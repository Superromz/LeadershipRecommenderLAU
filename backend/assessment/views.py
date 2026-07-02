import csv
import io
import json
from collections import Counter, defaultdict
from itertools import combinations

import numpy as np
from django.contrib.auth import get_user_model
from django.db.models import Avg
from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import AssessmentResult, SurveyResponse
from .serializers import (
    AssessmentSubmitSerializer,
    AssessmentResultSerializer,
    AssessmentListSerializer,
    SurveySerializer,
)
from core.inference import predict
from core.shap_engine import compute_shap
from core.counterfactual import generate_counterfactual
from core.decision_support import generate_recommendations


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_assessment(request):
    """
    Accepts a student's assessment responses, runs the full pipeline:
    inference → SHAP → counterfactual → decision support module,
    persists the result, and returns everything in one response.

    POST /api/assessment/submit/
    """
    serializer = AssessmentSubmitSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    payload = serializer.validated_data

    # 1. Inference
    inference_result = predict(payload)
    predicted_class  = inference_result['predicted_class']
    X_transformed    = inference_result.pop('X_transformed')

    # 2. SHAP
    shap_result = compute_shap(X_transformed, predicted_class)

    # Attach feature_value (standardised score) to top3 for decision support
    feature_names = list(shap_result['all_shap'].keys())
    for item in shap_result['top3']:
        feat_idx = feature_names.index(item['feature']) if item['feature'] in feature_names else None
        if feat_idx is not None:
            item['feature_value'] = float(X_transformed[0, feat_idx])

    # 3. Counterfactual
    counterfactual = generate_counterfactual(X_transformed, predicted_class)

    # 4. Decision support module
    recommendations = generate_recommendations(
        shap_result['top3'],
        inference_result['predicted_class_name']
    )

    # 5. Persist to database
    result = AssessmentResult.objects.create(
        user                     = request.user,
        role_assumption          = payload['role_assumption'],
        production_emphasis      = payload['production_emphasis'],
        initiation_of_structure  = payload['initiation_of_structure'],
        tolerance_of_uncertainty = payload['tolerance_of_uncertainty'],
        integration              = payload['integration'],
        consideration            = payload['consideration'],
        country                  = payload['country'],
        age                      = payload['age'],
        gender                   = payload['gender'],
        education_level          = payload['education_level'],
        work_experience_years    = payload['work_experience_years'],
        position_level           = payload['position_level'],
        predicted_class          = predicted_class,
        predicted_class_name     = inference_result['predicted_class_name'],
        probabilities            = inference_result['probabilities'],
        top3_shap_features       = shap_result['top3'],
        all_shap_values          = shap_result['all_shap'],
        counterfactual           = counterfactual,
        recommendations          = recommendations,
    )

    return Response(AssessmentResultSerializer(result).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assessment_history(request):
    """
    Returns a list of the authenticated student's past assessments (lightweight).
    GET /api/assessment/history/
    """
    results = AssessmentResult.objects.filter(user=request.user)
    return Response(AssessmentListSerializer(results, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assessment_detail(request, pk):
    """
    Returns the full result for a specific past assessment.
    GET /api/assessment/<id>/
    """
    try:
        result = AssessmentResult.objects.get(pk=pk, user=request.user)
    except AssessmentResult.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    return Response(AssessmentResultSerializer(result).data)


BEHAVIOURAL_FIELDS = [
    'role_assumption', 'production_emphasis', 'initiation_of_structure',
    'tolerance_of_uncertainty', 'integration', 'consideration',
]

COUNTRY_NAMES = {'USA': 'United States', 'JPN': 'Japan', 'BRA': 'Brazil', 'NGA': 'Nigeria', 'IND': 'India'}


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics(request):
    """
    Returns two analytics blocks:
      - personal: stats derived from the authenticated user's own assessments
      - global:   aggregate stats across all assessments in the system
    GET /api/assessment/analytics/
    """
    user_qs   = AssessmentResult.objects.filter(user=request.user).order_by('created_at')
    global_qs = AssessmentResult.objects.all()

    # ── Personal ──────────────────────────────────────────────────────────────

    user_list = list(user_qs.values(
        'id', 'created_at', 'predicted_class_name', 'probabilities',
        *BEHAVIOURAL_FIELDS, 'top3_shap_features',
    ))

    total = len(user_list)

    # Style distribution
    style_dist = Counter(r['predicted_class_name'] for r in user_list)

    # Average dimension scores
    if total:
        avg_scores = {
            f: round(sum(r[f] for r in user_list) / total, 2)
            for f in BEHAVIOURAL_FIELDS
        }
    else:
        avg_scores = {f: 0 for f in BEHAVIOURAL_FIELDS}

    # Dominant style
    dominant_style = style_dist.most_common(1)[0][0] if style_dist else None

    # ── H2 Cosine-similarity consistency (proposal Section 5.7 / 8.3) ─────────
    # For each pair of the user's assessments, compute cosine similarity between
    # their 6-dimensional Likert response vectors. Threshold = 75th percentile of
    # all pairwise similarities (empirical, as specified in proposal).
    # Report: similar_pairs, consistent_pairs, consistency_rate, threshold.
    cosine_consistency = None
    if total >= 2:
        vectors = np.array([[r[f] for f in BEHAVIOURAL_FIELDS] for r in user_list], dtype=float)
        norms   = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms   = np.where(norms == 0, 1e-10, norms)         # avoid div-by-zero
        unit    = vectors / norms

        pairs        = list(combinations(range(total), 2))
        similarities = [float(np.dot(unit[i], unit[j])) for i, j in pairs]

        # Empirical threshold: 75th percentile of all pairwise similarities
        threshold = float(np.percentile(similarities, 75)) if len(similarities) > 1 else 0.9

        similar_pairs    = [(i, j, s) for (i, j), s in zip(pairs, similarities) if s >= threshold]
        consistent_pairs = [
            (i, j, s) for i, j, s in similar_pairs
            if user_list[i]['predicted_class_name'] == user_list[j]['predicted_class_name']
        ]
        consistency_rate = (
            round(len(consistent_pairs) / len(similar_pairs) * 100, 1)
            if similar_pairs else None
        )

        cosine_consistency = {
            'total_pairs':       len(pairs),
            'similar_pairs':     len(similar_pairs),
            'consistent_pairs':  len(consistent_pairs),
            'consistency_rate':  consistency_rate,
            'threshold':         round(threshold, 4),
            'method':            'cosine_similarity',
        }

    # Simple % matching dominant style (kept for backward compat)
    consistency = round((style_dist[dominant_style] / total * 100), 1) if total else 0

    # Score timeline (last 8)
    timeline = [
        {
            'date':  r['created_at'].strftime('%b %d') if hasattr(r['created_at'], 'strftime') else str(r['created_at'])[:10],
            'style': r['predicted_class_name'],
            'confidence': round(max(r['probabilities'].values()) * 100, 1),
            **{f: r[f] for f in BEHAVIOURAL_FIELDS},
        }
        for r in user_list[-8:]
    ]

    # SHAP feature frequency (how often each feature appears in top3 across user's assessments)
    shap_freq: Counter = Counter()
    for r in user_list:
        for item in (r['top3_shap_features'] or []):
            shap_freq[item['feature']] += 1
    shap_frequency = [{'feature': k, 'count': v} for k, v in shap_freq.most_common()]

    personal = {
        'total_assessments':  total,
        'dominant_style':     dominant_style,
        'consistency_pct':    consistency,
        'cosine_consistency': cosine_consistency,
        'style_distribution': [{'style': k, 'count': v} for k, v in style_dist.items()],
        'avg_scores':         avg_scores,
        'timeline':           timeline,
        'shap_frequency':     shap_frequency,
    }

    # ── Global ────────────────────────────────────────────────────────────────

    global_list = list(global_qs.values(
        'predicted_class_name', 'country', 'position_level', *BEHAVIOURAL_FIELDS,
    ))
    global_total = len(global_list)

    # Global style distribution
    global_style_dist = Counter(r['predicted_class_name'] for r in global_list)

    # Style by country
    by_country: dict = defaultdict(Counter)
    for r in global_list:
        by_country[COUNTRY_NAMES.get(r['country'], r['country'])][r['predicted_class_name']] += 1
    style_by_country = [
        {'country': country, **dict(counts)}
        for country, counts in sorted(by_country.items())
    ]

    # Style by position level
    by_position: dict = defaultdict(Counter)
    for r in global_list:
        by_position[r['position_level']][r['predicted_class_name']] += 1
    style_by_position = [
        {'level': level, **dict(counts)}
        for level, counts in [('Junior', by_position['Junior']),
                               ('Mid',    by_position['Mid']),
                               ('Senior', by_position['Senior'])]
    ]

    # Global average dimension scores
    if global_total:
        global_avg = {
            f: round(sum(r[f] for r in global_list) / global_total, 2)
            for f in BEHAVIOURAL_FIELDS
        }
    else:
        global_avg = {f: 0 for f in BEHAVIOURAL_FIELDS}

    User = get_user_model()
    total_users = User.objects.count()

    global_data = {
        'total_assessments': global_total,
        'total_users':       total_users,
        'style_distribution': [{'style': k, 'count': v} for k, v in global_style_dist.most_common()],
        'style_by_country':  style_by_country,
        'style_by_position': style_by_position,
        'avg_scores':        global_avg,
    }

    # ── Survey aggregate ──────────────────────────────────────────────────────
    survey_qs = SurveyResponse.objects.filter(assessment__user=request.user)
    survey_count = survey_qs.count()
    if survey_count:
        avgs = survey_qs.aggregate(
            avg_relevance=Avg('relevance'),
            avg_personalisation=Avg('personalisation'),
            avg_usefulness=Avg('usefulness'),
        )
        useful_count = survey_qs.filter(usefulness__gte=4).count()
        personal['survey'] = {
            'count':               survey_count,
            'avg_relevance':       round(avgs['avg_relevance'], 2),
            'avg_personalisation': round(avgs['avg_personalisation'], 2),
            'avg_usefulness':      round(avgs['avg_usefulness'], 2),
            'useful_pct':          round(useful_count / survey_count * 100, 1),
        }
    else:
        personal['survey'] = None

    return Response({'personal': personal, 'global': global_data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_survey(request, pk):
    """
    POST /api/assessment/<id>/survey/
    Saves the H3 post-assessment satisfaction survey.
    """
    try:
        assessment = AssessmentResult.objects.get(pk=pk, user=request.user)
    except AssessmentResult.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    if hasattr(assessment, 'survey'):
        return Response({'detail': 'Survey already submitted.'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = SurveySerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer.save(assessment=assessment)
    return Response({'detail': 'Survey saved. Thank you!'}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_csv(request):
    """
    GET /api/assessment/export-csv/
    Admin-only. Streams all AssessmentResult rows + survey data as a CSV file.
    """
    rows = (
        AssessmentResult.objects
        .select_related('user', 'survey')
        .order_by('created_at')
    )

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        'id', 'created_at', 'user_email',
        'country', 'age', 'gender', 'education_level',
        'work_experience_years', 'position_level',
        'role_assumption', 'production_emphasis', 'initiation_of_structure',
        'tolerance_of_uncertainty', 'integration', 'consideration',
        'predicted_class', 'predicted_class_name',
        'survey_relevance', 'survey_personalisation', 'survey_usefulness',
    ])

    for r in rows:
        survey = getattr(r, 'survey', None)
        writer.writerow([
            r.id,
            r.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            r.user.email,
            r.country, r.age, r.gender, r.education_level,
            r.work_experience_years, r.position_level,
            r.role_assumption, r.production_emphasis, r.initiation_of_structure,
            r.tolerance_of_uncertainty, r.integration, r.consideration,
            r.predicted_class, r.predicted_class_name,
            survey.relevance       if survey else '',
            survey.personalisation if survey else '',
            survey.usefulness      if survey else '',
        ])

    response = HttpResponse(output.getvalue(), content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="lau_assessment_export.csv"'
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def model_comparison(request):
    """
    GET /api/assessment/model-comparison/
    Returns H1 benchmark comparison data from the research notebooks.
    """
    from django.conf import settings
    path = settings.MODELS_DIR / 'model_comparison.json'
    if not path.exists():
        return Response({'detail': 'Comparison data not found.'}, status=status.HTTP_404_NOT_FOUND)
    with open(path) as f:
        data = json.load(f)
    return Response(data)

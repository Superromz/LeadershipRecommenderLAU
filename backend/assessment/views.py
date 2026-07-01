from collections import Counter, defaultdict

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import AssessmentResult
from .serializers import (
    AssessmentSubmitSerializer,
    AssessmentResultSerializer,
    AssessmentListSerializer,
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

    # Consistency: fraction of assessments matching the most common style
    dominant_style = style_dist.most_common(1)[0][0] if style_dist else None
    consistency    = round((style_dist[dominant_style] / total * 100), 1) if total else 0

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
        'total_assessments': total,
        'dominant_style':    dominant_style,
        'consistency_pct':   consistency,
        'style_distribution': [{'style': k, 'count': v} for k, v in style_dist.items()],
        'avg_scores':        avg_scores,
        'timeline':          timeline,
        'shap_frequency':    shap_frequency,
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

    from django.contrib.auth import get_user_model
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

    return Response({'personal': personal, 'global': global_data})

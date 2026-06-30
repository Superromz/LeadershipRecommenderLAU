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

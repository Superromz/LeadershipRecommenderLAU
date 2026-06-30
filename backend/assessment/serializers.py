from rest_framework import serializers
from .models import AssessmentResult


class AssessmentSubmitSerializer(serializers.Serializer):
    """Validates the incoming assessment payload from the React frontend."""
    # Behavioural scores
    role_assumption          = serializers.IntegerField(min_value=1, max_value=5)
    production_emphasis      = serializers.IntegerField(min_value=1, max_value=5)
    initiation_of_structure  = serializers.IntegerField(min_value=1, max_value=5)
    tolerance_of_uncertainty = serializers.IntegerField(min_value=1, max_value=5)
    integration              = serializers.IntegerField(min_value=1, max_value=5)
    consideration            = serializers.IntegerField(min_value=1, max_value=5)

    # Demographics
    country               = serializers.ChoiceField(choices=['USA', 'JPN', 'BRA', 'NGA', 'IND'])
    age                   = serializers.IntegerField(min_value=16, max_value=80)
    gender                = serializers.ChoiceField(choices=['Male', 'Female', 'Other'])
    education_level       = serializers.ChoiceField(choices=['Bachelor', 'Master', 'PhD', 'Other'])
    work_experience_years = serializers.FloatField(min_value=0.0, max_value=50.0)
    position_level        = serializers.ChoiceField(choices=['Junior', 'Mid', 'Senior'])


class AssessmentResultSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AssessmentResult
        fields = [
            'id', 'created_at',
            'role_assumption', 'production_emphasis', 'initiation_of_structure',
            'tolerance_of_uncertainty', 'integration', 'consideration',
            'country', 'age', 'gender', 'education_level',
            'work_experience_years', 'position_level',
            'predicted_class', 'predicted_class_name', 'probabilities',
            'top3_shap_features', 'all_shap_values',
            'counterfactual', 'recommendations',
        ]
        read_only_fields = fields


class AssessmentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the history list view."""
    class Meta:
        model  = AssessmentResult
        fields = ['id', 'created_at', 'predicted_class_name', 'probabilities']
        read_only_fields = fields

from django.db import models
from django.conf import settings


class AssessmentResult(models.Model):
    """
    Stores a student's assessment submission and all computed outputs:
    prediction, SHAP values, counterfactual explanation, and recommendations.
    """
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                   related_name='assessments')
    created_at = models.DateTimeField(auto_now_add=True)

    # Behavioural scores (Likert 1–5)
    role_assumption          = models.IntegerField()
    production_emphasis      = models.IntegerField()
    initiation_of_structure  = models.IntegerField()
    tolerance_of_uncertainty = models.IntegerField()
    integration              = models.IntegerField()
    consideration            = models.IntegerField()

    # Demographics used at assessment time
    country                = models.CharField(max_length=3)
    age                    = models.PositiveIntegerField()
    gender                 = models.CharField(max_length=10)
    education_level        = models.CharField(max_length=20)
    work_experience_years  = models.FloatField()
    position_level         = models.CharField(max_length=10)

    # Model outputs
    predicted_class      = models.IntegerField()
    predicted_class_name = models.CharField(max_length=50)
    probabilities        = models.JSONField()

    # SHAP outputs
    top3_shap_features = models.JSONField()
    all_shap_values    = models.JSONField()

    # Counterfactual explanation
    counterfactual = models.JSONField(null=True, blank=True)

    # Decision support module output
    recommendations = models.JSONField()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} — {self.predicted_class_name} ({self.created_at:%Y-%m-%d})'


class SurveyResponse(models.Model):
    """H3 post-assessment satisfaction survey (3 Likert items, 1-5 scale)."""
    assessment      = models.OneToOneField(AssessmentResult, on_delete=models.CASCADE,
                                           related_name='survey')
    relevance       = models.IntegerField()        # "The style description felt relevant to me"
    personalisation = models.IntegerField()        # "The feedback felt personalised"
    usefulness      = models.IntegerField()        # "I found the recommendations useful"
    created_at      = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Survey for assessment {self.assessment_id}'

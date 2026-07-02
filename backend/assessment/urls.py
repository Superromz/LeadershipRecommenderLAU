from django.urls import path
from .views import (
    submit_assessment, assessment_history, assessment_detail,
    analytics, submit_survey, model_comparison,
)

urlpatterns = [
    path('submit/',             submit_assessment,  name='assessment_submit'),
    path('history/',            assessment_history, name='assessment_history'),
    path('analytics/',          analytics,          name='assessment_analytics'),
    path('model-comparison/',   model_comparison,   name='model_comparison'),
    path('<int:pk>/',           assessment_detail,  name='assessment_detail'),
    path('<int:pk>/survey/',    submit_survey,      name='assessment_survey'),
]

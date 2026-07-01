from django.urls import path
from .views import submit_assessment, assessment_history, assessment_detail, analytics

urlpatterns = [
    path('submit/',    submit_assessment,  name='assessment_submit'),
    path('history/',   assessment_history, name='assessment_history'),
    path('analytics/', analytics,          name='assessment_analytics'),
    path('<int:pk>/',  assessment_detail,  name='assessment_detail'),
]

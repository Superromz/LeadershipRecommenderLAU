from django.urls import path
from .views import submit_assessment, assessment_history, assessment_detail

urlpatterns = [
    path('submit/', submit_assessment, name='assessment_submit'),
    path('history/', assessment_history, name='assessment_history'),
    path('<int:pk>/', assessment_detail, name='assessment_detail'),
]

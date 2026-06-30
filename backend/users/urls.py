from django.urls import path
from .views import register, me, LoginView

urlpatterns = [
    path('register/', register, name='register'),
    path('token/', LoginView.as_view(), name='token_obtain'),
    path('me/', me, name='me'),
]

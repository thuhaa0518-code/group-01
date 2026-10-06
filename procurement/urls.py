from django.urls import path
from . import views

urlpatterns = [
    # REST API Endpoints for FE integration
    path('api/v1/state/', views.api_state_view, name='api_state'),
    path('api/v1/sync/', views.api_sync_view, name='api_sync'),
]

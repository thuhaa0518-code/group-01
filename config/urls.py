from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
import os

from procurement import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/state/', views.api_state_view, name='api_state'),
    path('api/v1/sync/', views.api_sync_view, name='api_sync'),

    # Serve static assets compiled from FE Vite build
    re_path(r'^assets/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'FE', 'dist', 'assets'),
    }),
    re_path(r'^vite.svg$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'FE', 'dist'),
        'path': 'vite.svg'
    }),

    re_path(r'^samples/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'sample_quotations'),
    }),

    # Catch-all SPA index route
    re_path(r'^.*$', views.spa_index_view, name='spa_index'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

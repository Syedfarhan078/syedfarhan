from django.urls import path
from . import views

app_name = 'portfolio'

urlpatterns = [
    path('', views.home_view, name='home'),
    path('contact/submit/', views.contact_submit, name='contact_submit'),
    path('api/neofetch/', views.api_neofetch, name='api_neofetch'),
    path('api/projects/', views.api_projects, name='api_projects'),
    path('api/about/', views.api_about, name='api_about'),
]

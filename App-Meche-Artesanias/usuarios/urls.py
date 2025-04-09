from django.urls import path
from .views import login_usuario

urlpatterns = [
    path('login/', login_usuario, name= 'login_usuario'),
    
]
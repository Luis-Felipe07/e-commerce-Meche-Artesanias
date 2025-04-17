from django.urls import path
from .views import registrar_usuario_api, login_usuario

urlpatterns = [
    path('login/', login_usuario, name= 'login_usuario'),
    path('registrar-usuario/', registrar_usuario_api, name='registro-usuario'),
    
]
# usuarios/urls.py
from django.urls import path
from .views import (
    registrar_usuario_api,
    login_usuario,
    verificar_autenticacion,
    subir_foto_perfil_api,
    PerfilUsuarioAPI, # Importo la API de perfil
)
from rest_framework_simplejwt.views import TokenRefreshView
from .views import crear_sesion

urlpatterns = [
    path('login/', login_usuario, name='login_usuario'),
    path('registrar-usuario/', registrar_usuario_api, name='registro_usuario'),
    path('verificar-autenticacion/', verificar_autenticacion, name='verificar_autenticacion'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('foto-perfil/', subir_foto_perfil_api, name='subir_foto_perfil'),
    # Ruta para obtener (GET) y actualizar (PUT) el perfil
    path('perfil/', PerfilUsuarioAPI.as_view(), name='perfil_usuario_api'),
    path('crear-sesion/', crear_sesion, name='crear_sesion'),
]
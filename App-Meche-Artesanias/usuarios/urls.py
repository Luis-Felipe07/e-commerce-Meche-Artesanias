
from django.urls import path
# Importo las vistas que voy a usar
from .views import (
    registrar_usuario_api,
    login_usuario,
    verificar_autenticacion,
    subir_foto_perfil_api, # La nueva vista para la foto
)
from rest_framework_simplejwt.views import TokenRefreshView # Para refrescar el token

urlpatterns = [
    # Defino las rutas de mi API para usuarios
    path('login/', login_usuario, name='login_usuario'),
    path('registrar-usuario/', registrar_usuario_api, name='registro-usuario'),
    path('verificar-autenticacion/', verificar_autenticacion, name='verificar-autenticacion'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Añado la ruta para la subida de la foto de perfil
    path('foto-perfil/', subir_foto_perfil_api, name='subir_foto_perfil'),
]
from django.urls import path
# Asegúrate de que esta línea de importación refleje todas las vistas necesarias
# si otras ramas añadieron más vistas y urls. Por ahora, se ve bien.
from .views import registrar_usuario_api, login_usuario, verificar_autenticacion # Añadí verificar_autenticacion que vi en el código original
from rest_framework_simplejwt.views import TokenRefreshView # Añadí esto que vi en el código original

urlpatterns = [
    path('login/', login_usuario, name='login_usuario'),
    path('registrar-usuario/', registrar_usuario_api, name='registro-usuario'),
    # Añadí las otras URLs que vi en tu archivo original para que no se pierdan
    path('verificar-autenticacion/', verificar_autenticacion, name='verificar-autenticacion'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
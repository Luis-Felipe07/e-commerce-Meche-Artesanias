# usuarios/views.py

from django.contrib.auth import authenticate, get_user_model
from django.core.validators import validate_email # No la uso directamente aquí si el serializer valida
from django.core.exceptions import ValidationError # No la uso directamente aquí si el serializer valida

from rest_framework.decorators import api_view, permission_classes, parser_classes, APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import login


# Importo mis serializers
from .serializers import RegistroUsuarioSerializer, UserProfileSerializer

User = get_user_model()

@api_view(['POST'])
def login_usuario(request):
    # Intento autenticarme con email y password
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(request, username=email, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        # Uso mi serializer para obtener los datos del usuario a devolver
        serializer = UserProfileSerializer(user, context={'request': request})
        return Response({
            'mensaje': 'Inicio de sesion Exitoso',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'usuario': serializer.data # Devuelvo los datos básicos
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Credenciales Incorrectas'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def registrar_usuario_api(request):
    # Valido y creo el usuario usando mi serializer
    serializer = RegistroUsuarioSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save() # El serializer se encarga de crear el usuario
            # Devuelvo solo mensaje de éxito (podría devolver tokens si quisiera loguear)
            return Response({
                "mensaje": "Registro exitoso.",
                # "urlRedireccion": "/login/" # Podría añadir URL si el JS la necesita
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
             print(f"Error al registrar: {e}") # Loggeo el error para depuración
             return Response({"mensaje": "Error interno al registrar."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        # Si la validación falla, devuelvo los errores del serializer
        return Response({
            "mensaje": "Hay errores en el formulario.",
            "errores": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated]) # Protegido: solo usuarios logueados
def verificar_autenticacion(request):
    # Confirmo que el token es válido y devuelvo los datos del usuario
    serializer = UserProfileSerializer(request.user, context={'request': request})
    return Response({
        'mensaje': 'Usuario autenticado correctamente',
        'usuario': serializer.data
    })


# API para obtener (GET) y actualizar (PUT) mi perfil
class PerfilUsuarioAPI(APIView):
    permission_classes = [IsAuthenticated] # Protegido

    def get(self, request):
        # Devuelvo mi perfil actual
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response({'usuario': serializer.data})

    def put(self, request):
        # Actualizo mi perfil con los datos recibidos
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'mensaje': 'Perfil actualizado con éxito', 'usuario': serializer.data})
        else:
            return Response({'errores': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated]) # Protegido
@parser_classes([MultiPartParser, FormParser]) # Necesario para subir archivos
def subir_foto_perfil_api(request):
    # Subo mi foto de perfil
    user = request.user
    archivo_foto = request.FILES.get('foto_perfil') # Clave debe coincidir con JS

    if not archivo_foto:
        return Response({"success": False, "mensaje": "No se envió ningún archivo."}, status=status.HTTP_400_BAD_REQUEST)

    # Validación básica de la foto
    if archivo_foto.size > 5 * 1024 * 1024: # 5MB
        return Response({"success": False, "mensaje": "El archivo es demasiado grande (máx 5MB)."}, status=status.HTTP_400_BAD_REQUEST)
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if archivo_foto.content_type not in allowed_types:
        return Response({"success": False, "mensaje": "Tipo de archivo no válido."}, status=status.HTTP_400_BAD_REQUEST)

    # Asigno y guardo la foto
    user.avatar = archivo_foto
    user.save()

    # Genero y devuelvo la URL de la foto guardada
    avatar_url = request.build_absolute_uri(user.avatar.url) if user.avatar else None
    return Response({
        "success": True,
        "mensaje": "Foto de perfil actualizada.",
        "url_foto": avatar_url
    }, status=status.HTTP_200_OK)
    
    
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_sesion(request):
    """
    Esta vista se usa para crear una sesión en Django después del login API.
    Requiere que el usuario esté autenticado con token (Bearer Token).
    """
    user = request.user  # El usuario ya viene autenticado gracias al token
    login(request, user) # Esto crea la sesión normal de Django
    return Response({"mensaje": "Sesión iniciada correctamente"}) # Podría devolver más info si quisiera  
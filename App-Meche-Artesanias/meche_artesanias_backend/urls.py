from django.contrib import admin
from django.urls import path
from django.urls import include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('grappelli/', include('grappelli.urls')),
    path('admin/', admin.site.urls),
    path('api/usuarios/', include('usuarios.urls')),
<<<<<<< HEAD
    path('api/', include('usuarios.urls')),
=======
    path('', include('productos.urls')),
    
    
>>>>>>> origin/JHAN/backend
]
    


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


import sys
import os

# Agregar el directorio raíz de tu proyecto al PYTHONPATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from django.core.wsgi import get_wsgi_application

# Establecer el módulo de configuración de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'meche_artesanias_backend.settings')

application = get_wsgi_application()



"""
WSGI config for meche_artesanias_backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""




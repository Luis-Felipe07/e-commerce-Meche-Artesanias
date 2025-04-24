from django.urls import path
from .views import tienda
from .views import bienvenida
from . import views

urlpatterns = [
    path('tienda/', tienda, name='tienda'),
    path('', views.bienvenida, name='bienvenida'),
    path('buscar/', views.buscar_productos, name='buscar_productos'),
    path('nosotros/', views.nosotros, name='nosotros'),
    path('contacto/', views.contacto, name='contacto'),
    path('', views.carrito, name='carrito'),
    path('login/', views.login, name='login'),
]

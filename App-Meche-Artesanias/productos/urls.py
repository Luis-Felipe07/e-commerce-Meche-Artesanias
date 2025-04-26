from django.urls import path
from .views import tienda
from .views import pgbienvenida
from . import views
from .views import CarritoView, AgregarItemCarrito, EliminarItemCarrito

urlpatterns = [
    path('tienda/', tienda, name='tienda'),
    path('', views.pgbienvenida, name='pgbienvenida'),
    path('buscar/', views.buscar_productos, name='buscar_productos'),
    path('nosotros/', views.nosotros, name='nosotros'),
    path('contacto/', views.contacto, name='contacto'),
    path('carrito/' , views.carrito, name='carrito'),
    path('login/', views.login, name='login'),
    path('registro_cliente/', views.registro_cliente, name='registro_cliente'),
    path('api/carrito/', CarritoView.as_view(), name='ver_carrito'),
    path('api/carrito/agregar/', AgregarItemCarrito.as_view(), name='agregar_al_carrito'),
    path('api/carrito/eliminar/<int:producto_id>/', EliminarItemCarrito.as_view(), name='eliminar_del_carrito'),
    path('pedido/procesar/', views.procesar_pedido, name='procesar_pedido'),
]

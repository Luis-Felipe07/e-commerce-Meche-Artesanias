
from django.urls import path
# Importo las vistas específicas que necesito, incluyendo las APIViews
from .views import (
    tienda, pgbienvenida, buscar_productos, nosotros, contacto, carrito,
    login, registro_cliente, dashboard_view, 
    CarritoView, AgregarItemCarrito, EliminarItemCarrito, 
    ProcesarPedidoView,
    PerfilUsuarioAPI, SubirFotoPerfilAPI, 
    PedidosUsuarioAPI, DetallePedidoAPI, 
    DireccionesUsuarioAPI, DireccionDetalleAPI 
)



urlpatterns = [
    # --- Páginas Principales (Renderizan HTML) ---
    path('tienda/', tienda, name='tienda'),
    path('', pgbienvenida, name='pgbienvenida'),
    path('buscar/', buscar_productos, name='buscar_productos'),
    path('nosotros/', nosotros, name='nosotros'),
    path('contacto/', contacto, name='contacto'),
    path('carrito/', carrito, name='carrito'), 

    # --- Autenticación/Registro (Renderizan HTML de formularios) ---
    path('login/', login, name='login'),
    path('registro_cliente/', registro_cliente, name='registro_cliente'),

    # --- Dashboard del Usuario (Renderiza HTML base del dashboard) ---
    path('dashboard/', dashboard_view, name='dashboard'),

    # --- APIs (Responden JSON) ---

    # API Carrito
    path('api/carrito/', CarritoView.as_view(), name='api_ver_carrito'),
    path('api/carrito/agregar/', AgregarItemCarrito.as_view(), name='api_agregar_al_carrito'),
    path('api/carrito/eliminar/<int:producto_id>/', EliminarItemCarrito.as_view(), name='api_eliminar_del_carrito'),
   

    # API Procesar Pedido
    path('api/pedido/procesar/', ProcesarPedidoView.as_view(), name='api_procesar_pedido'),

   
    path('api/usuarios/perfil/', PerfilUsuarioAPI.as_view(), name='api_perfil_usuario'),
    path('api/usuarios/foto-perfil/', SubirFotoPerfilAPI.as_view(), name='api_subir_foto'),
    

    # API Pedidos Usuario
    # Asumen que tienes PedidosUsuarioAPI y DetallePedidoAPI
    path('api/pedidos/', PedidosUsuarioAPI.as_view(), name='api_lista_pedidos'),
    path('api/pedidos/recientes/', PedidosUsuarioAPI.as_view(), {'recientes': True}, name='api_pedidos_recientes'), # Ejemplo para filtrar recientes
    path('api/pedidos/<int:pedido_id>/', DetallePedidoAPI.as_view(), name='api_detalle_pedido'),
    

    
    path('api/direcciones/', DireccionesUsuarioAPI.as_view(), name='api_lista_direcciones'),
    path('api/direcciones/<int:direccion_id>/', DireccionDetalleAPI.as_view(), name='api_detalle_direccion'), # Para GET, PUT, DELETE
    path('api/direcciones/<int:direccion_id>/predeterminada/', DireccionDetalleAPI.as_view(), name='api_direccion_predeterminada'), # Para POST a predeterminada

]
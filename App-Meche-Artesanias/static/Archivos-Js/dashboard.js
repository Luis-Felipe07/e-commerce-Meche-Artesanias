document.addEventListener('DOMContentLoaded', function() {
    // ===== REFERENCIAS DEL DOM =====
    
    // Referencias de elementos de usuario
    const menuUsuarioBtn = document.getElementById('menuUsuario');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const cerrarSesionBtn = document.getElementById('cerrarSesion');
    const cerrarSesionMenuBtn = document.getElementById('cerrarSesionMenu');
    const cerrarBusquedaBtn = document.getElementById('cerrarBusqueda');
    const buscadorInput = document.querySelector('.buscador input');
    
    // Referencias a elementos del perfil de usuario
    const nombreUsuarioSpan = document.getElementById('nombreUsuario');
    const nombreClientePanel = document.getElementById('nombreClientePanel');
    const nombrePerfilUsuario = document.getElementById('nombrePerfilUsuario');
    const emailUsuario = document.getElementById('emailUsuario');
    const imgPerfilUsuario = document.getElementById('imgPerfilUsuario');
    const perfilFotoActual = document.getElementById('perfilFotoActual');
    
    // Referencias a contenedores dinámicos
    const tablaPedidosRecientes = document.getElementById('tablaPedidosRecientes');
    const tablaTodosPedidos = document.getElementById('tablaTodosPedidos');
    const productosRecomendados = document.getElementById('productosRecomendados');
    const totalPedidos = document.getElementById('totalPedidos');
    const totalDirecciones = document.getElementById('totalDirecciones');
    const totalMetodosPago = document.getElementById('totalMetodosPago');
    const contadorCarrito = document.querySelector('.contador-carrito');
    
    // Referencias a secciones y contenedores SPA
    const seccionCargando = document.getElementById('cargando-seccion');
    const seccionContenido = document.getElementById('seccion-contenido');
    const todasLasSecciones = document.querySelectorAll('.seccion-panel');
    const menuSecciones = document.querySelectorAll('.menu-cliente a, .dropdown-menu a[data-section]');
    
    // Referencias a modales
    const modalDireccion = document.getElementById('modalDireccion');
    const modalMetodoPago = document.getElementById('modalMetodoPago');
    const modalDetallePedido = document.getElementById('modalDetallePedido');
    const btnsModalCerrar = document.querySelectorAll('.cerrar-modal');
    
    // Referencias a botones de acción
    const btnAgregarDireccion = document.getElementById('agregarDireccion');
    const btnAgregarMetodoPago = document.getElementById('agregarMetodoPago');
    const btnCambiarFoto = document.querySelector('.btn-cambiar-foto');
    const inputFotoPerfil = document.getElementById('inputFotoPerfil');
    
    // Referencias a formularios
    const formEditarPerfil = document.getElementById('formEditarPerfil');
    const formCambiarContrasena = document.getElementById('formCambiarContrasena');
    const formDireccion = document.getElementById('formDireccion');
    const formMetodoPago = document.getElementById('formMetodoPago');
    
    // Referencias a contenedores de datos
    const listaDirecciones = document.getElementById('listaDirecciones');
    const listaMetodosPago = document.getElementById('listaMetodosPago');
    
    // Paginación para sección de pedidos
    const btnPaginaAnterior = document.getElementById('paginaAnterior');
    const btnPaginaSiguiente = document.getElementById('paginaSiguiente');
    const spanPaginaActual = document.getElementById('paginaActual');
    
    // Variables de estado para la aplicación
    let paginaActual = 1;
    let totalPaginas = 1;
    let filtroEstadoPedido = 'todos';
    let busquedaPedido = '';
    
    // ===== IMPLEMENTACIÓN SPA =====
    
    /**
     * Función que inicializa el comportamiento SPA de la aplicación
     */
    function inicializarSPA() {
        // Escucho cambios en el hash para cambiar de sección
        window.addEventListener('hashchange', manejarCambioHash);
        
        // Configuro los enlaces del menú para cambiar secciones
        menuSecciones.forEach(enlace => {
            enlace.addEventListener('click', function(e) {
                e.preventDefault();
                const seccion = this.getAttribute('data-section');
                window.location.hash = seccion;
                
                // Si es un enlace del dropdown, lo cierro
                if (dropdownMenu) {
                    dropdownMenu.classList.remove('activo');
                }
            });
        });
        
        // Verifico si hay un hash en la URL inicial
        if (window.location.hash) {
            manejarCambioHash();
        } else {
            // Si no hay hash, establezco "dashboard" como sección predeterminada
            window.location.hash = 'dashboard';
        }
    }
    
    /**
     * Función que maneja cambios en el hash de la URL para cambiar secciones
     */
    function manejarCambioHash() {
        // Obtengo el hash actual sin el símbolo #
        let seccion = window.location.hash.substring(1);
        
        // Si no hay sección o no es válida, uso "dashboard" como predeterminado
        if (!seccion || !document.getElementById(`seccion-${seccion}`)) {
            seccion = 'dashboard';
            window.location.hash = seccion;
        }
        
        // Muestro el indicador de carga
        mostrarCargando();
        
        // Actualizo la clase activa en el menú
        actualizarMenuActivo(seccion);
        
        // Cargo el contenido de la sección
        setTimeout(() => {
            cambiarSeccion(seccion);
            ocultarCargando();
        }, 300); // Pequeño retraso para mostrar la animación de carga
    }
    
    /**
     * Muestra el indicador de carga y oculta el contenido
     */
    function mostrarCargando() {
        if (seccionCargando) {
            seccionCargando.classList.remove('oculto');
        }
        
        if (seccionContenido) {
            seccionContenido.style.opacity = '0.5';
        }
    }
    
    /**
     * Oculta el indicador de carga y muestra el contenido
     */
    function ocultarCargando() {
        if (seccionCargando) {
            seccionCargando.classList.add('oculto');
        }
        
        if (seccionContenido) {
            seccionContenido.style.opacity = '1';
        }
    }
    
    /**
     * Actualiza la clase activa en el menú lateral
     */
    function actualizarMenuActivo(seccion) {
        // Quito la clase activa de todos los elementos del menú
        document.querySelectorAll('.menu-cliente li').forEach(item => {
            item.classList.remove('activo');
        });
        
        // Agrego la clase activa al elemento correspondiente
        const enlaceActivo = document.querySelector(`.menu-cliente a[data-section="${seccion}"]`);
        if (enlaceActivo) {
            enlaceActivo.closest('li').classList.add('activo');
        }
    }
    
    /**
     * Cambia la sección visible en el panel
     */
    function cambiarSeccion(seccion) {
        // Oculto todas las secciones
        todasLasSecciones.forEach(seccionPanel => {
            seccionPanel.classList.remove('active');
        });
        
        // Muestro la sección solicitada
        const seccionDeseada = document.getElementById(`seccion-${seccion}`);
        if (seccionDeseada) {
            seccionDeseada.classList.add('active');
            
            // Cargo los datos específicos de cada sección
            switch(seccion) {
                case 'dashboard':
                    cargarDatosDashboard();
                    break;
                case 'perfil':
                    cargarDatosPerfil();
                    break;
                case 'pedidos':
                    cargarTodosPedidos();
                    break;
                case 'direcciones':
                    cargarDirecciones();
                    break;
                case 'pagos':
                    cargarMetodosDePago();
                    break;
            }
        }
    }
    
    /**
     * Carga los datos principales del dashboard
     */
    function cargarDatosDashboard() {
        cargarPedidosRecientes();
        cargarProductosRecomendados();
    }
    
    /**
     * Carga los datos del perfil del usuario para la edición
     */
    function cargarDatosPerfil() {
        const token = localStorage.getItem('mecheAuthToken');
        
        fetch('/api/usuarios/perfil/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(usuario => {
            // Relleno el formulario con los datos del usuario
            document.getElementById('nombreCompleto').value = usuario.nombre || '';
            document.getElementById('emailPerfil').value = usuario.email || '';
            document.getElementById('telefonoPerfil').value = usuario.telefono || '';
            
            // Actualizo la foto de perfil
            if (perfilFotoActual && usuario.foto_perfil) {
                perfilFotoActual.src = usuario.foto_perfil;
            }
        })
        .catch(error => {
            console.error('Error al cargar datos del perfil:', error);
            mostrarNotificacion('No se pudieron cargar tus datos de perfil', 'error');
        });
    }
    
    // ===== GESTIÓN DE SESIÓN DE USUARIO =====
    
    /**
     * Verifica si el usuario ha iniciado sesión
     */
    function verificarSesion() {
        const token = localStorage.getItem('mecheAuthToken');
        
        if (!token) {
            // Si no hay token, redirijo al login
            window.location.href = 'index-login.html';
            return;
        }
        
        // Verifico el token con el backend
        fetch('/api/auth/verificar-token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ token: token })
        })
        .then(response => response.json())
        .then(data => {
            if (!data.valido) {
                // Si el token no es válido, limpio el almacenamiento y redirijo
                localStorage.removeItem('mecheAuthToken');
                window.location.href = 'index-login.html';
            } else {
                // Si el token es válido, cargo los datos del usuario
                cargarDatosUsuario();
                
                // Inicializo la funcionalidad SPA
                inicializarSPA();
            }
        })
        .catch(error => {
            console.error('Error al verificar la sesión:', error);
            mostrarNotificacion('Error de conexión. Por favor, intenta más tarde.', 'error');
        });
    }
    
    /**
     * Carga los datos del usuario para mostrarlos en el panel
     */
    function cargarDatosUsuario() {
        const token = localStorage.getItem('mecheAuthToken');
        
        fetch('/api/usuarios/perfil/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(usuario => {
            // Actualizo la información del usuario en la interfaz
            if (nombreUsuarioSpan) nombreUsuarioSpan.textContent = usuario.nombre.split(' ')[0]; // Solo el primer nombre
            if (nombreClientePanel) nombreClientePanel.textContent = usuario.nombre;
            if (nombrePerfilUsuario) nombrePerfilUsuario.textContent = usuario.nombre;
            if (emailUsuario) emailUsuario.textContent = usuario.email;
            
            // Actualizo la foto de perfil si existe
            if (imgPerfilUsuario && usuario.foto_perfil) {
                imgPerfilUsuario.src = usuario.foto_perfil;
                imgPerfilUsuario.alt = `Foto de ${usuario.nombre}`;
            }
            
            // Actualizo los contadores de resumen
            if (totalPedidos) totalPedidos.textContent = usuario.total_pedidos || 0;
            if (totalDirecciones) totalDirecciones.textContent = usuario.total_direcciones || 0;
            if (totalMetodosPago) totalMetodosPago.textContent = usuario.total_metodos_pago || 0;
            
            // Actualizo el contador del carrito
            actualizarContadorCarrito();
        })
        .catch(error => {
            console.error('Error al cargar datos del usuario:', error);
            mostrarNotificacion('No pudimos cargar tus datos. Por favor, recarga la página.', 'error');
        });
    }
    
    /**
     * Cierra la sesión del usuario
     */
    function cerrarSesion() {
        const token = localStorage.getItem('mecheAuthToken');
        
        // Opcional: notificar al backend sobre el cierre de sesión
        fetch('/api/auth/logout/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .catch(error => {
            console.error('Error al cerrar sesión en el servidor:', error);
        })
        .finally(() => {
            // Independientemente de la respuesta del servidor, limpio el storage local
            localStorage.removeItem('mecheAuthToken');
            
            // Redirijo a la página de inicio o login
            window.location.href = 'index-login.html';
        });
    }
    
    // ===== FUNCIONES PARA CARGAR DATOS =====
    
    /**
     * Carga los pedidos recientes del usuario para la sección dashboard
     */
    function cargarPedidosRecientes() {
        const token = localStorage.getItem('mecheAuthToken');
        
        if (!tablaPedidosRecientes) return;
        
        // Muestro un mensaje de carga
        tablaPedidosRecientes.innerHTML = `
            <tr>
                <td colspan="5" class="sin-datos">Cargando pedidos recientes...</td>
            </tr>
        `;
        
        fetch('/api/pedidos/recientes/?limite=5', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(pedidos => {
            if (pedidos.length === 0) {
                tablaPedidosRecientes.innerHTML = `
                    <tr>
                        <td colspan="5" class="sin-datos">No tienes pedidos recientes</td>
                    </tr>
                `;
                return;
            }
            
            // Si hay pedidos, limpio la tabla y agrego las filas
            tablaPedidosRecientes.innerHTML = '';
            
            pedidos.forEach(pedido => {
                // Formateo la fecha para mostrarla en formato legible
                const fecha = new Date(pedido.fecha);
                const fechaFormateada = fecha.toLocaleDateString('es-CO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                
                // Determino la clase CSS según el estado del pedido
                let estadoClase = '';
                switch(pedido.estado) {
                    case 'pendiente':
                        estadoClase = 'estado-pendiente';
                        break;
                    case 'completado':
                        estadoClase = 'estado-completado';
                        break;
                    case 'cancelado':
                        estadoClase = 'estado-cancelado';
                        break;
                    case 'enviado':
                        estadoClase = 'estado-enviado';
                        break;
                }
                
                // Formateo el valor total con separador de miles
                const totalFormateado = pedido.total.toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    maximumFractionDigits: 0
                });
                
                // Creo la fila de la tabla
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>#${pedido.id}</td>
                    <td>${fechaFormateada}</td>
                    <td><span class="estado ${estadoClase}">${pedido.estado}</span></td>
                    <td>${totalFormateado}</td>
                    <td>
                        <div class="acciones-pedido">
                            <button type="button" class="btn-accion ver-detalle-pedido" data-id="${pedido.id}" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${pedido.estado === 'pendiente' ? `
                                <button type="button" class="btn-accion cancelar-pedido" data-id="${pedido.id}" title="Cancelar pedido">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                `;
                
                tablaPedidosRecientes.appendChild(fila);
            });
            
            // Agrego eventos para los botones
            configurarBotonesPedidos(tablaPedidosRecientes);
        })
        .catch(error => {
            console.error('Error al cargar pedidos recientes:', error);
            tablaPedidosRecientes.innerHTML = `
                <tr>
                    <td colspan="5" class="sin-datos">Error al cargar pedidos. Intenta de nuevo más tarde.</td>
                </tr>
            `;
        });
    }
    
    /**
     * Carga todos los pedidos para la sección de pedidos con paginación y filtros
     */
    function cargarTodosPedidos() {
        const token = localStorage.getItem('mecheAuthToken');
        
        if (!tablaTodosPedidos) return;
        
        // Muestro un mensaje de carga
        tablaTodosPedidos.innerHTML = `
            <tr>
                <td colspan="5" class="sin-datos">Cargando pedidos...</td>
            </tr>
        `;
        
        // Construyo la URL con los parámetros de paginación y filtros
        let url = `/api/pedidos/?pagina=${paginaActual}`;
        if (filtroEstadoPedido !== 'todos') {
            url += `&estado=${filtroEstadoPedido}`;
        }
        if (busquedaPedido) {
            url += `&buscar=${encodeURIComponent(busquedaPedido)}`;
        }
        
        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            // Guardo la información de paginación
            totalPaginas = data.total_paginas || 1;
            
            // Actualizo el indicador de página actual
            spanPaginaActual.textContent = `Página ${paginaActual} de ${totalPaginas}`;
            
            // Actualizo el estado de los botones de paginación
            btnPaginaAnterior.disabled = paginaActual <= 1;
            btnPaginaSiguiente.disabled = paginaActual >= totalPaginas;
            
            const pedidos = data.resultados || [];
            
            if (pedidos.length === 0) {
                tablaTodosPedidos.innerHTML = `
                    <tr>
                        <td colspan="5" class="sin-datos">No se encontraron pedidos</td>
                    </tr>
                `;
                return;
            }
            
            // Si hay pedidos, limpio la tabla y agrego las filas
            tablaTodosPedidos.innerHTML = '';
            
            pedidos.forEach(pedido => {
                // Formateo la fecha
                const fecha = new Date(pedido.fecha);
                const fechaFormateada = fecha.toLocaleDateString('es-CO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                
                // Determino la clase CSS según el estado
                let estadoClase = '';
                switch(pedido.estado) {
                    case 'pendiente':
                        estadoClase = 'estado-pendiente';
                        break;
                    case 'completado':
                        estadoClase = 'estado-completado';
                        break;
                    case 'cancelado':
                        estadoClase = 'estado-cancelado';
                        break;
                    case 'enviado':
                        estadoClase = 'estado-enviado';
                        break;
                }
                
                // Formateo el valor total
                const totalFormateado = pedido.total.toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    maximumFractionDigits: 0
                });
                
                // Creo la fila de la tabla
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>#${pedido.id}</td>
                    <td>${fechaFormateada}</td>
                    <td><span class="estado ${estadoClase}">${pedido.estado}</span></td>
                    <td>${totalFormateado}</td>
                    <td>
                        <div class="acciones-pedido">
                            <button type="button" class="btn-accion ver-detalle-pedido" data-id="${pedido.id}" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${pedido.estado === 'pendiente' ? `
                                <button type="button" class="btn-accion cancelar-pedido" data-id="${pedido.id}" title="Cancelar pedido">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                `;
                
                tablaTodosPedidos.appendChild(fila);
            });
            
            // Agrego eventos para los botones
            configurarBotonesPedidos(tablaTodosPedidos);
        })
        .catch(error => {
            console.error('Error al cargar todos los pedidos:', error);
            tablaTodosPedidos.innerHTML = `
                <tr>
                    <td colspan="5" class="sin-datos">Error al cargar pedidos. Intenta de nuevo más tarde.</td>
                </tr>
            `;
        });
    }
    
    /**
     * Configura los eventos para los botones de ver detalle y cancelar pedido
     */
    function configurarBotonesPedidos(tabla) {
        // Configuro eventos para ver detalle de pedido
        const botonesVerDetalle = tabla.querySelectorAll('.ver-detalle-pedido');
        botonesVerDetalle.forEach(boton => {
            boton.addEventListener('click', function() {
                const idPedido = this.getAttribute('data-id');
                abrirDetallePedido(idPedido);
            });
        });
        
        // Configuro eventos para cancelar pedido
        const botonesCancelar = tabla.querySelectorAll('.cancelar-pedido');
        botonesCancelar.forEach(boton => {
            boton.addEventListener('click', function() {
                const idPedido = this.getAttribute('data-id');
                confirmarCancelacionPedido(idPedido);
            });
        });
    }
    
    /**
     * Abre el modal con el detalle de un pedido
     */
    function abrirDetallePedido(idPedido) {
        const token = localStorage.getItem('mecheAuthToken');
        const contenidoDetalle = document.getElementById('contenidoDetallePedido');
        const detallePedidoId = document.getElementById('detallePedidoId');
        
        // Establezco el ID del pedido en el encabezado del modal
        if (detallePedidoId) {
            detallePedidoId.textContent = idPedido;
        }
        
        // Muestro un indicador de carga
        if (contenidoDetalle) {
            contenidoDetalle.innerHTML = `
                <div class="cargando-datos">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Cargando detalles del pedido...</p>
                </div>
            `;
        }
        
        // Abro el modal
        if (modalDetallePedido) {
            modalDetallePedido.classList.add('visible');
        }
        
        // Cargo los detalles del pedido desde la API
        fetch(`/api/pedidos/${idPedido}/detalle/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(pedido => {
            if (!contenidoDetalle) return;
            
            // Formateo la fecha
            const fecha = new Date(pedido.fecha);
            const fechaFormateada = fecha.toLocaleDateString('es-CO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Determino la clase CSS según el estado
            let estadoClase = '';
            switch(pedido.estado) {
                case 'pendiente':
                    estadoClase = 'estado-pendiente';
                    break;
                case 'completado':
                    estadoClase = 'estado-completado';
                    break;
                case 'cancelado':
                    estadoClase = 'estado-cancelado';
                    break;
                case 'enviado':
                    estadoClase = 'estado-enviado';
                    break;
            }
            
            // Construyo el HTML para los productos del pedido
            let productosHTML = '';
            pedido.productos.forEach(producto => {
                const subtotal = producto.precio * producto.cantidad;
                productosHTML += `
                    <tr>
                        <td>
                            <div class="producto-info">
                                <img src="${producto.imagen}" alt="${producto.nombre}">
                                <div>
                                    <h4>${producto.nombre}</h4>
                                    <p class="producto-variante">${producto.variante || ''}</p>
                                </div>
                            </div>
                        </td>
                        <td>${producto.cantidad}</td>
                        <td>${producto.precio.toLocaleString('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            maximumFractionDigits: 0
                        })}</td>
                        <td>${subtotal.toLocaleString('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            maximumFractionDigits: 0
                        })}</td>
                    </tr>
                `;
            });
            
            // Construyo el contenido completo del modal
            contenidoDetalle.innerHTML = `
                <div class="detalle-pedido">
                    <div class="encabezado-detalle">
                        <div class="info-encabezado">
                            <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                            <p><strong>Estado:</strong> <span class="estado ${estadoClase}">${pedido.estado}</span></p>
                        </div>
                    </div>
                    
                    <div class="info-envio">
                        <h3>Información de Envío</h3>
                        <div class="direccion-envio">
                            <p><strong>${pedido.direccion.nombre}</strong></p>
                            <p>${pedido.direccion.calle}</p>
                            <p>${pedido.direccion.ciudad}, ${pedido.direccion.estado}, ${pedido.direccion.cp}</p>
                            <p>${pedido.direccion.pais}</p>
                            <p>Tel: ${pedido.direccion.telefono}</p>
                        </div>
                    </div>
                    
                    <div class="productos-detalle">
                        <h3>Productos</h3>
                        <table class="tabla-productos">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productosHTML}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3" class="text-right"><strong>Subtotal:</strong></td>
                                    <td>${pedido.subtotal.toLocaleString('es-CO', {
                                        style: 'currency',
                                        currency: 'COP',
                                        maximumFractionDigits: 0
                                    })}</td>
                                </tr>
                                <tr>
                                    <td colspan="3" class="text-right"><strong>Envío:</strong></td>
                                    <td>${pedido.costo_envio.toLocaleString('es-CO', {
                                        style: 'currency',
                                        currency: 'COP',
                                        maximumFractionDigits: 0
                                    })}</td>
                                </tr>
                                <tr class="total-fila">
                                    <td colspan="3" class="text-right"><strong>Total:</strong></td>
                                    <td><strong>${pedido.total.toLocaleString('es-CO', {
                                        style: 'currency',
                                        currency: 'COP',
                                        maximumFractionDigits: 0
                                    })}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    
                    <div class="info-pago">
                        <h3>Información de Pago</h3>
                        <div class="metodo-pago">
                            <p><strong>Método:</strong> ${pedido.metodo_pago.tipo}</p>
                            <p><strong>Tarjeta:</strong> **** **** **** ${pedido.metodo_pago.ultimos_digitos}</p>
                        </div>
                    </div>
                    
                    ${pedido.estado === 'pendiente' ? `
                        <div class="acciones-detalle">
                            <button type="button" class="btn-cancelar-pedido" data-id="${pedido.id}">Cancelar Pedido</button>
                        </div>
                    ` : ''}
                </div>
            `;
            
            // Configuro el botón de cancelar pedido si existe
            const btnCancelarPedido = contenidoDetalle.querySelector('.btn-cancelar-pedido');
            if (btnCancelarPedido) {
                btnCancelarPedido.addEventListener('click', function() {
                    const idPedido = this.getAttribute('data-id');
                    // Cierro el modal de detalles
                    modalDetallePedido.classList.remove('visible');
                    // Abro la confirmación de cancelación
                    confirmarCancelacionPedido(idPedido);
                });
            }
        })
        .catch(error => {
            console.error('Error al cargar detalles del pedido:', error);
            if (contenidoDetalle) {
                contenidoDetalle.innerHTML = `
                    <div class="error-mensaje">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Error al cargar los detalles del pedido. Intenta nuevamente más tarde.</p>
                    </div>
                `;
            }
        });
    }
    
    /**
     * Muestra un diálogo de confirmación para cancelar un pedido
     */
    function confirmarCancelacionPedido(idPedido) {
        if (confirm(`¿Estás seguro de que deseas cancelar el pedido #${idPedido}? Esta acción no se puede deshacer.`)) {
            cancelarPedido(idPedido);
        }
    }
    
    /**
     * Procesa la cancelación de un pedido
     */
    function cancelarPedido(idPedido) {
        const token = localStorage.getItem('mecheAuthToken');
        
        fetch(`/api/pedidos/${idPedido}/cancelar/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion('Pedido cancelado correctamente', 'success');
                
                // Recargo los datos de pedidos
                if (window.location.hash === '#dashboard') {
                    cargarPedidosRecientes();
                } else if (window.location.hash === '#pedidos') {
                    cargarTodosPedidos();
                }
            } else {
                mostrarNotificacion(data.mensaje || 'No se pudo cancelar el pedido', 'error');
            }
        })
        .catch(error => {
            console.error('Error al cancelar pedido:', error);
            mostrarNotificacion('Error al cancelar el pedido. Intenta nuevamente más tarde.', 'error');
        });
    }
    
    /**
     * Carga productos recomendados para el usuario
     */
    function cargarProductosRecomendados() {
        const token = localStorage.getItem('mecheAuthToken');
        
        if (!productosRecomendados) return;
        
        // Muestro un mensaje de carga
        productosRecomendados.innerHTML = `
            <div class="cargando-productos">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando recomendaciones...</p>
            </div>
        `;
        
        fetch('/api/productos/recomendados/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(productos => {
            if (productos.length === 0) {
                productosRecomendados.innerHTML = `
                    <div class="sin-recomendaciones">
                        <p>No hay recomendaciones disponibles en este momento.</p>
                    </div>
                `;
                return;
            }
            
            // Si hay productos, limpio el contenedor y agrego las tarjetas
            productosRecomendados.innerHTML = '';
            
            productos.forEach(producto => {
                // Formateo el precio
                const precioFormateado = producto.precio.toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    maximumFractionDigits: 0
                });
                
                // Calculo el precio con descuento si existe
                let precioAnterior = '';
                if (producto.descuento > 0) {
                    const precioOriginal = producto.precio / (1 - producto.descuento / 100);
                    precioAnterior = `<span class="precio-anterior">${precioOriginal.toLocaleString('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        maximumFractionDigits: 0
                    })}</span>`;
                }
                
                // Creo la tarjeta del producto
                const tarjeta = document.createElement('div');
                tarjeta.className = 'producto-card';
                tarjeta.innerHTML = `
                    <div class="producto-imagen">
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                        ${producto.descuento > 0 ? `<span class="etiqueta-descuento">-${producto.descuento}%</span>` : ''}
                    </div>
                    <div class="producto-info">
                        <h3>${producto.nombre}</h3>
                        <div class="producto-precio">
                            <span class="precio-actual">${precioFormateado}</span>
                            ${precioAnterior}
                        </div>
                    </div>
                    <div class="producto-acciones">
                        <a href="producto.html?id=${producto.id}" class="btn-ver-producto">Ver Detalles</a>
                        <button type="button" class="btn-agregar-carrito" data-id="${producto.id}">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                `;
                
                productosRecomendados.appendChild(tarjeta);
            });
            
            // Configuro eventos para los botones de agregar al carrito
            const botonesAgregarCarrito = productosRecomendados.querySelectorAll('.btn-agregar-carrito');
            botonesAgregarCarrito.forEach(boton => {
                boton.addEventListener('click', function() {
                    const idProducto = this.getAttribute('data-id');
                    agregarAlCarrito(idProducto, 1);
                });
            });
        })
        .catch(error => {
            console.error('Error al cargar productos recomendados:', error);
            productosRecomendados.innerHTML = `
                <div class="error-mensaje">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error al cargar recomendaciones. Intenta nuevamente más tarde.</p>
                </div>
            `;
        });
    }
    
    /**
     * Carga las direcciones del usuario
     */
    function cargarDirecciones() {
        const token = localStorage.getItem('mecheAuthToken');
        
        if (!listaDirecciones) return;
        
        // Muestro un mensaje de carga
        listaDirecciones.innerHTML = `
            <div class="cargando-datos">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando direcciones...</p>
            </div>
        `;
        
        fetch('/api/usuarios/direcciones/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(direcciones => {
            if (direcciones.length === 0) {
                listaDirecciones.innerHTML = `
                    <div class="sin-datos">
                        <p>No tienes direcciones guardadas. Agrega una nueva dirección para futuros pedidos.</p>
                    </div>
                `;
                return;
            }
            
            // Si hay direcciones, limpio el contenedor y agrego las tarjetas
            listaDirecciones.innerHTML = '';
            
            direcciones.forEach(direccion => {
                const tarjeta = document.createElement('div');
                tarjeta.className = 'direccion-card';
                if (direccion.predeterminada) {
                    tarjeta.classList.add('predeterminada');
                }
                
                tarjeta.innerHTML = `
                    <div class="direccion-header">
                        <h3>${direccion.nombre}</h3>
                        ${direccion.predeterminada ? '<span class="etiqueta-predeterminada">Predeterminada</span>' : ''}
                    </div>
                    <div class="direccion-datos">
                        <p>${direccion.calle}</p>
                        <p>${direccion.ciudad}, ${direccion.estado}, ${direccion.cp}</p>
                        <p>${direccion.pais}</p>
                        <p>Tel: ${direccion.telefono}</p>
                    </div>
                    <div class="direccion-acciones">
                        <button type="button" class="btn-accion editar-direccion" data-id="${direccion.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        ${!direccion.predeterminada ? `
                            <button type="button" class="btn-accion establecer-predeterminada" data-id="${direccion.id}">
                                <i class="fas fa-check-circle"></i> Predeterminada
                            </button>
                        ` : ''}
                        <button type="button" class="btn-accion eliminar-direccion" data-id="${direccion.id}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                `;
                
                listaDirecciones.appendChild(tarjeta);
            });
            
            // Configuro eventos para los botones
            configurarBotonesDirecciones();
        })
        .catch(error => {
            console.error('Error al cargar direcciones:', error);
            listaDirecciones.innerHTML = `
                <div class="error-mensaje">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error al cargar direcciones. Intenta nuevamente más tarde.</p>
                </div>
            `;
        });
    }
    
    /**
     * Configura los eventos para los botones de direcciones
     */
    function configurarBotonesDirecciones() {
        // Configuro eventos para editar dirección
        const botonesEditar = document.querySelectorAll('.editar-direccion');
        botonesEditar.forEach(boton => {
            boton.addEventListener('click', function() {
                const idDireccion = this.getAttribute('data-id');
                cargarDireccionParaEditar(idDireccion);
            });
        });
        
        // Configuro eventos para establecer como predeterminada
        const botonesPredeterminada = document.querySelectorAll('.establecer-predeterminada');
        botonesPredeterminada.forEach(boton => {
            boton.addEventListener('click', function() {
                const idDireccion = this.getAttribute('data-id');
                establecerDireccionPredeterminada(idDireccion);
            });
        });
        
        // Configuro eventos para eliminar dirección
        const botonesEliminar = document.querySelectorAll('.eliminar-direccion');
        botonesEliminar.forEach(boton => {
            boton.addEventListener('click', function() {
                const idDireccion = this.getAttribute('data-id');
                confirmarEliminarDireccion(idDireccion);
            });
        });
    }
    
    /**
     * Abre el modal para agregar una nueva dirección
     */
    function abrirModalDireccion() {
        // Limpio el formulario
        formDireccion.reset();
        formDireccion.removeAttribute('data-id');
        
        // Cambio el título del modal
        document.querySelector('#modalDireccion .modal-titulo').textContent = 'Agregar Nueva Dirección';
        
        // Muestro el modal
        modalDireccion.classList.add('visible');
    }
    
    /**
     * Carga los datos de una dirección para editarla
     */
    function cargarDireccionParaEditar(idDireccion) {
        const token = localStorage.getItem('mecheAuthToken');
        
        fetch(`/api/usuarios/direcciones/${idDireccion}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(direccion => {
            // Relleno el formulario con los datos
            document.getElementById('nombreDireccion').value = direccion.nombre;
            document.getElementById('calleDireccion').value = direccion.calle;
            document.getElementById('ciudadDireccion').value = direccion.ciudad;
            document.getElementById('estadoDireccion').value = direccion.estado;
            document.getElementById('cpDireccion').value = direccion.cp;
            document.getElementById('paisDireccion').value = direccion.pais;
            document.getElementById('telefonoDireccion').value = direccion.telefono;
            document.getElementById('predeterminadaDireccion').checked = direccion.predeterminada;
            
            // Agrego el ID al formulario para saber que estamos editando
            formDireccion.setAttribute('data-id', idDireccion);
            
            // Cambio el título del modal
            document.querySelector('#modalDireccion .modal-titulo').textContent = 'Editar Dirección';
            
            // Muestro el modal
            modalDireccion.classList.add('visible');
        })
        .catch(error => {
            console.error('Error al cargar dirección para editar:', error);
            mostrarNotificacion('Error al cargar la dirección. Intenta nuevamente más tarde.', 'error');
        });
    }
    
    /**
     * Guarda los datos de una dirección (nueva o editada)
     */
    function guardarDireccion(event) {
        event.preventDefault();
        
        const token = localStorage.getItem('mecheAuthToken');
        const idDireccion = formDireccion.getAttribute('data-id');
        const esNueva = !idDireccion;
        
        // Obtengo los datos del formulario
        const datosDireccion = {
            nombre: document.getElementById('nombreDireccion').value,
            calle: document.getElementById('calleDireccion').value,
            ciudad: document.getElementById('ciudadDireccion').value,
            estado: document.getElementById('estadoDireccion').value,
            cp: document.getElementById('cpDireccion').value,
            pais: document.getElementById('paisDireccion').value,
            telefono: document.getElementById('telefonoDireccion').value,
            predeterminada: document.getElementById('predeterminadaDireccion').checked
        };
        
        // Determino la URL y método según si es nueva o edición
        const url = esNueva ? '/api/usuarios/direcciones/' : `/api/usuarios/direcciones/${idDireccion}/`;
        const metodo = esNueva ? 'POST' : 'PUT';
        
        fetch(url, {
            method: metodo,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosDireccion)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion(`Dirección ${esNueva ? 'agregada' : 'actualizada'} correctamente`, 'success');
                
                // Cierro el modal
                modalDireccion.classList.remove('visible');
                
                // Recargo las direcciones
                cargarDirecciones();
                
                // Si estamos en el dashboard, actualizo los contadores
                if (window.location.hash === '#dashboard') {
                    cargarDatosUsuario();
                }
            } else {
                mostrarNotificacion(data.mensaje || `No se pudo ${esNueva ? 'agregar' : 'actualizar'} la dirección`, 'error');
            }
        })
        .catch(error => {
            console.error(`Error al ${esNueva ? 'agregar' : 'actualizar'} dirección:`, error);
            mostrarNotificacion(`Error al ${esNueva ? 'agregar' : 'actualizar'} la dirección. Intenta nuevamente más tarde.`, 'error');
        });
    }
    
    /**
     * Establece una dirección como predeterminada
     */
    function establecerDireccionPredeterminada(idDireccion) {
        const token = localStorage.getItem('mecheAuthToken');
        
        fetch(`/api/usuarios/direcciones/${idDireccion}/predeterminada/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion('Dirección establecida como predeterminada', 'success');
                
                // Recargo las direcciones
                cargarDirecciones();
            } else {
                mostrarNotificacion(data.mensaje || 'No se pudo establecer la dirección como predeterminada', 'error');
            }
        })
        .catch(error => {
            console.error('Error al establecer dirección predeterminada:', error);
            mostrarNotificacion('Error al establecer la dirección como predeterminada. Intenta nuevamente más tarde.', 'error');
        });
    }
    
    /**
     * Muestra confirmación para eliminar una dirección
     */
    function confirmarEliminarDireccion(idDireccion) {
        if (confirm('¿Estás seguro de que deseas eliminar esta dirección? Esta acción no se puede deshacer.')) {
            eliminarDireccion(idDireccion);
        }
    }
    
    /**
     * Elimina una dirección
     */
    function eliminarDireccion(idDireccion) {
        const token = localStorage.getItem('mecheAuthToken');
        
        fetch(`/api/usuarios/direcciones/${idDireccion}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion('Dirección eliminada correctamente', 'success');
                
                // Recargo las direcciones
                cargarDirecciones();
                
                // Si estamos en el dashboard, actualizo los contadores
                if (window.location.hash === '#dashboard') {
                    cargarDatosUsuario();
                }
            } else {
                mostrarNotificacion(data.mensaje || 'No se pudo eliminar la dirección', 'error');
            }
        })
        .catch(error => {
            console.error('Error al eliminar dirección:', error);
            mostrarNotificacion('Error al eliminar la dirección. Intenta nuevamente más tarde.', 'error');
        });
    }
    
    /**
     * Carga los métodos de pago del usuario
     */
    function cargarMetodosDePago() {
        const token = localStorage.getItem('mecheAuthToken');
        
        if (!listaMetodosPago) return;
        
        // Muestro un mensaje de carga
        listaMetodosPago.innerHTML = `
            <div class="cargando-datos">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando métodos de pago...</p>
            </div>
        `;
        
        fetch('/api/usuarios/metodos-pago/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(metodos => {
            if (metodos.length === 0) {
                listaMetodosPago.innerHTML = `
                    <div class="sin-datos">
                        <p>No tienes métodos de pago guardados. Agrega uno nuevo para agilizar tus compras.</p>
                    </div>
                `;
                return;
            }
            
            // Si hay métodos, limpio el contenedor y agrego las tarjetas
            listaMetodosPago.innerHTML = '';
            
            metodos.forEach(metodo => {
                // Determino el icono según el tipo de tarjeta
                let iconoTarjeta = 'fa-credit-card';
                if (metodo.tipo.toLowerCase().includes('visa')) {
                    iconoTarjeta = 'fa-cc-visa';
                } else if (metodo.tipo.toLowerCase().includes('mastercard')) {
                    iconoTarjeta = 'fa-cc-mastercard';
                } else if (metodo.tipo.toLowerCase().includes('amex')) {
                    iconoTarjeta = 'fa-cc-amex';
                }
                
                const tarjeta = document.createElement('div');
                tarjeta.className = 'metodo-pago-card';
                if (metodo.predeterminado) {
                    tarjeta.classList.add('predeterminado');
                }
                
                tarjeta.innerHTML = `
                    <div class="metodo-pago-header">
                        <div class="tipo-tarjeta">
                            <i class="fab ${iconoTarjeta}"></i>
                            <h3>${metodo.tipo}</h3>
                        </div>
                        ${metodo.predeterminado ? '<span class="etiqueta-predeterminada">Predeterminado</span>' : ''}
                    </div>
                    <div class="metodo-pago-datos">
                        <p>**** **** **** ${metodo.ultimos_digitos}</p>
                        <p>Vence: ${metodo.mes_expiracion}/${metodo.ano_expiracion}</p>
                        <p>Titular: ${metodo.titular}</p>
                    </div>
                    <div class="metodo-pago-acciones">
                        ${!metodo.predeterminado ? `
                            <button type="button" class="btn-accion establecer-predeterminado-pago" data-id="${metodo.id}">
                                <i class="fas fa-check-circle"></i> Predeterminado
                            </button>
                        ` : ''}
                        <button type="button" class="btn-accion eliminar-metodo-pago" data-id="${metodo.id}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                `;
                
                listaMetodosPago.appendChild(tarjeta);
            });
            
            // Configuro eventos para los botones
            configurarBotonesMetodosPago();
        })
        .catch(error => {
            console.error('Error al cargar métodos de pago:', error);
            listaMetodosPago.innerHTML = `
                <div class="error-mensaje">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error al cargar métodos de pago. Intenta nuevamente más tarde.</p>
                </div>
            `;
        });
    }
    
    /**
     * Configura los eventos para los botones de métodos de pago
     */
    function configurarBotonesMetodosPago() {
        // Configuro eventos para establecer como predeterminado
        const botonesPredeterminado = document.querySelectorAll('.establecer-predeterminado-pago');
        botonesPredeterminado.forEach(boton => {
            boton.addEventListener('click', function() {
                const idMetodo = this.getAttribute('data-id');
                establecerMetodoPagoPredeterminado(idMetodo);
            });
        });
        
        // Configuro eventos para eliminar método de pago
        const botonesEliminar = document.querySelectorAll('.eliminar-metodo-pago');
        botonesEliminar.forEach(boton => {
            boton.addEventListener('click', function() {
                const idMetodo = this.getAttribute('data-id');
                confirmarEliminarMetodoPago(idMetodo);
            });
        });
    }
    
    /**
     * Abre el modal para agregar un nuevo método de pago
     */
    function abrirModalMetodoPago() {
        // Limpio el formulario
        formMetodoPago.reset();
        
        // Muestro el modal
        modalMetodoPago.classList.add('visible');
    }
    
    /**
     * Guarda los datos de un método de pago
     */
    function guardarMetodoPago(event) {
        event.preventDefault();
        
        const token = localStorage.getItem('mecheAuthToken');
        
        // Obtengo los datos del formulario
        const datosMetodoPago = {
            numero_tarjeta: document.getElementById('numeroTarjeta').value.replace(/\s/g, ''),
            titular: document.getElementById('titularTarjeta').value,
            mes_expiracion: document.getElementById('mesExpiracion').value,
            ano_expiracion: document.getElementById('anoExpiracion').value,
            cvv: document.getElementById('cvvTarjeta').value,
            predeterminado: document.getElementById('predeterminadoMetodoPago').checked
        };
        
        fetch('/api/usuarios/metodos-pago/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosMetodoPago)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion('Método de pago agregado correctamente', 'success');
                
                // Cierro el modal
                modalMetodoPago.classList.remove('visible');
                
                // Recargo los métodos de pago
                cargarMetodosDePago();
                
                // Si estamos en el dashboard, actualizo los contadores
                if (window.location.hash === '#dashboard') {
                    cargarDatosUsuario();
                }
            } else {
                mostrarNotificacion(data.mensaje || 'No se pudo agregar el método de pago', 'error');
            }
        })
        .catch(error => {
            console.error('Error al agregar método de pago:', error);
            mostrarNotificacion('Error al agregar el método de pago. Intenta nuevamente más tarde.', 'error');
        });
    }
    
    /**
     * Establece un método de pago como predeterminado
     */
    function establecerMetodoPagoPredeterminado(idMetodo) {
        const token = localStorage.getItem('mecheAuthToken');
        
        fetch(`/api/usuarios/metodos-pago/${idMetodo}/predeterminado/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion('Método de pago establecido como predeterminado', 'success');
                
                // Recargo los métodos de pago
                cargarMetodosDePago();
            } else {
                mostrarNotificacion(data.mensaje || 'No se pudo establecer el método de pago como predeterminado', 'error');
            }
        })
        .catch(error => {
            console.error('Error al establecer método de pago predeterminado:', error);
            mostrarNotificacion('Error al establecer el método de pago como predeterminado. Intenta nuevamente más tarde.', 'error');
        });
    }
    
    /**
     * Muestra confirmación para eliminar un método de pago
     */
    function confirmarEliminarMetodoPago(idMetodo) {
        if (confirm('¿Estás seguro de que deseas eliminar este método de pago? Esta acción no se puede deshacer.')) {
            eliminarMetodoPago(idMetodo);
        }
    }
    
    /**
     * Elimina un método de pago
     */
    function eliminarMetodoPago(idMetodo) {
        const token = localStorage.getItem('mecheAuthToken');
        
        fetch(`/api/usuarios/metodos-pago/${idMetodo}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion('Método de pago eliminado correctamente', 'success');
                
                // Recargo los métodos de pago
                cargarMetodosDePago();
                
                // Si estamos en el dashboard, actualizo los contadores
                if (window.location.hash === '#dashboard') {
                    cargarDatosUsuario();
                }
            } else {
                mostrarNotificacion(data.mensaje || 'No se pudo eliminar el método de pago', 'error');
            }
        })
        .catch(error => {
            console.error('Error al eliminar método de pago:', error);
            mostrarNotificacion('Error al eliminar el método de pago. Intenta nuevamente más tarde.', 'error');
        });
    }
    
    // ===== GESTIÓN DEL PERFIL DE USUARIO =====
    
    /**
     * Actualiza los datos del perfil del usuario
     */
    function actualizarPerfil(event) {
        event.preventDefault();
        
        const token = localStorage.getItem('mecheAuthToken');
        
        // Obtengo los datos del formulario
        const datosPerfil = {
            nombre: document.getElementById('nombreCompleto').value,
            email: document.getElementById('emailPerfil').value,
            telefono: document.getElementById('telefonoPerfil').value
        };
        
        fetch('/api/usuarios/perfil/', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosPerfil)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion('Perfil actualizado correctamente', 'success');
                
                // Actualizo la información del usuario en la interfaz
                cargarDatosUsuario();
            } else {
                mostrarNotificacion(data.mensaje || 'No se pudo actualizar el perfil', 'error');
            }
        })
        .catch(error => {
            console.error('Error al actualizar perfil:', error);
            mostrarNotificacion('Error al actualizar el perfil. Intenta nuevamente más tarde.', 'error');
        });
    }
    
    /**
     * Cambia la contraseña del usuario
     */
    function cambiarContrasena(event) {
        event.preventDefault();
        
        const token = localStorage.getItem('mecheAuthToken');
        const contrasenaActual = document.getElementById('contrasenaActual').value;
        const nuevaContrasena = document.getElementById('nuevaContrasena').value;
        const confirmacionContrasena = document.getElementById('confirmacionContrasena').value;
        
        // Verifico que las contraseñas coincidan
        if (nuevaContrasena !== confirmacionContrasena) {
            mostrarNotificacion('Las contraseñas no coinciden', 'error');
            return;
        }
        
        // Verifico que la nueva contraseña cumpla con requisitos mínimos
        if (nuevaContrasena.length < 8) {
            mostrarNotificacion('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }
        
        const datosContrasena = {
            contrasena_actual: contrasenaActual,
            nueva_contrasena: nuevaContrasena
        };
        
        fetch('/api/usuarios/cambiar-contrasena/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosContrasena)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion('Contraseña actualizada correctamente', 'success');
                
                // Limpio el formulario
                formCambiarContrasena.reset();
            } else {
                mostrarNotificacion(data.mensaje || 'No se pudo actualizar la contraseña', 'error');
            }
        })
        .catch(error => {
            console.error('Error al cambiar contraseña:', error);
            mostrarNotificacion('Error al cambiar la contraseña. Intenta nuevamente más tarde.', 'error');
        });
    }
    
    /**
     * Maneja el cambio de la foto de perfil
     */
    function cambiarFotoPerfil() {
        // Simulo clic en el input de archivo oculto
        inputFotoPerfil.click();
    }
    
    /**
     * Sube la nueva foto de perfil cuando se selecciona un archivo
     */
    function subirFotoPerfil(event) {
        const token = localStorage.getItem('mecheAuthToken');
        const archivo = event.target.files[0];
        
        if (!archivo) return;
        
        // Verifico que sea una imagen
        if (!archivo.type.startsWith('image/')) {
            mostrarNotificacion('Por favor, selecciona un archivo de imagen válido', 'error');
            return;
        }
        
        // Muestro indicador de carga
        perfilFotoActual.src = 'assets/img/cargando-imagen.gif';
        
        const formData = new FormData();
        formData.append('foto_perfil', archivo);
        
        fetch('/api/usuarios/foto-perfil/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion('Foto de perfil actualizada correctamente', 'success');
                
                // Actualizo la foto en la interfaz
                const urlFoto = data.url_foto;
                perfilFotoActual.src = urlFoto;
                
                // Actualizo la foto en el menú de usuario
                if (imgPerfilUsuario) {
                    imgPerfilUsuario.src = urlFoto;
                }
            } else {
                // Restauro la foto anterior en caso de error
                cargarDatosPerfil();
                mostrarNotificacion(data.mensaje || 'No se pudo actualizar la foto de perfil', 'error');
            }
        })
        .catch(error => {
            console.error('Error al subir foto de perfil:', error);
            // Restauro la foto anterior en caso de error
            cargarDatosPerfil();
            mostrarNotificacion('Error al subir la foto de perfil. Intenta nuevamente más tarde.', 'error');
        });
    }
    
    // ===== GESTIÓN DEL CARRITO =====
    
    /**
     * Actualiza el contador del carrito
     */
    function actualizarContadorCarrito() {
        // Obtengo los items del carrito desde el localStorage
        let carrito = JSON.parse(localStorage.getItem('mecheCarrito')) || [];
        
        // Sumo las cantidades
        const cantidad = carrito.reduce((total, item) => total + item.cantidad, 0);
        
        // Actualizo el contador en la interfaz
        if (contadorCarrito) {
            contadorCarrito.textContent = cantidad;
            
            // Si hay productos, muestro el contador
            if (cantidad > 0) {
                contadorCarrito.classList.add('activo');
            } else {
                contadorCarrito.classList.remove('activo');
            }
        }
    }
    
    /**
     * Agrega un producto al carrito
     */
    function agregarAlCarrito(idProducto, cantidad) {
        const token = localStorage.getItem('mecheAuthToken');
        
        // Primero obtengo la información actualizada del producto
        fetch(`/api/productos/${idProducto}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(producto => {
            // Obtengo el carrito actual
            let carrito = JSON.parse(localStorage.getItem('mecheCarrito')) || [];
            
            // Verifico si el producto ya está en el carrito
            const indexProducto = carrito.findIndex(item => item.id === idProducto);
            
            if (indexProducto !== -1) {
                // Si ya existe, actualizo la cantidad
                carrito[indexProducto].cantidad += cantidad;
            } else {
                // Si no existe, lo agrego
                carrito.push({
                    id: idProducto,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    imagen: producto.imagen,
                    cantidad: cantidad
                });
            }
            
            // Guardo el carrito actualizado
            localStorage.setItem('mecheCarrito', JSON.stringify(carrito));
            
            // Actualizo el contador
            actualizarContadorCarrito();
            
            // Muestro notificación
            mostrarNotificacion('Producto agregado al carrito', 'success');
        })
        .catch(error => {
            console.error('Error al agregar producto al carrito:', error);
            mostrarNotificacion('Error al agregar el producto al carrito. Intenta nuevamente más tarde.', 'error');
        });
    }
    
    // ===== UTILIDADES =====
    
    /**
     * Muestra una notificación en pantalla
     */
    function mostrarNotificacion(mensaje, tipo) {
        // Creo el elemento de notificación
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion ${tipo}`;
        
        // Determino el icono según el tipo
        let icono = 'fa-info-circle';
        if (tipo === 'success') {
            icono = 'fa-check-circle';
        } else if (tipo === 'error') {
            icono = 'fa-exclamation-circle';
        } else if (tipo === 'warning') {
            icono = 'fa-exclamation-triangle';
        }
        
        // Agrego el contenido
        notificacion.innerHTML = `
            <i class="fas ${icono}"></i>
            <span>${mensaje}</span>
            <button type="button" class="cerrar-notificacion">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Agrego al DOM
        document.body.appendChild(notificacion);
        
        // Configuro el evento para cerrar
        const botonCerrar = notificacion.querySelector('.cerrar-notificacion');
        botonCerrar.addEventListener('click', function() {
            document.body.removeChild(notificacion);
        });
        
        // Configurar desaparición automática después de 5 segundos
        setTimeout(() => {
            if (document.body.contains(notificacion)) {
                document.body.removeChild(notificacion);
            }
        }, 5000);
    }
    
    /**
     * Función auxiliar para formatear los campos de tarjeta de crédito
     */
    function formatearNumeroTarjeta(input) {
        // Elimino espacios y caracteres no numéricos
        let valor = input.value.replace(/\D/g, '');
        
        // Limito a 16 dígitos (estándar para la mayoría de tarjetas)
        valor = valor.substring(0, 16);
        
        // Agrego espacios cada 4 dígitos
        valor = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
        
        // Actualizo el valor del campo
        input.value = valor;
    }
    
    // ===== CONFIGURACIÓN DE EVENTOS =====
    
    /**
     * Configura todos los eventos necesarios para la aplicación
     */
    function configurarEventos() {
        // Evento para mostrar/ocultar el menú de usuario
        if (menuUsuarioBtn && dropdownMenu) {
            menuUsuarioBtn.addEventListener('click', function(e) {
                e.preventDefault();
                dropdownMenu.classList.toggle('activo');
            });
            
            // Cerrar el menú al hacer clic fuera
            document.addEventListener('click', function(e) {
                if (!menuUsuarioBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.remove('activo');
                }
            });
        }
        
        // Eventos para cerrar sesión
        if (cerrarSesionBtn) {
            cerrarSesionBtn.addEventListener('click', cerrarSesion);
        }
        
        if (cerrarSesionMenuBtn) {
            cerrarSesionMenuBtn.addEventListener('click', cerrarSesion);
        }
        
        // Eventos para el buscador
        if (cerrarBusquedaBtn && buscadorInput) {
            cerrarBusquedaBtn.addEventListener('click', function() {
                buscadorInput.value = '';
                this.style.display = 'none';
            });
            
            buscadorInput.addEventListener('input', function() {
                cerrarBusquedaBtn.style.display = this.value.length > 0 ? 'block' : 'none';
            });
        }
        
        // Eventos para cerrar modales
        btnsModalCerrar.forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('visible');
                }
            });
        });
        
        // Cerrar modal al hacer clic fuera
        document.addEventListener('click', function(e) {
            const modales = document.querySelectorAll('.modal.visible');
            modales.forEach(modal => {
                const contenidoModal = modal.querySelector('.modal-contenido');
                if (modal.contains(e.target) && !contenidoModal.contains(e.target)) {
                    modal.classList.remove('visible');
                }
            });
        });
        
        // Eventos para direcciones
        if (btnAgregarDireccion) {
            btnAgregarDireccion.addEventListener('click', abrirModalDireccion);
        }
        
        if (formDireccion) {
            formDireccion.addEventListener('submit', guardarDireccion);
        }
        
        // Eventos para métodos de pago
        if (btnAgregarMetodoPago) {
            btnAgregarMetodoPago.addEventListener('click', abrirModalMetodoPago);
        }
        
        if (formMetodoPago) {
            formMetodoPago.addEventListener('submit', guardarMetodoPago);
            
            // Formateador para número de tarjeta
            const inputNumeroTarjeta = document.getElementById('numeroTarjeta');
            if (inputNumeroTarjeta) {
                inputNumeroTarjeta.addEventListener('input', function() {
                    formatearNumeroTarjeta(this);
                });
            }
        }
        
        // Eventos para perfil de usuario
        if (formEditarPerfil) {
            formEditarPerfil.addEventListener('submit', actualizarPerfil);
        }
        
        if (formCambiarContrasena) {
            formCambiarContrasena.addEventListener('submit', cambiarContrasena);
        }
        
        if (btnCambiarFoto) {
            btnCambiarFoto.addEventListener('click', cambiarFotoPerfil);
        }
        
        if (inputFotoPerfil) {
            inputFotoPerfil.addEventListener('change', subirFotoPerfil);
        }
        
        // Eventos para paginación de pedidos
        if (btnPaginaAnterior) {
            btnPaginaAnterior.addEventListener('click', function() {
                if (paginaActual > 1) {
                    paginaActual--;
                    cargarTodosPedidos();
                }
            });
        }
        
        if (btnPaginaSiguiente) {
            btnPaginaSiguiente.addEventListener('click', function() {
                if (paginaActual < totalPaginas) {
                    paginaActual++;
                    cargarTodosPedidos();
                }
            });
        }
        
        // Eventos para filtrado de pedidos
        const filtroSelect = document.getElementById('filtroEstadoPedido');
        if (filtroSelect) {
            filtroSelect.addEventListener('change', function() {
                filtroEstadoPedido = this.value;
                paginaActual = 1; // Reinicio la paginación
                cargarTodosPedidos();
            });
        }
        
        // Eventos para búsqueda de pedidos
        const formBuscarPedido = document.getElementById('formBuscarPedido');
        if (formBuscarPedido) {
            formBuscarPedido.addEventListener('submit', function(e) {
                e.preventDefault();
                const inputBuscar = this.querySelector('input');
                busquedaPedido = inputBuscar.value.trim();
                paginaActual = 1; // Reinicio la paginación
                cargarTodosPedidos();
            });
        }
    }
    
    // ===== INICIALIZACIÓN DE LA APLICACIÓN =====
    
    /**
     * Función principal que inicializa la aplicación
     */
    function inicializarAplicacion() {
        // Verifico si el usuario ha iniciado sesión
        verificarSesion();
        
        // Configuro todos los eventos
        configurarEventos();
        
        // Actualizo el contador del carrito
        actualizarContadorCarrito();
    }
    
    // Inicio la aplicación cuando el DOM está completamente cargado
    inicializarAplicacion();
});
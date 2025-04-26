document.addEventListener('DOMContentLoaded', async function () { // Se convierte a async para el await inicial
    // ===== REFERENCIAS DEL DOM =====

    // Referencias de elementos de usuario
    const menuUsuarioBtn = document.getElementById('menuUsuario');
    const dropdownMenu = document.querySelector('.dropdown-menu');

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

    // ===== NUEVA LÓGICA DE AUTENTICACIÓN =====

    /**
     * Verifica la autenticación del usuario al cargar la página.
     * Redirige al login si el token no es válido o ha expirado.
     * Intenta refrescar el token si está expirado.
     */
    async function verificarAutenticacionInicial() {
        const accessToken = localStorage.getItem("accessToken");
        const tokenExpiration = localStorage.getItem("tokenExpiration");

        // Si no hay token o está expirado (localmente), redirigimos al login
        if (!accessToken || (tokenExpiration && new Date() > new Date(tokenExpiration))) {
            console.log("No hay token válido localmente o ha expirado. Redirigiendo al login...");
            limpiarSesionYRedirigir();
            return false; // Indica que la autenticación falló
        }

        try {

            const response = await fetch("http://127.0.0.1:8000/api/usuarios/verificar-autenticacion/", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                
                if (response.status === 401) {
                    console.log("Token de acceso inválido o expirado. Intentando refrescar...");
                    
                    await refreshToken();
                    
                    return false; 
                } else {
                    // Otro error de respuesta del servidor
                    console.error(`Error en la verificación del token: ${response.status}`);
                    throw new Error("Error en la autenticación");
                }
            } else {
                
                const userData = await response.json();
                console.log("Usuario autenticado:", userData.usuario);

                
                actualizarUIUsuario(userData.usuario);

                
                inicializarFuncionalidadPostAutenticacion();

                return true; 
            }
        } catch (error) {
            console.error("Error de autenticación:", error);
            // En caso de cualquier error (fetch, refresh, etc.), limpiamos y redirigimos
            limpiarSesionYRedirigir();
            return false; 
        }
    }

    /**
     * Función para refrescar el token de acceso usando el refresh token.
     */
    async function refreshToken() {
        const refreshTokenValue = localStorage.getItem("refreshToken");

        if (!refreshTokenValue) {
            console.log("No hay refresh token disponible para refrescar. Redirigiendo al login...");
            limpiarSesionYRedirigir(); 
            throw new Error("No hay refresh token disponible"); // Lanza error para detener la ejecución si es necesario
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/usuarios/token/refresh/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ refresh: refreshTokenValue })
            });

            if (!response.ok) {
                console.error(`Error al refrescar token: ${response.status}`);
                throw new Error("No se pudo refrescar el token");
            }

            const data = await response.json();

            // Actualizamos el token de acceso en localStorage
            localStorage.setItem("accessToken", data.access);

            // Actualizamos la fecha de expiración (asumiendo 1 hora, ajustar si la API devuelve 'expires_in')
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1); // Asume 1 hora de validez
            localStorage.setItem("tokenExpiration", expiresAt.toISOString());

            console.log("Token refrescado exitosamente");

            // Recargar la página para aplicar el nuevo token y reiniciar el estado
            window.location.reload();

        } catch (error) {
            console.error("Error crítico al refrescar el token:", error);
            // Si no podemos refrescar, limpiamos todo y enviamos al usuario al login
            limpiarSesionYRedirigir();
            // Opcional: lanzar el error para que la cadena de promesas/await lo maneje si es necesario
            // throw error;
        }
    }

    /**
     * Limpia los tokens del localStorage y redirige al login.
     */
    function limpiarSesionYRedirigir() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("tokenExpiration");
        // Opcional: limpiar también el carrito u otros datos de sesión si es necesario
        // localStorage.removeItem('mecheCarrito');
        console.log("Tokens eliminados. Redirigiendo a index-login.html...");
        window.location.href = "index-login.html";
    }

    /**
     * Cierra la sesión del usuario eliminando los tokens y redirigiendo al login.
     * Esta función reemplaza la antigua 'cerrarSesion'.
     */
    function logout() {
        console.log("Cerrando sesión...");
        // Opcional: notificar al backend sobre el cierre de sesión (si tienes un endpoint para ello)
        // fetch('/api/auth/logout/', { method: 'POST', headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}`} })
        // .finally(() => {
        //     limpiarSesionYRedirigir();
        // });
        limpiarSesionYRedirigir(); // Llama a la función centralizada
    }

    /**
     * Actualiza los elementos de la UI con los datos del usuario.
     * @param {Object} usuario - El objeto de usuario obtenido de la API.
     */
    function actualizarUIUsuario(usuario) {
        //if (nombreUsuarioSpan) nombreUsuarioSpan.textContent = usuario.nombre ? usuario.nombre.split(' ')[0] : 'Usuario'; 
        if (nombreClientePanel) nombreClientePanel.textContent = usuario.nombre ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : 'Cliente';
        if (nombrePerfilUsuario) nombrePerfilUsuario.textContent = usuario.nombre ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : 'Usuario';
        if (emailUsuario) emailUsuario.textContent = usuario.email || 'email@ejemplo.com';

        // Actualizar foto de perfil si existe
        if (imgPerfilUsuario && usuario.foto_perfil) {
            imgPerfilUsuario.src = usuario.foto_perfil;
            imgPerfilUsuario.alt = `Foto de ${usuario.nombre || 'Usuario'}`;
        }
        if (perfilFotoActual && usuario.foto_perfil) { // Actualiza también la foto en la sección perfil
            perfilFotoActual.src = usuario.foto_perfil;
        }

        // Aquí podrías actualizar otros datos si la API los devuelve (total_pedidos, etc.)
        // Por ahora, usamos los elementos existentes que se cargan en otras funciones.
    }

    // ===== IMPLEMENTACIÓN SPA =====

    /**
     * Función que inicializa el comportamiento SPA de la aplicación
     */
    function inicializarSPA() {
        // Escucho cambios en el hash para cambiar de sección
        window.addEventListener('hashchange', manejarCambioHash);

        // Configuro los enlaces del menú para cambiar secciones
        menuSecciones.forEach(enlace => {
            enlace.addEventListener('click', function (e) {
                const seccionAttr = this.getAttribute('data-section');
                // Solo prevenir default si es un enlace de sección válido
                if (seccionAttr) {
                    e.preventDefault();
                    window.location.hash = seccionAttr;

                    // Si es un enlace del dropdown, lo cierro
                    if (dropdownMenu && dropdownMenu.classList.contains('activo')) {
                        dropdownMenu.classList.remove('activo');
                    }
                }
                // Si no tiene data-section (como el de cerrar sesión), no previene el default
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
            // No forzar el hash aquí si ya estamos manejando uno inválido,
            // simplemente proceder a mostrar el dashboard.
            // window.location.hash = seccion;
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

            // Cargo los datos específicos de cada sección (asegurarse que las funciones usen el nuevo token)
            switch (seccion) {
                case 'dashboard':
                    cargarDatosDashboard();
                    break;
                case 'perfil':
                    cargarDatosPerfil();
                    break;
                case 'pedidos':
                    // Reiniciar estado de paginación y filtros al cambiar a la sección
                    paginaActual = 1;
                    filtroEstadoPedido = 'todos';
                    busquedaPedido = '';
                    // Resetear UI de filtros si es necesario
                    const filtroSelect = document.getElementById('filtroEstadoPedido');
                    if (filtroSelect) filtroSelect.value = 'todos';
                    const inputBuscar = document.querySelector('#formBuscarPedido input');
                    if (inputBuscar) inputBuscar.value = '';

                    cargarTodosPedidos();
                    break;
                case 'direcciones':
                    cargarDirecciones();
                    break;
                case 'pagos':
                    cargarMetodosDePago();
                    break;
            }
        } else {
            console.warn(`Sección '${seccion}' no encontrada. Mostrando dashboard.`);
            // Si la sección deseada no existe, muestra el dashboard por defecto
            const seccionDashboard = document.getElementById('seccion-dashboard');
            if (seccionDashboard) {
                seccionDashboard.classList.add('active');
                cargarDatosDashboard();
                actualizarMenuActivo('dashboard'); // Asegura que el menú refleje el dashboard
            }
        }
    }

    /**
     * Carga los datos principales del dashboard
     */
    function cargarDatosDashboard() {
        cargarPedidosRecientes();
        cargarProductosRecomendados();
        // Asegurarse que los contadores se carguen o actualicen aquí si es necesario
        cargarContadoresResumen(); // Función separada para claridad
    }

    /**
     * Carga los contadores de resumen (pedidos, direcciones, pagos).
     * Podría obtenerse de la llamada inicial de autenticación o una específica.
     */
    function cargarContadoresResumen() {
        const token = localStorage.getItem('accessToken'); // Usar el nuevo nombre del token
        if (!token) return; // No hacer nada si no hay token

        // Asumimos que la API de perfil devuelve estos contadores
        // Si no, necesitarías un endpoint específico o calcularlos localmente si es posible.
        fetch('http://127.0.0.1:8000/api/usuarios/perfil/', { // Ajustar endpoint si es diferente
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error ${response.status} al cargar contadores`);
                }
                return response.json();
            })
            .then(data => {
                // Asumiendo que la respuesta tiene un objeto 'usuario' con los contadores
                const usuario = data.usuario || data; // Ajustar según la estructura de tu API
                if (totalPedidos) totalPedidos.textContent = usuario.total_pedidos || 0;
                if (totalDirecciones) totalDirecciones.textContent = usuario.total_direcciones || 0;
                if (totalMetodosPago) totalMetodosPago.textContent = usuario.total_metodos_pago || 0;
            })
            .catch(error => {
                console.error('Error al cargar contadores de resumen:', error);
                // Podrías poner 'N/A' o 'Error' en los contadores
                if (totalPedidos) totalPedidos.textContent = '-';
                if (totalDirecciones) totalDirecciones.textContent = '-';
                if (totalMetodosPago) totalMetodosPago.textContent = '-';
            });
    }


    /**
     * Carga los datos del perfil del usuario para la edición
     */
    function cargarDatosPerfil() {
        const token = localStorage.getItem('accessToken'); // Usa 'accessToken'
        if (!token) return; // Si no hay token, no cargar nada

        fetch('http://127.0.0.1:8000/api/usuarios/perfil/', { // Endpoint de perfil
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    // Si falla (ej. token inválido aunque la verificación inicial pasó, raro pero posible)
                    if (response.status === 401) {
                        console.warn("Token inválido al cargar perfil. Intentando refrescar...");
                        refreshToken(); // Intentar refrescar, que recargará la página o redirigirá
                    }
                    throw new Error(`Error ${response.status} al cargar perfil`);
                }
                return response.json();
            })
            .then(data => {
                const usuario = data.usuario || data; // Adaptar según la estructura de tu API
                // Relleno el formulario con los datos del usuario
                document.getElementById('nombreCompleto').value = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
                document.getElementById('emailPerfil').value = usuario.email || '';
                document.getElementById('telefonoPerfil').value = usuario.telefono || '';

                // Actualizo la foto de perfil en la sección de edición
                if (perfilFotoActual) {
                    perfilFotoActual.src = usuario.foto_perfil || 'assets/img/perfil-placeholder.png'; // Usar placeholder si no hay foto
                }
            })
            .catch(error => {
                console.error('Error al cargar datos del perfil:', error);
                mostrarNotificacion('No se pudieron cargar tus datos de perfil. Intenta recargar.', 'error');
                // Podrías deshabilitar el formulario o mostrar un mensaje en él
            });
    }

    // ===== FUNCIONES PARA CARGAR DATOS (Pedidos, Recomendados, Direcciones, Pagos) =====
    // IMPORTANTE: Asegurarse que TODAS las funciones que hagan fetch usen 'accessToken'
    // y el endpoint correcto. Revisar y adaptar cada una.

    /**
     * Carga los pedidos recientes del usuario para la sección dashboard
     */
    function cargarPedidosRecientes() {
        const token = localStorage.getItem('accessToken'); // Usar el nuevo token
        if (!token || !tablaPedidosRecientes) return;

        tablaPedidosRecientes.innerHTML = `<tr><td colspan="5" class="sin-datos">Cargando pedidos recientes...</td></tr>`;

        fetch('http://127.0.0.1:8000/api/pedidos/recientes/?limite=5', { // Adaptar endpoint si es necesario
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) refreshToken(); // Intenta refrescar si no autorizado
                    throw new Error(`Error ${response.status} al cargar pedidos recientes`);
                }
                return response.json();
            })
            .then(pedidos => {
                if (!pedidos || pedidos.length === 0) {
                    tablaPedidosRecientes.innerHTML = `<tr><td colspan="5" class="sin-datos">No tienes pedidos recientes</td></tr>`;
                    return;
                }

                tablaPedidosRecientes.innerHTML = ''; // Limpiar tabla
                pedidos.forEach(pedido => {
                    const fechaFormateada = new Date(pedido.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    const estadoClase = `estado-${pedido.estado.toLowerCase()}`; // Asumir clase CSS basada en estado
                    const totalFormateado = (pedido.total || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                    <td>#${pedido.id || pedido.numero_pedido || 'N/A'}</td>
                    <td>${fechaFormateada}</td>
                    <td><span class="estado ${estadoClase}">${pedido.estado || 'Desconocido'}</span></td>
                    <td>${totalFormateado}</td>
                    <td>
                        <div class="acciones-pedido">
                            <button type="button" class="btn-accion ver-detalle-pedido" data-id="${pedido.id}" title="Ver detalles"><i class="fas fa-eye"></i></button>
                            ${pedido.estado === 'pendiente' ? `<button type="button" class="btn-accion cancelar-pedido" data-id="${pedido.id}" title="Cancelar pedido"><i class="fas fa-times"></i></button>` : ''}
                        </div>
                    </td>
                `;
                    tablaPedidosRecientes.appendChild(fila);
                });

                configurarBotonesPedidos(tablaPedidosRecientes);
            })
            .catch(error => {
                console.error('Error al cargar pedidos recientes:', error);
                tablaPedidosRecientes.innerHTML = `<tr><td colspan="5" class="sin-datos">Error al cargar pedidos. Intenta de nuevo.</td></tr>`;
            });
    }

    /**
     * Carga todos los pedidos para la sección de pedidos con paginación y filtros
     */
    function cargarTodosPedidos() {
        const token = localStorage.getItem('accessToken'); // Usar el nuevo token
        if (!token || !tablaTodosPedidos) return;

        tablaTodosPedidos.innerHTML = `<tr><td colspan="5" class="sin-datos">Cargando pedidos...</td></tr>`;

        let url = `http://127.0.0.1:8000/api/pedidos/?pagina=${paginaActual}`; // Adaptar endpoint
        if (filtroEstadoPedido !== 'todos') url += `&estado=${filtroEstadoPedido}`;
        if (busquedaPedido) url += `&buscar=${encodeURIComponent(busquedaPedido)}`;

        fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) refreshToken();
                    throw new Error(`Error ${response.status} al cargar todos los pedidos`);
                }
                return response.json();
            })
            .then(data => {
                totalPaginas = data.total_paginas || 1;
                spanPaginaActual.textContent = `Página ${paginaActual} de ${totalPaginas}`;
                btnPaginaAnterior.disabled = paginaActual <= 1;
                btnPaginaSiguiente.disabled = paginaActual >= totalPaginas;

                const pedidos = data.resultados || [];
                if (pedidos.length === 0) {
                    tablaTodosPedidos.innerHTML = `<tr><td colspan="5" class="sin-datos">No se encontraron pedidos con los filtros aplicados</td></tr>`;
                    return;
                }

                tablaTodosPedidos.innerHTML = '';
                pedidos.forEach(pedido => {
                    const fechaFormateada = new Date(pedido.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    const estadoClase = `estado-${pedido.estado.toLowerCase()}`;
                    const totalFormateado = (pedido.total || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                    <td>#${pedido.id || pedido.numero_pedido || 'N/A'}</td>
                    <td>${fechaFormateada}</td>
                    <td><span class="estado ${estadoClase}">${pedido.estado || 'Desconocido'}</span></td>
                    <td>${totalFormateado}</td>
                    <td>
                        <div class="acciones-pedido">
                            <button type="button" class="btn-accion ver-detalle-pedido" data-id="${pedido.id}" title="Ver detalles"><i class="fas fa-eye"></i></button>
                            ${pedido.estado === 'pendiente' ? `<button type="button" class="btn-accion cancelar-pedido" data-id="${pedido.id}" title="Cancelar pedido"><i class="fas fa-times"></i></button>` : ''}
                        </div>
                    </td>
                `;
                    tablaTodosPedidos.appendChild(fila);
                });

                configurarBotonesPedidos(tablaTodosPedidos);
            })
            .catch(error => {
                console.error('Error al cargar todos los pedidos:', error);
                tablaTodosPedidos.innerHTML = `<tr><td colspan="5" class="sin-datos">Error al cargar pedidos. Intenta de nuevo.</td></tr>`;
            });
    }

    /**
     * Configura los eventos para los botones de ver detalle y cancelar pedido
     */
    function configurarBotonesPedidos(tabla) {
        const botonesVerDetalle = tabla.querySelectorAll('.ver-detalle-pedido');
        botonesVerDetalle.forEach(boton => {
            boton.addEventListener('click', function () {
                const idPedido = this.getAttribute('data-id');
                abrirDetallePedido(idPedido);
            });
        });

        const botonesCancelar = tabla.querySelectorAll('.cancelar-pedido');
        botonesCancelar.forEach(boton => {
            boton.addEventListener('click', function () {
                const idPedido = this.getAttribute('data-id');
                confirmarCancelacionPedido(idPedido);
            });
        });
    }

    /**
     * Abre el modal con el detalle de un pedido
     */
    function abrirDetallePedido(idPedido) {
        const token = localStorage.getItem('accessToken'); // Usar nuevo token
        const contenidoDetalle = document.getElementById('contenidoDetallePedido');
        const detallePedidoId = document.getElementById('detallePedidoId');
        if (!token || !modalDetallePedido || !contenidoDetalle || !detallePedidoId) return;

        detallePedidoId.textContent = idPedido;
        contenidoDetalle.innerHTML = `<div class="cargando-datos"><i class="fas fa-spinner fa-spin"></i><p>Cargando detalles...</p></div>`;
        modalDetallePedido.classList.add('visible');

        fetch(`http://127.0.0.1:8000/api/pedidos/${idPedido}/detalle/`, { // Adaptar endpoint
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) refreshToken();
                    throw new Error(`Error ${response.status} al cargar detalle del pedido`);
                }
                return response.json();
            })
            .then(pedido => {
                // ... (resto del código para construir el HTML del detalle, sin cambios lógicos significativos)
                // Asegúrate que las propiedades (pedido.fecha, pedido.estado, pedido.productos, etc.) coincidan con tu API
                const fechaFormateada = new Date(pedido.fecha).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                const estadoClase = `estado-${pedido.estado.toLowerCase()}`;
                let productosHTML = '';
                (pedido.productos || []).forEach(producto => {
                    const subtotal = (producto.precio * producto.cantidad) || 0;
                    productosHTML += `
                    <tr>
                        <td>
                            <div class="producto-info">
                                <img src="${producto.imagen || 'assets/img/placeholder-producto.png'}" alt="${producto.nombre || 'Producto'}">
                                <div>
                                    <h4>${producto.nombre || 'Producto'}</h4>
                                    <p class="producto-variante">${producto.variante || ''}</p>
                                </div>
                            </div>
                        </td>
                        <td>${producto.cantidad || 0}</td>
                        <td>${(producto.precio || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</td>
                        <td>${subtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</td>
                    </tr>
                `;
                });

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
                             <p><strong>${pedido.direccion?.nombre || 'No disponible'}</strong></p>
                             <p>${pedido.direccion?.calle || ''}</p>
                             <p>${pedido.direccion?.ciudad || ''}, ${pedido.direccion?.estado || ''}, ${pedido.direccion?.cp || ''}</p>
                             <p>${pedido.direccion?.pais || ''}</p>
                             <p>Tel: ${pedido.direccion?.telefono || ''}</p>
                         </div>
                     </div>

                     <div class="productos-detalle">
                         <h3>Productos</h3>
                         <table class="tabla-productos">
                             <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead>
                             <tbody>${productosHTML}</tbody>
                             <tfoot>
                                 <tr><td colspan="3" class="text-right"><strong>Subtotal:</strong></td><td>${(pedido.subtotal || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</td></tr>
                                 <tr><td colspan="3" class="text-right"><strong>Envío:</strong></td><td>${(pedido.costo_envio || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</td></tr>
                                 <tr class="total-fila"><td colspan="3" class="text-right"><strong>Total:</strong></td><td><strong>${(pedido.total || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</strong></td></tr>
                             </tfoot>
                         </table>
                     </div>

                     <div class="info-pago">
                         <h3>Información de Pago</h3>
                         <div class="metodo-pago">
                             <p><strong>Método:</strong> ${pedido.metodo_pago?.tipo || 'No disponible'}</p>
                             <p><strong>Terminación:</strong> **** ${pedido.metodo_pago?.ultimos_digitos || ''}</p>
                         </div>
                     </div>

                     ${pedido.estado === 'pendiente' ? `<div class="acciones-detalle"><button type="button" class="btn-cancelar-pedido" data-id="${pedido.id}">Cancelar Pedido</button></div>` : ''}
                 </div>
             `;

                const btnCancelarPedido = contenidoDetalle.querySelector('.btn-cancelar-pedido');
                if (btnCancelarPedido) {
                    btnCancelarPedido.addEventListener('click', function () {
                        modalDetallePedido.classList.remove('visible');
                        confirmarCancelacionPedido(this.getAttribute('data-id'));
                    });
                }

            })
            .catch(error => {
                console.error('Error al cargar detalles del pedido:', error);
                contenidoDetalle.innerHTML = `<div class="error-mensaje"><i class="fas fa-exclamation-circle"></i><p>Error al cargar detalles. Intenta de nuevo.</p></div>`;
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
        const token = localStorage.getItem('accessToken'); // Usar nuevo token
        if (!token) return;

        fetch(`http://127.0.0.1:8000/api/pedidos/${idPedido}/cancelar/`, { // Adaptar endpoint
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' // Asegurar Content-Type si el backend lo espera
            }
            // No se necesita body si el backend solo necesita el ID en la URL
        })
            .then(response => {
                // El backend podría devolver 200 OK o 204 No Content en éxito, o JSON con mensaje
                if (!response.ok) {
                    // Intentar leer mensaje de error si es JSON
                    return response.json().then(err => { throw new Error(err.mensaje || err.detail || `Error ${response.status}`) });
                }
                // Si es 204 No Content, no hay JSON para parsear
                if (response.status === 204) {
                    return { success: true }; // Simular éxito
                }
                return response.json();
            })
            .then(data => {
                // Asumir que 'success' o un estado 2xx indica éxito
                // if (data.success) { // O simplemente si no hubo error
                mostrarNotificacion('Pedido cancelado correctamente', 'success');
                // Recargar la vista actual para reflejar el cambio
                if (window.location.hash.includes('dashboard')) cargarPedidosRecientes();
                if (window.location.hash.includes('pedidos')) cargarTodosPedidos();
                // } else { // No necesario si lanzamos error en !response.ok
                //     mostrarNotificacion(data.mensaje || 'No se pudo cancelar el pedido', 'error');
                // }
            })
            .catch(error => {
                console.error('Error al cancelar pedido:', error);
                mostrarNotificacion(error.message || 'Error al cancelar el pedido. Intenta nuevamente.', 'error');
            });
    }

    /**
     * Carga productos recomendados para el usuario
     */
    function cargarProductosRecomendados() {
        const token = localStorage.getItem('accessToken'); // Usar nuevo token
        if (!token || !productosRecomendados) return;

        productosRecomendados.innerHTML = `<div class="cargando-productos"><i class="fas fa-spinner fa-spin"></i><p>Cargando recomendaciones...</p></div>`;

        fetch('http://127.0.0.1:8000/api/productos/recomendados/', { // Adaptar endpoint
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) refreshToken();
                    throw new Error(`Error ${response.status} al cargar recomendaciones`);
                }
                return response.json();
            })
            .then(productos => {
                if (!productos || productos.length === 0) {
                    productosRecomendados.innerHTML = `<div class="sin-recomendaciones"><p>No hay recomendaciones disponibles.</p></div>`;
                    return;
                }

                productosRecomendados.innerHTML = '';
                productos.forEach(producto => {
                    // ... (resto del código para crear la tarjeta del producto, sin cambios lógicos)
                    const precioFormateado = (producto.precio || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
                    let precioAnterior = '';
                    if (producto.descuento > 0) {
                        const precioOriginal = (producto.precio || 0) / (1 - (producto.descuento / 100));
                        precioAnterior = `<span class="precio-anterior">${precioOriginal.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</span>`;
                    }
                    const tarjeta = document.createElement('div');
                    tarjeta.className = 'producto-card';
                    tarjeta.innerHTML = `
                     <div class="producto-imagen">
                         <img src="${producto.imagen || 'assets/img/placeholder-producto.png'}" alt="${producto.nombre || 'Producto'}">
                         ${producto.descuento > 0 ? `<span class="etiqueta-descuento">-${producto.descuento}%</span>` : ''}
                     </div>
                     <div class="producto-info">
                         <h3>${producto.nombre || 'Producto'}</h3>
                         <div class="producto-precio">
                             <span class="precio-actual">${precioFormateado}</span>
                             ${precioAnterior}
                         </div>
                     </div>
                     <div class="producto-acciones">
                         <a href="producto.html?id=${producto.id}" class="btn-ver-producto">Ver Detalles</a>
                         <button type="button" class="btn-agregar-carrito" data-id="${producto.id}"><i class="fas fa-shopping-cart"></i></button>
                     </div>
                 `;
                    productosRecomendados.appendChild(tarjeta);
                });

                // Configurar botones de agregar al carrito (la lógica de agregarAlCarrito debe existir)
                const botonesAgregarCarrito = productosRecomendados.querySelectorAll('.btn-agregar-carrito');
                botonesAgregarCarrito.forEach(boton => {
                    boton.addEventListener('click', function () {
                        const idProducto = this.getAttribute('data-id');
                        agregarAlCarrito(idProducto, 1); // Asume cantidad 1
                    });
                });
            })
            .catch(error => {
                console.error('Error al cargar productos recomendados:', error);
                productosRecomendados.innerHTML = `<div class="error-mensaje"><i class="fas fa-exclamation-circle"></i><p>Error al cargar recomendaciones.</p></div>`;
            });
    }

    /**
     * Carga las direcciones del usuario
     */
    function cargarDirecciones() {
        const token = localStorage.getItem('accessToken'); // Usar nuevo token
        if (!token || !listaDirecciones) return;

        listaDirecciones.innerHTML = `<div class="cargando-datos"><i class="fas fa-spinner fa-spin"></i><p>Cargando direcciones...</p></div>`;

        fetch('http://127.0.0.1:8000/api/usuarios/direcciones/', { // Adaptar endpoint
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) refreshToken();
                    throw new Error(`Error ${response.status} al cargar direcciones`);
                }
                return response.json();
            })
            .then(direcciones => {
                if (!direcciones || direcciones.length === 0) {
                    listaDirecciones.innerHTML = `<div class="sin-datos"><p>No tienes direcciones guardadas.</p></div>`;
                    return;
                }

                listaDirecciones.innerHTML = '';
                direcciones.forEach(direccion => {
                    // ... (resto del código para crear la tarjeta de dirección, sin cambios lógicos)
                    const tarjeta = document.createElement('div');
                    tarjeta.className = 'direccion-card';
                    if (direccion.predeterminada) tarjeta.classList.add('predeterminada');
                    tarjeta.innerHTML = `
                     <div class="direccion-header">
                         <h3>${direccion.nombre || 'Dirección'}</h3>
                         ${direccion.predeterminada ? '<span class="etiqueta-predeterminada">Predeterminada</span>' : ''}
                     </div>
                     <div class="direccion-datos">
                         <p>${direccion.calle || ''}</p>
                         <p>${direccion.ciudad || ''}, ${direccion.estado || ''}, ${direccion.cp || ''}</p>
                         <p>${direccion.pais || ''}</p>
                         <p>Tel: ${direccion.telefono || ''}</p>
                     </div>
                     <div class="direccion-acciones">
                         <button type="button" class="btn-accion editar-direccion" data-id="${direccion.id}"><i class="fas fa-edit"></i> Editar</button>
                         ${!direccion.predeterminada ? `<button type="button" class="btn-accion establecer-predeterminada" data-id="${direccion.id}"><i class="fas fa-check-circle"></i> Predeterminada</button>` : ''}
                         <button type="button" class="btn-accion eliminar-direccion" data-id="${direccion.id}"><i class="fas fa-trash"></i> Eliminar</button>
                     </div>
                 `;
                    listaDirecciones.appendChild(tarjeta);
                });

                configurarBotonesDirecciones();
            })
            .catch(error => {
                console.error('Error al cargar direcciones:', error);
                listaDirecciones.innerHTML = `<div class="error-mensaje"><i class="fas fa-exclamation-circle"></i><p>Error al cargar direcciones.</p></div>`;
            });
    }

    /**
     * Configura los eventos para los botones de direcciones
     */
    function configurarBotonesDirecciones() {
        const botonesEditar = document.querySelectorAll('.editar-direccion');
        botonesEditar.forEach(boton => {
            boton.addEventListener('click', function () {
                cargarDireccionParaEditar(this.getAttribute('data-id'));
            });
        });

        const botonesPredeterminada = document.querySelectorAll('.establecer-predeterminada');
        botonesPredeterminada.forEach(boton => {
            boton.addEventListener('click', function () {
                establecerDireccionPredeterminada(this.getAttribute('data-id'));
            });
        });

        const botonesEliminar = document.querySelectorAll('.eliminar-direccion');
        botonesEliminar.forEach(boton => {
            boton.addEventListener('click', function () {
                confirmarEliminarDireccion(this.getAttribute('data-id'));
            });
        });
    }

    /**
     * Abre el modal para agregar/editar una dirección
     */
    function abrirModalDireccion(direccion = null) {
        if (!formDireccion || !modalDireccion) return;
        formDireccion.reset();
        formDireccion.removeAttribute('data-id');
        document.querySelector('#modalDireccion .modal-titulo').textContent = 'Agregar Nueva Dirección';

        if (direccion) {
            // Rellenar formulario para editar
            document.getElementById('nombreDireccion').value = direccion.nombre || '';
            document.getElementById('calleDireccion').value = direccion.calle || '';
            document.getElementById('ciudadDireccion').value = direccion.ciudad || '';
            document.getElementById('estadoDireccion').value = direccion.estado || '';
            document.getElementById('cpDireccion').value = direccion.cp || '';
            document.getElementById('paisDireccion').value = direccion.pais || '';
            document.getElementById('telefonoDireccion').value = direccion.telefono || '';
            document.getElementById('predeterminadaDireccion').checked = direccion.predeterminada || false;
            formDireccion.setAttribute('data-id', direccion.id);
            document.querySelector('#modalDireccion .modal-titulo').textContent = 'Editar Dirección';
        }

        modalDireccion.classList.add('visible');
    }

    /**
     * Carga los datos de una dirección para editarla
     */
    function cargarDireccionParaEditar(idDireccion) {
        const token = localStorage.getItem('accessToken'); // Usar nuevo token
        if (!token) return;

        fetch(`http://127.0.0.1:8000/api/usuarios/direcciones/${idDireccion}/`, { // Adaptar endpoint
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) refreshToken();
                    throw new Error(`Error ${response.status} al cargar dirección para editar`);
                }
                return response.json();
            })
            .then(direccion => {
                abrirModalDireccion(direccion); // Reutilizar la función de abrir modal
            })
            .catch(error => {
                console.error('Error al cargar dirección para editar:', error);
                mostrarNotificacion('Error al cargar la dirección. Intenta nuevamente.', 'error');
            });
    }

    /**
     * Guarda los datos de una dirección (nueva o editada)
     */
    function guardarDireccion(event) {
        event.preventDefault();
        const token = localStorage.getItem('accessToken'); // Usar nuevo token
        if (!token || !formDireccion) return;

        const idDireccion = formDireccion.getAttribute('data-id');
        const esNueva = !idDireccion;
        const url = esNueva ? 'http://127.0.0.1:8000/api/usuarios/direcciones/' : `http://127.0.0.1:8000/api/usuarios/direcciones/${idDireccion}/`;
        const metodo = esNueva ? 'POST' : 'PUT';

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

        fetch(url, {
            method: metodo,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosDireccion)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.mensaje || err.detail || `Error ${response.status}`) });
                }
                // Si es PUT exitoso, puede devolver 200 OK con el objeto o 204 No Content
                // Si es POST exitoso, suele devolver 201 Created con el objeto
                return response.status === 204 ? { success: true } : response.json();
            })
            .then(data => {
                // if (data.success) { // Asumiendo que la API devuelve 'success' o un estado 2xx indica éxito
                mostrarNotificacion(`Dirección ${esNueva ? 'agregada' : 'actualizada'} correctamente`, 'success');
                modalDireccion.classList.remove('visible');
                cargarDirecciones(); // Recargar lista
                cargarContadoresResumen(); // Actualizar contador en dashboard
                // } else { // No necesario si lanzamos error
                //     mostrarNotificacion(data.mensaje || `No se pudo ${esNueva ? 'agregar' : 'actualizar'} la dirección`, 'error');
                // }
            })
            .catch(error => {
                console.error(`Error al ${esNueva ? 'agregar' : 'actualizar'} dirección:`, error);
                mostrarNotificacion(error.message || `Error al ${esNueva ? 'guardar' : 'actualizar'} la dirección.`, 'error');
            });
    }

    /**
     * Establece una dirección como predeterminada
     */
    function establecerDireccionPredeterminada(idDireccion) {
        const token = localStorage.getItem('accessToken'); // Usar nuevo token
        if (!token) return;

        fetch(`http://127.0.0.1:8000/api/usuarios/direcciones/${idDireccion}/predeterminada/`, { // Adaptar endpoint
            method: 'POST', // O PUT/PATCH según tu API
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' // Asegurar si backend lo requiere
            }
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.mensaje || err.detail || `Error ${response.status}`) });
                }
                return response.status === 204 ? { success: true } : response.json();
            })
            .then(data => {
                // if (data.success) {
                mostrarNotificacion('Dirección establecida como predeterminada', 'success');
                cargarDirecciones(); // Recargar para ver el cambio
                // } else {
                //     mostrarNotificacion(data.mensaje || 'No se pudo establecer como predeterminada', 'error');
                // }
            })
            .catch(error => {
                console.error('Error al establecer dirección predeterminada:', error);
                mostrarNotificacion(error.message || 'Error al establecer como predeterminada.', 'error');
            });
    }

    /**
     * Muestra confirmación para eliminar una dirección
     */
    function confirmarEliminarDireccion(idDireccion) {
        if (confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
            eliminarDireccion(idDireccion);
        }
    }

    /**
     * Elimina una dirección
     */
    function eliminarDireccion(idDireccion) {
        const token = localStorage.getItem('accessToken'); // Usar nuevo token
        if (!token) return;

        fetch(`http://127.0.0.1:8000/api/usuarios/direcciones/${idDireccion}/`, { // Adaptar endpoint
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                // DELETE exitoso suele devolver 204 No Content
                if (!response.ok && response.status !== 204) {
                    return response.json().then(err => { throw new Error(err.mensaje || err.detail || `Error ${response.status}`) });
                }
                return { success: true }; // Simular éxito para 204
            })
            .then(data => {
                // if (data.success) {
                mostrarNotificacion('Dirección eliminada correctamente', 'success');
                cargarDirecciones(); // Recargar lista
                cargarContadoresResumen(); // Actualizar contador
                // } else {
                //     mostrarNotificacion(data.mensaje || 'No se pudo eliminar la dirección', 'error');
                // }
            })
            .catch(error => {
                console.error('Error al eliminar dirección:', error);
                // Podría haber restricciones (ej. dirección usada en pedido pendiente)
                mostrarNotificacion(error.message || 'Error al eliminar la dirección.', 'error');
            });
    }

    /**
     * Carga los métodos de pago del usuario
     */
    function cargarMetodosDePago() {
        const token = localStorage.getItem('accessToken'); // Usar nuevo token
        if (!token || !listaMetodosPago) return;

        listaMetodosPago.innerHTML = `<div class="cargando-datos"><i class="fas fa-spinner fa-spin"></i><p>Cargando métodos de pago...</p></div>`;

        fetch('http://127.0.0.1:8000/api/usuarios/metodos-pago/', { // Adaptar endpoint
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) refreshToken();
                    throw new Error(`Error ${response.status} al cargar métodos de pago`);
                }
                return response.json();
            })
            .then(metodos => {
                if (!metodos || metodos.length === 0) {
                    listaMetodosPago.innerHTML = `<div class="sin-datos"><p>No tienes métodos de pago guardados.</p></div>`;
                    return;
                }

                listaMetodosPago.innerHTML = '';
                metodos.forEach(metodo => {
                    // ... (resto del código para crear la tarjeta de método de pago, sin cambios lógicos)
                    let iconoTarjeta = 'fa-credit-card'; // Icono por defecto
                    const tipoLower = (metodo.tipo || '').toLowerCase();
                    if (tipoLower.includes('visa')) iconoTarjeta = 'fa-cc-visa';
                    else if (tipoLower.includes('mastercard')) iconoTarjeta = 'fa-cc-mastercard';
                    else if (tipoLower.includes('amex')) iconoTarjeta = 'fa-cc-amex';

                    const tarjeta = document.createElement('div');
                    tarjeta.className = 'metodo-pago-card';
                    if (metodo.predeterminado) tarjeta.classList.add('predeterminado');

                    tarjeta.innerHTML = `
                     <div class="metodo-pago-header">
                         <div class="tipo-tarjeta">
                             <i class="fab ${iconoTarjeta}"></i>
                             <h3>${metodo.tipo || 'Tarjeta'}</h3>
                         </div>
                         ${metodo.predeterminado ? '<span class="etiqueta-predeterminada">Predeterminado</span>' : ''}
                     </div>
                     <div class="metodo-pago-datos">
                         <p>**** **** **** ${metodo.ultimos_digitos || '????'}</p>
                         <p>Vence: ${metodo.mes_expiracion || 'MM'}/${(metodo.ano_expiracion || 'AA').toString().slice(-2)}</p> {/* Mostrar solo últimos 2 dígitos del año */}
                         <p>Titular: ${metodo.titular || 'No disponible'}</p>
                     </div>
                     <div class="metodo-pago-acciones">
                         ${!metodo.predeterminado ? `<button type="button" class="btn-accion establecer-predeterminado-pago" data-id="${metodo.id}"><i class="fas fa-check-circle"></i> Predeterminado</button>` : ''}
                         <button type="button" class="btn-accion eliminar-metodo-pago" data-id="${metodo.id}"><i class="fas fa-trash"></i> Eliminar</button>
                     </div>
                 `;
                    listaMetodosPago.appendChild(tarjeta);
                });

                configurarBotonesMetodosPago();
            })
            .catch(error => {
                console.error('Error al cargar métodos de pago:', error);
                listaMetodosPago.innerHTML = `<div class="error-mensaje"><i class="fas fa-exclamation-circle"></i><p>Error al cargar métodos de pago.</p></div>`;
            });
    }

    /**
     * Configura los eventos para los botones de métodos de pago
     */
    function configurarBotonesMetodosPago() {
        const botonesPredeterminado = document.querySelectorAll('.establecer-predeterminado-pago');
        botonesPredeterminado.forEach(boton => {
            boton.addEventListener('click', function () {
                establecerMetodoPagoPredeterminado(this.getAttribute('data-id'));
            });
        });

        const botonesEliminar = document.querySelectorAll('.eliminar-metodo-pago');
        botonesEliminar.forEach(boton => {
            boton.addEventListener('click', function () {
                confirmarEliminarMetodoPago(this.getAttribute('data-id'));
            });
        });
    }

    /**
     * Abre el modal para agregar un nuevo método de pago
     */
    function abrirModalMetodoPago() {
        if (!formMetodoPago || !modalMetodoPago) return;
        formMetodoPago.reset(); // Limpia el formulario
        modalMetodoPago.classList.add('visible');
    }

    /**
     * Guarda los datos de un método de pago
     */
    function guardarMetodoPago(event) {
        event.preventDefault();
        const token = localStorage.getItem('accessToken'); // Usar nuevo token
        if (!token || !formMetodoPago) return;

        // Validación básica en frontend (más robusta sería ideal)
        const numeroTarjeta = document.getElementById('numeroTarjeta').value.replace(/\s/g, '');
        const mesExp = document.getElementById('mesExpiracion').value;
        const anoExp = document.getElementById('anoExpiracion').value;
        const cvv = document.getElementById('cvvTarjeta').value;

        if (numeroTarjeta.length < 13 || numeroTarjeta.length > 19 || !/^\d+$/.test(numeroTarjeta)) {
            mostrarNotificacion('Número de tarjeta inválido.', 'error'); return;
        }
        if (!/^(0[1-9]|1[0-2])$/.test(mesExp)) {
            mostrarNotificacion('Mes de expiración inválido (MM).', 'error'); return;
        }
        if (!/^(20)\d{2}$/.test(anoExp) || parseInt(anoExp) < new Date().getFullYear()) {
            mostrarNotificacion('Año de expiración inválido (AAAA) o pasado.', 'error'); return;
        }
        if (!/^\d{3,4}$/.test(cvv)) {
            mostrarNotificacion('CVV inválido (3 o 4 dígitos).', 'error'); return;
        }


        const datosMetodoPago = {
            numero_tarjeta: numeroTarjeta,
            titular: document.getElementById('titularTarjeta').value,
            mes_expiracion: mesExp,
            ano_expiracion: anoExp,
            cvv: cvv, // ¡Precaución! Enviar CVV es riesgoso y a menudo no se almacena. Consulta con tu pasarela de pago.
            predeterminado: document.getElementById('predeterminadoMetodoPago').checked
        };

        fetch('http://127.0.0.1:8000/api/usuarios/metodos-pago/', { // Adaptar endpoint
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosMetodoPago)
        })
            .then(response => {
                if (!response.ok) {
                    // Intentar obtener mensaje de error específico del backend
                    return response.json().then(err => { throw new Error(err.mensaje || err.detail || `Error ${response.status}`) });
                }
                return response.json(); // Asume 201 Created devuelve el objeto
            })
            .then(data => {
                // if (data.id) { // Verificar si se creó un ID o alguna propiedad esperada
                mostrarNotificacion('Método de pago agregado correctamente', 'success');
                modalMetodoPago.classList.remove('visible');
                cargarMetodosDePago(); // Recargar lista
                cargarContadoresResumen(); // Actualizar contador
                // } else { // No necesario si lanzamos error
                //     mostrarNotificacion(data.mensaje || 'No se pudo agregar el método de pago', 'error');
                // }
            })
            .catch(error => {
                console.error('Error al agregar método de pago:', error);
                mostrarNotificacion(error.message || 'Error al agregar método de pago.', 'error');
            });
    }

    /**
     * Establece un método de pago como predeterminado
     */
    function establecerMetodoPagoPredeterminado(idMetodo) {
        const token = localStorage.getItem('accessToken'); // Usar nuevo token
        if (!token) return;

        fetch(`http://127.0.0.1:8000/api/usuarios/metodos-pago/${idMetodo}/predeterminado/`, { // Adaptar endpoint
            method: 'POST', // O PUT/PATCH
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.mensaje || err.detail || `Error ${response.status}`) });
                }
                return response.status === 204 ? { success: true } : response.json();
            })
            .then(data => {
                // if (data.success) {
                mostrarNotificacion('Método de pago establecido como predeterminado', 'success');
                cargarMetodosDePago(); // Recargar lista
                // } else {
                //     mostrarNotificacion(data.mensaje || 'No se pudo establecer como predeterminado', 'error');
                // }
            })
            .catch(error => {
                console.error('Error al establecer método de pago predeterminado:', error);
                mostrarNotificacion(error.message || 'Error al establecer como predeterminado.', 'error');
            });
    }

    /**
     * Muestra confirmación para eliminar un método de pago
     */
    function confirmarEliminarMetodoPago(idMetodo) {
        if (confirm('¿Estás seguro de que deseas eliminar este método de pago?')) {
            eliminarMetodoPago(idMetodo);
        }
    }

    /**
     * Elimina un método de pago
     */
    function eliminarMetodoPago(idMetodo) {
        const token = localStorage.getItem('accessToken'); // Usar nuevo token
        if (!token) return;

        fetch(`http://127.0.0.1:8000/api/usuarios/metodos-pago/${idMetodo}/`, { // Adaptar endpoint
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                if (!response.ok && response.status !== 204) {
                    return response.json().then(err => { throw new Error(err.mensaje || err.detail || `Error ${response.status}`) });
                }
                return { success: true };
            })
            .then(data => {
                // if (data.success) {
                mostrarNotificacion('Método de pago eliminado correctamente', 'success');
                cargarMetodosDePago(); // Recargar lista
                cargarContadoresResumen(); // Actualizar contador
                // } else {
                //     mostrarNotificacion(data.mensaje || 'No se pudo eliminar el método de pago', 'error');
                // }
            })
            .catch(error => {
                console.error('Error al eliminar método de pago:', error);
                mostrarNotificacion(error.message || 'Error al eliminar método de pago.', 'error');
            });
    }

    // ===== GESTIÓN DEL PERFIL DE USUARIO =====


    function actualizarPerfil(event) {
        event.preventDefault();
        const token = localStorage.getItem('accessToken'); // Usar nuevo token
        if (!token || !formEditarPerfil) return;

        // Obtener nombre y apellido separados si el campo es 'nombreCompleto'
        const nombreCompleto = document.getElementById('nombreCompleto').value.trim();
        const primerEspacio = nombreCompleto.indexOf(' ');
        const nombre = primerEspacio === -1 ? nombreCompleto : nombreCompleto.substring(0, primerEspacio);
        const apellido = primerEspacio === -1 ? '' : nombreCompleto.substring(primerEspacio + 1);


        const datosPerfil = {
            // Enviar nombre y apellido por separado si tu API lo espera así
            nombre: nombre,
            apellido: apellido,
            // Si tu API espera un solo campo 'nombre':
            // nombre: nombreCompleto,
            email: document.getElementById('emailPerfil').value,
            telefono: document.getElementById('telefonoPerfil').value
        };

        fetch('http://127.0.0.1:8000/api/usuarios/perfil/', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosPerfil)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.mensaje || err.detail || `Error ${response.status}`) });
                }
                return response.json(); // Asume que devuelve el perfil actualizado
            })
            .then(data => {
                // if (data.usuario || data.id) { // Verificar respuesta exitosa
                mostrarNotificacion('Perfil actualizado correctamente', 'success');
                actualizarUIUsuario(data.usuario || data); // Actualizar UI con los nuevos datos
                // } else {
                //     mostrarNotificacion(data.mensaje || 'No se pudo actualizar el perfil', 'error');
                // }
            })
            .catch(error => {
                console.error('Error al actualizar perfil:', error);
                mostrarNotificacion(error.message || 'Error al actualizar el perfil.', 'error');
            });
    }

    /**
     * Cambia la contraseña del usuario
     */
    function cambiarContrasena(event) {
        event.preventDefault();
        const token = localStorage.getItem('accessToken'); // Usar nuevo token
        if (!token || !formCambiarContrasena) return;

        const contrasenaActual = document.getElementById('contrasenaActual').value;
        const nuevaContrasena = document.getElementById('nuevaContrasena').value;
        const confirmacionContrasena = document.getElementById('confirmacionContrasena').value;

        // Validaciones básicas
        if (!contrasenaActual || !nuevaContrasena || !confirmacionContrasena) {
            mostrarNotificacion('Todos los campos de contraseña son requeridos.', 'error'); return;
        }
        if (nuevaContrasena !== confirmacionContrasena) {
            mostrarNotificacion('Las nuevas contraseñas no coinciden.', 'error'); return;
        }
        if (nuevaContrasena.length < 8) { // Ajustar según tus requisitos
            mostrarNotificacion('La nueva contraseña debe tener al menos 8 caracteres.', 'error'); return;
        }
        if (nuevaContrasena === contrasenaActual) {
            mostrarNotificacion('La nueva contraseña no puede ser igual a la actual.', 'error'); return;
        }

        const datosContrasena = {
            contrasena_actual: contrasenaActual,
            nueva_contrasena: nuevaContrasena
            // La confirmación no suele enviarse al backend
        };

        fetch('http://127.0.0.1:8000/api/usuarios/cambiar-contrasena/', { // Adaptar endpoint
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosContrasena)
        })
            .then(response => {
                if (!response.ok) {
                    // Manejar errores comunes como contraseña actual incorrecta
                    return response.json().then(err => { throw new Error(err.mensaje || err.detail || `Error ${response.status}`) });
                }
                // Éxito usualmente es 200 OK o 204 No Content
                return response.status === 204 ? { success: true } : response.json();
            })
            .then(data => {
                // if (data.success) {
                mostrarNotificacion('Contraseña actualizada correctamente', 'success');
                formCambiarContrasena.reset(); // Limpiar formulario
                // } else {
                //     mostrarNotificacion(data.mensaje || 'No se pudo actualizar la contraseña', 'error');
                // }
            })
            .catch(error => {
                console.error('Error al cambiar contraseña:', error);
                // Mostrar mensaje específico si es posible (ej. "Contraseña actual incorrecta")
                mostrarNotificacion(error.message || 'Error al cambiar la contraseña.', 'error');
            });
    }

    /**
     * Maneja el clic en el botón para cambiar la foto de perfil
     */
    function cambiarFotoPerfil() {
        if (inputFotoPerfil) {
            inputFotoPerfil.click(); // Abre el selector de archivos
        }
    }

    /**
     * Sube la nueva foto de perfil cuando se selecciona un archivo
     */
    function subirFotoPerfil(event) {
        const token = localStorage.getItem('accessToken'); // Usar nuevo token
        if (!token || !event.target.files || event.target.files.length === 0) return;

        const archivo = event.target.files[0];

        // Validación básica del archivo
        if (!archivo.type.startsWith('image/')) {
            mostrarNotificacion('Por favor, selecciona un archivo de imagen (JPG, PNG, GIF, etc.).', 'error');
            inputFotoPerfil.value = ''; // Limpiar selección
            return;
        }
        const maxSizeMB = 5; // Limitar a 5MB, por ejemplo
        if (archivo.size > maxSizeMB * 1024 * 1024) {
            mostrarNotificacion(`El tamaño del archivo no debe exceder ${maxSizeMB}MB.`, 'error');
            inputFotoPerfil.value = ''; // Limpiar selección
            return;
        }

        // Mostrar indicador visual de carga (opcional)
        if (perfilFotoActual) perfilFotoActual.style.opacity = '0.5';
        if (imgPerfilUsuario) imgPerfilUsuario.style.opacity = '0.5';


        const formData = new FormData();
        // El nombre del campo ('foto_perfil') debe coincidir con lo que espera tu API
        formData.append('foto_perfil', archivo);

        fetch('http://127.0.0.1:8000/api/usuarios/foto-perfil/', { // Adaptar endpoint
            method: 'POST', // O PUT si reemplaza la existente
            headers: {
                'Authorization': `Bearer ${token}`
                // No establecer 'Content-Type': 'multipart/form-data', el navegador lo hace automáticamente con FormData
            },
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.mensaje || err.detail || `Error ${response.status}`) });
                }
                return response.json(); // Asume que devuelve la URL de la nueva foto
            })
            .then(data => {
                // Asumiendo que la respuesta tiene la URL en data.url_foto o similar
                const urlFoto = data.url_foto || data.foto_perfil_url || data.url; // Adaptar a tu API
                // if (urlFoto) {
                mostrarNotificacion('Foto de perfil actualizada correctamente', 'success');
                // Actualizar las imágenes en la UI
                if (perfilFotoActual) perfilFotoActual.src = urlFoto;
                if (imgPerfilUsuario) imgPerfilUsuario.src = urlFoto;
                // } else {
                //     throw new Error("La respuesta no incluyó la URL de la nueva foto.");
                // }
            })
            .catch(error => {
                console.error('Error al subir foto de perfil:', error);
                mostrarNotificacion(error.message || 'Error al subir la foto de perfil.', 'error');
                // Podrías restaurar la foto anterior si la tienes guardada en una variable
            })
            .finally(() => {
                // Quitar indicador de carga
                if (perfilFotoActual) perfilFotoActual.style.opacity = '1';
                if (imgPerfilUsuario) imgPerfilUsuario.style.opacity = '1';
                inputFotoPerfil.value = ''; // Limpiar el input para permitir subir la misma foto de nuevo si falla
            });
    }

    // ===== GESTIÓN DEL CARRITO (Local Storage) =====
    // Estas funciones parecen operar solo con localStorage, no necesitan token directamente,
    // pero podrían interactuar con la API al añadir (para verificar stock/precio).

    /**
     * Actualiza el contador visual del carrito basado en localStorage.
     */
    function actualizarContadorCarrito() {
        try {
            let carrito = JSON.parse(localStorage.getItem('mecheCarrito')) || [];
            const cantidad = carrito.reduce((total, item) => total + (item.cantidad || 0), 0);

            if (contadorCarrito) {
                contadorCarrito.textContent = cantidad;
                contadorCarrito.classList.toggle('activo', cantidad > 0);
            }
        } catch (e) {
            console.error("Error al leer o parsear el carrito de localStorage:", e);
            // Podrías limpiar el carrito si está corrupto
            // localStorage.removeItem('mecheCarrito');
            if (contadorCarrito) {
                contadorCarrito.textContent = '0';
                contadorCarrito.classList.remove('activo');
            }
        }
    }

    /**
     * Agrega un producto al carrito en localStorage.
     * Podría mejorarse verificando stock/precio con la API antes de agregar.
     */
    function agregarAlCarrito(idProducto, cantidad) {
        // Opcional: Verificar producto y precio con la API antes de añadir
        // const token = localStorage.getItem('accessToken');
        // fetch(`/api/productos/${idProducto}/`, { headers: {'Authorization': `Bearer ${token}`} })...

        try {
            let carrito = JSON.parse(localStorage.getItem('mecheCarrito')) || [];
            const indexProducto = carrito.findIndex(item => item.id === idProducto);

            // Necesitamos info básica del producto para añadirla si no existe
            // Esto es simplificado, idealmente obtendrías esta info de la API o del DOM si está disponible
            const productoInfo = obtenerInfoProductoParaCarrito(idProducto); // Necesitarías implementar esto

            if (indexProducto !== -1) {
                carrito[indexProducto].cantidad += cantidad;
            } else {
                if (productoInfo) {
                    carrito.push({
                        id: idProducto,
                        nombre: productoInfo.nombre,
                        precio: productoInfo.precio,
                        imagen: productoInfo.imagen,
                        cantidad: cantidad
                    });
                } else {
                    console.error(`No se encontró información para el producto ${idProducto}`);
                    mostrarNotificacion('Error al obtener información del producto.', 'error');
                    return; // No añadir si no tenemos info
                }
            }

            localStorage.setItem('mecheCarrito', JSON.stringify(carrito));
            actualizarContadorCarrito();
            mostrarNotificacion('Producto agregado al carrito', 'success');

        } catch (e) {
            console.error("Error al modificar el carrito en localStorage:", e);
            mostrarNotificacion('Error al actualizar el carrito.', 'error');
        }
    }

    /**
     * Función placeholder para obtener info de producto (simplificado).
     * Debería buscar en el DOM si está en la página actual o hacer fetch a la API.
     */
    function obtenerInfoProductoParaCarrito(idProducto) {
        // Intenta buscar en las tarjetas de producto si están cargadas (ej. recomendaciones)
        const tarjetaProducto = document.querySelector(`.producto-card [data-id="${idProducto}"]`)?.closest('.producto-card');
        if (tarjetaProducto) {
            return {
                id: idProducto,
                nombre: tarjetaProducto.querySelector('.producto-info h3')?.textContent || 'Producto',
                precio: parseFloat(tarjetaProducto.querySelector('.precio-actual')?.textContent.replace(/[^0-9,-]+/g, "").replace(',', '.') || '0'),
                imagen: tarjetaProducto.querySelector('.producto-imagen img')?.src || ''
            };
        }
        // Si no está en el DOM, deberías hacer un fetch a la API (requiere token)
        console.warn(`Info para producto ${idProducto} no encontrada en el DOM. Implementar fetch a API si es necesario.`);
        // fetch(`/api/productos/${idProducto}...`)
        return null; // O retornar un objeto por defecto si prefieres
    }


    // ===== UTILIDADES =====

    /**
     * Muestra una notificación flotante en pantalla.
     */
    function mostrarNotificacion(mensaje, tipo = 'info') { // tipo por defecto 'info'
        const contenedorNotificaciones = document.getElementById('contenedor-notificaciones') || crearContenedorNotificaciones();

        const notificacion = document.createElement('div');
        notificacion.className = `notificacion ${tipo}`; // Clases: info, success, warning, error

        let icono = 'fa-info-circle'; // Icono por defecto
        if (tipo === 'success') icono = 'fa-check-circle';
        else if (tipo === 'warning') icono = 'fa-exclamation-triangle';
        else if (tipo === 'error') icono = 'fa-times-circle'; // Cambiado a 'times-circle' para error

        notificacion.innerHTML = `
            <i class="fas ${icono}"></i>
            <span>${mensaje}</span>
            <button type="button" class="cerrar-notificacion" aria-label="Cerrar notificación">&times;</button>
        `;

        contenedorNotificaciones.appendChild(notificacion);

        // Cerrar al hacer clic en el botón
        notificacion.querySelector('.cerrar-notificacion').addEventListener('click', () => {
            notificacion.remove();
        });

        // Desaparición automática
        setTimeout(() => {
            notificacion.remove();
        }, 5000); // 5 segundos
    }

    /**
     * Crea el contenedor de notificaciones si no existe.
     */
    function crearContenedorNotificaciones() {
        let contenedor = document.createElement('div');
        contenedor.id = 'contenedor-notificaciones';
        // Estilos básicos (mover a CSS idealmente)
        contenedor.style.position = 'fixed';
        contenedor.style.top = '20px';
        contenedor.style.right = '20px';
        contenedor.style.zIndex = '1050'; // Encima de otros elementos
        contenedor.style.display = 'flex';
        contenedor.style.flexDirection = 'column';
        contenedor.style.gap = '10px';
        document.body.appendChild(contenedor);
        return contenedor;
    }


    /**
     * Formatea un input para número de tarjeta de crédito (#### #### #### ####).
     */
    function formatearNumeroTarjeta(input) {
        let valor = input.value.replace(/\D/g, ''); // Eliminar no dígitos
        valor = valor.substring(0, 19); // Limitar longitud (ej. 16 + 3 espacios)
        let formateado = '';
        for (let i = 0; i < valor.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formateado += ' ';
            }
            formateado += valor[i];
        }
        input.value = formateado;
    }

    // ===== CONFIGURACIÓN DE EVENTOS =====

    /**
     * Configura todos los event listeners necesarios para la aplicación.
     */
    function configurarEventos() {
        // Menú desplegable de usuario
        if (menuUsuarioBtn && dropdownMenu) {
            menuUsuarioBtn.addEventListener('click', (e) => {
                e.preventDefault();
                dropdownMenu.classList.toggle('activo');
            });
            // Cerrar menú al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!menuUsuarioBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.remove('activo');
                }
            });
        }

        // Botón/Enlace de Cerrar Sesión (ahora usa la función 'logout')
        // Asumiendo que tienes un enlace o botón con id='enlaceCerrarSesion' en el menú
        const enlaceCerrarSesion = document.getElementById('enlaceCerrarSesion'); // O el selector correcto
        if (enlaceCerrarSesion) {
            enlaceCerrarSesion.addEventListener('click', (e) => {
                e.preventDefault(); // Prevenir navegación si es un enlace
                logout();
            });
        }
        // Buscar otros posibles botones de cerrar sesión si existen y asignarles 'logout'
        // Ejemplo: const cerrarSesionMenuBtn = document.getElementById('cerrarSesionMenu');
        // if (cerrarSesionMenuBtn) cerrarSesionMenuBtn.addEventListener('click', logout);


        // Buscador (sin cambios)
        if (cerrarBusquedaBtn && buscadorInput) {
            cerrarBusquedaBtn.addEventListener('click', () => { buscadorInput.value = ''; cerrarBusquedaBtn.style.display = 'none'; });
            buscadorInput.addEventListener('input', () => { cerrarBusquedaBtn.style.display = buscadorInput.value.length > 0 ? 'block' : 'none'; });
        }

        // Cerrar Modales
        btnsModalCerrar.forEach(btn => {
            btn.addEventListener('click', () => { btn.closest('.modal')?.classList.remove('visible'); });
        });
        // Cerrar modal al hacer clic en el fondo oscuro
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) { // Si el clic fue directamente en el fondo
                    modal.classList.remove('visible');
                }
            });
        });


        // --- Eventos para Secciones Específicas ---

        // Direcciones
        if (btnAgregarDireccion) btnAgregarDireccion.addEventListener('click', () => abrirModalDireccion()); // Abre modal vacío
        if (formDireccion) formDireccion.addEventListener('submit', guardarDireccion);

        // Métodos de Pago
        if (btnAgregarMetodoPago) btnAgregarMetodoPago.addEventListener('click', abrirModalMetodoPago);
        if (formMetodoPago) {
            formMetodoPago.addEventListener('submit', guardarMetodoPago);
            const inputNumeroTarjeta = document.getElementById('numeroTarjeta');
            if (inputNumeroTarjeta) {
                inputNumeroTarjeta.addEventListener('input', () => formatearNumeroTarjeta(inputNumeroTarjeta));
            }
            // Añadir validación para mes/año/cvv si se desea
        }

        // Perfil de Usuario
        if (formEditarPerfil) formEditarPerfil.addEventListener('submit', actualizarPerfil);
        if (formCambiarContrasena) formCambiarContrasena.addEventListener('submit', cambiarContrasena);
        if (btnCambiarFoto) btnCambiarFoto.addEventListener('click', cambiarFotoPerfil);
        if (inputFotoPerfil) inputFotoPerfil.addEventListener('change', subirFotoPerfil);

        // Paginación y Filtros de Pedidos
        if (btnPaginaAnterior) btnPaginaAnterior.addEventListener('click', () => { if (paginaActual > 1) { paginaActual--; cargarTodosPedidos(); } });
        if (btnPaginaSiguiente) btnPaginaSiguiente.addEventListener('click', () => { if (paginaActual < totalPaginas) { paginaActual++; cargarTodosPedidos(); } });

        const filtroSelect = document.getElementById('filtroEstadoPedido');
        if (filtroSelect) {
            filtroSelect.addEventListener('change', () => {
                filtroEstadoPedido = filtroSelect.value;
                paginaActual = 1; // Resetear paginación al filtrar
                cargarTodosPedidos();
            });
        }

        const formBuscarPedido = document.getElementById('formBuscarPedido');
        const inputBuscarPedido = formBuscarPedido?.querySelector('input[type="search"]'); // Selector más específico
        if (formBuscarPedido && inputBuscarPedido) {
            formBuscarPedido.addEventListener('submit', (e) => {
                e.preventDefault();
                busquedaPedido = inputBuscarPedido.value.trim();
                paginaActual = 1; // Resetear paginación al buscar
                cargarTodosPedidos();
            });
            // Opcional: buscar al limpiar el input
            inputBuscarPedido.addEventListener('search', () => { // Evento 'search' se dispara al limpiar (icono X)
                if (inputBuscarPedido.value === '') {
                    busquedaPedido = '';
                    paginaActual = 1;
                    cargarTodosPedidos();
                }
            });
        }
    }

    // ===== INICIALIZACIÓN DE LA APLICACIÓN =====

    /**
     * Función principal que inicializa la aplicación.
     * Ahora es async para esperar la verificación de autenticación.
     */
    async function inicializarAplicacion() {
        console.log("Inicializando aplicación...");
        // 1. Verificar autenticación (redirige si falla)
        const autenticado = await verificarAutenticacionInicial();

        // 2. Si la autenticación fue exitosa, continuar con la inicialización
        if (autenticado) {
            console.log("Autenticación exitosa, continuando inicialización...");
            // El resto de la inicialización se mueve a inicializarFuncionalidadPostAutenticacion()
            // llamado dentro de verificarAutenticacionInicial si es exitoso.
        } else {
            console.log("Autenticación inicial fallida o en proceso de refresco/redirección.");
            // No hacer nada más aquí, verificarAutenticacionInicial o refreshToken manejan la redirección.
        }
    }

    /**
     * Inicializa el resto de la funcionalidad después de una autenticación exitosa.
     */
    function inicializarFuncionalidadPostAutenticacion() {
        // Configurar todos los listeners de eventos generales
        configurarEventos();

        // Inicializar la funcionalidad SPA (manejo de hash)
        inicializarSPA(); // Esto cargará la sección correcta según el hash o por defecto

        // Actualizar contador del carrito (basado en localStorage)
        actualizarContadorCarrito();

        // Otros pasos de inicialización que dependan de que el usuario esté logueado
        // ...
        console.log("Funcionalidad post-autenticación inicializada.");
    }


    // Iniciar la aplicación
    inicializarAplicacion();

});
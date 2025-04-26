document.addEventListener('DOMContentLoaded', async function () { // Hago esto async para poder usar await al inicio

    // Obtengo las referencias a los elementos del DOM que necesitaré
    const menuUsuarioBtn = document.getElementById('menuUsuario');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const cerrarBusquedaBtn = document.getElementById('cerrarBusqueda');
    const buscadorInput = document.querySelector('.buscador input');
    const nombreClientePanel = document.getElementById('nombreClientePanel');
    const nombrePerfilUsuario = document.getElementById('nombrePerfilUsuario');
    const emailUsuario = document.getElementById('emailUsuario');
    const imgPerfilUsuario = document.getElementById('imgPerfilUsuario');
    const perfilFotoActual = document.getElementById('perfilFotoActual');
    const tablaPedidosRecientes = document.getElementById('tablaPedidosRecientes');
    const tablaTodosPedidos = document.getElementById('tablaTodosPedidos');
    const productosRecomendados = document.getElementById('productosRecomendados');
    const totalPedidos = document.getElementById('totalPedidos');
    const totalDirecciones = document.getElementById('totalDirecciones');
    const totalMetodosPago = document.getElementById('totalMetodosPago');
    const contadorCarrito = document.querySelector('.contador-carrito');
    const seccionCargando = document.getElementById('cargando-seccion');
    const seccionContenido = document.getElementById('seccion-contenido');
    const todasLasSecciones = document.querySelectorAll('.seccion-panel');
    const menuSecciones = document.querySelectorAll('.menu-cliente a, .dropdown-menu a[data-section]');
    const modalDireccion = document.getElementById('modalDireccion');
    const modalMetodoPago = document.getElementById('modalMetodoPago');
    const modalDetallePedido = document.getElementById('modalDetallePedido');
    const btnsModalCerrar = document.querySelectorAll('.cerrar-modal');
    const btnAgregarDireccion = document.getElementById('agregarDireccion');
    const btnAgregarMetodoPago = document.getElementById('agregarMetodoPago');
    const btnCambiarFoto = document.querySelector('.btn-cambiar-foto');
    const inputFotoPerfil = document.getElementById('inputFotoPerfil');
    const formEditarPerfil = document.getElementById('formEditarPerfil');
    const formCambiarContrasena = document.getElementById('formCambiarContrasena');
    const formDireccion = document.getElementById('formDireccion');
    const formMetodoPago = document.getElementById('formMetodoPago');
    const listaDirecciones = document.getElementById('listaDirecciones');
    const listaMetodosPago = document.getElementById('listaMetodosPago');
    const btnPaginaAnterior = document.getElementById('paginaAnterior');
    const btnPaginaSiguiente = document.getElementById('paginaSiguiente');
    const spanPaginaActual = document.getElementById('paginaActual');

    // Guardo el estado de la paginación y filtros
    let paginaActual = 1;
    let totalPaginas = 1;
    let filtroEstadoPedido = 'todos';
    let busquedaPedido = '';

    // --- LÓGICA DE AUTENTICACIÓN ---

    // Verifico si el usuario está autenticado al cargar la página
    async function verificarAutenticacionInicial() {
        const accessToken = localStorage.getItem("accessToken");
        const tokenExpiration = localStorage.getItem("tokenExpiration");

        // Verifico primero localmente si hay token y si no ha expirado
        if (!accessToken || (tokenExpiration && new Date() > new Date(tokenExpiration))) {
            console.log("Token no válido localmente. Redirigiendo...");
            limpiarSesionYRedirigir();
            return false;
        }

        try {
            // Verifico el token contra el backend
            const response = await fetch("http://127.0.0.1:8000/api/usuarios/verificar-autenticacion/", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                // Si el token es inválido (401), intento refrescarlo
                if (response.status === 401) {
                    console.log("Token inválido o expirado, intentando refrescar...");
                    await refreshToken();
                    return false;
                } else {
                    console.error(`Error verificando token: ${response.status}`);
                    throw new Error("Error de autenticación");
                }
            } else {
                // Si el token es válido, obtengo datos y actualizo la UI
                const userData = await response.json();
                console.log("Usuario autenticado:", userData.usuario);
                actualizarUIUsuario(userData.usuario);
                inicializarFuncionalidadPostAutenticacion(); // Inicio el resto de la app
                return true;
            }
        } catch (error) {
            console.error("Error de autenticación:", error);
            limpiarSesionYRedirigir(); // Si algo falla, limpio y redirijo
            return false;
        }
    }

    // Intento obtener un nuevo token de acceso usando el de refresco
    async function refreshToken() {
        const refreshTokenValue = localStorage.getItem("refreshToken");

        if (!refreshTokenValue) {
            console.log("No hay refresh token. Redirigiendo...");
            limpiarSesionYRedirigir();
            throw new Error("No hay refresh token disponible");
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/usuarios/token/refresh/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh: refreshTokenValue })
            });

            if (!response.ok) {
                throw new Error("No se pudo refrescar el token");
            }

            const data = await response.json();

            // Guardo el nuevo token de acceso y su expiración estimada
            localStorage.setItem("accessToken", data.access);
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1); // Asumo 1 hora
            localStorage.setItem("tokenExpiration", expiresAt.toISOString());

            console.log("Token refrescado.");
            window.location.reload(); // Recargo la página para usar el nuevo token

        } catch (error) {
            console.error("Error crítico al refrescar token:", error);
            limpiarSesionYRedirigir(); // Si falla el refresco, mando al login
        }
    }

    // Borro los tokens de localStorage y redirijo al login
    function limpiarSesionYRedirigir() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("tokenExpiration");
        console.log("Redirigiendo a login...");
        window.location.href = "index-login.html";
    }

    // Cierro la sesión del usuario
    function logout() {
        console.log("Cerrando sesión...");
        limpiarSesionYRedirigir();
    }

    // Actualizo los elementos visuales con la información del usuario
    function actualizarUIUsuario(usuario) {
        // Ya no muestro el nombre en la barra superior (nombreUsuarioSpan comentado)
        // if (nombreUsuarioSpan) nombreUsuarioSpan.textContent = usuario.nombre ? usuario.nombre.split(' ')[0] : 'Usuario';
        if (nombreClientePanel) nombreClientePanel.textContent = usuario.nombre ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : 'Cliente';
        if (nombrePerfilUsuario) nombrePerfilUsuario.textContent = usuario.nombre ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : 'Usuario';
        if (emailUsuario) emailUsuario.textContent = usuario.email || 'email@ejemplo.com';

        // Muestro la foto de perfil si existe
        const urlFoto = usuario.foto_perfil || '/App-Meche-Artesanias/static/Img/usuario-default.jpg'; // Uso placeholder si no hay foto
        if (imgPerfilUsuario) {
            imgPerfilUsuario.src = urlFoto;
            imgPerfilUsuario.alt = `Foto de ${usuario.nombre || 'Usuario'}`;
        }
        if (perfilFotoActual) {
            perfilFotoActual.src = urlFoto;
        }
    }

    // --- IMPLEMENTACIÓN SPA (Single Page Application) ---

    // Configuro la navegación basada en el hash (#) de la URL
    function inicializarSPA() {
        window.addEventListener('hashchange', manejarCambioHash);
        menuSecciones.forEach(enlace => {
            enlace.addEventListener('click', function (e) {
                const seccionAttr = this.getAttribute('data-section');
                if (seccionAttr) { // Solo actúo si es un enlace de sección
                    e.preventDefault();
                    window.location.hash = seccionAttr;
                    if (dropdownMenu && dropdownMenu.classList.contains('activo')) {
                        dropdownMenu.classList.remove('activo'); // Cierro el dropdown si está abierto
                    }
                }
            });
        });

        // Cargo la sección inicial basada en el hash o voy al dashboard
        if (window.location.hash) {
            manejarCambioHash();
        } else {
            window.location.hash = 'dashboard';
        }
    }

    // Manejo el cambio de sección cuando cambia el hash
    function manejarCambioHash() {
        let seccion = window.location.hash.substring(1) || 'dashboard'; // Obtengo la sección o uso dashboard
        if (!document.getElementById(`seccion-${seccion}`)) { // Si no existe, voy al dashboard
            seccion = 'dashboard';
        }
        mostrarCargando();
        actualizarMenuActivo(seccion);
        setTimeout(() => { // Pequeña pausa para efecto visual
            cambiarSeccion(seccion);
            ocultarCargando();
        }, 300);
    }

    // Muestro el spinner de carga
    function mostrarCargando() {
        if (seccionCargando) seccionCargando.classList.remove('oculto');
        if (seccionContenido) seccionContenido.style.opacity = '0.5';
    }

    // Oculto el spinner de carga
    function ocultarCargando() {
        if (seccionCargando) seccionCargando.classList.add('oculto');
        if (seccionContenido) seccionContenido.style.opacity = '1';
    }

    // Marco como activa la opción del menú lateral correspondiente
    function actualizarMenuActivo(seccion) {
        document.querySelectorAll('.menu-cliente li').forEach(item => item.classList.remove('activo'));
        const enlaceActivo = document.querySelector(`.menu-cliente a[data-section="${seccion}"]`);
        if (enlaceActivo) enlaceActivo.closest('li').classList.add('activo');
    }

    // Oculto todas las secciones y muestro la deseada, cargando sus datos
    function cambiarSeccion(seccion) {
        todasLasSecciones.forEach(s => s.classList.remove('active'));
        const seccionDeseada = document.getElementById(`seccion-${seccion}`);

        if (seccionDeseada) {
            seccionDeseada.classList.add('active');
            // Cargo los datos específicos de la sección que se muestra
            switch (seccion) {
                case 'dashboard': cargarDatosDashboard(); break;
                case 'perfil': cargarDatosPerfil(); break;
                case 'pedidos':
                    paginaActual = 1; // Reinicio paginación y filtros al entrar
                    filtroEstadoPedido = 'todos';
                    busquedaPedido = '';
                    const filtroSelect = document.getElementById('filtroEstadoPedido');
                    if (filtroSelect) filtroSelect.value = 'todos';
                    const inputBuscar = document.querySelector('#formBuscarPedido input');
                    if (inputBuscar) inputBuscar.value = '';
                    cargarTodosPedidos();
                    break;
                case 'direcciones': cargarDirecciones(); break;
                case 'pagos': cargarMetodosDePago(); break;
            }
        } else { // Si la sección no existe, muestro el dashboard
            const seccionDashboard = document.getElementById('seccion-dashboard');
            if (seccionDashboard) {
                seccionDashboard.classList.add('active');
                cargarDatosDashboard();
                actualizarMenuActivo('dashboard');
            }
        }
    }

    // --- FUNCIONES PARA CARGAR DATOS ---

    // Cargo los datos iniciales del dashboard
    function cargarDatosDashboard() {
        cargarPedidosRecientes();
        cargarProductosRecomendados();
        cargarContadoresResumen();
    }

    // Obtengo los contadores de resumen (total pedidos, etc.) desde la API
    function cargarContadoresResumen() {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        // Asumo que la API de perfil devuelve estos contadores
        fetch('http://127.0.0.1:8000/api/usuarios/verificar-autenticacion/', { // Reutilizo esta si devuelve todo
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => response.ok ? response.json() : Promise.reject(`Error ${response.status}`))
            .then(data => {
                const usuario = data.usuario || data;
                // Aquí necesitaría que la API devuelva 'total_pedidos', 'total_direcciones', etc.
                if (totalPedidos) totalPedidos.textContent = usuario.total_pedidos || 0;
                if (totalDirecciones) totalDirecciones.textContent = usuario.total_direcciones || 0;
                if (totalMetodosPago) totalMetodosPago.textContent = usuario.total_metodos_pago || 0;
            })
            .catch(error => {
                console.error('Error cargando contadores:', error);
                if (totalPedidos) totalPedidos.textContent = '-';
                if (totalDirecciones) totalDirecciones.textContent = '-';
                if (totalMetodosPago) totalMetodosPago.textContent = '-';
            });
    }

    // Cargo los datos del usuario para el formulario de edición de perfil
    function cargarDatosPerfil() {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        // Idealmente tendría un endpoint /api/usuarios/perfil/ GET
        fetch('http://127.0.0.1:8000/api/usuarios/verificar-autenticacion/', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) refreshToken();
                    throw new Error(`Error ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const usuario = data.usuario || data;
                document.getElementById('nombreCompleto').value = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
                document.getElementById('emailPerfil').value = usuario.email || '';
                document.getElementById('telefonoPerfil').value = usuario.telefono || ''; // Asume campo telefono en API
                if (perfilFotoActual) {
                    perfilFotoActual.src = usuario.foto_perfil || '/App-Meche-Artesanias/static/Img/usuario-default.jpg';
                }
            })
            .catch(error => {
                console.error('Error cargando datos de perfil:', error);
                mostrarNotificacion('No se pudieron cargar tus datos de perfil.', 'error');
            });
    }

    // Cargo los últimos 5 pedidos para el dashboard
    function cargarPedidosRecientes() {
        const token = localStorage.getItem('accessToken');
        if (!token || !tablaPedidosRecientes) return;
        tablaPedidosRecientes.innerHTML = `<tr><td colspan="5" class="sin-datos">Cargando...</td></tr>`;
        // Asumo que tengo este endpoint en el backend
        fetch('http://127.0.0.1:8000/api/pedidos/recientes/?limite=5', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => { /* ... manejo de respuesta y errores ... */ })
            .then(pedidos => { /* ... renderizado de filas ... */ })
            .catch(error => { /* ... manejo de error fetch ... */ });
        // Simplificado por brevedad, la lógica interna es similar a cargarTodosPedidos
    }

    // Cargo la lista completa de pedidos con paginación y filtros
    function cargarTodosPedidos() {
        const token = localStorage.getItem('accessToken');
        if (!token || !tablaTodosPedidos) return;
        tablaTodosPedidos.innerHTML = `<tr><td colspan="5" class="sin-datos">Cargando...</td></tr>`;
        let url = `http://127.0.0.1:8000/api/pedidos/?pagina=${paginaActual}`; // Asumo endpoint
        if (filtroEstadoPedido !== 'todos') url += `&estado=${filtroEstadoPedido}`;
        if (busquedaPedido) url += `&buscar=${encodeURIComponent(busquedaPedido)}`;

        fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => { /* ... manejo de respuesta y errores ... */ })
            .then(data => {
                totalPaginas = data.total_paginas || 1;
                spanPaginaActual.textContent = `Página ${paginaActual} de ${totalPaginas}`;
                btnPaginaAnterior.disabled = paginaActual <= 1;
                btnPaginaSiguiente.disabled = paginaActual >= totalPaginas;
                const pedidos = data.resultados || [];
                /* ... renderizado de filas ... */
                configurarBotonesPedidos(tablaTodosPedidos);
            })
            .catch(error => { /* ... manejo de error fetch ... */ });
        // Simplificado por brevedad
    }

    // Añado listeners a los botones de las filas de pedidos
    function configurarBotonesPedidos(tabla) {
        tabla.querySelectorAll('.ver-detalle-pedido').forEach(boton => {
            boton.addEventListener('click', function() { abrirDetallePedido(this.getAttribute('data-id')); });
        });
        tabla.querySelectorAll('.cancelar-pedido').forEach(boton => {
            boton.addEventListener('click', function() { confirmarCancelacionPedido(this.getAttribute('data-id')); });
        });
    }

    // Abro el modal y cargo los detalles de un pedido específico
    function abrirDetallePedido(idPedido) {
        const token = localStorage.getItem('accessToken');
        const contenidoDetalle = document.getElementById('contenidoDetallePedido');
        const detallePedidoId = document.getElementById('detallePedidoId');
        if (!token || !modalDetallePedido || !contenidoDetalle || !detallePedidoId) return;

        detallePedidoId.textContent = idPedido;
        contenidoDetalle.innerHTML = `<div class="cargando-datos"><i class="fas fa-spinner fa-spin"></i><p>Cargando...</p></div>`;
        modalDetallePedido.classList.add('visible');

        // Asumo endpoint de detalle
        fetch(`http://127.0.0.1:8000/api/pedidos/${idPedido}/detalle/`, {
             method: 'GET', headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => { /* ... manejo respuesta ... */ return response.json(); })
        .then(pedido => { /* ... renderizado del detalle completo en contenidoDetalle ... */ })
        .catch(error => { /* ... manejo error ... */ });
         // Simplificado por brevedad
    }

    // Pido confirmación antes de cancelar
    function confirmarCancelacionPedido(idPedido) {
        if (confirm(`¿Seguro que quieres cancelar el pedido #${idPedido}?`)) {
            cancelarPedido(idPedido);
        }
    }

    // Envío la solicitud para cancelar un pedido al backend
    function cancelarPedido(idPedido) {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        // Asumo endpoint de cancelación
        fetch(`http://127.0.0.1:8000/api/pedidos/${idPedido}/cancelar/`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        .then(response => { /* ... manejo respuesta ... */ })
        .then(data => {
             mostrarNotificacion('Pedido cancelado', 'success');
             // Recargo datos para reflejar cambio
             if (window.location.hash.includes('dashboard')) cargarPedidosRecientes();
             if (window.location.hash.includes('pedidos')) cargarTodosPedidos();
        })
        .catch(error => { /* ... manejo error ... */ });
        // Simplificado
    }

    // Cargo productos recomendados (ej. para el dashboard)
    function cargarProductosRecomendados() {
        // Lógica similar a las otras cargas de datos, usando un endpoint como /api/productos/recomendados/
         // Simplificado
    }

    // Cargo las direcciones guardadas del usuario
    function cargarDirecciones() {
         // Lógica similar, usando endpoint /api/usuarios/direcciones/ GET
         // Al renderizar, añado listeners con configurarBotonesDirecciones()
         // Simplificado
    }

    // Añado listeners a los botones de editar/eliminar/predeterminada de las direcciones
    function configurarBotonesDirecciones() {
        document.querySelectorAll('.editar-direccion').forEach(b => b.addEventListener('click', function() { cargarDireccionParaEditar(this.getAttribute('data-id')); }));
        document.querySelectorAll('.establecer-predeterminada').forEach(b => b.addEventListener('click', function() { establecerDireccionPredeterminada(this.getAttribute('data-id')); }));
        document.querySelectorAll('.eliminar-direccion').forEach(b => b.addEventListener('click', function() { confirmarEliminarDireccion(this.getAttribute('data-id')); }));
    }

    // Abro el modal de dirección (vacío para nuevo, con datos para editar)
    function abrirModalDireccion(direccion = null) {
         if (!formDireccion || !modalDireccion) return;
         formDireccion.reset();
         formDireccion.removeAttribute('data-id');
         document.querySelector('#modalDireccion .modal-titulo').textContent = 'Agregar Nueva Dirección';
         if (direccion) { // Si edito, relleno el formulario
             // ... rellenar campos del formDireccion con datos de 'direccion' ...
             formDireccion.setAttribute('data-id', direccion.id);
             document.querySelector('#modalDireccion .modal-titulo').textContent = 'Editar Dirección';
         }
         modalDireccion.classList.add('visible');
         // Simplificado
    }

    // Obtengo los datos de una dirección específica para ponerlos en el modal de edición
    function cargarDireccionParaEditar(idDireccion) {
         // Hago fetch GET a /api/usuarios/direcciones/{idDireccion}/
         // y llamo a abrirModalDireccion(datosRecibidos)
         // Simplificado
    }

    // Guardo una dirección nueva o editada
    function guardarDireccion(event) {
         event.preventDefault();
         // Obtengo datos del formDireccion
         // Determino si es POST (nuevo) o PUT (editar) basado en data-id
         // Hago fetch POST o PUT a /api/usuarios/direcciones/ o /api/usuarios/direcciones/{id}/
         // Al éxito: cierro modal, muestro notificación, recargo direcciones y contadores
         // Simplificado
    }

    // Marco una dirección como predeterminada
    function establecerDireccionPredeterminada(idDireccion) {
         // Hago fetch POST (o PUT) a /api/usuarios/direcciones/{id}/predeterminada/
         // Al éxito: muestro notificación, recargo direcciones
         // Simplificado
    }

    // Pido confirmación para eliminar dirección
    function confirmarEliminarDireccion(idDireccion) {
        if (confirm('¿Seguro que quieres eliminar esta dirección?')) {
            eliminarDireccion(idDireccion);
        }
    }

    // Envío solicitud para eliminar una dirección
    function eliminarDireccion(idDireccion) {
         // Hago fetch DELETE a /api/usuarios/direcciones/{id}/
         // Al éxito: muestro notificación, recargo direcciones y contadores
         // Simplificado
    }

    // Cargo los métodos de pago guardados
    function cargarMetodosDePago() {
        // Similar a cargarDirecciones, usando endpoint /api/usuarios/metodos-pago/
        // Y llamando a configurarBotonesMetodosPago()
        // Simplificado
    }

    // Añado listeners a los botones de métodos de pago
    function configurarBotonesMetodosPago() {
        document.querySelectorAll('.establecer-predeterminado-pago').forEach(b => b.addEventListener('click', function() { establecerMetodoPagoPredeterminado(this.getAttribute('data-id')); }));
        document.querySelectorAll('.eliminar-metodo-pago').forEach(b => b.addEventListener('click', function() { confirmarEliminarMetodoPago(this.getAttribute('data-id')); }));
    }

    // Abro el modal para añadir un nuevo método de pago
    function abrirModalMetodoPago() {
        if (!formMetodoPago || !modalMetodoPago) return;
        formMetodoPago.reset();
        modalMetodoPago.classList.add('visible');
    }

    // Guardo un nuevo método de pago
    function guardarMetodoPago(event) {
        event.preventDefault();
        // Obtengo datos del formMetodoPago, valido
        // Hago fetch POST a /api/usuarios/metodos-pago/
        // Al éxito: cierro modal, notifico, recargo métodos y contadores
        // Simplificado
    }

    // Establezco un método de pago como predeterminado
    function establecerMetodoPagoPredeterminado(idMetodo) {
        // Fetch POST a /api/usuarios/metodos-pago/{id}/predeterminado/
        // Al éxito: notifico, recargo métodos
        // Simplificado
    }

    // Confirmo antes de eliminar método de pago
    function confirmarEliminarMetodoPago(idMetodo) {
        if (confirm('¿Seguro que quieres eliminar este método de pago?')) {
            eliminarMetodoPago(idMetodo);
        }
    }

    // Elimino un método de pago
    function eliminarMetodoPago(idMetodo) {
        // Fetch DELETE a /api/usuarios/metodos-pago/{id}/
        // Al éxito: notifico, recargo métodos y contadores
        // Simplificado
    }

    // --- GESTIÓN DEL PERFIL ---

    // Actualizo los datos básicos del perfil
    function actualizarPerfil(event) {
        event.preventDefault();
        const token = localStorage.getItem('accessToken');
        if (!token || !formEditarPerfil) return;

        // Obtengo nombre y apellido del campo 'nombreCompleto'
        const nombreCompleto = document.getElementById('nombreCompleto').value.trim();
        const primerEspacio = nombreCompleto.indexOf(' ');
        const nombre = primerEspacio === -1 ? nombreCompleto : nombreCompleto.substring(0, primerEspacio);
        const apellido = primerEspacio === -1 ? '' : nombreCompleto.substring(primerEspacio + 1);

        const datosPerfil = {
            nombre: nombre,
            apellido: apellido,
            email: document.getElementById('emailPerfil').value,
            telefono: document.getElementById('telefonoPerfil').value
        };

        // Hago fetch PUT a /api/usuarios/perfil/ (o endpoint similar)
        fetch('http://127.0.0.1:8000/api/usuarios/perfil/', { // Necesito este endpoint PUT
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPerfil)
        })
        .then(response => { /* ... manejo respuesta ... */ return response.json(); })
        .then(data => {
            mostrarNotificacion('Perfil actualizado', 'success');
            actualizarUIUsuario(data.usuario || data); // Actualizo UI con la respuesta
        })
        .catch(error => { /* ... manejo error ... */ });
        // Simplificado
    }

    // Cambio la contraseña del usuario
    function cambiarContrasena(event) {
        event.preventDefault();
        const token = localStorage.getItem('accessToken');
        if (!token || !formCambiarContrasena) return;
        // Obtengo contraseñas, valido que coincidan y cumplan requisitos
        // Hago fetch POST a /api/usuarios/cambiar-contrasena/
        // Al éxito: notifico, reseteo formulario
        // Simplificado
    }

    // Hago clic en el input de archivo oculto
    function cambiarFotoPerfil() {
        if (inputFotoPerfil) inputFotoPerfil.click();
    }

    // Subo la foto seleccionada al backend
    function subirFotoPerfil(event) {
        const token = localStorage.getItem('accessToken');
        if (!token || !event.target.files || event.target.files.length === 0) return;
        const archivo = event.target.files[0];
        // Valido tipo y tamaño
        if (!archivo.type.startsWith('image/') || archivo.size > 5 * 1024 * 1024) {
             mostrarNotificacion('Archivo inválido (imagen < 5MB).', 'error');
             inputFotoPerfil.value = ''; return;
        }
        // Muestro carga visual
        if (perfilFotoActual) perfilFotoActual.style.opacity = '0.5';
        if (imgPerfilUsuario) imgPerfilUsuario.style.opacity = '0.5';

        const formData = new FormData();
        formData.append('foto_perfil', archivo); // La clave debe coincidir con el backend

        // Hago fetch POST a /api/usuarios/foto-perfil/
        fetch('http://127.0.0.1:8000/api/usuarios/foto-perfil/', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }, // Sin Content-Type para FormData
            body: formData
        })
        .then(response => { /* ... manejo respuesta ... */ return response.json(); })
        .then(data => {
            if (data.success && data.url_foto) {
                mostrarNotificacion('Foto actualizada', 'success');
                // Actualizo las imágenes en la UI
                if (perfilFotoActual) perfilFotoActual.src = data.url_foto;
                if (imgPerfilUsuario) imgPerfilUsuario.src = data.url_foto;
            } else {
                throw new Error(data.mensaje || 'Error al subir foto');
            }
        })
        .catch(error => { /* ... manejo error ... */ })
        .finally(() => { // Restauro opacidad y limpio input
            if (perfilFotoActual) perfilFotoActual.style.opacity = '1';
            if (imgPerfilUsuario) imgPerfilUsuario.style.opacity = '1';
            inputFotoPerfil.value = '';
        });
        // Simplificado
    }

    // --- GESTIÓN DEL CARRITO (localStorage) ---

    // Actualizo el número en el icono del carrito
    function actualizarContadorCarrito() {
        try {
            let carrito = JSON.parse(localStorage.getItem('mecheCarrito')) || [];
            const cantidad = carrito.reduce((total, item) => total + (item.cantidad || 0), 0);
            if (contadorCarrito) {
                contadorCarrito.textContent = cantidad;
                contadorCarrito.classList.toggle('activo', cantidad > 0);
            }
        } catch (e) { console.error("Error leyendo carrito:", e); }
    }

    // Añado un producto al carrito (guardado en localStorage)
    function agregarAlCarrito(idProducto, cantidad) {
        try {
            let carrito = JSON.parse(localStorage.getItem('mecheCarrito')) || [];
            const indexProducto = carrito.findIndex(item => item.id === idProducto);
            const productoInfo = obtenerInfoProductoParaCarrito(idProducto); // Necesito info básica

            if (!productoInfo) {
                 mostrarNotificacion('Error al obtener info del producto.', 'error'); return;
            }

            if (indexProducto !== -1) {
                carrito[indexProducto].cantidad += cantidad;
            } else {
                carrito.push({ ...productoInfo, cantidad: cantidad });
            }
            localStorage.setItem('mecheCarrito', JSON.stringify(carrito));
            actualizarContadorCarrito();
            mostrarNotificacion('Producto agregado al carrito', 'success');
        } catch (e) { mostrarNotificacion('Error al actualizar carrito.', 'error'); }
    }

    // Intento obtener info básica del producto (simplificado)
    function obtenerInfoProductoParaCarrito(idProducto) {
        // Intento buscarlo en las tarjetas renderizadas
        const tarjetaProducto = document.querySelector(`.producto-card [data-id="${idProducto}"]`)?.closest('.producto-card');
        if (tarjetaProducto) {
            return {
                id: idProducto,
                nombre: tarjetaProducto.querySelector('.producto-info h3')?.textContent || 'Producto',
                precio: parseFloat(tarjetaProducto.querySelector('.precio-actual')?.textContent.replace(/[^0-9,-]+/g, "").replace(',', '.') || '0'),
                imagen: tarjetaProducto.querySelector('.producto-imagen img')?.src || ''
            };
        }
        // Idealmente haría un fetch a la API aquí si no lo encuentro en el DOM
        console.warn(`Info para ${idProducto} no encontrada localmente.`);
        return null;
    }

    // --- UTILIDADES ---

    // Muestro una notificación toast
    function mostrarNotificacion(mensaje, tipo = 'info') {
        const contenedor = document.getElementById('contenedor-notificaciones') || crearContenedorNotificaciones();
        const notif = document.createElement('div');
        notif.className = `notificacion ${tipo}`;
        let icono = 'fa-info-circle';
        if (tipo === 'success') icono = 'fa-check-circle';
        else if (tipo === 'warning') icono = 'fa-exclamation-triangle';
        else if (tipo === 'error') icono = 'fa-times-circle';
        notif.innerHTML = `<i class="fas ${icono}"></i><span>${mensaje}</span><button type="button" class="cerrar-notificacion">&times;</button>`;
        contenedor.appendChild(notif);
        notif.querySelector('.cerrar-notificacion').addEventListener('click', () => notif.remove());
        setTimeout(() => notif.remove(), 5000);
    }

    // Creo el div contenedor para las notificaciones si no existe
    function crearContenedorNotificaciones() {
        let cont = document.createElement('div'); cont.id = 'contenedor-notificaciones';
        cont.style.cssText = 'position:fixed; top:20px; right:20px; z-index:1050; display:flex; flex-direction:column; gap:10px;';
        document.body.appendChild(cont); return cont;
    }

    // Formateo el input de número de tarjeta con espacios
    function formatearNumeroTarjeta(input) {
        let valor = input.value.replace(/\D/g, '').substring(0, 19);
        let formateado = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
        input.value = formateado;
    }

    // --- CONFIGURACIÓN DE EVENTOS ---

    // Asigno todos los listeners a botones, formularios, etc.
    function configurarEventos() {
        // Menú desplegable usuario
        if (menuUsuarioBtn && dropdownMenu) {
            menuUsuarioBtn.addEventListener('click', (e) => { e.preventDefault(); dropdownMenu.classList.toggle('activo'); });
            document.addEventListener('click', (e) => { if (!menuUsuarioBtn.contains(e.target) && !dropdownMenu.contains(e.target)) dropdownMenu.classList.remove('activo'); });
        }
        // Botón Cerrar Sesión (necesito un elemento con id="enlaceCerrarSesion" o similar en el HTML del dropdown)
        const enlaceCerrarSesion = document.getElementById('cerrarSesion') || document.getElementById('cerrarSesionMenu'); // Busco en ambos posibles lugares
        if (enlaceCerrarSesion) {
             enlaceCerrarSesion.addEventListener('click', (e) => { e.preventDefault(); logout(); });
        }
        // Buscador
        if (cerrarBusquedaBtn && buscadorInput) { /* ... listener input y click ... */ }
        // Modales
        btnsModalCerrar.forEach(btn => btn.addEventListener('click', () => btn.closest('.modal')?.classList.remove('visible')));
        document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', (e) => { if (e.target === m) m.classList.remove('visible'); }));
        // Botones y Forms de Secciones
        if (btnAgregarDireccion) btnAgregarDireccion.addEventListener('click', () => abrirModalDireccion());
        if (formDireccion) formDireccion.addEventListener('submit', guardarDireccion);
        if (btnAgregarMetodoPago) btnAgregarMetodoPago.addEventListener('click', abrirModalMetodoPago);
        if (formMetodoPago) { /* ... listener submit y formateo tarjeta ... */ }
        if (formEditarPerfil) formEditarPerfil.addEventListener('submit', actualizarPerfil);
        if (formCambiarContrasena) formCambiarContrasena.addEventListener('submit', cambiarContrasena);
        if (btnCambiarFoto) btnCambiarFoto.addEventListener('click', cambiarFotoPerfil);
        if (inputFotoPerfil) inputFotoPerfil.addEventListener('change', subirFotoPerfil);
        // Paginación y Filtros Pedidos
        if (btnPaginaAnterior) btnPaginaAnterior.addEventListener('click', () => { /* ... cambiar pagina y cargar ... */ });
        if (btnPaginaSiguiente) btnPaginaSiguiente.addEventListener('click', () => { /* ... cambiar pagina y cargar ... */ });
        const filtroSelect = document.getElementById('filtroEstadoPedido');
        if (filtroSelect) { /* ... listener change ... */ }
        const formBuscarPedido = document.getElementById('formBuscarPedido');
        if (formBuscarPedido) { /* ... listener submit y search ... */ }

        // Simplificado por brevedad
    }

    // --- INICIALIZACIÓN ---

    // Función principal que arranca todo
    async function inicializarAplicacion() {
        console.log("Iniciando dashboard...");
        const autenticado = await verificarAutenticacionInicial(); // Primero verifico si estoy logueado
        if (!autenticado) {
             console.log("Autenticación fallida o redirigiendo...");
             // No continúo si la autenticación falla o está refrescando/redirigiendo
             return;
        }
        // Si estoy autenticado, inicializo el resto
        console.log("Autenticación OK. Inicializando funcionalidad.");
        // inicializarFuncionalidadPostAutenticacion(); // Esta función ya se llama dentro de verificarAutenticacionInicial si es exitoso
    }

    // Pongo en marcha las funciones necesarias DESPUÉS de verificar la autenticación
    function inicializarFuncionalidadPostAutenticacion() {
        configurarEventos(); // Configuro todos los botones y formularios
        inicializarSPA();    // Activo la navegación SPA
        actualizarContadorCarrito(); // Muestro el número de items en el carrito
        console.log("Dashboard inicializado.");
    }

    // Arranco la aplicación al cargar la página
    inicializarAplicacion();

});
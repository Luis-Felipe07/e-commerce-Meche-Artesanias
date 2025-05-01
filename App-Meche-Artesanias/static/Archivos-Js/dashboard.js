
// App-Meche-Artesanias/static/Archivos-Js/dashboard.js
document.addEventListener('DOMContentLoaded', async function () {

    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const menuUsuarioBtn = document.getElementById('menuUsuario');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const cerrarBusquedaBtn = document.getElementById('cerrarBusqueda');
    const buscadorInput = document.querySelector('.buscador input[name="q"]'); // Corregido selector
    const nombreClientePanel = document.getElementById('nombreClientePanel');
    const nombrePerfilUsuario = document.getElementById('nombrePerfilUsuario');
    const emailUsuario = document.getElementById('emailUsuario');
    const imgPerfilUsuario = document.getElementById('imgPerfilUsuario');
    const perfilFotoActual = document.getElementById('perfilFotoActual');
    const tablaPedidosRecientes = document.getElementById('tablaPedidosRecientes');
    const tablaTodosPedidos = document.getElementById('tablaTodosPedidos');
    const productosRecomendadosDiv = document.getElementById('productosRecomendados');
    const totalPedidosSpan = document.getElementById('totalPedidos');
    const totalDireccionesSpan = document.getElementById('totalDirecciones');
    const totalMetodosPagoSpan = document.getElementById('totalMetodosPago'); // Si se usa
    const totalItemsCarritoDashSpan = document.getElementById('totalItemsCarritoDash'); // Tarjeta resumen carrito
    const contadorCarritoIcon = document.getElementById('contador-carrito-icon'); // Icono header
    const seccionCargando = document.getElementById('cargando-seccion');
    const seccionContenidoPrincipal = document.getElementById('seccion-contenido');
    const todasLasSecciones = document.querySelectorAll('.seccion-panel');
    const menuSecciones = document.querySelectorAll('.menu-cliente a[data-section], .dropdown-menu a[data-section]');
    const modalDireccion = document.getElementById('modalDireccion');
    const modalMetodoPago = document.getElementById('modalMetodoPago'); // Si se usa
    const modalDetallePedido = document.getElementById('modalDetallePedido');
    const contenidoDetallePedido = document.getElementById('contenidoDetallePedido'); // Asegúrate que este ID existe en tu modal
    const detallePedidoId = document.getElementById('detallePedidoId'); // Asegúrate que este ID existe
    const btnsModalCerrar = document.querySelectorAll('.cerrar-modal');
    const btnAgregarDireccion = document.getElementById('agregarDireccion');
    const btnAgregarMetodoPago = document.getElementById('agregarMetodoPago'); // Si se usa
    const btnCambiarFoto = document.querySelector('.btn-cambiar-foto');
    const inputFotoPerfil = document.getElementById('inputFotoPerfil');
    const formEditarPerfil = document.getElementById('formEditarPerfil');
    const formCambiarContrasena = document.getElementById('formCambiarContrasena');
    const formDireccion = document.getElementById('formDireccion');
    const formMetodoPago = document.getElementById('formMetodoPago'); // Si se usa
    const listaDireccionesDiv = document.getElementById('listaDirecciones');
    const listaMetodosPagoDiv = document.getElementById('listaMetodosPago'); // Si se usa
    const btnPaginaAnterior = document.getElementById('paginaAnterior');
    const btnPaginaSiguiente = document.getElementById('paginaSiguiente');
    const spanPaginaActual = document.getElementById('paginaActual');
    const seccionContenidoCarrito = document.getElementById('carrito-dashboard-items');
    const seccionResumenCarrito = document.getElementById('carrito-dashboard-resumen');
    const totalCarritoDashboard = document.getElementById('carrito-dashboard-total');
    const btnCerrarSesion1 = document.getElementById('cerrarSesion'); // En dropdown
    const btnCerrarSesion2 = document.getElementById('cerrarSesionMenu'); // En menú lateral
    const filtroSelect = document.getElementById('filtroEstadoPedido');
    const formBuscarPedido = document.getElementById('formBuscarPedido');
    const buscarPedidoInput = document.getElementById('buscarPedidoInput');

    // --- VARIABLES GLOBALES ---
    let paginaActualPedidos = 1; // Renombrado para claridad
    let totalPaginasPedidos = 1;

    // --- FUNCIONES DE UTILIDAD ---

    function mostrarNotificacion(mensaje, tipo = 'info', duracion = 3500) {
        const contenedor = document.getElementById('contenedor-notificaciones') || crearContenedorNotificaciones();
        const notif = document.createElement('div');
        notif.className = `notificacion-toast ${tipo}`;
        notif.classList.add('mostrar');
        let icono = 'fa-info-circle';
        if (tipo === 'success') icono = 'fa-check-circle';
        else if (tipo === 'warning') icono = 'fa-exclamation-triangle';
        else if (tipo === 'error') icono = 'fa-times-circle';
        notif.innerHTML = `<div class="notificacion-contenido"><i class="fas ${icono}"></i><span>${mensaje}</span></div><button class="notificacion-cerrar">&times;</button>`;
        contenedor.appendChild(notif);
        notif.querySelector('.notificacion-cerrar').addEventListener('click', () => {
            notif.classList.remove('mostrar');
            notif.addEventListener('transitionend', () => notif.remove());
        });
        setTimeout(() => {
            notif.classList.remove('mostrar');
            notif.addEventListener('transitionend', () => notif.remove());
        }, duracion);
    }

    function crearContenedorNotificaciones() {
        let cont = document.getElementById('contenedor-notificaciones');
        if (!cont) {
            cont = document.createElement('div');
            cont.id = 'contenedor-notificaciones';
            cont.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:1050; display:flex; flex-direction:column; gap:10px; max-width: 350px; width: 90%; pointer-events: none;';
            // Permitir clicks en los botones dentro de las notificaciones
            cont.addEventListener('pointerdown', (e) => {
                if (e.target.closest('button')) {
                    e.target.closest('button').style.pointerEvents = 'auto';
                }
            }, true);
            document.body.appendChild(cont);
        }
        return cont;
    }

    // --- LÓGICA DE AUTENTICACIÓN Y API ---

    async function fetchAPI(url, options = {}) {
        console.log(`[fetchAPI] Iniciando llamada a: ${url}`, options); // LOG INICIO
        const token = localStorage.getItem('accessToken');
        console.log(`[fetchAPI] Token actual: ${token ? token.substring(0, 15) + '...' : 'Ninguno'}`); // LOG TOKEN
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
        // No incluyo CSRF token asumiendo autenticación puramente por JWT Bearer

        const finalUrl = url.startsWith('/') ? url : `/api${url.startsWith('api') ? url.substring(3) : url}`; // Aseguro que empiece con /api si no lo hace

        const config = {
            ...options,
            headers: { ...defaultHeaders, ...options.headers }
        };

        // Si es una petición con FormData (subir archivo), no establezco Content-Type
        if (options.body instanceof FormData) {
            delete config.headers['Content-Type'];
        } else if (typeof options.body === 'object' && options.body !== null && !(options.body instanceof FormData)) {
            // Aseguro que el cuerpo sea JSON string si es un objeto (y no FormData)
            config.body = JSON.stringify(options.body);
        }


        if (!token) delete config.headers['Authorization'];

        try {
            let response = await fetch(finalUrl, config);
            console.log(`[fetchAPI] Respuesta inicial para ${url}: Status ${response.status}`); // LOG RESPUESTA INICIAL

            if (response.status === 401 && !options.triedRefresh) {
                console.log("[fetchAPI] Status 401 detectado. Intentando refrescar token..."); // LOG 401
                const refreshed = await refreshToken(); // Intenta refrescar
                if (refreshed) {
                    console.log("[fetchAPI] Refresco de token exitoso. Reintentando la llamada original..."); // LOG REFRESH OK
                    config.headers['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;
                    config.triedRefresh = true; // Marco para no entrar en bucle
                    response = await fetch(finalUrl, config); // Reintenta la llamada
                    console.log(`[fetchAPI] Respuesta tras reintento para ${url}: Status ${response.status}`); // LOG RESPUESTA REINTENTO
                } else {
                    console.error("[fetchAPI] Falla en el refresco de token. Limpiando sesión y redirigiendo."); // LOG REFRESH FALLIDO
                    limpiarSesionYRedirigir();
                    // Lanzo un error para detener la ejecución de esta llamada
                    throw new Error("Fallo de autenticación y refresco.");
                }
            }

            let data = {};
            const contentType = response.headers.get("content-type");
            if (response.status !== 204 && contentType && contentType.includes("application/json")) { // Si no es "No Content" y es JSON
                try {
                    data = await response.json();
                    console.log(`[fetchAPI] Datos JSON recibidos para ${url}:`, data); // LOG DATOS JSON
                } catch (e) {
                    console.error(`[fetchAPI] Error parseando JSON para ${url} (Status: ${response.status})`, e); // LOG ERROR PARSEO
                    if (!response.ok) {
                        // Intento leer como texto si falla el JSON y la respuesta no fue OK
                        const textError = await response.text().catch(() => 'No se pudo leer el cuerpo del error');
                        throw new Error(`Error ${response.status} del servidor. Respuesta no JSON: ${textError.substring(0, 150)}`);
                    } else {
                        // Si fue OK pero falló el parseo JSON (inesperado)
                        throw new Error(`Respuesta OK (${response.status}) pero no se pudo parsear JSON para ${url}`);
                    }
                }
            } else if (response.status === 204) {
                console.log(`[fetchAPI] Respuesta 204 No Content para ${url}`); // LOG 204
                data = { success: true, status: 204 }; // Simulo éxito para 204
            } else {
                // Si no es JSON (ej. subida de archivo puede devolver texto)
                const textData = await response.text().catch(() => '');
                console.log(`[fetchAPI] Respuesta no JSON recibida para ${url} (Status: ${response.status}, Tipo: ${contentType}): ${textData.substring(0, 100)}`); // LOG NO JSON
                // Si la respuesta fue OK, creo un objeto de éxito simulado
                if (response.ok) {
                    data = { success: true, mensaje: "Operación exitosa (respuesta no JSON)", status: response.status, bodyText: textData };
                } else {
                    // Si no fue OK y no es JSON, lanzo error con el texto
                    throw new Error(`Error ${response.status} del servidor. Respuesta texto: ${textData.substring(0, 150)}`);
                }
            }


            if (!response.ok) {
                // Si AÚN no está OK (después de posible refresco)
                console.error(`[fetchAPI] Error final en API ${response.status} para ${url}. Datos/Error:`, data); // LOG ERROR FINAL API
                // Construyo un mensaje de error más útil
                let errorMessage = `Error ${response.status}`;
                if (typeof data === 'object' && data !== null) {
                    errorMessage += `: ${data.error || data.detail || data.mensaje || JSON.stringify(data).substring(0, 100)}`;
                } else if (typeof data === 'string') {
                    errorMessage += `: ${data.substring(0, 100)}`;
                }
                throw new Error(errorMessage);
            }

            console.log(`[fetchAPI] Llamada exitosa a ${url}`); // LOG ÉXITO
            return data;

        } catch (error) {
            console.error(`[fetchAPI] Error CATCH en fetchAPI para ${finalUrl}:`, error.message); // LOG ERROR CATCH
            // No muestro notificación aquí, dejo que la función llamante decida
            throw error; // Relanzo para manejo específico en la función que llamó
        }
    }

    async function refreshToken() {
        console.log("[refreshToken] Intentando refrescar token..."); // LOG INICIO REFRESH
        const refreshTokenValue = localStorage.getItem("refreshToken");
        if (!refreshTokenValue) {
            console.warn("[refreshToken] No se encontró refresh token en localStorage."); // LOG NO REFRESH TOKEN
            return false;
        }
        console.log(`[refreshToken] Usando refresh token: ${refreshTokenValue.substring(0, 15)}...`); // LOG REFRESH TOKEN VALUE (truncado)

        try {
            // Uso la URL de tu app 'usuarios' para el refresh
            const response = await fetch("/api/usuarios/token/refresh/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh: refreshTokenValue })
            });

            console.log(`[refreshToken] Respuesta de API refresh: Status ${response.status}`); // LOG RESPUESTA REFRESH

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // Intenta obtener detalles del error
                console.error(`[refreshToken] No se pudo refrescar el token. Status: ${response.status}`, errorData); // LOG FALLO REFRESH
                return false;
            }

            const data = await response.json();
            if (!data.access) {
                console.error("[refreshToken] Respuesta OK pero no contiene 'access' token.", data); // LOG TOKEN ACCESS FALTANTE
                return false;
            }

            localStorage.setItem("accessToken", data.access);
            // Actualizo expiración estimada (asumiendo 1 hora como en settings.py)
            const expiresAt = new Date(); expiresAt.setHours(expiresAt.getHours() + 1);
            localStorage.setItem("tokenExpiration", expiresAt.toISOString());
            console.log("[refreshToken] Token refrescado y guardado exitosamente."); // LOG ÉXITO REFRESH
            return true;
        } catch (error) {
            console.error("[refreshToken] Error crítico durante el proceso de refresh:", error); // LOG ERROR CRÍTICO REFRESH
            return false;
        }
    }

    function limpiarSesionYRedirigir() {
        console.warn("[limpiarSesionYRedirigir] Limpiando tokens y redirigiendo a /login/"); // LOG LIMPIEZA Y REDIRECCIÓN
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("tokenExpiration");
       
        window.location.href = "/login/";
    }

    function logout() {
        console.log("[logout] Iniciando cierre de sesión..."); // LOG LOGOUT
        
        limpiarSesionYRedirigir(); // Llama directamente si no hay endpoint de logout
    }

    async function verificarAutenticacionInicial() {
        console.log("[verificarAutenticacionInicial] Verificando autenticación al cargar dashboard..."); // LOG INICIO VERIFICACIÓN
        const accessToken = localStorage.getItem("accessToken");
        const tokenExpiration = localStorage.getItem("tokenExpiration");
        let isPotentiallyExpired = false;

        if (tokenExpiration) {
            const expirationDate = new Date(tokenExpiration);
            const now = new Date();
            // Añade un pequeño margen (ej. 1 minuto) para considerar expirado un poco antes
            expirationDate.setMinutes(expirationDate.getMinutes() - 1);
            isPotentiallyExpired = now > expirationDate;
            console.log(`[verificarAutenticacionInicial] Token expira: ${tokenExpiration}. Expirado?: ${isPotentiallyExpired}`); // LOG CHECK EXPIRACIÓN
        }

        if (!accessToken || isPotentiallyExpired) {
            console.log("[verificarAutenticacionInicial] Token ausente o potencialmente expirado. Intentando refrescar..."); // LOG NECESITA REFRESCO
            const refreshed = await refreshToken();
            if (!refreshed) {
                console.error("[verificarAutenticacionInicial] Refresco fallido. Redirigiendo a login."); // LOG REFRESCO FALLIDO EN CHECK INICIAL
                limpiarSesionYRedirigir();
                return false; // Detiene la ejecución adicional
            }
            // Si el refresco funcionó, el nuevo token ya está en localStorage
            console.log("[verificarAutenticacionInicial] Refresco inicial exitoso. Procediendo a verificar con API."); // LOG REFRESCO INICIAL OK
        } else {
            console.log("[verificarAutenticacionInicial] Token local encontrado y parece válido. Verificando con API..."); // LOG TOKEN LOCAL OK
        }

        // Ahora, verifica el token (original o recién refrescado) contra el backend
        try {
            // Uso la URL de tu app 'usuarios' para verificar
            console.log("[verificarAutenticacionInicial] Llamando a fetchAPI para /api/usuarios/verificar-autenticacion/"); // LOG LLAMADA VERIFICACIÓN
            const data = await fetchAPI("/api/usuarios/verificar-autenticacion/"); // fetchAPI maneja el reintento interno si falla por 401 aquí
            console.log("[verificarAutenticacionInicial] Verificación API exitosa. Usuario:", data.usuario); // LOG VERIFICACIÓN API OK
            actualizarUIUsuario(data.usuario); // <-- Actualiza la UI con los datos del usuario
            inicializarFuncionalidadPostAutenticacion(); // <-- Solo inicializa el resto si la verificación es exitosa
            return true;

        } catch (error) {
            // Este catch se activa si fetchAPI falla DESPUÉS de intentar refrescar (si fue necesario)
            // o si la llamada inicial falló por una razón distinta a 401
            console.error("[verificarAutenticacionInicial] Error CATCH final durante la verificación/refresco API:", error.message); // LOG ERROR FINAL VERIFICACIÓN
            // Si la verificación final falla, limpiamos y redirigimos
            limpiarSesionYRedirigir();
            return false; // Detiene la ejecución adicional
        }
    }


    // --- Función para actualizar la UI con datos del usuario ---
    function actualizarUIUsuario(usuario) {
        console.log("[actualizarUIUsuario] Actualizando UI con datos:", usuario);
        if (!usuario) {
            console.error("[actualizarUIUsuario] No se recibieron datos del usuario.");
            return;
        }

        const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
        const nombreMostrar = nombreCompleto || usuario.email || 'Usuario'; // Fallback

        // Elementos del Header/Dropdown
        // Elementos del Header/Dropdown
        if (menuUsuarioBtn) {
            const nombreUsuarioSpan = menuUsuarioBtn.querySelector('span#nombreUsuario');
            if (nombreUsuarioSpan) { // <-- Añade esta comprobación
                nombreUsuarioSpan.textContent = nombreMostrar;
            }
        }

        // Panel Lateral
        if (nombreClientePanel) nombreClientePanel.textContent = nombreMostrar;
        if (nombrePerfilUsuario) nombrePerfilUsuario.textContent = nombreMostrar;
        if (emailUsuario) emailUsuario.textContent = usuario.email || '';
        const defaultAvatar = "/static/Img/usuario-default.jpg"; // Ruta correcta a imagen por defecto
        if (imgPerfilUsuario) imgPerfilUsuario.src = usuario.avatar_url || defaultAvatar;

        // Formulario de Perfil
        if (formEditarPerfil) {
            if (formEditarPerfil.nombreCompleto) formEditarPerfil.nombreCompleto.value = nombreCompleto;
            if (formEditarPerfil.emailPerfil) formEditarPerfil.emailPerfil.value = usuario.email || '';
            // Asumo que 'telefonoPerfil' es el ID/name correcto en tu form
            if (formEditarPerfil.telefonoPerfil) formEditarPerfil.telefonoPerfil.value = usuario.telefono || ''; // Necesita campo 'telefono' en modelo/API
            if (formEditarPerfil.biografiaPerfil) formEditarPerfil.biografiaPerfil.value = usuario.biografia || '';
            // Campos readonly que vienen del modelo UsuarioPersonalizado via API
            if (formEditarPerfil.tipoDocumentoPerfil) formEditarPerfil.tipoDocumentoPerfil.value = usuario.tipo_documento || '';
            if (formEditarPerfil.numeroDocumentoPerfil) formEditarPerfil.numeroDocumentoPerfil.value = usuario.numero_documento || '';
        }
        // Foto Actual en Sección Perfil
        if (perfilFotoActual) perfilFotoActual.src = usuario.avatar_url || defaultAvatar;

        console.log("[actualizarUIUsuario] UI actualizada.");
    }

    // --- LÓGICA SPA (Single Page Application) ---

    function inicializarSPA() {
        console.log("[inicializarSPA] Inicializando navegación SPA...");
        window.addEventListener('hashchange', manejarCambioHash);
        menuSecciones.forEach(enlace => {
            enlace.addEventListener('click', function (e) {
                const seccionAttr = this.getAttribute('data-section');
                if (seccionAttr && seccionAttr !== '#') {
                    e.preventDefault();
                    const nuevoHash = `#${seccionAttr}`;
                    if (window.location.hash !== nuevoHash || e.target === enlace) {
                        console.log(`[inicializarSPA] Click en menú, cambiando hash a: ${nuevoHash}`);
                        window.location.hash = nuevoHash;
                    } else {
                        console.log(`[inicializarSPA] Click en menú, hash ya es ${nuevoHash}, no se cambia.`);
                    }
                    // Cierro el dropdown si está abierto
                    const parentDropdown = enlace.closest('.dropdown-menu');
                    if (parentDropdown) parentDropdown.classList.remove('activo'); // Oculta el menú desplegable
                }
            });
        });
        manejarCambioHash(); // Carga la sección inicial
    }

    function manejarCambioHash() {
        let seccionId = window.location.hash.substring(1) || 'dashboard';
        console.log(`[manejarCambioHash] Detectado cambio de hash a: #${seccionId}`);
        if (!document.getElementById(`seccion-${seccionId}`)) {
            console.warn(`[manejarCambioHash] Sección "${seccionId}" no encontrada en el DOM, volviendo a dashboard.`);
            seccionId = 'dashboard';
            // Opcional: cambiar el hash a #dashboard si la sección no existe
            // window.history.replaceState(null, null, '#dashboard');
        }
        console.log(`[manejarCambioHash] Mostrando sección: ${seccionId}`);
        mostrarCargando();
        actualizarMenuActivo(seccionId);

        requestAnimationFrame(() => {
            cambiarSeccion(seccionId)
                .catch(err => {
                    console.error(`[manejarCambioHash] Error al cambiar/cargar sección ${seccionId}:`, err);
                    // Podrías mostrar un error en la sección deseada si falla la carga
                    const seccionFallida = document.getElementById(`seccion-${seccionId}`);
                    if (seccionFallida) seccionFallida.innerHTML = `<p class="error text-center p-5">Error al cargar contenido.</p>`;
                    else console.error("No se pudo mostrar error en la sección porque no existe.");
                })
                .finally(() => {
                    ocultarCargando();
                    console.log(`[manejarCambioHash] Carga/cambio de sección ${seccionId} finalizado.`);
                });
        });
    }

    function mostrarCargando() {
        console.log("[mostrarCargando] Mostrando indicador de carga...");
        if (seccionCargando) seccionCargando.classList.remove('oculto');
        if (seccionContenidoPrincipal) seccionContenidoPrincipal.style.display = 'none'; // Oculto contenido viejo
    }

    function ocultarCargando() {
        console.log("[ocultarCargando] Ocultando indicador de carga.");
        if (seccionCargando) seccionCargando.classList.add('oculto');
        if (seccionContenidoPrincipal) seccionContenidoPrincipal.style.display = 'block'; // Muestro contenedor principal
    }

    function actualizarMenuActivo(seccionId) {
        console.log(`[actualizarMenuActivo] Marcando menú '${seccionId}' como activo.`);
        menuSecciones.forEach(enlace => {
            const menuItem = enlace.closest('li') || enlace;
            if (enlace.getAttribute('data-section') === seccionId) {
                menuItem.classList.add('activo');
            } else {
                menuItem.classList.remove('activo');
            }
        });
    }

    async function cambiarSeccion(seccionId) {
        console.log(`[cambiarSeccion] Cambiando a la sección: ${seccionId}`);
        document.querySelectorAll('.seccion-panel').forEach(s => s.classList.remove('active'));
        const seccionDeseada = document.getElementById(`seccion-${seccionId}`);

        if (seccionDeseada) {
            seccionDeseada.classList.add('active');
            console.log(`[cambiarSeccion] Ejecutando carga de datos para: ${seccionId}`);
            try {
                switch (seccionId) {
                    case 'dashboard':
                        await Promise.allSettled([cargarDatosDashboard(), cargarCarritoDashboard()]); // Carga ambos, carrito solo para contador
                        break;
                    case 'carrito-dashboard':
                        await cargarCarritoDashboard(true); // Carga lista completa
                        break;
                    case 'perfil':
                        await cargarDatosPerfil();
                        break;
                    case 'pedidos':
                        paginaActualPedidos = 1;
                        await cargarTodosPedidos();
                        break;
                    case 'direcciones':
                        await cargarDirecciones();
                        break;
                    // case 'pagos': await cargarMetodosDePago(); break;
                    default:
                        console.warn(`[cambiarSeccion] Acción de carga no definida para: ${seccionId}`);
                        seccionDeseada.innerHTML = `<p>Contenido para '${seccionId}' aún no implementado.</p>`;
                }
                console.log(`[cambiarSeccion] Datos para ${seccionId} cargados/ejecutados.`);
            } catch (error) {
                console.error(`[cambiarSeccion] Error cargando datos para ${seccionId}:`, error);
                seccionDeseada.innerHTML = `<p class="error text-center p-5">Error al cargar contenido: ${error.message}</p>`;
            }
        } else {
            console.error(`[cambiarSeccion] Fallback: Elemento #seccion-${seccionId} no encontrado.`);
            const dash = document.getElementById('seccion-dashboard');
            if (dash) {
                dash.classList.add('active');
                await Promise.allSettled([cargarDatosDashboard(), cargarCarritoDashboard()]);
                actualizarMenuActivo('dashboard');
            } else {
                console.error("[cambiarSeccion] Fallback fallido: Sección dashboard tampoco encontrada.");
            }
        }
    }

    // --- FUNCIONES DE CARGA DE DATOS ---

    async function cargarDatosDashboard() {
        console.log("[cargarDatosDashboard] Iniciando carga de datos del panel principal...");
        // Uso allSettled para que si una falla, las otras continúen
        const results = await Promise.allSettled([
            cargarContadoresResumen(),
            cargarPedidosRecientes(),
            // cargarProductosRecomendados(), // Descomentar si se implementa
        ]);
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`[cargarDatosDashboard] Fallo carga parcial ${index}:`, result.reason);
                // Podrías indicar el error en la UI aquí si es necesario
            }
        });
        console.log("[cargarDatosDashboard] Carga de datos del panel principal finalizada.");
    }

    async function cargarContadoresResumen() {
        console.log("[cargarContadoresResumen] Cargando contadores...");
        // Vacío los contadores existentes para indicar carga
        if (totalItemsCarritoDashSpan) totalItemsCarritoDashSpan.textContent = '...';
        if (totalPedidosSpan) totalPedidosSpan.textContent = '...';
        if (totalDireccionesSpan) totalDireccionesSpan.textContent = '...';

        try {
            // Llama a la API de perfil que debería incluir estos contadores
            // Asegúrate que tu API /usuarios/perfil/ los devuelva
            const data = await fetchAPI('/api/usuarios/perfil/');
            const usuario = data.usuario || data; // Asumo que la respuesta envuelve en 'usuario' o es el objeto directo
            console.log("[cargarContadoresResumen] Datos recibidos:", usuario);

            // Calcula el total de items del carrito desde la API del carrito
            const carritoData = await fetchAPI('/api/carrito/');
            const totalItems = carritoData.items ? carritoData.items.reduce((sum, item) => sum + item.cantidad, 0) : 0;

            if (totalItemsCarritoDashSpan) totalItemsCarritoDashSpan.textContent = `${totalItems} Items`;
            if (contadorCarritoIcon) contadorCarritoIcon.textContent = totalItems > 0 ? totalItems : '0';

            // Contadores de Pedidos y Direcciones (requieren que la API de perfil los devuelva)
            if (totalPedidosSpan) totalPedidosSpan.textContent = usuario.total_pedidos ?? 0; // Necesitas añadir 'total_pedidos' a la API de perfil
            if (totalDireccionesSpan) totalDireccionesSpan.textContent = usuario.total_direcciones ?? 0; // Necesitas añadir 'total_direcciones'

            console.log("[cargarContadoresResumen] Contadores actualizados.");

        } catch (error) {
            console.error('[cargarContadoresResumen] Error:', error);
            if (totalItemsCarritoDashSpan) totalItemsCarritoDashSpan.textContent = 'Error';
            if (totalPedidosSpan) totalPedidosSpan.textContent = '-';
            if (totalDireccionesSpan) totalDireccionesSpan.textContent = '-';
            if (contadorCarritoIcon) contadorCarritoIcon.textContent = '0';
        }
    }


    async function cargarPedidosRecientes() {
        if (!tablaPedidosRecientes) return;
        console.log("[cargarPedidosRecientes] Cargando...");
        tablaPedidosRecientes.innerHTML = `<tr><td colspan="5" class="sin-datos"><i class="fas fa-spinner fa-spin"></i> Cargando...</td></tr>`;
        try {
            // Asumo endpoint /api/pedidos/ con filtro ?recientes=true o similar
            const data = await fetchAPI('/api/pedidos/?limite=5&orden=-fecha'); // Pide 5 más recientes
            const pedidos = data.results || data.pedidos || data || []; // Adapta según la respuesta real de tu API
            console.log(`[cargarPedidosRecientes] Pedidos recibidos: ${pedidos.length}`);
            if (pedidos.length > 0) {
                tablaPedidosRecientes.innerHTML = ''; // Limpia la tabla antes de añadir
                pedidos.forEach(pedido => tablaPedidosRecientes.appendChild(crearFilaPedido(pedido)));
                configurarBotonesPedidos(tablaPedidosRecientes); // Añade listeners a los botones de la tabla
            } else {
                tablaPedidosRecientes.innerHTML = `<tr><td colspan="5" class="sin-datos">No tienes pedidos recientes.</td></tr>`;
            }
        } catch (error) {
            console.error("[cargarPedidosRecientes] Error:", error);
            tablaPedidosRecientes.innerHTML = `<tr><td colspan="5" class="sin-datos error">Error al cargar pedidos recientes.</td></tr>`;
        }
    }

    async function cargarTodosPedidos() {
        if (!tablaTodosPedidos || !filtroSelect || !buscarPedidoInput || !spanPaginaActual || !btnPaginaAnterior || !btnPaginaSiguiente) {
            console.error("[cargarTodosPedidos] Faltan elementos del DOM necesarios.");
            return;
        }
        console.log(`[cargarTodosPedidos] Cargando página ${paginaActualPedidos}...`);
        tablaTodosPedidos.innerHTML = `<tr><td colspan="5" class="sin-datos"><i class="fas fa-spinner fa-spin"></i> Cargando...</td></tr>`;

        // Construyo la URL con parámetros de paginación, filtro y búsqueda
        let url = `/api/pedidos/?pagina=${paginaActualPedidos}`;
        const estado = filtroSelect.value;
        const busqueda = buscarPedidoInput.value.trim();
        if (estado && estado !== 'todos') url += `&estado=${estado}`;
        if (busqueda) url += `&buscar=${encodeURIComponent(busqueda)}`;
        url += `&orden=-fecha`; // Siempre ordenar por fecha descendente

        console.log(`[cargarTodosPedidos] URL final: ${url}`);

        try {
            const data = await fetchAPI(url);
            console.log("[cargarTodosPedidos] Respuesta API:", data);
            // Asumo que la API devuelve una estructura como { count: X, total_paginas: Y, results: [...] }
            totalPaginasPedidos = data.total_paginas || 1;
            const pedidos = data.results || data.pedidos || []; // Adapta según tu API

            spanPaginaActual.textContent = `Página ${paginaActualPedidos} de ${totalPaginasPedidos}`;
            btnPaginaAnterior.disabled = paginaActualPedidos <= 1;
            btnPaginaSiguiente.disabled = paginaActualPedidos >= totalPaginasPedidos;

            if (pedidos.length > 0) {
                tablaTodosPedidos.innerHTML = '';
                pedidos.forEach(pedido => tablaTodosPedidos.appendChild(crearFilaPedido(pedido)));
                configurarBotonesPedidos(tablaTodosPedidos);
            } else {
                const mensaje = busqueda || estado !== 'todos' ? 'No se encontraron pedidos con esos filtros.' : 'No tienes pedidos.';
                tablaTodosPedidos.innerHTML = `<tr><td colspan="5" class="sin-datos">${mensaje}</td></tr>`;
            }
        } catch (error) {
            console.error("[cargarTodosPedidos] Error:", error);
            tablaTodosPedidos.innerHTML = `<tr><td colspan="5" class="sin-datos error">Error al cargar los pedidos.</td></tr>`;
            spanPaginaActual.textContent = 'Error';
            btnPaginaAnterior.disabled = true;
            btnPaginaSiguiente.disabled = true;
        }
    }

    // Función para crear fila de tabla de pedido (revisada y formato COP)
    function crearFilaPedido(pedido) {
        const tr = document.createElement('tr');
        // Formato de fecha más corto
        const fecha = new Date(pedido.fecha).toLocaleDateString('es-CO');
        // Formato COP
        const total = parseFloat(pedido.total || 0);
        const totalFormateado = total.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: (total % 1 === 0) ? 0 : 2 });

        const estado = pedido.estado || (pedido.completado ? 'Completado' : 'Pendiente'); // Usa completado si no hay estado
        const estadoTexto = estado.charAt(0).toUpperCase() + estado.slice(1);
        const estadoClass = `estado-${estado.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

        tr.innerHTML = `
            <td>#${pedido.id}</td>
            <td>${fecha}</td>
            <td><span class="estado ${estadoClass}">${estadoTexto}</span></td>
            <td>${totalFormateado}</td>
            <td>
                <div class="acciones-pedido">
                    <button class="btn-accion ver-detalle-pedido" data-id="${pedido.id}" title="Ver Detalle"><i class="fas fa-eye"></i></button>
                    {# Lógica para cancelar podría ir aquí si la API lo soporta #}
                </div>
            </td>
        `;
        return tr;
    }


    async function cargarDatosPerfil() {
        if (!formEditarPerfil) return;
        console.log("[cargarDatosPerfil] Cargando...");
        // Muestra algún indicador de carga si quieres
        formEditarPerfil.style.opacity = '0.5';
        try {
            // Llama a la API de perfil
            const data = await fetchAPI('/api/usuarios/perfil/');
            actualizarUIUsuario(data.usuario || data); // Actualiza toda la UI
            console.log("[cargarDatosPerfil] Datos cargados y UI actualizada.");
        } catch (error) {
            console.error('[cargarDatosPerfil] Error:', error);
            mostrarNotificacion('No se pudieron cargar tus datos de perfil.', 'error');
            // Podrías limpiar el formulario o mostrar un mensaje de error en la sección
        } finally {
            formEditarPerfil.style.opacity = '1'; // Restaura opacidad
        }
    }

    async function cargarDirecciones() {
        if (!listaDireccionesDiv) return;
        console.log("[cargarDirecciones] Cargando...");
        listaDireccionesDiv.innerHTML = `<div class="cargando-datos"><i class="fas fa-spinner fa-spin"></i><p>Cargando...</p></div>`;
        try {
            // Asumo endpoint /api/direcciones/
            const direcciones = await fetchAPI('/api/direcciones/'); // La API debe devolver una lista
            console.log(`[cargarDirecciones] Direcciones recibidas:`, direcciones);
            if (direcciones && direcciones.length > 0) {
                listaDireccionesDiv.innerHTML = '';
                direcciones.forEach(dir => listaDireccionesDiv.appendChild(crearTarjetaDireccion(dir)));
                configurarBotonesDirecciones(listaDireccionesDiv);
            } else {
                listaDireccionesDiv.innerHTML = '<p class="text-center text-muted p-4">Aún no has añadido ninguna dirección.</p>';
            }
            // Actualizo contador global si existe
            if (totalDireccionesSpan) totalDireccionesSpan.textContent = direcciones ? direcciones.length : 0;
        } catch (error) {
            console.error("[cargarDirecciones] Error:", error);
            listaDireccionesDiv.innerHTML = '<p class="text-center text-danger p-4">Error al cargar las direcciones.</p>';
            if (totalDireccionesSpan) totalDireccionesSpan.textContent = '-';
        }
    }

    // --- NUEVA: Cargar datos del carrito para sección específica y contadores ---
    async function cargarCarritoDashboard(renderizarListaCompleta = false) {
        console.log("[cargarCarritoDashboard] Cargando datos del carrito...");
        try {
            const carritoData = await fetchAPI('/api/carrito/');
            console.log("[cargarCarritoDashboard] Datos recibidos:", carritoData);
            const items = carritoData.items || [];
            const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
            const totalValor = parseFloat(carritoData.total || 0);

            // Actualizar contador en tarjeta resumen
            if (totalItemsCarritoDashSpan) {
                totalItemsCarritoDashSpan.textContent = `${totalItems} Item${totalItems !== 1 ? 's' : ''}`;
            }
            // Actualizar contador en icono del header
            if (contadorCarritoIcon) {
                contadorCarritoIcon.textContent = totalItems > 0 ? totalItems : '0';
                // Opcional: mostrar/ocultar icono basado en si hay items
                contadorCarritoIcon.style.display = totalItems > 0 ? 'flex' : 'none';
            }

            // Si estamos en la sección del carrito, renderizamos la lista completa
            if (renderizarListaCompleta && seccionContenidoCarrito && seccionResumenCarrito && totalCarritoDashboard) {
                if (items.length === 0) {
                    seccionContenidoCarrito.innerHTML = '<p class="carrito-vacio text-center p-5"><i class="fas fa-shopping-cart fa-2x mb-3 d-block"></i>Tu carrito está vacío.</p>';
                    seccionResumenCarrito.style.display = 'none'; // Oculta resumen
                } else {
                    let itemsHTML = '<div class="lista-carrito-items">'; // Contenedor para scroll
                    items.forEach(item => {
                        itemsHTML += crearElementoItemCarrito(item); // Función para crear HTML de cada item
                    });
                    itemsHTML += '</div>'; // Cierro contenedor scroll
                    seccionContenidoCarrito.innerHTML = itemsHTML;

                    // Muestro y actualizo el total y el botón de pagar
                    totalCarritoDashboard.textContent = `Total: ${totalValor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: (totalValor % 1 === 0) ? 0 : 2 })}`;
                    seccionResumenCarrito.style.display = 'block'; // Muestro resumen

                    // Aquí podrías añadir listeners específicos para los botones +/-/eliminar DENTRO de esta sección si son diferentes a la página de carrito principal
                    configurarBotonesCarritoDashboard(seccionContenidoCarrito);
                }
            }

        } catch (error) {
            console.error('[cargarCarritoDashboard] Error:', error);
            // Indicar error en contadores si es posible
            if (totalItemsCarritoDashSpan) totalItemsCarritoDashSpan.textContent = 'Error';
            if (contadorCarritoIcon) contadorCarritoIcon.textContent = '0';
            // Mostrar error en la sección del carrito si estamos en ella
            if (renderizarListaCompleta && seccionContenidoCarrito) {
                seccionContenidoCarrito.innerHTML = '<p class="text-danger text-center p-5">Error al cargar el carrito.</p>';
            }
            if (renderizarListaCompleta && seccionResumenCarrito) {
                seccionResumenCarrito.style.display = 'none';
            }
        }
    }


    // --- FUNCIONES DE RENDERIZADO ---

    function crearTarjetaDireccion(direccion) {
        const div = document.createElement('div');
        div.className = 'tarjeta-direccion';
        div.dataset.id = direccion.id; // Guardamos el ID
        const esPredeterminada = direccion.predeterminada || false;
        const predeterminadaBadge = esPredeterminada ? '<span class="marca-predeterminada">Predeterminada</span>' : '';

        // Construcción cuidadosa de la dirección completa
        const partesDireccion = [
            direccion.direccion,
            direccion.ciudad,
            direccion.estado,
            direccion.codigo_postal,
            direccion.pais
        ].filter(p => p && String(p).trim() !== '').join(', '); // Filtra nulos/vacíos

        const telefonoHTML = direccion.telefono ? `<p><i class="fas fa-phone-alt me-2"></i> ${direccion.telefono}</p>` : '';
        // Nombre alias o fallback
        const nombreMostrado = direccion.nombre_alias || `Dirección ${direccion.id}`;

        div.innerHTML = `
            ${predeterminadaBadge}
            <div class="datos-direccion">
                <h3><i class="fas fa-map-marker-alt"></i> ${nombreMostrado}</h3>
                ${partesDireccion ? `<div class="direccion-completa">${partesDireccion}</div>` : '<div class="direccion-completa text-muted"><em>Dirección no completa</em></div>'}
                ${telefonoHTML}
            </div>
            <div class="acciones-tarjeta">
                <button class="btn-tarjeta editar-direccion" data-id="${direccion.id}" title="Editar"><i class="fas fa-edit"></i> Editar</button>
                <button class="btn-tarjeta eliminar-direccion" data-id="${direccion.id}" title="Eliminar"><i class="fas fa-trash-alt"></i> Eliminar</button>
                ${!esPredeterminada ? `<button class="btn-tarjeta establecer-predeterminada" data-id="${direccion.id}" title="Marcar como predeterminada"><i class="fas fa-star"></i> Predet.</button>` : ''}
            </div>
        `;
        return div;
    }

    // --- Renderizar item del carrito para la sección del dashboard ---
    function crearElementoItemCarrito(item) {
        const producto = item.producto;
        if (!producto) return '<div class="carrito-item error">Error: Datos de producto incompletos</div>'; // Manejo de error

        const subtotal = parseFloat(item.subtotal || 0);
        const subtotalFormateado = subtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: (subtotal % 1 === 0) ? 0 : 2 });
        const imagenSrc = producto.imagen_url || "/static/Img/producto-default.jpg"; // Usa imagen por defecto

        return `
            <div class="carrito-item" data-product-id="${producto.id}">
                <img src="${imagenSrc}" alt="${producto.nombre || 'Producto'}" class="carrito-item-img">
                <div class="carrito-item-info">
                    <div class="carrito-item-nombre">${producto.nombre || 'Nombre no disponible'}</div>
                    <div class="carrito-item-meta">Cantidad: ${item.cantidad}</div>
                </div>
                <div class="carrito-item-subtotal fw-bold">${subtotalFormateado}</div>
                
                 <button class="btn-accion-carrito eliminar-item-dash" data-id="${producto.id}" title="Eliminar del carrito"><i class="fas fa-times"></i></button>
            </div>
        `;
    }

    // Función para renderizar el detalle de un pedido en el modal
    function renderizarDetallePedido(pedido) {
        if (!pedido) return '<p class="text-danger text-center p-4">No se pudieron cargar los datos del pedido.</p>';

        console.log("[renderizarDetallePedido] Datos recibidos:", pedido);

        const fecha = pedido.fecha ? new Date(pedido.fecha).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' }) : 'Fecha no disponible';
        const total = parseFloat(pedido.total || 0);
        const totalFormateado = total.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: (total % 1 === 0) ? 0 : 2 });
        const estado = pedido.estado || (pedido.completado ? 'Completado' : 'Pendiente'); // Usa completado si no hay estado

        // Intenta obtener la dirección de envío (ajusta según tu modelo Pedido/Direccion)
        let direccionEnvioHTML = '<p>No especificada</p>';
        if (pedido.direccion_envio) {
            // Si direccion_envio es un objeto con los detalles:
            if (typeof pedido.direccion_envio === 'object') {
                const dir = pedido.direccion_envio;
                direccionEnvioHTML = `<p>${dir.direccion || ''}<br>${dir.ciudad || ''}, ${dir.estado || ''} ${dir.codigo_postal || ''}<br>${dir.pais || ''}</p>`;
            } else {
                // Si es solo texto:
                direccionEnvioHTML = `<p>${pedido.direccion_envio}</p>`;
            }
        }

        const metodoPago = pedido.metodo_pago || 'No especificado'; // Ajusta si tienes más detalle

        let itemsHTML = '<p class="text-muted my-3">No hay detalles de productos para este pedido.</p>';
        if (pedido.detalles && Array.isArray(pedido.detalles) && pedido.detalles.length > 0) {
            itemsHTML = pedido.detalles.map(item => {
                const prod = item.producto; // Asume que 'producto' está anidado en el detalle
                if (!prod) return '<div class="producto-item error">Error: Datos de producto incompletos en detalle</div>';

                const cantidad = item.cantidad || 0;
                const precioUnit = parseFloat(item.precio_unitario || 0);
                // Cálculo de subtotal por item
                const itemSubtotal = cantidad * precioUnit;
                const itemSubtotalFormateado = itemSubtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: (itemSubtotal % 1 === 0) ? 0 : 2 });
                const itemPrecioUnitFormateado = precioUnit.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: (precioUnit % 1 === 0) ? 0 : 2 });

                // Imagen (con fallback)
                const imagenSrc = prod.imagen_url || "/static/Img/producto-default.jpg";

                return `
                    <div class="producto-item">
                        <div class="producto-img"><img src="${imagenSrc}" alt="${prod.nombre || 'Producto'}"></div>
                        <div class="producto-info">
                            <h4>${prod.nombre || 'Nombre no disponible'}</h4>
                            <div class="producto-meta">Cant: ${cantidad} | P.Unit: ${itemPrecioUnitFormateado}</div>
                        </div>
                        <div class="producto-precio">${itemSubtotalFormateado}</div>
                    </div>`;
            }).join('');
        } else {
            console.warn("[renderizarDetallePedido] No se encontraron detalles de items en el pedido:", pedido.id);
        }

        // Construcción del HTML final
        return `
            <div class="detalle-pedido-info mb-4">
                <div class="info-resumida row gy-3">
                    <div class="col-md-6 info-bloque">
                        <h4><i class="fas fa-calendar-alt me-2"></i>Fecha del Pedido</h4>
                        <p>${fecha}</p>
                    </div>
                    <div class="col-md-6 info-bloque">
                        <h4><i class="fas fa-receipt me-2"></i>Número de Pedido</h4>
                        <p>#${pedido.id}</p>
                    </div>
                    <div class="col-md-6 info-bloque">
                        <h4><i class="fas fa-check-circle me-2"></i>Estado</h4>
                        <p>${estado}</p>
                    </div>
                    <div class="col-md-6 info-bloque">
                        <h4><i class="fas fa-credit-card me-2"></i>Método de Pago</h4>
                        <p>${metodoPago}</p>
                    </div>
                </div>
                 <div class="info-bloque mt-3">
                      <h4><i class="fas fa-shipping-fast me-2"></i>Dirección de Envío</h4>
                      ${direccionEnvioHTML}
                 </div>
            </div>

            <div class="productos-pedido">
                <h3>Productos Incluidos</h3>
                ${itemsHTML}
            </div>

            <div class="resumen-pedido">
                <h3>Resumen Total</h3>
                {# Aquí podrías añadir desglose si tu API lo da (subtotal, envío, etc.) #}
                <div class="resumen-item resumen-total d-flex justify-content-between">
                    <span>Total General:</span>
                    <span>${totalFormateado}</span>
                </div>
            </div>
        `;
    }


    // --- FUNCIONES DE ACCIÓN (Formularios, botones, etc.) ---

    async function abrirDetallePedido(idPedido) {
        if (!modalDetallePedido || !contenidoDetallePedido || !detallePedidoId) {
            console.error("Elementos del modal de detalle no encontrados.");
            return;
        }
        console.log(`[abrirDetallePedido] Abriendo detalle para pedido ID: ${idPedido}`);
        detallePedidoId.textContent = idPedido; // Pone el ID en el título del modal
        contenidoDetallePedido.innerHTML = `<div class="cargando-datos"><i class="fas fa-spinner fa-spin"></i><p>Cargando detalles del pedido...</p></div>`;
        modalDetallePedido.classList.add('active'); // Muestra el modal

        try {
            // Llama a la API para obtener los detalles completos del pedido
            // Asumo endpoint /api/pedidos/{id}/
            const pedidoData = await fetchAPI(`/api/pedidos/${idPedido}/`);
            contenidoDetallePedido.innerHTML = renderizarDetallePedido(pedidoData); // Renderiza los detalles
            console.log(`[abrirDetallePedido] Detalles cargados para pedido ${idPedido}`);
        } catch (error) {
            console.error(`[abrirDetallePedido] Error al cargar detalle pedido ${idPedido}:`, error);
            contenidoDetallePedido.innerHTML = `<p class="text-danger text-center p-4">Error al cargar los detalles del pedido: ${error.message}</p>`;
        }
    }


    async function actualizarPerfil(event) {
        event.preventDefault();
        if (!formEditarPerfil) return;
        const boton = formEditarPerfil.querySelector('button[type="submit"]');
        if (!boton) return;
        const textoOriginal = boton.textContent;
        boton.disabled = true; boton.textContent = 'Guardando...';
        console.log("[actualizarPerfil] Intentando actualizar perfil...");

        // Obtengo nombre y apellido (asumiendo campo 'nombreCompleto')
        const nombreCompletoInput = formEditarPerfil.nombreCompleto;
        let nombre = '';
        let apellido = '';
        if (nombreCompletoInput) {
            const nombreCompletoVal = nombreCompletoInput.value.trim();
            const primerEspacio = nombreCompletoVal.indexOf(' ');
            nombre = primerEspacio === -1 ? nombreCompletoVal : nombreCompletoVal.substring(0, primerEspacio);
            apellido = primerEspacio === -1 ? '' : nombreCompletoVal.substring(primerEspacio + 1);
        } else {
            // Si no existe 'nombreCompleto', busca 'nombre' y 'apellido' individuales
            nombre = formEditarPerfil.nombre?.value.trim() || '';
            apellido = formEditarPerfil.apellido?.value.trim() || '';
        }


        // Recopilo los datos (solo los que existen en el formulario)
        const datos = {};
        if (nombre) datos.nombre = nombre;
        if (apellido) datos.apellido = apellido;
        if (formEditarPerfil.telefonoPerfil && formEditarPerfil.telefonoPerfil.value) datos.telefono = formEditarPerfil.telefonoPerfil.value;
        if (formEditarPerfil.biografiaPerfil && formEditarPerfil.biografiaPerfil.value) datos.biografia = formEditarPerfil.biografiaPerfil.value;

        console.log("[actualizarPerfil] Datos a enviar:", datos);

        try {
            // Llama a la API de perfil con PUT
            const data = await fetchAPI('/api/usuarios/perfil/', { method: 'PUT', body: datos });
            console.log("[actualizarPerfil] Respuesta API:", data);
            mostrarNotificacion('Perfil actualizado con éxito.', 'success');
            actualizarUIUsuario(data.usuario || data); // Actualiza UI con la respuesta
        } catch (error) {
            console.error("[actualizarPerfil] Error:", error);
            // Intenta mostrar un error más específico si la API lo devuelve
            let mensajeError = 'Error al actualizar el perfil.';
            if (error.message && error.message.includes('{')) { // Intenta parsear si parece JSON
                try {
                    const errorJson = JSON.parse(error.message.substring(error.message.indexOf('{')));
                    mensajeError = Object.values(errorJson).flat().join(' '); // Concatena mensajes de error de campos
                } catch (e) { }
            } else if (error.message) {
                mensajeError = error.message;
            }
            mostrarNotificacion(mensajeError, 'error');
        } finally {
            boton.disabled = false; boton.textContent = textoOriginal;
        }
    }

    async function subirFotoPerfil() {
        if (!inputFotoPerfil || !inputFotoPerfil.files || inputFotoPerfil.files.length === 0) {
            console.warn("[subirFotoPerfil] No se seleccionó archivo.");
            return;
        }
        const archivo = inputFotoPerfil.files[0];
        console.log(`[subirFotoPerfil] Intentando subir archivo: ${archivo.name} (${archivo.size} bytes)`);

        // Muestro feedback (ej. en el botón o cerca de la imagen)
        if (btnCambiarFoto) btnCambiarFoto.textContent = 'Subiendo...'; btnCambiarFoto.disabled = true;

        const formData = new FormData();
        formData.append('foto_perfil', archivo); // La clave debe coincidir con la esperada en la API

        try {
            // Llama a la API de subir foto (debe aceptar FormData)
            const data = await fetchAPI('/api/usuarios/foto-perfil/', {
                method: 'POST',
                body: formData
                // No se pone Content-Type, fetch lo hace solo para FormData
            });
            console.log("[subirFotoPerfil] Respuesta API:", data);
            mostrarNotificacion(data.mensaje || 'Foto de perfil actualizada.', 'success');
            // Actualizo la imagen en la UI usando la URL devuelta
            if (data.avatar_url) {
                if (imgPerfilUsuario) imgPerfilUsuario.src = data.avatar_url;
                if (perfilFotoActual) perfilFotoActual.src = data.avatar_url;
            } else {
                // Si no devuelve URL, recargo los datos del perfil para obtenerla
                await cargarDatosPerfil();
            }
        } catch (error) {
            console.error("[subirFotoPerfil] Error:", error);
            mostrarNotificacion(`Error al subir la foto: ${error.message}`, 'error');
        } finally {
            if (btnCambiarFoto) btnCambiarFoto.textContent = 'Cambiar foto'; btnCambiarFoto.disabled = false;
            inputFotoPerfil.value = ''; // Limpio el input file
        }
    }


    // --- Direcciones ---
    function abrirModalDireccion(direccion = null) {
        if (!modalDireccion || !formDireccion) return;
        console.log("[abrirModalDireccion] Abriendo modal.", direccion ? `Editando ID: ${direccion.id}` : "Nueva dirección");
        formDireccion.reset();
        formDireccion.removeAttribute('data-id');
        // Limpio mensajes de error previos si existen
        formDireccion.querySelectorAll('.error-mensaje').forEach(el => el.remove());
        formDireccion.querySelectorAll('.campo-error').forEach(el => el.classList.remove('campo-error'));

        const tituloModal = modalDireccion.querySelector('.modal-titulo');

        if (direccion && direccion.id) {
            if (tituloModal) tituloModal.textContent = 'Editar Dirección';
            formDireccion.setAttribute('data-id', direccion.id);
            // Relleno campos (IMPORTANTE: los 'name' del form deben coincidir con las claves de 'direccion')
            for (const key in direccion) {
                const input = formDireccion.elements[key];
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = direccion[key];
                    } else {
                        input.value = direccion[key] || '';
                    }
                }
            }
            // Caso especial si el campo 'direccion' contiene calle, etc.
            if (formDireccion.elements['direccion'] && direccion.direccion) {
                formDireccion.elements['direccion'].value = direccion.direccion;
            }
        } else {
            if (tituloModal) tituloModal.textContent = 'Agregar Nueva Dirección';
            // Valores por defecto si es necesario
            if (formDireccion.elements['pais']) formDireccion.elements['pais'].value = 'Colombia';
        }
        modalDireccion.classList.add('active');
    }

    async function cargarDireccionParaEditar(idDireccion) {
        console.log(`[cargarDireccionParaEditar] Cargando dirección ID: ${idDireccion}...`);
        // Podrías mostrar un spinner aquí
        try {
            // Asumo endpoint /api/direcciones/{id}/ para GET
            const direccion = await fetchAPI(`/api/direcciones/${idDireccion}/`);
            console.log(`[cargarDireccionParaEditar] Datos recibidos:`, direccion);
            abrirModalDireccion(direccion); // Abro modal con los datos
        } catch (error) {
            console.error(`[cargarDireccionParaEditar] Error:`, error);
            mostrarNotificacion(`Error al cargar la dirección: ${error.message}`, 'error');
        }
    }

    async function guardarDireccion(event) {
        event.preventDefault();
        if (!formDireccion) return;
        const boton = formDireccion.querySelector('button[type="submit"]');
        if (!boton) return;
        const textoOriginal = boton.textContent;
        boton.disabled = true; boton.textContent = 'Guardando...';
        console.log("[guardarDireccion] Intentando guardar dirección...");
        // Limpio errores previos
        formDireccion.querySelectorAll('.error-mensaje').forEach(el => el.remove());
        formDireccion.querySelectorAll('.campo-error').forEach(el => el.classList.remove('campo-error'));


        const idDireccion = formDireccion.getAttribute('data-id');
        const metodo = idDireccion ? 'PUT' : 'POST';
        const url = idDireccion ? `/api/direcciones/${idDireccion}/` : '/api/direcciones/';
        console.log(`[guardarDireccion] Método: ${metodo}, URL: ${url}`);

        // Recopilo datos del formulario
        const formData = new FormData(formDireccion);
        const datos = {};
        formData.forEach((value, key) => {
            // Tratamiento especial para checkbox 'predeterminada'
            if (key === 'predeterminada') {
                datos[key] = formDireccion.elements[key].checked;
            } else {
                datos[key] = value;
            }
        });
        // Quito el ID si existe, porque no se envía en el body
        delete datos.id_direccion;


        console.log("[guardarDireccion] Datos a enviar:", datos);

        try {
            const respuesta = await fetchAPI(url, { method: metodo, body: datos });
            console.log("[guardarDireccion] Respuesta API:", respuesta);
            mostrarNotificacion(`Dirección ${idDireccion ? 'actualizada' : 'guardada'} correctamente.`, 'success');
            modalDireccion.classList.remove('active');
            await cargarDirecciones(); // Recargo la lista
        } catch (error) {
            console.error("[guardarDireccion] Error:", error);
            // Intento mostrar errores específicos por campo si la API los devuelve
            let errorMessage = error.message || 'Error desconocido al guardar.';
            if (errorMessage.includes('{')) { // Intento parsear si parece JSON de errores
                try {
                    const errorsJson = JSON.parse(errorMessage.substring(errorMessage.indexOf('{')));
                    mostrarErroresFormulario(formDireccion, errorsJson);
                    errorMessage = "Por favor, corrige los errores indicados."; // Mensaje genérico para notificación
                } catch (e) {
                    console.error("No se pudo parsear JSON de error:", e);
                    // Si no es JSON, muestro el mensaje tal cual
                }
            }
            mostrarNotificacion(`Error al guardar: ${errorMessage}`, 'error');
        } finally {
            boton.disabled = false; boton.textContent = textoOriginal;
        }
    }

    // Función auxiliar para mostrar errores de formulario devueltos por la API
    function mostrarErroresFormulario(form, errores) {
        // Limpio errores previos
        form.querySelectorAll('.error-mensaje').forEach(el => el.remove());
        form.querySelectorAll('.campo-error').forEach(el => el.classList.remove('campo-error'));

        for (const campo in errores) {
            const input = form.elements[campo];
            const mensaje = Array.isArray(errores[campo]) ? errores[campo].join(' ') : errores[campo];
            if (input) {
                input.classList.add('campo-error');
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-mensaje text-danger small mt-1';
                errorDiv.textContent = mensaje;
                // Inserta el error después del input o su contenedor más cercano
                input.parentNode.insertBefore(errorDiv, input.nextSibling);
            } else {
                // Si el error no corresponde a un campo (ej. 'non_field_errors')
                console.warn(`Error no asociado a campo: ${campo} - ${mensaje}`);
                // Podrías mostrarlo al principio del formulario
                const errorGeneralDiv = document.createElement('div');
                errorGeneralDiv.className = 'alert alert-danger small';
                errorGeneralDiv.textContent = mensaje;
                form.prepend(errorGeneralDiv);
            }
        }
    }


    async function establecerDireccionPredeterminada(idDireccion) {
        console.log(`[establecerDireccionPredeterminada] Intentando marcar ID: ${idDireccion}...`);
        const boton = document.querySelector(`.establecer-predeterminada[data-id="${idDireccion}"]`);
        if (boton) { boton.disabled = true; boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }

        try {
            // Asumo endpoint POST a /api/direcciones/{id}/predeterminada/
            await fetchAPI(`/api/direcciones/${idDireccion}/predeterminada/`, { method: 'POST' });
            mostrarNotificacion('Dirección predeterminada actualizada.', 'success');
            await cargarDirecciones(); // Recargo para ver el cambio y actualizar botones
        } catch (error) {
            console.error(`[establecerDireccionPredeterminada] Error:`, error);
            mostrarNotificacion(`Error al marcar como predeterminada: ${error.message}`, 'error');
            // Restauro el botón si falló
            if (boton) { boton.disabled = false; boton.innerHTML = '<i class="fas fa-star"></i> Predet.'; }
        }
        // No necesito finally aquí porque la recarga ya restaura el estado visual
    }

    function confirmarEliminarDireccion(idDireccion) {
        // Podrías usar un modal de confirmación más elegante en lugar de confirm()
        if (confirm('¿Estás realmente seguro de que deseas eliminar esta dirección? Esta acción no se puede deshacer.')) {
            console.log(`[confirmarEliminarDireccion] Confirmado eliminar ID: ${idDireccion}`);
            eliminarDireccion(idDireccion);
        } else {
            console.log(`[confirmarEliminarDireccion] Cancelado eliminar ID: ${idDireccion}`);
        }
    }

    async function eliminarDireccion(idDireccion) {
        console.log(`[eliminarDireccion] Eliminando ID: ${idDireccion}...`);
        const tarjeta = document.querySelector(`.tarjeta-direccion[data-id="${idDireccion}"]`);
        if (tarjeta) tarjeta.style.opacity = '0.5'; // Feedback visual

        try {
            // Asumo endpoint DELETE /api/direcciones/{id}/
            await fetchAPI(`/api/direcciones/${idDireccion}/`, { method: 'DELETE' });
            mostrarNotificacion('Dirección eliminada correctamente.', 'success');
            // Elimino la tarjeta directamente en lugar de recargar toda la lista (más eficiente)
            if (tarjeta) {
                tarjeta.remove();
                // Actualizo contador si es necesario (restándole 1)
                if (totalDireccionesSpan) {
                    const actual = parseInt(totalDireccionesSpan.textContent) || 0;
                    totalDireccionesSpan.textContent = Math.max(0, actual - 1);
                }
                // Compruebo si la lista quedó vacía
                if (listaDireccionesDiv && listaDireccionesDiv.children.length === 0) {
                    listaDireccionesDiv.innerHTML = '<p class="text-center text-muted p-4">No tienes direcciones guardadas. ¡Añade una!</p>';
                }
            } else {
                await cargarDirecciones(); // Fallback: recargar si no se encontró la tarjeta
            }
        } catch (error) {
            console.error(`[eliminarDireccion] Error:`, error);
            mostrarNotificacion(`Error al eliminar la dirección: ${error.message}`, 'error');
            if (tarjeta) tarjeta.style.opacity = '1'; // Restauro opacidad si falla
        }
    }

    // --- NUEVA: Eliminar item desde el dashboard ---
    async function eliminarItemDesdeDashboard(idProducto) {
        console.log(`[eliminarItemDesdeDashboard] Eliminando producto ID: ${idProducto}`);
        const itemElement = document.querySelector(`.carrito-item[data-product-id="${idProducto}"]`);
        if (itemElement) itemElement.style.opacity = '0.5'; // Feedback

        try {
            // Llama a la misma API de eliminar que usa carrito.js
            await fetchAPI(`/api/carrito/eliminar/${idProducto}/`, { method: 'DELETE' });
            mostrarNotificacion("Producto eliminado del carrito.", "success");
            // Recargo la sección del carrito del dashboard para reflejar el cambio
            await cargarCarritoDashboard(true);
            // También actualizo el contador general del dashboard
            await cargarContadoresResumen(); // Recarga contadores

        } catch (error) {
            console.error("[eliminarItemDesdeDashboard] Error:", error);
            mostrarNotificacion(`Error al eliminar: ${error.message}`, 'error');
            if (itemElement) itemElement.style.opacity = '1'; // Restauro si falla
        }
    }


    // --- CONFIGURACIÓN INICIAL DE EVENTOS ---
    function configurarEventos() {
        console.log("[configurarEventos] Configurando listeners estáticos...");
        // Cierres Modales
        btnsModalCerrar.forEach(btn => btn.addEventListener('click', () => btn.closest('.modal')?.classList.remove('active')));
        document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', (e) => { if (e.target === m) m.classList.remove('active'); }));

        // Botones Abrir Modales
        if (btnAgregarDireccion) btnAgregarDireccion.addEventListener('click', () => abrirModalDireccion());
        // if (btnAgregarMetodoPago) btnAgregarMetodoPago.addEventListener('click', abrirModalMetodoPago);

        // Formularios
        if (formDireccion) formDireccion.addEventListener('submit', guardarDireccion);
        if (formEditarPerfil) formEditarPerfil.addEventListener('submit', actualizarPerfil);
        // if (formCambiarContrasena) formCambiarContrasena.addEventListener('submit', cambiarContrasena);
        // if (formMetodoPago) formMetodoPago.addEventListener('submit', guardarMetodoPago);

        // Foto Perfil
        if (btnCambiarFoto) btnCambiarFoto.addEventListener('click', () => inputFotoPerfil?.click());
        if (inputFotoPerfil) inputFotoPerfil.addEventListener('change', subirFotoPerfil);

        // Filtros y Búsqueda Pedidos
        if (filtroSelect) filtroSelect.addEventListener('change', () => { console.log("[Evento] Cambio filtro pedidos"); paginaActualPedidos = 1; cargarTodosPedidos(); });
        if (formBuscarPedido) formBuscarPedido.addEventListener('submit', (e) => { e.preventDefault(); console.log("[Evento] Submit búsqueda pedido"); paginaActualPedidos = 1; cargarTodosPedidos(); });

        // Paginación Pedidos
        if (btnPaginaAnterior) btnPaginaAnterior.addEventListener('click', () => { if (!btnPaginaAnterior.disabled) { console.log("[Evento] Click página anterior"); paginaActualPedidos--; cargarTodosPedidos(); } });
        if (btnPaginaSiguiente) btnPaginaSiguiente.addEventListener('click', () => { if (!btnPaginaSiguiente.disabled) { console.log("[Evento] Click página siguiente"); paginaActualPedidos++; cargarTodosPedidos(); } });

        // Cerrar Sesión
        if (btnCerrarSesion1) btnCerrarSesion1.addEventListener('click', (e) => { e.preventDefault(); logout(); });
        if (btnCerrarSesion2) btnCerrarSesion2.addEventListener('click', (e) => { e.preventDefault(); logout(); });

        // Menú desplegable usuario
        if (menuUsuarioBtn && dropdownMenu) {
            menuUsuarioBtn.addEventListener('click', (e) => { e.preventDefault(); dropdownMenu.classList.toggle('activo'); });
            // Cierro el menú si hago clic fuera
            document.addEventListener('click', (e) => {
                if (dropdownMenu.classList.contains('activo') && !menuUsuarioBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    console.log("[Evento] Click fuera del menú desplegable, cerrando.");
                    dropdownMenu.classList.remove('activo');
                }
            });
        }

        // Buscador (general del header)
        if (cerrarBusquedaBtn && buscadorInput) {
            cerrarBusquedaBtn.style.display = buscadorInput.value ? 'block' : 'none';
            buscadorInput.addEventListener('input', () => { cerrarBusquedaBtn.style.display = buscadorInput.value ? 'block' : 'none'; });
            cerrarBusquedaBtn.addEventListener('click', () => { buscadorInput.value = ''; cerrarBusquedaBtn.style.display = 'none'; buscadorInput.focus(); });
        }
        console.log("[configurarEventos] Listeners estáticos configurados.");
    }

    // Configura listeners DELEGADOS para acciones en elementos que se cargan dinámicamente
    function configurarBotonesPedidos(contenedorTablaBody) {
        if (!contenedorTablaBody) return;
        console.log("[configurarBotonesPedidos] Configurando listeners para botones de pedidos...");
        // Clono y reemplazo para limpiar listeners viejos, luego reasigno
        const nuevoContenedor = contenedorTablaBody.cloneNode(true);
        contenedorTablaBody.parentNode.replaceChild(nuevoContenedor, contenedorTablaBody);
        contenedorTablaBody = nuevoContenedor; // Trabajo con el nuevo nodo

        contenedorTablaBody.addEventListener('click', function (event) {
            const botonVer = event.target.closest('.ver-detalle-pedido');
            // const botonCancelar = event.target.closest('.cancelar-pedido');

            if (botonVer) {
                event.preventDefault();
                const pedidoId = botonVer.getAttribute('data-id');
                console.log(`[Listener Pedidos] Click en ver detalle ID: ${pedidoId}`);
                if (pedidoId) abrirDetallePedido(pedidoId);
            }
            // else if (botonCancelar) { ... }
        });
    }

    function configurarBotonesDirecciones(contenedorListaDiv) {
        if (!contenedorListaDiv) return;
        console.log("[configurarBotonesDirecciones] Configurando listeners para tarjetas de dirección...");
        // Limpieza de listeners
        const nuevoContenedor = contenedorListaDiv.cloneNode(true);
        contenedorListaDiv.parentNode.replaceChild(nuevoContenedor, contenedorListaDiv);
        contenedorListaDiv = nuevoContenedor;


        contenedorListaDiv.addEventListener('click', function (event) {
            const btnEditar = event.target.closest('.editar-direccion');
            const btnEliminar = event.target.closest('.eliminar-direccion');
            const btnPredet = event.target.closest('.establecer-predeterminada');
            // Obtengo el ID desde el botón mismo o desde la tarjeta padre
            const id = event.target.closest('[data-id]')?.getAttribute('data-id');

            if (!id) return;

            if (btnEditar) {
                event.preventDefault();
                console.log(`[Listener Direcciones] Click en editar ID: ${id}`);
                cargarDireccionParaEditar(id);
            } else if (btnEliminar) {
                event.preventDefault();
                console.log(`[Listener Direcciones] Click en eliminar ID: ${id}`);
                confirmarEliminarDireccion(id);
            } else if (btnPredet) {
                event.preventDefault();
                console.log(`[Listener Direcciones] Click en establecer predeterminada ID: ${id}`);
                establecerDireccionPredeterminada(id);
            }
        });
    }

    // --- NUEVA: Configurar botones en la sección carrito del dashboard ---
    function configurarBotonesCarritoDashboard(contenedorItemsDiv) {
        if (!contenedorItemsDiv) return;
        console.log("[configurarBotonesCarritoDashboard] Configurando listeners para items del carrito en dashboard...");
        // Limpieza de listeners
        const nuevoContenedor = contenedorItemsDiv.cloneNode(true);
        contenedorItemsDiv.parentNode.replaceChild(nuevoContenedor, contenedorItemsDiv);
        contenedorItemsDiv = nuevoContenedor;

        contenedorItemsDiv.addEventListener('click', function (event) {
            const btnEliminarDash = event.target.closest('.eliminar-item-dash');
            const id = btnEliminarDash?.getAttribute('data-id'); // Obtengo id desde el botón

            if (id && btnEliminarDash) {
                event.preventDefault();
                console.log(`[Listener Carrito Dash] Click en eliminar ID: ${id}`);
                // Llamo a la función específica para eliminar desde el dashboard
                if (confirm('¿Quitar este producto del carrito?')) {
                    eliminarItemDesdeDashboard(id);
                }
            }
            // Aquí podrías añadir listeners para botones +/- si los incluyes en crearElementoItemCarrito
        });
    }


    // --- INICIALIZACIÓN ---
    async function inicializarAplicacion() {
        console.log("--- [Dashboard JS] Iniciando Aplicación ---");
        // Verifica token. Si falla, redirige. Si tiene éxito, llama a inicializarFuncionalidadPostAutenticacion.
        await verificarAutenticacionInicial();
        // La consola indicará si la inicialización continúa o si se redirige.
    }

    function inicializarFuncionalidadPostAutenticacion() {
        console.log("--- [Dashboard JS] Autenticación Verificada. Inicializando UI y SPA ---");
        configurarEventos(); // Configura listeners para elementos estáticos
        inicializarSPA();    // Activa navegación por hash y carga la sección inicial
        console.log("--- [Dashboard JS] UI y SPA Inicializados ---");
    }

    // Arranca la aplicación
    inicializarAplicacion();

}); // Fin DOMContentLoaded


// App-Meche-Artesanias/static/Archivos-Js/tienda.js
document.addEventListener('DOMContentLoaded', () => {

  // --- Función de Notificación Mejorada ---
  function mostrarNotificacion(mensaje, tipo = 'info', duracion = 3500) {
       // Reutilizo el contenedor del dashboard si existe, o creo uno nuevo
      const contenedor = document.getElementById('contenedor-notificaciones') || crearContenedorNotificaciones();
      const notif = document.createElement('div');
      // Aplico clases CSS para estilo (asumiendo que tienes .notificacion-toast, .exito, .error, etc.)
      notif.className = `notificacion-toast ${tipo}`;
      notif.classList.add('mostrar'); // Clase para animación de entrada

      let icono = 'fa-info-circle'; // Icono por defecto
      if (tipo === 'success') icono = 'fa-check-circle';
      else if (tipo === 'warning') icono = 'fa-exclamation-triangle';
      else if (tipo === 'error') icono = 'fa-times-circle';

      // Contenido con icono y mensaje
      notif.innerHTML = `
          <div class="notificacion-contenido">
              <i class="fas ${icono}"></i>
              <span>${mensaje}</span>
          </div>
          <button class="notificacion-cerrar">&times;</button>
      `;
      contenedor.appendChild(notif);

      // Botón para cerrar
      notif.querySelector('.notificacion-cerrar').addEventListener('click', () => {
           notif.classList.remove('mostrar');
           // Espero a que termine la animación de salida antes de eliminar
           notif.addEventListener('transitionend', () => notif.remove());
      });

      // Cierre automático
      setTimeout(() => {
          notif.classList.remove('mostrar');
          notif.addEventListener('transitionend', () => notif.remove());
      }, duracion);
  }

  // Función para crear el contenedor si no existe (igual a la de dashboard.js)
  function crearContenedorNotificaciones() {
      let cont = document.getElementById('contenedor-notificaciones');
      if (!cont) {
          cont = document.createElement('div');
          cont.id = 'contenedor-notificaciones';
          // Estilos básicos si no están en CSS general
          cont.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:1050; display:flex; flex-direction:column; gap:10px; max-width: 350px; width: 90%;';
          document.body.appendChild(cont);
      }
      return cont;
  }

  // --- Función fetchAPI (Revisada) ---
  async function fetchAPI(url, options = {}) {
      const token = localStorage.getItem('accessToken');
      const defaultHeaders = {
          'Content-Type': 'application/json', // Importante para POST/PUT con JSON
          'Authorization': token ? `Bearer ${token}` : ''
      };
      // Asumiendo que NO necesitas CSRF Token porque usas JWT Bearer token
      // Si lo necesitaras, lo añadirías aquí:
      // const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
      // if (csrfToken) defaultHeaders['X-CSRFToken'] = csrfToken;

      // Aseguro URL relativa correcta
      const finalUrl = url.startsWith('/') ? url : `/${url}`;

      const config = {
          ...options,
          headers: { ...defaultHeaders, ...options.headers, }
      };
      if (!token && config.headers['Authorization'] === '') {
          delete config.headers['Authorization']; // No enviar header vacío si no hay token
      }

      try {
          let response = await fetch(finalUrl, config);

          // Manejo simplificado de refresco (solo si falla por 401)
          if (response.status === 401 && !options.triedRefresh && localStorage.getItem('refreshToken')) {
               console.log("Intento de refresco desde tienda.js...");
                // Asumo que tienes una función global o importada `intentarRefrescarToken`
                // que devuelve true/false. Si no, manejo básico:
                const refreshed = false; // Reemplazar con llamada a función de refresco real si existe
                if (refreshed) {
                   // Reintento la llamada
                   config.headers['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;
                   config.triedRefresh = true;
                   response = await fetch(finalUrl, config);
                } else {
                   throw new Error("Autenticación requerida."); // Fuerza el catch y mensaje al usuario
                }
          }

          // Obtengo el cuerpo de la respuesta (si existe) ANTES de verificar response.ok
          // para poder mostrar mensajes de error del backend (ej. 400 Bad Request)
          let data = {};
          try {
               // Intento leer como JSON. Si la respuesta es 204 No Content, esto dará error.
               if (response.status !== 204) {
                   data = await response.json();
               } else {
                   data = { success: true }; // Simulo éxito para 204
               }
          } catch (e) {
              // Si falla el parseo JSON y la respuesta NO fue OK, es un problema
              if (!response.ok) {
                  console.error("Error parseando respuesta JSON de error:", e);
                  throw new Error(`Error ${response.status} del servidor (respuesta no JSON)`);
              }
              // Si fue OK pero no JSON (raro para esta API), asumo éxito vacío
               data = { success: true };
          }


          if (!response.ok) {
              // Si la respuesta no fue OK (4xx, 5xx), lanzo error con mensaje del backend si existe
              throw new Error(data.error || data.detail || data.mensaje || `Error ${response.status}`);
          }

          return data; // Devuelvo los datos JSON (o el objeto simulado para 204)

      } catch (error) {
          console.error(`Error en fetchAPI para ${finalUrl} desde tienda.js:`, error);
          // Relanzo el error para que la función que llamó a fetchAPI lo maneje
          throw error;
      }
  }

  // --- Actualizar Contador ---
  function actualizarContadorCarritoVisual(carritoData) {
      const contadorElement = document.getElementById('contador-carrito'); // ID del span en tienda.html
      if (!contadorElement) return;

      const items = carritoData?.items || [];
      const totalProductos = items.reduce((total, item) => total + item.cantidad, 0);

      contadorElement.textContent = totalProductos > 0 ? totalProductos : '0';
       // Opcional: Ocultar/mostrar si es cero
       contadorElement.style.display = totalProductos > 0 ? 'inline-block' : 'none';
  }

  // --- Cargar Contador Inicial ---
  async function cargarContadorInicial() {
    if (localStorage.getItem('accessToken')) {
        try {
            // Uso la API para obtener el estado actual del carrito
            const carritoData = await fetchAPI('/api/carrito/');
            actualizarContadorCarritoVisual(carritoData);
        } catch (error) {
            console.log("No se pudo cargar contador inicial (quizás no logueado o error API).");
            actualizarContadorCarritoVisual(null); // Pone 0
        }
    } else {
         actualizarContadorCarritoVisual(null); // Pone 0 si no hay token
    }
  }

  // --- Lógica Principal (Agregar al carrito) ---
  async function manejarClickAgregarCarrito(event) {
      const boton = event.currentTarget;
      const productoId = boton.getAttribute('data-producto-id');
      // Ajusto para buscar el input dentro del contenedor .card o .producto
      const contenedor = boton.closest('.card') || boton.closest('.producto');
      // Ajusto el selector para ID que empieza con `cantidad-` O `pago-` (adaptado a tienda.html)
      const inputCantidad = contenedor ? contenedor.querySelector('input[type="number"][id^="cantidad-"]') : null;

      if (!productoId) {
          mostrarNotificacion('Error: No se encontró el ID del producto.', 'error');
          return;
      }

      const cantidad = inputCantidad ? parseInt(inputCantidad.value, 10) : 1;

      if (isNaN(cantidad) || cantidad < 1) {
          mostrarNotificacion('Cantidad inválida. Debe ser 1 o más.', 'error');
          if(inputCantidad) inputCantidad.value = 1;
          return;
      }

      boton.disabled = true;
      const textoOriginal = boton.innerHTML; // Guardo el contenido HTML (podría tener icono)
      boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agregando...'; // Indicador visual

      try {
          const resultado = await fetchAPI('/api/carrito/agregar/', {
              method: 'POST',
              body: JSON.stringify({
                  producto_id: productoId,
                  cantidad: cantidad
              })
          });

          // La API ahora devuelve el carrito completo en la clave 'carrito'
          if (resultado.carrito) {
              actualizarContadorCarritoVisual(resultado.carrito);
               // Muestro el mensaje devuelto por la API
               mostrarNotificacion(resultado.mensaje, resultado.stock_limitado ? 'warning' : 'success');
          } else {
               // Si no devuelve carrito, muestro mensaje genérico pero intento recargar contador
               mostrarNotificacion(resultado.mensaje || 'Producto agregado.', 'success');
               cargarContadorInicial(); // Intento recargar por si acaso
          }

      } catch (error) {
          console.error('Error al agregar al carrito:', error);
          // Muestro el mensaje de error específico que lanzó fetchAPI
          mostrarNotificacion(error.message || 'Error al agregar producto.', 'error');
          if (error.message.includes("Autenticación")) {
              // Sugerir iniciar sesión
          }
      } finally {
          boton.disabled = false;
          boton.innerHTML = textoOriginal; // Restauro contenido original
      }
  }

  // --- Inicialización ---
  const btnsAgregarCarrito = document.querySelectorAll('button[data-producto-id]');
  btnsAgregarCarrito.forEach(btn => {
      btn.addEventListener('click', manejarClickAgregarCarrito);
  });

  // Inicializar otras cosas si es necesario (ej. buscador)
  // inicializarBuscador();

  cargarContadorInicial(); // Carga el contador al iniciar

}); // Fin DOMContentLoaded
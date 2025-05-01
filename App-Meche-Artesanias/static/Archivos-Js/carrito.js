// App-Meche-Artesanias/static/Archivos-Js/carrito.js
document.addEventListener('DOMContentLoaded', () => {

  const carritoContenidoDiv = document.getElementById('carrito-contenido');
  const carritoResumenDiv = document.getElementById('carrito-resumen');
  const contadorCarritoIconHeader = document.getElementById('contador-carrito-icon-header');

  // --- Funciones Auxiliares ---

  // Muestra notificaciones (puedes usar la misma función de dashboard.js si la haces global o la importas)
  function mostrarNotificacion(mensaje, tipo = 'info') {
      // Implementación simple o reutiliza la de dashboard.js
      alert(`${tipo.toUpperCase()}: ${mensaje}`); // Placeholder simple
  }

  // Función reutilizable para hacer llamadas a la API (similar a la de dashboard.js)
  async function fetchAPI(url, options = {}) {
      const token = localStorage.getItem('accessToken');
      // Asume que tu API requiere el token CSRF si usas sesiones + JWT o solo sesiones
      // const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
      const defaultHeaders = {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          // 'X-CSRFToken': csrfToken || '' // Descomenta si necesitas CSRF
      };

      const finalUrl = url.startsWith('/') ? url : `/${url}`;
      const config = { ...options, headers: { ...defaultHeaders, ...options.headers } };
      if (!token) delete config.headers['Authorization'];

      try {
          let response = await fetch(finalUrl, config);
          // Manejo básico de refresco de token (simplificado)
          if (response.status === 401 && !options.triedRefresh && localStorage.getItem('refreshToken')) {
               console.log("Intentando refrescar token desde carrito.js...");
               // Aquí deberías llamar a una función de refresco similar a la de dashboard.js
               // Por simplicidad, asumimos que falla o que el usuario debe re-loguearse.
               mostrarNotificacion('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', 'error');
               localStorage.removeItem('accessToken'); // Limpio token viejo
               localStorage.removeItem('refreshToken');
               window.location.href = '/login/'; // Redirijo a login
               throw new Error("Token expirado y refresco no implementado/fallido aquí.");
          }
          if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || errorData.detail || errorData.mensaje || `Error ${response.status}`);
          }
          if (response.status === 204) return null; // No Content
          return await response.json();
      } catch (error) {
          console.error(`Error en fetchAPI para ${finalUrl}:`, error);
          throw error; // Relanza para manejo específico
      }
  }

  // --- Funciones para Renderizar el Carrito ---

  function renderizarCarrito(carritoData) {
      if (!carritoContenidoDiv || !carritoResumenDiv) return;

      const items = carritoData.items || [];
      const total = parseFloat(carritoData.total || 0);

       // Actualizo contador en header
       const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
       if(contadorCarritoIconHeader){
           contadorCarritoIconHeader.textContent = totalItems > 0 ? totalItems : '0';
           contadorCarritoIconHeader.style.display = totalItems > 0 ? 'inline-block' : 'none'; // O flex, según tu CSS
       }


      if (items.length === 0) {
          carritoContenidoDiv.innerHTML = '<p class="carrito-vacio"><i class="fas fa-shopping-cart"></i> Tu carrito está vacío.</p>';
          carritoResumenDiv.innerHTML = ''; // Limpio resumen
      } else {
          // Construyo la tabla
          let tablaHTML = `
              <table class="tabla-carrito">
                <thead>
                  <tr>
                    <th colspan="2">Producto</th>
                    <th>Precio Unit.</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
          `;
          items.forEach(item => {
              tablaHTML += crearFilaItemHTML(item);
          });
          tablaHTML += `
                </tbody>
              </table>
          `;
          carritoContenidoDiv.innerHTML = tablaHTML;

          // Construyo el resumen
          carritoResumenDiv.innerHTML = `
              <div class="resumen-carrito">
                  <h2>Total: $${total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                  <button class="btn-proceder-pago" id="btn-pagar">Proceder al Pago</button>
              </div>
          `;

          // Añado listeners a los nuevos botones de la tabla
          agregarListenersItems();
           // Listener para el botón de pagar
          document.getElementById('btn-pagar')?.addEventListener('click', procederAlPago);

      }
  }

  function crearFilaItemHTML(item) {
      const producto = item.producto;
      if (!producto) return ''; // Seguridad por si falta el producto

      const subtotal = parseFloat(item.subtotal || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const precioUnitario = parseFloat(producto.precio || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const imagenSrc = producto.imagen_url || "{% static 'Img/producto-default.jpg' %}"; // Usa imagen por defecto

      return `
          <tr data-product-id="${producto.id}">
            <td><img src="${imagenSrc}" alt="${producto.nombre}" class="carrito-item-img"></td>
            <td class="item-info">
                <span class="item-nombre">${producto.nombre}</span>
                {# <span class="item-precio-unitario">$${precioUnitario} / unidad</span> #} {# Opcional mostrar precio unitario aquí #}
            </td>
             <td>$${precioUnitario}</td> {# Columna separada para precio unitario #}
            <td>
                <div class="cantidad-controles">
                    <button class="btn-decrementar" data-product-id="${producto.id}" ${item.cantidad <= 1 ? 'disabled' : ''}>-</button>
                    <input type="number" class="cantidad-input" value="${item.cantidad}" min="1" data-product-id="${producto.id}" style="width: 50px; text-align: center;">
                    <button class="btn-incrementar" data-product-id="${producto.id}">+</button>
                </div>
            </td>
            <td class="item-subtotal">$${subtotal}</td>
            <td>
              <button class="btn-eliminar" data-product-id="${producto.id}" title="Eliminar item">
                  <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
      `;
  }

  // --- Funciones de Interacción con la API ---

  async function cargarCarritoInicial() {
      carritoContenidoDiv.innerHTML = `<div class="cargando-carrito"><i class="fas fa-spinner fa-spin"></i><p>Cargando tu carrito...</p></div>`;
      carritoResumenDiv.innerHTML = '';
       try {
          const carritoData = await fetchAPI('/api/carrito/');
           renderizarCarrito(carritoData);
      } catch (error) {
          console.error("Error al cargar carrito inicial:", error);
          // Mostrar mensaje de error más amigable
          let mensajeError = "No se pudo cargar tu carrito. ";
          if (error.message.includes("401") || error.message.includes("autenticación")) {
              mensajeError += '<a href="/login/">Inicia sesión</a> para ver tu carrito.';
          } else {
              mensajeError += "Inténtalo de nuevo más tarde.";
          }
           carritoContenidoDiv.innerHTML = `<p class="carrito-vacio error"><i class="fas fa-exclamation-circle"></i> ${mensajeError}</p>`;
      }
  }

  async function eliminarItem(productoId) {
      console.log(`Intentando eliminar producto ID: ${productoId}`);
      // Añadir feedback visual (ej. deshabilitar botón)
       const boton = document.querySelector(`.btn-eliminar[data-product-id="${productoId}"]`);
       if(boton) boton.disabled = true;

       try {
           // Uso la URL definida en productos/urls.py que incluye el ID
          const carritoActualizado = await fetchAPI(`/api/carrito/eliminar/${productoId}/`, {
              method: 'DELETE',
          });
           // La respuesta de DELETE suele ser 204 No Content o el carrito actualizado
           // Si es 204, necesito recargar el carrito. Si devuelve el carrito, lo renderizo.
          if(carritoActualizado) {
               renderizarCarrito(carritoActualizado);
               mostrarNotificacion('Producto eliminado del carrito.', 'success');
          } else {
              // Si la respuesta fue 204, recargo el carrito completo
               await cargarCarritoInicial();
               mostrarNotificacion('Producto eliminado del carrito.', 'success');
          }

      } catch (error) {
          console.error(`Error al eliminar item ${productoId}:`, error);
          mostrarNotificacion(error.message || 'Error al eliminar el producto.', 'error');
           if(boton) boton.disabled = false; // Rehabilitar botón si falla
      }
  }

  async function actualizarCantidadItem(productoId, nuevaCantidad) {
       console.log(`Actualizando producto ID: ${productoId} a cantidad: ${nuevaCantidad}`);
       if (nuevaCantidad < 1) {
           console.warn("La cantidad no puede ser menor a 1. Intentando eliminar.");
           // Si la cantidad es 0 o menos, elimino el item
           await eliminarItem(productoId);
           return;
       }

        // Deshabilito controles mientras actualizo
       const controles = document.querySelector(`tr[data-product-id="${productoId}"] .cantidad-controles`);
       if(controles) controles.style.opacity = '0.5';


       try {
           // Necesito un endpoint para actualizar, o simularlo con agregar (con cantidad negativa o positiva)
           // Opción 1: Endpoint PUT /api/carrito/actualizar/ (Preferida)
           /*
           const carritoActualizado = await fetchAPI('/api/carrito/actualizar/', {
               method: 'PUT', // O POST si prefieres
               body: JSON.stringify({ producto_id: productoId, cantidad: nuevaCantidad })
           });
           renderizarCarrito(carritoActualizado);
           */

           // Opción 2: Simular con agregar (requiere ajuste en API 'AgregarItemCarrito' para manejar cantidades absolutas o diferenciales)
           // Esto es más complejo y menos ideal que un endpoint dedicado.
           // Por ahora, asumimos que no hay endpoint de actualización y NO hacemos la llamada.
           // En un caso real, deberíamos AÑADIR el endpoint PUT.
           console.warn("Endpoint de actualización no implementado. No se envió cambio de cantidad a la API.");
           // mostrarNotificacion("Funcionalidad de actualizar cantidad no disponible.", "warning");

            // *** SOLUCIÓN TEMPORAL: Recargar el carrito para revertir el cambio visual ***
            // Esto NO guarda el cambio, es solo para que la UI no quede inconsistente
             await cargarCarritoInicial();
             mostrarNotificacion("Actualización de cantidad no implementada en backend.", "warning");


       } catch (error) {
           console.error(`Error al actualizar cantidad de ${productoId}:`, error);
           mostrarNotificacion(error.message || 'Error al actualizar la cantidad.', 'error');
            // Si falla, recargo para asegurar consistencia visual
           await cargarCarritoInicial();
       } finally {
            // Rehabilito controles
            if(controles) controles.style.opacity = '1';
       }

  }


  function procederAlPago() {
      console.log("Procediendo al pago...");
      // Aquí iría la lógica para redirigir a la página de checkout,
      // pasar la información necesaria, o iniciar un proceso de pago.
      // Por ejemplo, podría llamar a la vista `procesar_pedido` si es una API:
      /*
      fetchAPI('/pedido/procesar/', { method: 'POST' })
          .then(data => {
              mostrarNotificacion(`Pedido #${data.pedido_id} creado con éxito!`, 'success');
              // Redirigir a página de confirmación o dashboard
              window.location.href = '/dashboard/#pedidos'; // O a una página específica de éxito
          })
          .catch(error => {
              mostrarNotificacion(error.message || 'Error al procesar el pedido.', 'error');
          });
      */
       // O simplemente redirigir a una página de checkout que maneje la lógica:
        window.location.href = '/checkout/'; // Asegúrate que esta URL exista en tu urls.py
        mostrarNotificacion('Redirigiendo a la página de pago...', 'info');
  }


  // --- Agregar Listeners ---

  function agregarListenersItems() {
      // Botones Eliminar
      document.querySelectorAll('.btn-eliminar').forEach(btn => {
          // Quito listeners anteriores para evitar duplicados si se re-renderiza
          btn.replaceWith(btn.cloneNode(true));
      });
      document.querySelectorAll('.btn-eliminar').forEach(btn => {
           btn.addEventListener('click', (e) => {
               const productoId = e.currentTarget.getAttribute('data-product-id');
               eliminarItem(productoId);
           });
      });

      // Botones Incrementar/Decrementar cantidad
      document.querySelectorAll('.btn-decrementar, .btn-incrementar').forEach(btn => {
           btn.replaceWith(btn.cloneNode(true));
      });
       document.querySelectorAll('.btn-decrementar, .btn-incrementar').forEach(btn => {
           btn.addEventListener('click', (e) => {
               const productoId = e.currentTarget.getAttribute('data-product-id');
               const inputCantidad = document.querySelector(`.cantidad-input[data-product-id="${productoId}"]`);
               if (inputCantidad) {
                   let cantidadActual = parseInt(inputCantidad.value, 10);
                   if (e.currentTarget.classList.contains('btn-incrementar')) {
                       cantidadActual++;
                   } else if (cantidadActual > 1) { // Solo decrementa si es mayor a 1
                       cantidadActual--;
                   }
                    // Actualizo visualmente el input y el botón decrementar
                   inputCantidad.value = cantidadActual;
                    const btnDecrementar = document.querySelector(`.btn-decrementar[data-product-id="${productoId}"]`);
                    if(btnDecrementar) btnDecrementar.disabled = cantidadActual <= 1;

                    // Llamo a la función para actualizar en backend (después de un pequeño delay para no saturar si hacen click rápido)
                    clearTimeout(inputCantidad.updateTimeout); // Cancelo timeout anterior si existe
                    inputCantidad.updateTimeout = setTimeout(() => {
                        actualizarCantidadItem(productoId, cantidadActual);
                    }, 750); // Espero 750ms después del último click/cambio
               }
           });
       });

       // Inputs de Cantidad (para detectar cambios manuales)
        document.querySelectorAll('.cantidad-input').forEach(input => {
            input.replaceWith(input.cloneNode(true));
        });
        document.querySelectorAll('.cantidad-input').forEach(input => {
            input.addEventListener('change', (e) => {
                 const productoId = e.currentTarget.getAttribute('data-product-id');
                 let nuevaCantidad = parseInt(e.currentTarget.value, 10);
                 if(isNaN(nuevaCantidad) || nuevaCantidad < 1) {
                     nuevaCantidad = 1; // Corrijo a 1 si no es válido
                     e.currentTarget.value = 1;
                 }
                  const btnDecrementar = document.querySelector(`.btn-decrementar[data-product-id="${productoId}"]`);
                  if(btnDecrementar) btnDecrementar.disabled = nuevaCantidad <= 1;

                 // Actualizo en backend
                 actualizarCantidadItem(productoId, nuevaCantidad);
            });
        });
  }

  // --- Inicialización ---
  cargarCarritoInicial();

}); // Fin DOMContentLoaded
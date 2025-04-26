
// Espero a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  // Inicializo el array del carrito usando localStorage si existe
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  
  // Función para mostrar notificaciones al usuario
  function mostrarNotificacion(mensaje, tipo = 'exito') {
    // Primero verifico si ya existe una notificación
    let notificacion = document.querySelector('.notificacion');
    
    // Si no existe, la creo
    if (!notificacion) {
      notificacion = document.createElement('div');
      notificacion.className = 'notificacion';
      document.body.appendChild(notificacion);
    }
    
    // Asigno el mensaje y la clase según el tipo
    notificacion.textContent = mensaje;
    notificacion.classList.add(tipo);
    notificacion.classList.add('mostrar');
    
    // Oculto la notificación después de 3 segundos
    setTimeout(() => {
      notificacion.classList.remove('mostrar');
    }, 3000);
  }
  
  // Función para actualizar el contador del carrito
  function actualizarContadorCarrito() {
    const contador = document.getElementById('contador-carrito');
    if (!contador) return;
    
    // Calculo el total de productos en el carrito
    const totalProductos = carrito.reduce((total, item) => total + item.cantidad, 0);
    contador.textContent = totalProductos > 0 ? totalProductos : '';
  }

  /* Función para actualizar el localStorage con el carrito */
  function actualizarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
  }
  
  // Función para enviar los datos al backend de Django
  async function agregarAlCarritoBackend(productoId, metodoPago) {
    try {
      // Muestro un loader para indicar que se está procesando
      const loader = document.createElement('div');
      loader.className = 'loader';
      document.body.appendChild(loader);
      loader.style.display = 'block';
      
      // Obtengo el token CSRF
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
      
      // Realizo la petición al backend de Django
      const response = await fetch('/agregar-al-carrito/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
          producto_id: productoId,
          metodo_pago: metodoPago,
          cantidad: 1 
        })
      });
      
      // Oculto el loader
      loader.style.display = 'none';
      document.body.removeChild(loader);
      
      if (!response.ok) {
        throw new Error('Error al comunicarse con el servidor');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Si la operación fue exitosa, actualizo el carrito local
        const productoExistente = carrito.find(item => item.id === productoId);
        
        if (productoExistente) {
          // Si el producto ya existe, incremento la cantidad
          productoExistente.cantidad += 1;
        } else {
          // Si es un producto nuevo, lo añado al carrito
          carrito.push({
            id: productoId,
            cantidad: 1,
            metodoPago: metodoPago
          });
        }
        
        // Actualizo el localStorage y el contador
        actualizarCarrito();
        
        // Muestro notificación de éxito
        mostrarNotificacion('Producto agregado al carrito correctamente', 'exito');
        
        return true;
      } else {
        // Si hubo un error en el servidor, muestro el mensaje
        mostrarNotificacion(data.message || 'Error al agregar al carrito', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarNotificacion('Error de conexión. Intente nuevamente.', 'error');
      return false;
    }
  }
  
  // Función para manejar el evento de click en botones "Agregar al carrito"
  function manejarClickAgregarCarrito() {
    // Obtengo el ID del producto desde el atributo data
    const productoId = this.getAttribute('data-producto-id');
    
    // Obtengo el selector de método de pago correspondiente a este producto
    const selectorPago = document.getElementById(`pago-${productoId}`);
    const metodoPago = selectorPago ? selectorPago.value : '';
    
    // Verifico que se haya seleccionado un método de pago
    if (!metodoPago) {
      mostrarNotificacion('Por favor seleccione un método de pago', 'error');
      return;
    }
    
    // Llamo a la función para agregar al carrito en el backend
    agregarAlCarritoBackend(productoId, metodoPago);
  }
  
  // Función para cargar imágenes de forma dinámica
  function cargarImagenesDinamicas() {
    // Selecciono todas las imágenes de productos que necesitan cargarse
    const imagenesProductos = document.querySelectorAll('.producto img');
    
    imagenesProductos.forEach(img => {
      // Verifico si la imagen tiene un src válido
      if (img.src && !img.src.includes('producto-default.jpg')) {
        // Creo un objeto Image para precargar
        const imgPreload = new Image();
        
        // Cuando la imagen se carga correctamente
        imgPreload.onload = function() {
          // Actualizo la imagen con efecto de fade in
          img.style.opacity = '0';
          img.src = this.src;
          
          // Efecto de fade in
          setTimeout(() => {
            img.style.transition = 'opacity 0.5s ease';
            img.style.opacity = '1';
          }, 50);
        };
        
        // Si hay error al cargar la imagen
        imgPreload.onerror = function() {
          // se usa una imagen por defecto
          img.src = '/static/Img/producto-default.jpg';
        };
        
        // Inicio la carga de la imagen
        imgPreload.src = img.src;
      }
    });
  }
  
  // Función para inicializar el buscador
  function inicializarBuscador() {
    const inputBuscador = document.querySelector('.buscador input');
    const btnCerrar = document.getElementById('cerrarBusqueda');
    
    if (inputBuscador && btnCerrar) {
      // Muestro el botón de cerrar cuando hay texto
      inputBuscador.addEventListener('input', function() {
        btnCerrar.style.display = this.value.length > 0 ? 'block' : 'none';
      });
      
      // Limpio el campo y oculto el botón cuando se hace clic en cerrar
      btnCerrar.addEventListener('click', function() {
        inputBuscador.value = '';
        this.style.display = 'none';
        inputBuscador.focus();
      });
    }
  }
  
  // Función para filtrar productos por categoría
  function filtrarPorCategoria(categoriaId) {
    const productos = document.querySelectorAll('.producto');
    
    productos.forEach(producto => {
      const categoriasProducto = producto.getAttribute('data-categorias').split(',');
      
      if (categoriaId === 'todos' || categoriasProducto.includes(categoriaId)) {
        producto.style.display = 'block';
      } else {
        producto.style.display = 'none';
      }
    });
  }
  
  // Selecciono todos los botones "Agregar al carrito"
  const btnsAgregarCarrito = document.querySelectorAll('.btn-secundario');
  
  // Asigno el evento click a cada botón
  btnsAgregarCarrito.forEach(btn => {
    btn.addEventListener('click', manejarClickAgregarCarrito);
  });
  
  // Cargo las imágenes de forma dinámica
  cargarImagenesDinamicas();
  
  // Inicializo el buscador
  inicializarBuscador();
  
  // Actualizo el contador del carrito
  actualizarContadorCarrito();
  
  // Compruebo si hay filtros de categoría en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const categoriaFiltro = urlParams.get('categoria');
  
  if (categoriaFiltro) {
    filtrarPorCategoria(categoriaFiltro);
  }
});
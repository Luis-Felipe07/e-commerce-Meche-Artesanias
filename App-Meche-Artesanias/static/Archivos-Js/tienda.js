// En este script configuro las funcionalidades de la tienda

// Selecciono todos los botones "Agregar al carrito"
const btnsAgregarCarrito = document.querySelectorAll('.btn-secundario');
// Inicializo el array del carrito usando localStorage si existe
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

/* Función para actualizar el localStorage con el carrito */
function actualizarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  // Aquí podría actualizar el contador de productos del carrito
}

/* Agrego eventos a cada botón de "Agregar al carrito" */
btnsAgregarCarrito.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    // Obtengo el elemento del producto
    const producto = btn.closest('.producto');
    // En esta parte recojo el nombre, precio e imagen del producto
    const nombreProducto = producto.querySelector('h3').textContent;
    const precioTexto = producto.querySelector('p').textContent;
    const precio = parseInt(precioTexto.replace(/\D/g, ''));
    const imagen = producto.querySelector('img').src;
    // También obtengo el método de pago seleccionado para este producto
    const selectPago = producto.querySelector('.metodos-pago select');
    const metodoPago = selectPago ? selectPago.value : "";
    
    // Verifico si el producto ya se encuentra en el carrito
    const indiceProducto = carrito.findIndex(item => item.nombre === nombreProducto && item.metodoPago === metodoPago);
    
    if (indiceProducto !== -1) {
      // En esta parte aumento la cantidad si el producto ya existe con ese método de pago
      carrito[indiceProducto].cantidad += 1;
    } else {
      // Si es un producto nuevo, lo agrego al carrito
      carrito.push({
        id: index + 1,
        nombre: nombreProducto,
        precio: precio,
        imagen: imagen,
        metodoPago: metodoPago,
        cantidad: 1
      });
    }
    
    actualizarCarrito();
    // Muestra una alerta sencilla (puedes usar la función mostrarAlerta si la defines globalmente)
    alert(`${nombreProducto} agregado al carrito`);
  });
});

/* Manejo del buscador similar al index */
// Selecciono el input del buscador y el botón para cerrar búsqueda
const buscador = document.querySelector('.buscador input');
const btnCerrarBusqueda = document.getElementById('cerrarBusqueda');

if (buscador) {
  buscador.addEventListener('focus', () => {
    btnCerrarBusqueda.style.display = 'block';
  });
  
  btnCerrarBusqueda.addEventListener('click', () => {
    buscador.value = '';
    btnCerrarBusqueda.style.display = 'none';
  });
  
  buscador.addEventListener('input', (e) => {
    btnCerrarBusqueda.style.display = e.target.value ? 'block' : 'none';
  });
}

/* Agrego funcionalidad para la navegación suave al hacer clic en enlaces internos */
const enlacesNavegacion = document.querySelectorAll('.navegacion a');
enlacesNavegacion.forEach(enlace => {
  enlace.addEventListener('click', (e) => {
    const href = enlace.getAttribute('href');
    if (href.startsWith('#') && href.length > 1) {
      e.preventDefault();
      const seccionDestino = document.querySelector(href);
      if (seccionDestino) {
        window.scrollTo({
          top: seccionDestino.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    }
  });
});

/* Código extra para implementar un menú móvil (si es necesario) */
document.addEventListener('DOMContentLoaded', () => {
  const btnMenu = document.createElement('button');
  btnMenu.className = 'btn-menu-movil';
  btnMenu.innerHTML = '<i class="fas fa-bars"></i>';
  document.querySelector('.logo').after(btnMenu);
  
  btnMenu.addEventListener('click', () => {
    document.querySelector('.navegacion').classList.toggle('mostrar');
  });
  
  // Inyecto estilos adicionales para el menú móvil
  const estiloMovil = document.createElement('style');
  estiloMovil.textContent = `
    .btn-menu-movil {
      display: none;
      background: transparent;
      color: var(--color-claro);
      font-size: 24px;
      padding: 5px;
    }
    
    @media (max-width: 768px) {
      .btn-menu-movil {
        display: block;
        order: 2;
      }
      
      .navegacion {
        width: 100%;
        height: 0;
        overflow: hidden;
        transition: height 0.3s ease;
      }
      
      .navegacion.mostrar {
        height: auto;
      }
      
      .navegacion ul {
        flex-direction: column;
        padding: 15px 0;
      }
      
      .navegacion li {
        margin: 10px 0;
        text-align: center;
      }
    }
  `;
  document.head.appendChild(estiloMovil);
});

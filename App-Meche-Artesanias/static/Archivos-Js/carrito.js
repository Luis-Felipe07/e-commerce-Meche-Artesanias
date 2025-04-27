document.addEventListener("DOMContentLoaded", function() {
  // Event listener para actualizar la cantidad de productos
  const cantidadInputs = document.querySelectorAll('.cantidad-input');
  cantidadInputs.forEach(input => {
    input.addEventListener('change', function() {
      const productoId = this.dataset.id;
      const nuevaCantidad = this.value;

      fetch('/api/carrito/actualizar/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value  // CSRF token
        },
        body: JSON.stringify({
          producto_id: productoId,
          cantidad: nuevaCantidad
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Actualizar el subtotal o total si es necesario
          alert('Cantidad actualizada');
          location.reload();  // Recargar la página para mostrar los cambios
        } else {
          alert('Error al actualizar el carrito');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Hubo un problema actualizando el carrito');
      });
    });
  });

  // Event listener para eliminar productos
  const eliminarBtns = document.querySelectorAll('.btn-eliminar');
  eliminarBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const productoId = this.dataset.id;

      fetch('/api/carrito/eliminar/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        },
        body: JSON.stringify({
          producto_id: productoId
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Eliminar el producto de la tabla
          const row = this.closest('tr');
          row.remove();
          alert('Producto eliminado');
        } else {
          alert('Error al eliminar el producto');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Hubo un problema eliminando el producto');
      });
    });
  });
});




  
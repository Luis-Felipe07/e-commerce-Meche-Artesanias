document.addEventListener("DOMContentLoaded", function () {
  const eliminarBtns = document.querySelectorAll(".btn-eliminar");

  eliminarBtns.forEach(btn => {
    btn.addEventListener("click", function () {
      const row = btn.closest("tr");
      const productoId = row.dataset.id;

      fetch(`/api/carrito/eliminar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({ producto_id: productoId }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.message) {
            location.reload();
          } else {
            alert(data.error || "Error al eliminar el producto.");
          }
        });
    });
  });

  const cantidadInputs = document.querySelectorAll(".cantidad-input");

  cantidadInputs.forEach(input => {
    input.addEventListener("change", function () {
      const row = input.closest("tr");
      const productoId = row.dataset.id;
      const nuevaCantidad = input.value;

      fetch(`/api/carrito/actualizar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({
          producto_id: productoId,
          nueva_cantidad: nuevaCantidad,
        }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.message) {
            location.reload();
          } else {
            alert(data.error || "Error al actualizar la cantidad.");
          }
        });
    });
  });
});

// Utilidad para obtener el token CSRF desde cookies
function getCSRFToken() {
  const name = "csrftoken";
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return "";
}




  
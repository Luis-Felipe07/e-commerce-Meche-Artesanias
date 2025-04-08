document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();
  
    const usuario = document.getElementById("usuario").value;
    const clave = document.getElementById("clave").value;
    const mensajeError = document.getElementById("mensajeError");
  
    // Usuario y contraseña de ejemplo
    const usuarioCorrecto = "admin";
    const claveCorrecta = "1234";
  
    if (usuario === usuarioCorrecto && clave === claveCorrecta) {
      mensajeError.textContent = "";
      alert("¡Bienvenido!");
      // Aquí podrías redirigir, por ejemplo: window.location.href = "dashboard.html";
    } else {
      mensajeError.textContent = "Usuario o contraseña incorrectos.";
    }
  });
  

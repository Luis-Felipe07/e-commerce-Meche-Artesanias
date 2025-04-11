document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = document.getElementById("usuario").value;
  const password = document.getElementById("clave").value;
  const mensajeError = document.getElementById("mensajeError");

  try {
    const response = await fetch("http://127.0.0.1:8000/api/usuarios/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      mensajeError.textContent = "";
      alert("¡Bienvenido!");

      // Guarda el token en localStorage para usarlo después
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);

      // Redirige página principal
      window.location.href = "index-pgbienvenida.html";
    } else {
      mensajeError.textContent = data.detail || "Usuario o contraseña incorrectos.";
    }
  } catch (error) {
    mensajeError.textContent = "Error al conectar con el servidor.";
    console.error("Error de login:", error);
  }
});



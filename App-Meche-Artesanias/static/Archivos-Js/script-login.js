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

      // Guarda los tokens en localStorage
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      
      // También podemos guardar la fecha de expiración (1 hora desde ahora para access token)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      localStorage.setItem("tokenExpiration", expiresAt.toISOString());

      // Redirige al dashboard del usuario
      window.location.href = "/dashboard/";
    } else {
      mensajeError.textContent = data.error || "Usuario o contraseña incorrectos.";
    }
  } catch (error) {
    mensajeError.textContent = "Error al conectar con el servidor.";
    console.error("Error de login:", error);
  }
});
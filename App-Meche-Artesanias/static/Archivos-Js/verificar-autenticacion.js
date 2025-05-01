(async function verificarLogin() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.warn("[verificarLogin] No hay token. Redirigiendo a login...");
        window.location.href = '/login/';
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/api/usuarios/verificar-autenticacion/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.warn("[verificarLogin] Token inválido. Redirigiendo a login...");
            localStorage.removeItem("accessToken"); // Elimino por seguridad
            window.location.href = '/login/';
        }

        const data = await response.json();
        console.log("[verificarLogin] Usuario autenticado:", data.usuario);

    } catch (error) {
        console.error("Error al verificar token:", error);
        window.location.href = '/login/';
    }
})();

// Obtuve las referencias a los elementos que necesito del HTML.
const formulario = document.getElementById('formularioRegistro');
const mensajeExito = document.getElementById('mensajeExito');
const mensajeNoCoinciden = document.getElementById('mensajeNoCoinciden');

// Esta es la URL correcta de la API para registrar usuarios.
const API_URL_REGISTRO = 'http://127.0.0.1:8000/api/usuarios/registrar-usuario/';

// Verifico si las contraseñas coinciden.
function verificarContraseñas() {
  const passwordInput = document.getElementById('password');
  const confirmarPasswordInput = document.getElementById('confirmarPassword');
  const password = passwordInput.value;
  const confirmarPassword = confirmarPasswordInput.value;

  if (password !== confirmarPassword) {
    mensajeNoCoinciden.style.display = 'block';
    confirmarPasswordInput.classList.add('campo-error');
    return false;
  } else {
    mensajeNoCoinciden.style.display = 'none';
    confirmarPasswordInput.classList.remove('campo-error');
    return true;
  }
}

// Valido un campo individual del formulario.
function validarCampo(campo, errorId, validacionFn) {
  const valorCampo = campo.value.trim();
  const mensajeErrorElemento = document.getElementById(errorId);

  if (!validacionFn(valorCampo)) {
    campo.classList.add('campo-error');
    if (mensajeErrorElemento) mensajeErrorElemento.style.display = 'block';
    return false;
  } else {
    campo.classList.remove('campo-error');
    if (mensajeErrorElemento) mensajeErrorElemento.style.display = 'none';
    return true;
  }
}

// Valido si el email tiene un formato correcto.
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Envío los datos del usuario al backend.
async function enviarDatosAlBackend(datosUsuario) {
  try {
    const respuesta = await fetch(API_URL_REGISTRO, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosUsuario)
    });

    let data = {};
    try {
      if (respuesta.status !== 204) { // Solo parseo si hay contenido
        data = await respuesta.json();
      }
    } catch (e) {
      console.warn("Respuesta no es JSON o está vacía.", respuesta.status, e);
      if (!respuesta.ok) {
        const errorText = await respuesta.text().catch(() => `Error ${respuesta.status}`);
        data = { errorInterno: true, mensaje: errorText };
      } else {
        data = {};
      }
    }

    console.log("Respuesta backend:", respuesta.status, data);

    if (respuesta.ok) {
      return {
        exito: true,
        mensaje: data.mensaje || 'Registro exitoso',
        datos: data
      };
    } else {
      return {
        exito: false,
        mensaje: data.mensaje || data.error || data.detail || `Error en el registro (${respuesta.status})`,
        errores: data.errores
      };
    }
  } catch (error) {
    console.error('Error en fetch:', error);
    return {
      exito: false,
      mensaje: 'Error de conexión con el servidor.'
    };
  }
}

// Muestro los errores específicos que devuelve el backend.
function mostrarErroresDelBackend(errores) {
    limpiarTodosLosErrores();
    for (const campo in errores) {
        const elementoCampo = formulario.elements[campo];
        const mensajeError = Array.isArray(errores[campo]) ? errores[campo].join(' ') : errores[campo];

        if (elementoCampo) {
            elementoCampo.classList.add('campo-error');
            let errorId;
            if (campo === 'confirmar_password') {
                 errorId = 'errorConfirmarPassword';
            } else {
                 const nombreCampoCapitalizado = campo.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
                 errorId = 'error' + nombreCampoCapitalizado.charAt(0).toUpperCase() + nombreCampoCapitalizado.slice(1);
            }
            const mensajeErrorElemento = document.getElementById(errorId);
            if (mensajeErrorElemento) {
                mensajeErrorElemento.textContent = mensajeError;
                mensajeErrorElemento.style.display = 'block';
            } else {
                console.warn(`No encontré elemento de error ID: ${errorId} para campo ${campo}`);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'mensaje-error fallback-error';
                errorDiv.style.cssText = 'color: red; font-size: 12px;';
                errorDiv.textContent = mensajeError;
                elementoCampo.parentNode.insertBefore(errorDiv, elementoCampo.nextSibling);
            }
        } else {
             console.warn(`Error no asociado a campo: ${campo} - ${mensajeError}`);
             mostrarErrorGeneral(mensajeError);
        }
    }
}

// Limpio todos los mensajes de error del formulario.
function limpiarTodosLosErrores() {
    formulario.querySelectorAll('.campo-error').forEach(el => el.classList.remove('campo-error'));
    formulario.querySelectorAll('.mensaje-error').forEach(el => {
        if (!el.id || el.id !== 'mensajeNoCoinciden') {
            el.style.display = 'none';
            el.textContent = '';
        }
    });
    formulario.querySelectorAll('.fallback-error, .general-error-message').forEach(el => el.remove());
}

// Muestro un error general arriba del formulario.
function mostrarErrorGeneral(mensaje) {
     if (formulario.querySelector('.general-error-message')) return; // Evito duplicados
     const mensajeErrorGeneral = document.createElement('div');
     mensajeErrorGeneral.className = 'mensaje-error general-error-message';
     mensajeErrorGeneral.textContent = mensaje;
     mensajeErrorGeneral.style.cssText = 'color: red; background-color: rgba(255, 0, 0, 0.1); border: 1px solid red; padding: 10px; border-radius: 5px; margin-bottom: 15px; text-align: center;';
     formulario.prepend(mensajeErrorGeneral);
     setTimeout(() => { mensajeErrorGeneral.remove(); }, 7000);
}

// Manejo el envío (submit) del formulario.
formulario.addEventListener('submit', async function(evento) {
  evento.preventDefault();
  limpiarTodosLosErrores();

  // Valido todos los campos del frontend primero.
  const esValido = [
    validarCampo(formulario.elements['nombre'], 'errorNombre', v => v.length > 0),
    validarCampo(formulario.elements['apellido'], 'errorApellido', v => v.length > 0),
    validarCampo(formulario.elements['tipo_documento'], 'errorTipoDocumento', v => v !== ""),
    validarCampo(formulario.elements['numero_documento'], 'errorNumeroDocumento', v => v.length > 5),
    validarCampo(formulario.elements['email'], 'errorEmail', validarEmail),
    validarCampo(formulario.elements['password'], 'errorPassword', v => v.length >= 8),
    verificarContraseñas()
  ].every(v => v === true);

  if (esValido) {
    // Si pasa validación frontend, preparo los datos.
    const datosUsuario = {
      nombre: formulario.elements['nombre'].value.trim(),
      apellido: formulario.elements['apellido'].value.trim(),
      tipo_documento: formulario.elements['tipo_documento'].value,
      numero_documento: formulario.elements['numero_documento'].value.trim(),
      email: formulario.elements['email'].value.trim(),
      password: formulario.elements['password'].value
    };

    const btnRegistro = formulario.querySelector('.btn-registrarse');
    const textoOriginalBtn = btnRegistro.textContent;
    btnRegistro.textContent = 'Registrando...';
    btnRegistro.disabled = true;

    // Envío al backend.
    const resultado = await enviarDatosAlBackend(datosUsuario);

    btnRegistro.textContent = textoOriginalBtn;
    btnRegistro.disabled = false;

    if (resultado.exito) {
      mensajeExito.textContent = resultado.mensaje || '¡Registro exitoso! Redirigiendo...';
      mensajeExito.style.display = 'block';
      // Redirijo al login (asegúrate que '/login/' exista en tus urls.py).
      const urlRedireccion = resultado.datos?.urlRedireccion || '/login/';
      setTimeout(() => { window.location.href = urlRedireccion; }, 2500);
    } else {
      // Muestro errores del backend.
      if (resultado.errores) {
        mostrarErroresDelBackend(resultado.errores);
      }
      mostrarErrorGeneral(resultado.mensaje || 'Ocurrió un error durante el registro.');
    }
  } else {
      console.log("Validación frontend falló.");
      mostrarErrorGeneral("Por favor, revisa los campos marcados.");
  }
});

// --- Validaciones en tiempo real ---

document.getElementById('confirmarPassword').addEventListener('input', verificarContraseñas);
document.getElementById('password').addEventListener('input', function() {
  validarCampo(this, 'errorPassword', valor => valor.length >= 8);
});
document.getElementById('email').addEventListener('input', function() {
  validarCampo(this, 'errorEmail', validarEmail);
});

// Limpio errores al interactuar con un campo.
Object.values(formulario.elements).forEach(campo => {
    campo.addEventListener('input', function() {
        let errorId = '';
        if (this.name === 'confirmarPassword') { errorId = 'errorConfirmarPassword'; }
        else if (this.name) {
             const nombreCampoCapitalizado = this.name.replace(/_([a-z])/g, (_, p1) => p1.toUpperCase());
             errorId = 'error' + nombreCampoCapitalizado.charAt(0).toUpperCase() + nombreCampoCapitalizado.slice(1);
        }
        const mensajeErrorElemento = document.getElementById(errorId);
        if (mensajeErrorElemento && mensajeErrorElemento.style.display !== 'none') {
             this.classList.remove('campo-error');
             mensajeErrorElemento.style.display = 'none';
             mensajeErrorElemento.textContent = '';
        }
         const fallbackError = this.parentNode.querySelector('.fallback-error');
         if (fallbackError) { fallbackError.remove(); this.classList.remove('campo-error'); }
         const generalError = formulario.querySelector('.general-error-message');
         if (generalError) { generalError.remove(); }
         if (this.id === 'confirmarPassword') { mensajeNoCoinciden.style.display = 'none'; }
    });
});
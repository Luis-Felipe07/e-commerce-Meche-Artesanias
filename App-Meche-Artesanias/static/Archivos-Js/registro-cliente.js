// Referencias al formulario y elementos de mensajes
const formulario = document.getElementById('formularioRegistro');
const mensajeExito = document.getElementById('mensajeExito');
const mensajeNoCoinciden = document.getElementById('mensajeNoCoinciden');

// URL de la API de registro
const API_URL_REGISTRO = 'http://127.0.0.1:8000/api/registrar-usuario/';

// Verifica si las contraseñas coinciden
function verificarContraseñas() {
  const password = document.getElementById('password').value;
  const confirmarPassword = document.getElementById('confirmarPassword').value;

  if (password !== confirmarPassword) {
    mensajeNoCoinciden.style.display = 'block';
    document.getElementById('confirmarPassword').classList.add('campo-error');
    return false;
  } else {
    mensajeNoCoinciden.style.display = 'none';
    document.getElementById('confirmarPassword').classList.remove('campo-error');
    return true;
  }
}

// Valida un campo del formulario
function validarCampo(campo, errorId, validacion) {
  const valorCampo = campo.value.trim();
  const mensajeError = document.getElementById(errorId);

  if (!validacion(valorCampo)) {
    campo.classList.add('campo-error');
    mensajeError.style.display = 'block';
    return false;
  } else {
    campo.classList.remove('campo-error');
    mensajeError.style.display = 'none';
    return true;
  }
}

// Valida formato de email
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Envía los datos al backend
async function enviarDatosAlBackend(datosUsuario) {
  try {
    const respuesta = await fetch(API_URL_REGISTRO, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value, // si usas CSRF
      },
      body: JSON.stringify(datosUsuario)
    });

    const data = await respuesta.json();

    if (respuesta.ok) {
      return {
        exito: true,
        mensaje: data.mensaje || 'Registro exitoso',
        datos: data
      };
    } else {
      return {
        exito: false,
        mensaje: data.mensaje || 'Error en el registro',
        errores: data.errores
      };
    }
  } catch (error) {
    console.error('Error de conexión con el servidor:', error);
    return {
      exito: false,
      mensaje: 'No se pudo conectar al servidor'
    };
  }
}

// Muestra los errores que devuelve el backend
function mostrarErroresDelBackend(errores) {
  for (const campo in errores) {
    const mensajeError = errores[campo];
    const elementoCampo = document.getElementById(campo);

    if (elementoCampo) {
      elementoCampo.classList.add('campo-error');

      const errorId = 'error' + campo.charAt(0).toUpperCase() + campo.slice(1);
      const mensajeErrorElement = document.getElementById(errorId);

      if (mensajeErrorElement) {
        mensajeErrorElement.textContent = mensajeError;
        mensajeErrorElement.style.display = 'block';
      }
    }
  }
}

// Manejador de envío del formulario
formulario.addEventListener('submit', async function(evento) {
  evento.preventDefault();

  // Validaciones
  const nombreValido = validarCampo(
    document.getElementById('nombre'),
    'errorNombre',
    valor => valor.length > 0
  );

  const apellidoValido = validarCampo(
    document.getElementById('apellido'),
    'errorApellido',
    valor => valor.length > 0
  );

  const tipoDocumentoValido = validarCampo(
    document.getElementById('tipoDocumento'),
    'errorTipoDocumento',
    valor => valor !== ""
  );

  const numeroDocumentoValido = validarCampo(
    document.getElementById('numeroDocumento'),
    'errorNumeroDocumento',
    valor => valor.length > 5
  );

  const emailValido = validarCampo(
    document.getElementById('email'),
    'errorEmail',
    validarEmail
  );

  const passwordValido = validarCampo(
    document.getElementById('password'),
    'errorPassword',
    valor => valor.length >= 8
  );

  const contraseñasCoinciden = verificarContraseñas();

  if (nombreValido && apellidoValido && tipoDocumentoValido &&
      numeroDocumentoValido && emailValido && passwordValido && contraseñasCoinciden) {

    const datosUsuario = {
      nombre: document.getElementById('nombre').value.trim(),
      apellido: document.getElementById('apellido').value.trim(),
      tipo_documento: document.getElementById('tipoDocumento').value,
      numero_documento: document.getElementById('numeroDocumento').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value
    };

    // Cambio botón a "Registrando..."
    const btnRegistro = document.querySelector('.btn-registrarse');
    const textoOriginal = btnRegistro.textContent;
    btnRegistro.textContent = 'Registrando...';
    btnRegistro.disabled = true;

    const resultado = await enviarDatosAlBackend(datosUsuario);

    // Restaurar botón
    btnRegistro.textContent = textoOriginal;
    btnRegistro.disabled = false;

    if (resultado.exito) {
      mensajeExito.textContent = resultado.mensaje || '¡Registro exitoso! Redirigiendo...';
      mensajeExito.style.display = 'block';

      const urlRedireccion = resultado.datos?.urlRedireccion || 'index-login.html';
      setTimeout(() => {
        window.location.href = urlRedireccion;
      }, 3000);
    } else {
      if (resultado.errores) {
        mostrarErroresDelBackend(resultado.errores);
      } else {
        mostrarErrorGeneral(resultado.mensaje);
      }
    }
  }
});

// Muestra un error general arriba del formulario
function mostrarErrorGeneral(mensaje) {
  const mensajeErrorGeneral = document.createElement('div');
  mensajeErrorGeneral.className = 'mensaje-error general';
  mensajeErrorGeneral.textContent = mensaje;
  mensajeErrorGeneral.style.color = 'red';
  mensajeErrorGeneral.style.marginBottom = '15px';
  formulario.prepend(mensajeErrorGeneral);

  setTimeout(() => {
    mensajeErrorGeneral.remove();
  }, 5000);
}

// Validaciones en tiempo real
document.getElementById('confirmarPassword').addEventListener('input', verificarContraseñas);

document.getElementById('password').addEventListener('input', function() {
  validarCampo(this, 'errorPassword', valor => valor.length >= 8);
});

document.getElementById('email').addEventListener('input', function() {
  validarCampo(this, 'errorEmail', validarEmail);
});

// Limpia errores al enfocarse en un campo
document.querySelectorAll('input, select').forEach(campo => {
  campo.addEventListener('focus', function() {
    this.classList.remove('campo-error');
    const errorId = 'error' + this.id.charAt(0).toUpperCase() + this.id.slice(1);
    const mensajeError = document.getElementById(errorId);
    if (mensajeError) {
      mensajeError.style.display = 'none';
    }
  });
});

// Verifica conexión con el backend (opcional

// Obtengo referencia al formulario y a los elementos que voy a manipular
const formulario = document.getElementById('formularioRegistro');
const mensajeExito = document.getElementById('mensajeExito');
const mensajeNoCoinciden = document.getElementById('mensajeNoCoinciden');

// Esta función comprueba si las contraseñas coinciden
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

// Esta función valida un campo específico del formulario
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

// Valido el correo electrónico con una expresión regular
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Manejador de evento para validar el formulario completo
formulario.addEventListener('submit', function(evento) {
  evento.preventDefault(); // Evito que el formulario se envíe automáticamente
  
  // Valido cada campo del formulario
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
  
  // Verifico si las contraseñas coinciden
  const contraseñasCoinciden = verificarContraseñas();
  
  // Si todo es válido, procedo con el registro
  if (nombreValido && apellidoValido && tipoDocumentoValido && 
      numeroDocumentoValido && emailValido && passwordValido && contraseñasCoinciden) {
    
    // Aquí simulo el envío del formulario y muestro mensaje de éxito
    mensajeExito.style.display = 'block';
    
    // Después de un tiempo, redirijo al usuario a la página de login
    setTimeout(() => {
      window.location.href = 'index-login.html';
    }, 3000); // Redirijo después de 3 segundos
  }
});

// Añado validación en tiempo real cuando el usuario cambia entre campos
document.getElementById('confirmarPassword').addEventListener('input', verificarContraseñas);

// También puedo agregar validaciones en tiempo real para otros campos
document.getElementById('password').addEventListener('input', function() {
  validarCampo(
    this, 
    'errorPassword', 
    valor => valor.length >= 8
  );
});

document.getElementById('email').addEventListener('input', function() {
  validarCampo(
    this,
    'errorEmail',
    validarEmail
  );
});

// Limpio los mensajes de error cuando el usuario comienza a escribir en un campo
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('focus', function() {
    this.classList.remove('campo-error');
    const errorId = 'error' + this.id.charAt(0).toUpperCase() + this.id.slice(1);
    const mensajeError = document.getElementById(errorId);
    if (mensajeError) {
      mensajeError.style.display = 'none';
    }
  });
});
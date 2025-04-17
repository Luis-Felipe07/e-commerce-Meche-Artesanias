// Obtengo referencia al formulario y a los elementos que voy a manipular
const formulario = document.getElementById('formularioRegistro');
const mensajeExito = document.getElementById('mensajeExito');
const mensajeNoCoinciden = document.getElementById('mensajeNoCoinciden');

// URL para la API de registro
// Compañero en el backend Debe crear un endpoint para el registro de usuarios en  Django
// Por ejemplo: '/api/registrar-usuario/' o similar
const API_URL_REGISTRO = 'http://127.0.0.1:8000/api/registrar-usuario/';

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

// Función para enviar los datos al backend
// Compañero  Esta función hará la petición POST a el endpoint de registro
async function enviarDatosAlBackend(datosUsuario) {
  try {
    // Compañero Verifique que su endpoint acepte peticiones POST y que reciba estos campos
    const respuesta = await fetch(API_URL_REGISTRO, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Compañero Si en el backend usa CSRF en Django, necesitará incluir el token aquí
        // 'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
      },
      body: JSON.stringify(datosUsuario)
    });
     
    const data = await respuesta.json();
    console.log(data);
    
    // Compañero Asegúrese de devolver códigos de estado apropiados y un JSON con mensajes claros
    if (respuesta.ok) {
      const datos = await respuesta.json();
      return { 
        exito: true, 
        mensaje: datos.mensaje || 'Registro exitoso',
        datos: datos
      };
    } else {
      // Si el servidor responde con un error (ej. 400, 500)
      const errorData = await respuesta.json();
      return { 
        exito: false, 
        mensaje: errorData.mensaje || 'Error en el registro',
        errores: errorData.errores
      };
    }
  } catch (error) {
    console.error('Error al enviar datos:', error);
    return { 
      exito: false, 
      mensaje: 'Error de conexión con el servidor'
    };
  }
}

// Función para mostrar errores devueltos por el backend
// Compañero  la API debería devolver errores en formato JSON con el campo específico que falló
function mostrarErroresDelBackend(errores) {
  
  for (const campo in errores) {
    const mensajeError = errores[campo];
    const elementoCampo = document.getElementById(campo);
    
    if (elementoCampo) {
      elementoCampo.classList.add('campo-error');
      
      // Intento encontrar el elemento de mensaje de error para este campo
      const errorId = 'error' + campo.charAt(0).toUpperCase() + campo.slice(1);
      const mensajeErrorElement = document.getElementById(errorId);
      
      if (mensajeErrorElement) {
        mensajeErrorElement.textContent = mensajeError;
        mensajeErrorElement.style.display = 'block';
      }
    }
  }
}

// Manejador de evento para validar el formulario completo
formulario.addEventListener('submit', async function(evento) {
  evento.preventDefault(); 
  
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
    
    // Preparo los datos para enviar al backend
    // Compañero Estos son los campos que enviaremos desde el frontend, asegúrate de procesarlos correctamente
    const datosUsuario = {
      nombre: document.getElementById('nombre').value.trim(),
      apellido: document.getElementById('apellido').value.trim(),
      tipo_documento: document.getElementById('tipoDocumento').value,
      numero_documento: document.getElementById('numeroDocumento').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value
      
      // No envío confirmarPassword porque ya validé que coincide con password
    };
    
    // Muestro algún indicador de carga 
    const btnRegistro = document.querySelector('.btn-registrarse');
    const textoOriginal = btnRegistro.textContent;
    btnRegistro.textContent = 'Registrando...';
    btnRegistro.disabled = true;
    
    // Envío los datos al backend
    const resultado = await enviarDatosAlBackend(datosUsuario);
    
    // Restauro el botón
    btnRegistro.textContent = textoOriginal;
    btnRegistro.disabled = false;
    
    if (resultado.exito) {
      // Si el registro fue exitoso
      mensajeExito.textContent = resultado.mensaje || '¡Registro exitoso! Redirigiendo al inicio de sesión...';
      mensajeExito.style.display = 'block';
      
      // Compañero en el backend Se debe redirigir a otra URL la del login después del registro, puedes devolverla en el JSON
      const urlRedireccion = resultado.datos?.urlRedireccion || 'index-login.html';
      
      // Después de un tiempo, redirijo al usuario a la página de login
      setTimeout(() => {
        window.location.href = urlRedireccion;
      }, 3000); // Redirijo después de 3 segundos
    } else {
      // Si hubo errores en el backend
      if (resultado.errores) {
        // Si el backend devolvió errores específicos para campos
        mostrarErroresDelBackend(resultado.errores);
      } else {
        // Si es un error general
        // Compañero en el backend Cree un div para errores generales en el HTML si no existe
        const mensajeErrorGeneral = document.createElement('div');
        mensajeErrorGeneral.className = 'mensaje-error general';
        mensajeErrorGeneral.textContent = resultado.mensaje;
        mensajeErrorGeneral.style.color = 'red';
        mensajeErrorGeneral.style.marginBottom = '15px';
        formulario.prepend(mensajeErrorGeneral);
        
        // Lo elimino después de 5 segundos
        setTimeout(() => {
          mensajeErrorGeneral.remove();
        }, 5000);
      }
    }
  }
});

// Añado validación en tiempo real cuando el usuario cambia entre campos
document.getElementById('confirmarPassword').addEventListener('input', verificarContraseñas);

// También  agrego validaciones en tiempo real para otros campos
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

// Verifico la conexión con el backend al cargar la página (opcional)
// Compañero aqui debe Crear un endpoint simple para verificar que la API está disponible
async function verificarConexion() {
  try {
    const respuesta = await fetch('/api/status/');
    if (respuesta.ok) {
      console.log('Conexión con el backend establecida correctamente');
    } else {
      console.error('El backend está disponible pero devolvió un error');
    }
  } catch (error) {
    console.error('No se puede conectar con el backend:', error);
  }
}

// Descomentar esta línea si quieres verificar la conexión al cargar la página
// window.addEventListener('load', verificarConexion);
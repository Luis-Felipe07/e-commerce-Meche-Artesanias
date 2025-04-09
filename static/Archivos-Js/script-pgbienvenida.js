// Variables para elementos del DOM
const buscador = document.getElementById('buscar');
const btnCerrarBusqueda = document.getElementById('cerrarBusqueda');
const formularioContacto = document.getElementById('formularioContacto');
const enlacesNavegacion = document.querySelectorAll('.navegacion a');
const btnCarrito = document.querySelector('.carrito a');
const btnsAgregarCarrito = document.querySelectorAll('.btn-secundario');

// Función para mostrar mensajes de alerta personalizados
function mostrarAlerta(mensaje, tipo = 'info') {
    // Crear elemento de alerta
    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo}`;
    alerta.textContent = mensaje;
    
    // Añadir alerta al DOM
    document.body.appendChild(alerta);
    
    // Mostrar la alerta con animación
    setTimeout(() => {
        alerta.classList.add('mostrar');
    }, 10);
    
    // Eliminar la alerta después de 3 segundos
    setTimeout(() => {
        alerta.classList.remove('mostrar');
        setTimeout(() => {
            document.body.removeChild(alerta);
        }, 300);
    }, 3000);
}

// Manejo del buscador
if (buscador) {
    buscador.addEventListener('focus', () => {
        btnCerrarBusqueda.style.display = 'block';
    });
    
    btnCerrarBusqueda.addEventListener('click', () => {
        buscador.value = '';
        btnCerrarBusqueda.style.display = 'none';
    });
    
    buscador.addEventListener('input', (e) => {
        btnCerrarBusqueda.style.display = e.target.value ? 'block' : 'none';
    });
}

// Manejo del formulario de contacto
if (formularioContacto) {
    formularioContacto.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Obtener valores del formulario
        const nombre = document.getElementById('nombre').value;
        const apellido = document.getElementById('apellido').value;
        const email = document.getElementById('email').value;
        const mensaje = document.getElementById('mensaje').value;
        
        // Validación básica (se puede ampliar según necesidades)
        if (!nombre || !apellido || !email || !mensaje) {
            mostrarAlerta('Por favor, complete todos los campos', 'error');
            return;
        }
        
        // Simulación de envío (aquí se conectaría con el backend)
        mostrarAlerta('¡Mensaje enviado correctamente! Nos pondremos en contacto pronto.', 'exito');
        
        // Limpiar formulario
        formularioContacto.reset();
    });
}

// Navegación suave al hacer clic en enlaces internos
enlacesNavegacion.forEach(enlace => {
    enlace.addEventListener('click', (e) => {
        const href = enlace.getAttribute('href');
        
        // Si es un enlace interno con ancla
        if (href.startsWith('#') && href.length > 1) {
            e.preventDefault();
            const seccionDestino = document.querySelector(href);
            
            if (seccionDestino) {
                window.scrollTo({
                    top: seccionDestino.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Manejo del carrito de compras (funcionalidad básica)
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function actualizarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    // Aquí se podría actualizar un contador en el icono del carrito
}

// Evento para botones "Agregar al carrito"
btnsAgregarCarrito.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        const producto = btn.closest('.producto');
        const nombreProducto = producto.querySelector('h3').textContent;
        const precioTexto = producto.querySelector('p').textContent;
        const precio = parseInt(precioTexto.replace(/\D/g, ''));
        const imagen = producto.querySelector('img').src;
        
        // Verificar si el producto ya está en el carrito
        const productoExistente = carrito.findIndex(item => item.nombre === nombreProducto);
        
        if (productoExistente !== -1) {
            carrito[productoExistente].cantidad += 1;
        } else {
            carrito.push({
                id: index + 1,
                nombre: nombreProducto,
                precio: precio,
                imagen: imagen,
                cantidad: 1
            });
        }
        
        actualizarCarrito();
        mostrarAlerta(`${nombreProducto} agregado al carrito`, 'exito');
    });
});

// Animación para elementos al hacer scroll
document.addEventListener('DOMContentLoaded', () => {
    const elementosAnimados = document.querySelectorAll('.producto, .beneficio, .historia-contenido, .historia-imagen');
    
    function checkScroll() {
        const triggerBottom = window.innerHeight * 0.8;
        
        elementosAnimados.forEach(elemento => {
            const elementoTop = elemento.getBoundingClientRect().top;
            
            if (elementoTop < triggerBottom) {
                elemento.classList.add('visible');
            }
        });
    }
    
    // Iniciar comprobación
    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Comprobar elementos visibles al cargar la página
});

// Menú móvil (se agregará el HTML correspondiente)
const btnMenu = document.createElement('button');
btnMenu.className = 'btn-menu-movil';
btnMenu.innerHTML = '<i class="fas fa-bars"></i>';
document.querySelector('.logo').after(btnMenu);

btnMenu.addEventListener('click', () => {
    document.querySelector('.navegacion').classList.toggle('mostrar');
});

// Agregar estilos adicionales para menú móvil
document.addEventListener('DOMContentLoaded', () => {
    // Crear una etiqueta de estilo para añadir los estilos necesarios para el menú móvil
    const estiloMovil = document.createElement('style');
    estiloMovil.textContent = `
        .btn-menu-movil {
            display: none;
            background: transparent;
            color: var(--color-claro);
            font-size: 24px;
            padding: 5px;
        }
        
        @media (max-width: 768px) {
            .btn-menu-movil {
                display: block;
                order: 2;
            }
            
            .navegacion {
                width: 100%;
                height: 0;
                overflow: hidden;
                transition: height 0.3s ease;
            }
            
            .navegacion.mostrar {
                height: auto;
            }
            
            .navegacion ul {
                flex-direction: column;
                padding: 15px 0;
            }
            
            .navegacion li {
                margin: 10px 0;
                text-align: center;
            }
        }
    `;
    document.head.appendChild(estiloMovil);
});

// Slider para productos destacados (se implementaría si hay múltiples páginas de productos)
function iniciarSlider() {
    const slider = document.querySelector('.productos-grid');
    if (!slider) return;
    
    let paginaActual = 0;
    const productosPorPagina = 4;
    const productos = slider.querySelectorAll('.producto');
    const totalPaginas = Math.ceil(productos.length / productosPorPagina);
    
    // Si hay suficientes productos para hacer un slider
    if (totalPaginas > 1) {
        // Crear controles de navegación
        const controles = document.createElement('div');
        controles.className = 'controles-slider';
        
        const btnAnterior = document.createElement('button');
        btnAnterior.className = 'btn-slider anterior';
        btnAnterior.innerHTML = '<i class="fas fa-chevron-left"></i>';
        
        const btnSiguiente = document.createElement('button');
        btnSiguiente.className = 'btn-slider siguiente';
        btnSiguiente.innerHTML = '<i class="fas fa-chevron-right"></i>';
        
        controles.appendChild(btnAnterior);
        controles.appendChild(btnSiguiente);
        
        // Insertar controles después del slider
        slider.parentNode.insertBefore(controles, slider.nextSibling);
        
        // Función para mostrar la página actual
        function mostrarPagina() {
            productos.forEach((producto, index) => {
                const inicioRango = paginaActual * productosPorPagina;
                const finRango = inicioRango + productosPorPagina;
                
                if (index >= inicioRango && index < finRango) {
                    producto.style.display = 'block';
                } else {
                    producto.style.display = 'none';
                }
            });
        }
        
        // Eventos para los botones
        btnAnterior.addEventListener('click', () => {
            paginaActual = paginaActual > 0 ? paginaActual - 1 : totalPaginas - 1;
            mostrarPagina();
        });
        
        btnSiguiente.addEventListener('click', () => {
            paginaActual = paginaActual < totalPaginas - 1 ? paginaActual + 1 : 0;
            mostrarPagina();
        });
        
        // Inicializar
        mostrarPagina();
        
        // Añadir estilos para los controles
        const estilosSlider = document.createElement('style');
        estilosSlider.textContent = `
            .controles-slider {
                display: flex;
                justify-content: center;
                margin-top: 30px;
            }
            
            .btn-slider {
                background-color: var(--color-principal);
                color: var(--color-claro);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                margin: 0 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.3s ease;
            }
            
            .btn-slider:hover {
                background-color: var(--color-secundario);
            }
        `;
        document.head.appendChild(estilosSlider);
    }
}

// Validación en tiempo real para el formulario
if (formularioContacto) {
    const campos = formularioContacto.querySelectorAll('input, textarea');
    
    campos.forEach(campo => {
        campo.addEventListener('blur', () => {
            validarCampo(campo);
        });
    });
    
    function validarCampo(campo) {
        if (!campo.value.trim()) {
            marcarError(campo, 'Este campo es obligatorio');
            return false;
        }
        
        // Validación específica para email
        if (campo.id === 'email') {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regex.test(campo.value)) {
                marcarError(campo, 'Por favor, introduce un email válido');
                return false;
            }
        }
        
        // Si pasa todas las validaciones
        limpiarError(campo);
        return true;
    }
    
    function marcarError(campo, mensaje) {
        // Eliminar mensajes anteriores
        limpiarError(campo);
        
        // Añadir clase de error
        campo.classList.add('campo-error');
        
        // Crear mensaje de error
        const mensajeError = document.createElement('div');
        mensajeError.className = 'mensaje-error';
        mensajeError.textContent = mensaje;
        
        // Insertar mensaje después del campo
        campo.parentNode.appendChild(mensajeError);
    }
    
    function limpiarError(campo) {
        campo.classList.remove('campo-error');
        const mensajeError = campo.parentNode.querySelector('.mensaje-error');
        if (mensajeError) {
            campo.parentNode.removeChild(mensajeError);
        }
    }
    
    // Añadir estilos para mensajes de error
    const estilosError = document.createElement('style');
    estilosError.textContent = `
        .campo-error {
            border-color: #dc3545 !important;
        }
        
        .mensaje-error {
            color: #dc3545;
            font-size: 14px;
            margin-top: 5px;
        }
    `;
    document.head.appendChild(estilosError);
}

// Función para mostrar/alternar información sobre cuidado de mochilas
function configurarInfoCuidado() {
    const enlaceCuidado = document.querySelector('a[href*="Cuidar"]');
    if (!enlaceCuidado) return;
    
    enlaceCuidado.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Verificar si ya existe el modal
        let modalCuidado = document.getElementById('modal-cuidado');
        
        if (!modalCuidado) {
            // Crear el modal
            modalCuidado = document.createElement('div');
            modalCuidado.id = 'modal-cuidado';
            modalCuidado.className = 'modal';
            
            // Contenido del modal
            modalCuidado.innerHTML = `
                <div class="modal-contenido">
                    <span class="cerrar-modal">&times;</span>
                    <h2>Cómo Cuidar tu Mochila Artesanal</h2>
                    <ul>
                        <li><strong>Lavado:</strong> Lavar a mano con agua fría y jabón neutro.</li>
                        <li><strong>Secado:</strong> Secar a la sombra para mantener los colores vivos.</li>
                        <li><strong>Almacenamiento:</strong> Guardar en un lugar seco y limpio.</li>
                        <li><strong>Manchas:</strong> Tratar inmediatamente con jabón neutro.</li>
                        <li><strong>Evitar:</strong> No usar secadora ni plancha directamente.</li>
                    </ul>
                    <p>Cada mochila es única y ha sido tejida a mano con materiales naturales. Siguiendo estos consejos, tu mochila te acompañará por muchos años.</p>
                </div>
            `;
            
            document.body.appendChild(modalCuidado);
            
            // Añadir estilos para el modal
            const estilosModal = document.createElement('style');
            estilosModal.textContent = `
                .modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    z-index: 1000;
                    align-items: center;
                    justify-content: center;
                }
                
                .modal.mostrar {
                    display: flex;
                }
                
                .modal-contenido {
                    background-color: var(--color-claro);
                    padding: 30px;
                    border-radius: 10px;
                    max-width: 600px;
                    width: 90%;
                    position: relative;
                    animation: aparecer 0.3s ease;
                }
                
                @keyframes aparecer {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .cerrar-modal {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    font-size: 24px;
                    cursor: pointer;
                }
                
                .modal-contenido h2 {
                    color: var(--color-principal);
                    margin-bottom: 20px;
                }
                
                .modal-contenido ul {
                    margin-bottom: 20px;
                }
                
                .modal-contenido li {
                    margin-bottom: 10px;
                    list-style: disc;
                    margin-left: 20px;
                }
            `;
            document.head.appendChild(estilosModal);
            
            // Evento para cerrar el modal
            modalCuidado.querySelector('.cerrar-modal').addEventListener('click', () => {
                modalCuidado.classList.remove('mostrar');
            });
            
            // Cerrar modal al hacer clic fuera
            modalCuidado.addEventListener('click', (e) => {
                if (e.target === modalCuidado) {
                    modalCuidado.classList.remove('mostrar');
                }
            });
        }
        
        // Mostrar el modal
        modalCuidado.classList.add('mostrar');
    });
}

// Código para la sección de Comentarios y calificación con estrellas
document.addEventListener('DOMContentLoaded', () => {
  const estrellas = document.querySelectorAll('.estrella');
  const textareaComentario = document.getElementById('comentario');
  const btnEnviarComentario = document.getElementById('enviarComentario');
  const listaComentarios = document.querySelector('.lista-comentarios');
  
  let calificacionSeleccionada = 0;

  // Función para actualizar visualmente las estrellas
  function actualizarEstrellas(valor) {
    estrellas.forEach(estrella => {
      const estrellaValor = parseInt(estrella.getAttribute('data-valor'));
      if (estrellaValor <= valor) {
        estrella.classList.add('seleccionada');
      } else {
        estrella.classList.remove('seleccionada');
      }
    });
  }

  // Agregar evento click a cada estrella para seleccionar la calificación
  estrellas.forEach(estrella => {
    estrella.addEventListener('click', () => {
      calificacionSeleccionada = parseInt(estrella.getAttribute('data-valor'));
      actualizarEstrellas(calificacionSeleccionada);
    });
  });

  // Evento para enviar comentario
  btnEnviarComentario.addEventListener('click', () => {
    const comentarioTexto = textareaComentario.value.trim();
    
    if (calificacionSeleccionada === 0) {
      mostrarAlerta('Por favor, selecciona una calificación', 'error');
      return;
    }
    
    if (comentarioTexto === '') {
      mostrarAlerta('Escribe tu comentario', 'error');
      return;
    }
    
    // Crear el elemento del comentario
    const comentarioItem = document.createElement('div');
    comentarioItem.className = 'comentario-item';
    
    // Se muestra la calificación (estrellas llenas y vacías) y el comentario
    comentarioItem.innerHTML = `
      <div class="calificacion">
        ${'&#9733;'.repeat(calificacionSeleccionada)}${'&#9734;'.repeat(5 - calificacionSeleccionada)}
      </div>
      <p>${comentarioTexto}</p>
    `;
    
    // Agregar el comentario a la lista (al inicio)
    listaComentarios.prepend(comentarioItem);
    
    // Limpiar campos
    calificacionSeleccionada = 0;
    actualizarEstrellas(0);
    textareaComentario.value = '';
    
    mostrarAlerta('¡Comentario enviado!', 'exito');
  });
});

// Llamar a las funciones cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    iniciarSlider();
    configurarInfoCuidado();
    
    // Inicializar animaciones para las alertas
    const estilosAlerta = document.createElement('style');
    estilosAlerta.textContent = `
        .alerta {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 5px;
            color: white;
            z-index: 1000;
            transform: translateX(110%);
            transition: transform 0.3s ease;
        }
        
        .alerta.mostrar {
            transform: translateX(0);
        }
        
        .alerta-info {
            background-color: #17a2b8;
        }
        
        .alerta-exito {
            background-color: #28a745;
        }
        
        .alerta-error {
            background-color: #dc3545;
        }
    `;
    document.head.appendChild(estilosAlerta);
});

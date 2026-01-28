
// 1. Variables de estado
let intentosFallidos = 0;
const PIN_CORRECTO = "1851"; 

// 2. Función principal: Verificar el PIN
function checkPin() {
    const input = document.getElementById('pin-input');
    const mensajeError = document.getElementById('mensaje-error');
    const pinIngresado = input.value;

    if (pinIngresado === PIN_CORRECTO) {
        // ÉXITO
        intentosFallidos = 0; 
        
        // PRIMERO generamos el QR con el pin
        generarQR(pinIngresado);
        
        // LUEGO mostramos la pantalla del QR
        mostrarPantalla('screen-form');
        
    } else {
        // ERROR
        intentosFallidos++;
        input.value = ""; 
        
        if (intentosFallidos >= 3) {
            mensajeError.innerHTML = "❌ Sistema bloqueado. Contacte al casero.";
            input.disabled = true;
            document.querySelector('.btn-primary').disabled = true;
        } else {
            mensajeError.innerHTML = `❌ PIN incorrecto. Intento ${intentosFallidos} de 3.`;
            mensajeError.style.color = "red";
        }
    }
}

// 3. Función para generar el código QR dinámicamente
function generarQR(pin) {
    // Limpiamos el contenedor por si había un QR viejo
    const contenedorQR = document.getElementById("qrcode");
    contenedorQR.innerHTML = "";

    // IMPORTANTE: Sustituye 'Alvart1' por tu nombre de usuario real de GitHub
    const urlDestino = `https://Alvart1.github.io/Seguridad-check/formulario.html?reserva=${pin}`;

    // Creamos el QR (Asegúrate de tener la librería en el <head>)
    new QRCode(contenedorQR, {
        text: urlDestino,
        width: 200,
        height: 200,
        colorDark : "#003580", // Azul Booking
        colorLight : "#ffffff"
    });
}

// 4. Función para navegar entre pantallas
function mostrarPantalla(idPantalla) {
    // Ocultamos todas
    document.getElementById('screen-lock').style.display = 'none';
    document.getElementById('screen-form').style.display = 'none';
    document.getElementById('screen-dashboard').style.display = 'none';
    
    // Mostramos la seleccionada
    document.getElementById(idPantalla).style.display = 'block';
}

// 5. Funciones para el Panel de Control (Dashboard)
function abrirCajon() {
    alert("Cajón abierto. Tienes 30 segundos para recoger las llaves.");
    // Aquí irá la conexión con tu hardware más adelante
}
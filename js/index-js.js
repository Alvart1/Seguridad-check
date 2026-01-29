function verificarYGenerar() {
    const pinCorrecto = "1851"; // Este es el PIN que has elegido
    const input = document.getElementById("pinInput").value;

    if (input === pinCorrecto) {
        generarQR(input);
    } else {
        alert("PIN incorrecto. Por favor, inténtelo de nuevo.");
        document.getElementById("pinInput").value = ""; // Limpia el cuadro si falla
    }
}

function generarQR(pin) {
    const contenedorQR = document.getElementById("qrcode");
    
    // Limpiamos el contenedor por si ya había un QR generado antes
    contenedorQR.innerHTML = "";

    // IMPORTANTE: Esta es la URL de tu formulario en GitHub Pages
    // Al estar todos los HTML en la raíz, la ruta es directa
    const urlDestino = `https://alvart1.github.io/Seguridad-check/formulario.html?reserva=${pin}`;

    // Generamos el código QR usando la librería que pusimos en el HTML
    new QRCode(contenedorQR, {
        text: urlDestino,
        width: 256,
        height: 256,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    // Opcional: Ocultar el botón y el input tras generar el QR para que se vea limpio
    document.getElementById("pinInput").style.display = "none";
    document.querySelector("button").style.display = "none";
}
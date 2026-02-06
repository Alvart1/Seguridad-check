function verificarYGenerar() {
    const pinCorrecto = "1234"; // Define aquí tu PIN
    const urlDestino = "https://alvart1.github.io/Seguridad-check/formulario.html";
    
    const input = document.getElementById("pinInput");
    const inicio = document.getElementById("pantalla-inicio");
    const resultado = document.getElementById("pantalla-resultado");
    const contenedorQR = document.getElementById("qrcode");

    if (input.value === pinCorrecto) {
        // 1. Limpiar el QR anterior si existiera
        contenedorQR.innerHTML = "";

        // 2. Generar el QR
        new QRCode(contenedorQR, {
            text: urlDestino,
            width: 250,
            height: 250,
            colorDark : "#000000",
            colorLight : "#ffffff"
        });

        // 3. Intercambio de pantallas
        inicio.style.display = "none";
        resultado.style.display = "flex";
    } else {
        alert("PIN INCORRECTO");
        input.value = "";
    }
}
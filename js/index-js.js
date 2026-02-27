/**
 * Lóxica para a Interface de Bloqueo (index.html)
 */
let clicsSecretos = 0;
document.querySelector(".titulo h1").onclick = function() {
    clicsSecretos++;
    if (clicsSecretos === 5) {
        const pass = prompt("Acceso Restringido. Introduce la clave maestra:");
        if (pass === "abc123.") { 
            window.location.href = "panel-propietario.html";
        } else {
            alert("Acceso denegado");
            clicsSecretos = 0;
        }
    }
    setTimeout(() => { clicsSecretos = 0; }, 3000);
};

let tempoInactividade; 

function verificarYGenerar() {
    const pinCorrecto = "1234"; 
    // Esta é a URL que o cliente verá no seu móbil ao escanear
    const urlDestino = "https://alvart1.github.io/Seguridad-check/formulario.html?auth=ok";
    
    const input = document.getElementById("pinInput");
    const inicio = document.getElementById("pantalla-inicio");
    const resultado = document.getElementById("pantalla-resultado");
    const contenedorQR = document.getElementById("qrcode");

    if (input.value === pinCorrecto) {
        // Se acertamos o PIN, limpamos o rastro de "xa rexistrado" para novos clientes
        sessionStorage.setItem('tablet_desbloqueada', 'true');

        // Limpamos o contido anterior do QR para que non se amontonen
        contenedorQR.innerHTML = ""; 

        // Xerar o QR
        new QRCode(contenedorQR, {
            text: urlDestino,
            width: 250,
            height: 250,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });

        // CAMBIO DE PANTALLA: Aquí é onde se pon azul se o CSS así o di
        inicio.style.display = "none";
        resultado.style.display = "flex"; 
        
        // Se tes un enlace de texto debaixo do QR, actualizámolo
        const enlaceEscrito = document.querySelector(".enlace-secreto");
        if (enlaceEscrito) {
            enlaceEscrito.href = urlDestino;
        }
        
        resetTimer();
    } else {
        alert("PIN INCORRECTO");
        input.value = "";
    }
}

function resetTimer() {
    clearTimeout(tempoInactividade);
    const pantallaResultado = document.getElementById("pantalla-resultado");
    if (pantallaResultado && pantallaResultado.style.display === "flex") {
        tempoInactividade = setTimeout(() => {
            window.location.reload(); 
        }, 300000); // 5 minutos
    }
}

// Interaccións para que a tablet non se apague mentres se usa
document.onmousemove = resetTimer;
document.ontouchstart = resetTimer;
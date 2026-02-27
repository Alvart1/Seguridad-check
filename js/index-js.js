/**
 * Lóxica para a Interface de Bloqueo (index.html)
 */
let clicsSecretos = 0;
document.querySelector(".titulo h1").onclick = function() {
    clicsSecretos++;
    if (clicsSecretos === 5) {
        const pass = prompt("Acceso Restringido. Introduce la clave maestra:");
        if (pass === "abc123.") { // Cambia esta clave a tu gusto
            window.location.href = "panel-propietario.html";
        } else {
            alert("Acceso denegado");
            clicsSecretos = 0;
        }
    }
    // Reiniciar contador si no completa los 5 clics en 3 segundos
    setTimeout(() => { clicsSecretos = 0; }, 3000);
};
let tempoInactividade; // Declaramos fóra para que sexa global

function verificarYGenerar() {
    const pinCorrecto = "1234"; 
    // Añadimos un parámetro a la URL para que el formulario sepa que viene del QR
    const urlDestino = "https://alvart1.github.io/Seguridad-check/formulario.html?auth=ok";
    
    const input = document.getElementById("pinInput");
    const inicio = document.getElementById("pantalla-inicio");
    const resultado = document.getElementById("pantalla-resultado");
    const contenedorQR = document.getElementById("qrcode");

    if (input.value === pinCorrecto) {
        clearTimeout(tempoInactividade);
        sessionStorage.setItem('tablet_desbloqueada', 'true');

        const xaRexistrado = localStorage.getItem('hospede_rexistrado');

        if (xaRexistrado === 'true') {
            window.location.replace("acceso-llaves.html"); 
        } else {
            contenedorQR.innerHTML = ""; 
            new QRCode(contenedorQR, {
                text: urlDestino, // Ahora el QR lleva el "pase VIP"
                width: 250,
                height: 250
            });

            inicio.style.display = "none";
            resultado.style.display = "flex";
            
            // Actualizamos también el enlace de texto por si acaso
            document.querySelector(".enlace-secreto").href = urlDestino;
            
            resetTimer();
        }
    } else {
        alert("PIN INCORRECTO");
        input.value = "";
    }
}

// --- XESTIÓN DE INACTIVIDADE ---
function resetTimer() {
    clearTimeout(tempoInactividade);
    
    // IMPORTANTE: Só activamos o timer se o QR está na pantalla.
    // Se o usuario acertou o PIN e estamos noutra páxina, o timer non debe facer nada.
    const pantallaResultado = document.getElementById("pantalla-resultado");
    const qrVisible = pantallaResultado && pantallaResultado.style.display === "flex";

    if (qrVisible) {
        tempoInactividade = setTimeout(() => {
            sessionStorage.removeItem('tablet_desbloqueada');
            window.location.href = "index.html";
        }, 300000); // 5 minutos
    }
}

// Escoitar interaccións
document.onmousemove = resetTimer;
document.onkeypress = resetTimer;
document.ontouchstart = resetTimer;
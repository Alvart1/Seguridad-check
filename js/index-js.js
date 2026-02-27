/**
 * Lóxica para a Interface de Bloqueo (index.html)
 */

// --- 1. ACCESO AO PANEL PROPIETARIO ---
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

// --- 2. XERACIÓN DE QR E ENLACE ---
function verificarYGenerar() {
    const pinCorrecto = "1234"; 
    const urlDestino = "https://alvart1.github.io/Seguridad-check/formulario.html?auth=ok";
    
    const input = document.getElementById("pinInput");
    const inicio = document.getElementById("pantalla-inicio");
    const resultado = document.getElementById("pantalla-resultado");
    const contenedorQR = document.getElementById("qrcode");
    const enlaceSecreto = document.querySelector(".enlace-secreto");

    if (input.value === pinCorrecto) {
        clearTimeout(tempoInactividade);
        sessionStorage.setItem('tablet_desbloqueada', 'true');

        const xaRexistrado = localStorage.getItem('hospede_rexistrado');

        if (xaRexistrado === 'true') {
            window.location.replace("acceso-llaves.html"); 
        } else {
            // Xerar QR
            contenedorQR.innerHTML = ""; 
            new QRCode(contenedorQR, {
                text: urlDestino, 
                width: 250,
                height: 250
            });

            // Actualizar Enlace Secreto
            if (enlaceSecreto) {
                enlaceSecreto.href = urlDestino;
            }

            // Cambiar Pantalla
            inicio.style.display = "none";
            resultado.style.display = "flex";
            
            resetTimer();
        }
    } else {
        alert("PIN INCORRECTO");
        input.value = "";
    }
}

// --- 3. XESTIÓN DE INACTIVIDADE ---
function resetTimer() {
    clearTimeout(tempoInactividade);
    const pantallaResultado = document.getElementById("pantalla-resultado");
    const qrVisible = pantallaResultado && pantallaResultado.style.display === "flex";

    if (qrVisible) {
        tempoInactividade = setTimeout(() => {
            sessionStorage.removeItem('tablet_desbloqueada');
            window.location.reload();
        }, 300000); // 5 minutos
    }
}

document.onmousemove = resetTimer;
document.onkeypress = resetTimer;
document.ontouchstart = resetTimer;
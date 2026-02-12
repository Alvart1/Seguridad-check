/**
 * Lóxica para a Interface de Bloqueo (index.html)
 */

function verificarYGenerar() {
    const pinCorrecto = "1234"; 
    const urlDestino = "https://alvart1.github.io/Seguridad-check/formulario.html";
    
    const input = document.getElementById("pinInput");
    const inicio = document.getElementById("pantalla-inicio");
    const resultado = document.getElementById("pantalla-resultado");
    const contenedorQR = document.getElementById("qrcode");

    if (input.value === pinCorrecto) {
        // 1. Autorizamos a sesión
        sessionStorage.setItem('tablet_desbloqueada', 'true');

        // 2. Comprobamos rexistro previo
        const xaRexistrado = localStorage.getItem('hospede_rexistrado');

        if (xaRexistrado === 'true') {
            // REVISA ESTE NOME: Debe coincidir exactamente co teu ficheiro .html
            window.location.href = "acceso-chaves.html"; 
        } else {
            // Xeramos o QR
            contenedorQR.innerHTML = ""; 
            new QRCode(contenedorQR, {
                text: urlDestino,
                width: 250,
                height: 250
            });

            inicio.style.display = "none";
            resultado.style.display = "flex";
        }
    } else {
        alert("PIN INCORRECTO");
        input.value = "";
    }
}

// --- CORRECCIÓN DA INACTIVIDADE ---
let tempoInactividade;

function resetTimer() {
    clearTimeout(tempoInactividade);
    
    // Só activamos o timer se ESTAMOS na páxina de resultado (QR amosado)
    // Se acabamos de poñer o PIN e o sistema nos redirixe, non queremos que o timer nos faga un bucle ao index
    const resultadoVisible = document.getElementById("pantalla-resultado")?.style.display === "flex";

    tempoInactividade = setTimeout(() => {
        if (sessionStorage.getItem('tablet_desbloqueada') && resultadoVisible) {
            sessionStorage.removeItem('tablet_desbloqueada');
            window.location.href = "index.html";
        }
    }, 300000); 
}

// Escoitar interaccións
window.onload = resetTimer;
document.onmousemove = resetTimer;
document.onkeypress = resetTimer;
document.ontouchstart = resetTimer;
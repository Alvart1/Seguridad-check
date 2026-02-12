/**
 * Lóxica para a Interface de Bloqueo (index.html)
 */

function verificarYGenerar() {
    const pinCorrecto = "1234"; // O teu PIN de seguridade
    const urlDestino = "https://alvart1.github.io/Seguridad-check/formulario.html";
    
    const input = document.getElementById("pinInput");
    const inicio = document.getElementById("pantalla-inicio");
    const resultado = document.getElementById("pantalla-resultado");
    const contenedorQR = document.getElementById("qrcode");

    if (input.value === pinCorrecto) {
        // 1. Autorizamos a sesión actual da tablet
        sessionStorage.setItem('tablet_desbloqueada', 'true');

        // 2. Comprobamos se o cliente xa completou o rexistro anteriormente
        // Isto evita que teñan que cubrir o formulario cada vez que a tablet se bloquea
        const xaRexistrado = localStorage.getItem('hospede_rexistrado');

        if (xaRexistrado === 'true') {
            // Se xa está rexistrado, imos directo á interface de chaves
            window.location.href = "acceso-llaves.html";
        } else {
            // Se é a primeira vez, xeramos o QR para o formulario
            contenedorQR.innerHTML = ""; // Limpar QR previo se existe

            new QRCode(contenedorQR, {
                text: urlDestino,
                width: 250,
                height: 250,
                colorDark : "#000000",
                colorLight : "#ffffff"
            });

            // Intercambio de pantallas
            inicio.style.display = "none";
            resultado.style.display = "flex";
        }
    } else {
        alert("PIN INCORRECTO");
        input.value = "";
    }
}

// --- XESTIÓN DE INACTIVIDADE ---
// Se ninguén toca a tablet en 5 minutos, refrescamos para que volva pedir o PIN
let tempoInactividade;

function resetTimer() {
    clearTimeout(tempoInactividade);
    tempoInactividade = setTimeout(() => {
        // Se a tablet estaba desbloqueada, pechamos a sesión e refrescamos
        if (sessionStorage.getItem('tablet_desbloqueada')) {
            sessionStorage.removeItem('tablet_desbloqueada');
            window.location.href = "index.html";
        }
    }, 300000); // 300.000ms = 5 minutos
}

// Escoitar interaccións do usuario
window.onload = resetTimer;
document.onmousemove = resetTimer;
document.onkeypress = resetTimer;
document.ontouchstart = resetTimer;
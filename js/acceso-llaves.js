/**
 * Lóxica para o Control do Caixón (acceso-chaves.html)
 */

window.onload = function() {
    // 1. SEGURIDADE MELLORADA
    const desbloqueada = sessionStorage.getItem('tablet_desbloqueada') === 'true';
    const rexistrado = localStorage.getItem('hospede_rexistrado') === 'true';
    const tenMetodo = localStorage.getItem('metodo_acceso');

    // Se a tablet non está desbloqueada polo propietario, fóra sempre
    if (!desbloqueada) {
        window.location.href = "index.html";
        return;
    }

    // Se está desbloqueada pero non rexistrou nin elixiu método, 
    // significa que intentou entrar na URL a man sen facer o proceso
    if (!rexistrado && !tenMetodo) {
        window.location.href = "index.html";
        return;
    }

    // 2. CARGAR INTERFACE DINÁMICA... (o resto do teu código igual)

    // 2. CARGAR INTERFACE DINÁMICA
    const metodo = localStorage.getItem('metodo_acceso');
    const contenedor = document.getElementById('interfaz-dinamica');

    if (metodo === 'pin') {
        // Debuxamos un teclado numérico sinxelo
        contenedor.innerHTML = `
            <div class="teclado-pin">
                <input type="password" id="pin-cliente" placeholder="PIN" maxlength="4" readonly>
                <div class="grid-numerico">
                    ${[1,2,3,4,5,6,7,8,9,0].map(n => `<button onclick="teclear(${n})">${n}</button>`).join('')}
                    <button onclick="limparPin()" style="background:#e74c3c">C</button>
                    <button onclick="verificarYAbrir()" style="background:#2ecc71">OK</button>
                </div>
            </div>
        `;
    } else {
        // Debuxamos o botón para recoñecemento facial
        contenedor.innerHTML = `
            <div class="facial-container">
                <div class="camara-placeholder">📸</div>
                <button onclick="abrirPolaCara()" class="btn-abrir">Abrir con Rostro</button>
            </div>
        `;
    }
};

// --- FUNCIÓNS PARA O MÉTODO PIN ---
let pinIntroducido = "";
function teclear(num) {
    if (pinIntroducido.length < 4) {
        pinIntroducido += num;
        document.getElementById('pin-cliente').value = pinIntroducido;
    }
}
function limparPin() {
    pinIntroducido = "";
    document.getElementById('pin-cliente').value = "";
}

// --- FUNCIÓN PRINCIPAL: ABRIR CAIXÓN ---
async function enviarOrdeAbrir() {
    const statusMsg = document.getElementById('mensaje-estado');
    statusMsg.innerText = "⏳ Conectando con el cajón...";

    try {
        // Chamada ao teu hardware
        const res = await fetch(`http://10.158.13.63:8080/abrir`);
        if (res.ok) {
            statusMsg.innerText = "✅ CAJÓN ABIERTO. ¡Recoja sus llaves!";
            statusMsg.style.color = "#2ecc71";
            setTimeout(() => { statusMsg.innerText = ""; }, 5000);
        } else {
            throw new Error("Hardware no responde");
        }
    } catch (e) {
        statusMsg.innerText = "❌ ERROR: No se pudo abrir el cajón.";
        statusMsg.style.color = "#e74c3c";
    }
}

// Validacións segundo o método
function verificarYAbrir() {
    if (pinIntroducido.length === 4) {
        // Aquí poderías comprobar se o PIN coincide co que gardaron, 
        // polo de agora abrimos se poñen calquera 4 números.
        enviarOrdeAbrir();
        limparPin();
    } else {
        alert("Introduce un PIN de 4 dígitos");
    }
}

function abrirPolaCara() {
    // Aquí iría a lóxica da cámara. Por agora, simulamos a apertura.
    enviarOrdeAbrir();
}

// --- FINALIZAR ESTANCIA ---
function confirmarFinEstancia() {
    if (confirm("¿Seguro que quieres finalizar? Se borrarán tus datos y no podrás volver a entrar sin el propietario.")) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "index.html";
    }
}
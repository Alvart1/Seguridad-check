/**
 * Lóxica para o Panel de Control (acceso-llaves.html)
 */
const IP_Raspberry = "http://10.182.60.63:3000/abrir";

window.onload = function() {
    if (sessionStorage.getItem('tablet_desbloqueada') !== 'true') {
        window.location.href = "index.html";
        return;
    }
    
    const metodo = localStorage.getItem('metodo_acceso');
    const contenedor = document.getElementById('interfaz-dinamica');
    const btnCrear = document.querySelector('.crear-cuenta'); // Seleccionamos o botón

    if (metodo) {
        // 1. Ocultamos o botón de crear conta
        if (btnCrear) btnCrear.style.display = 'none';

        // 2. Amosamos o botón de abrir
        contenedor.innerHTML = `
            <div class="panel-usuario">
                <p>Bienvenido. Tu acceso por <strong>${metodo.toUpperCase()}</strong> está listo.</p>
                <button type="button" class="btn-principal" onclick="solicitarAcceso()">
                    🔑 ABRIR CAJÓN
                </button>
            </div>
        `;
    } else {
        contenedor.innerHTML = `
            <div class="benvida">
                <p>Bienvenido. Por favor, pulsa en "Crear cuenta" para empezar.</p>
            </div>
        `;
    }
};

// --- FUNCIÓNS DE ACCIÓN ---

function solicitarAcceso() {
    const metodo = localStorage.getItem('metodo_acceso');
    const pinCorrecto = localStorage.getItem('pin_guardado');
    
    if (metodo === 'pin') {
        let intento = prompt("Introduce tu PIN de 4 cifras para abrir:");
        
        if (intento === pinCorrecto) {
            abrirCajonReal();
        } else {
            alert("❌ PIN Incorrecto");
        }
    } else if (metodo === 'foto') {
        // Aquí iría a lóxica real da cámara
        alert("Iniciando escaneo facial...");
        abrirCajonReal(); 
    }
}

async function abrirCajonReal() {
    try {
        const res = await fetch(IP_Raspberry);
        if (res.ok) {
            alert("✅ ¡Cajón abierto! Recoge tus llaves.");
        } else {
            alert("⚠️ El cajón no responde. Comprueba la conexión del hardware.");
        }
    } catch (e) {
        alert("❌ ERROR: No se pudo conectar con el servidor del cajón.");
    }
}

// --- NAVEGACIÓN ---

function crearcuenta() {
    window.location.href = "crear-cuenta.html";
}

function confirmarFinEstancia() {
    if (confirm("¿Seguro que quieres finalizar? Se borrarán todos tus datos y la tablet se bloqueará.")) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "index.html";
    }
}
/**
 * Lóxica para o Panel de Control (acceso-llaves.html)
 */

window.onload = function() {
    // 1. SEGURIDADE: Verificamos se a tablet está desbloqueada polo propietario
    if (sessionStorage.getItem('tablet_desbloqueada') !== 'true') {
        window.location.href = "index.html";
        return;
    }
    
    // 2. DETECTAR ESTADO DO CLIENTE
    const metodo = localStorage.getItem('metodo_acceso');
    const contenedor = document.getElementById('interfaz-dinamica');

    if (metodo) {
        // SE XA TEN CONTA: Amosamos o botón de abrir directamente
        contenedor.innerHTML = `
            <div class="panel-usuario">
                <p>Estado: <strong>Cuenta Activa (${metodo.toUpperCase()})</strong></p>
                <button type="button" class="btn-principal" onclick="solicitarAcceso()" style="padding: 20px; font-size: 1.5rem; background: #2ecc71; color: white; border-radius: 10px; border: none; cursor: pointer;">
                    🔑 ABRIR CAJÓN
                </button>
            </div>
        `;
    } else {
        // SE NON TEN CONTA: Mensaxe de benvida para que a cree
        contenedor.innerHTML = `
            <div class="benvida">
                <p>Bienvenido al sistema de gestión de llaves.</p>
                <p>Por favor, pulsa en <strong>"Crear cuenta"</strong> para configurar tu acceso.</p>
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
        const res = await fetch(`http://10.158.13.63:8080/abrir`);
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
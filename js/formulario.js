// --- CONFIGURACIÓN ---
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

const PIN_PROPIETARIO = "0000"; 
let totalHospedes = 0, hospedeActual = 1, reservaId = null;
let tempoInactividade;
const SEGUNDOS_INACTIVIDADE = 300; // 5 minutos

// --- LÓXICA DE VISIBILIDADE ---
function mostrarSeccion(id) {
    // Esconder todas
    document.getElementById('bloqueo-tablet').style.display = 'none';
    document.getElementById('paso-inicio').style.display = 'none';
    document.getElementById('seccion-formulario').style.display = 'none';
    document.getElementById('seccion-final').style.display = 'none';
    
    // Mostrar a indicada
    const elemento = document.getElementById(id);
    if (elemento) elemento.style.display = 'block';
}

function verificarEstado() {
    const desbloqueada = sessionStorage.getItem('tablet_desbloqueada');
    const rexistrado = localStorage.getItem('hospede_rexistrado');

    if (!desbloqueada) {
        mostrarSeccion('bloqueo-tablet');
    } else if (rexistrado === 'true') {
        mostrarSeccion('seccion-final');
    } else {
        mostrarSeccion('paso-inicio');
    }
}

// --- BLOQUEO E INACTIVIDADE ---
window.onload = function() {
    verificarEstado();
    resetTimer();
};

function validarPinTablet() {
    const inputPin = document.getElementById('pin-propietario').value;
    if (inputPin === PIN_PROPIETARIO) {
        sessionStorage.setItem('tablet_desbloqueada', 'true');
        verificarEstado();
    } else {
        alert("PIN incorrecto");
        document.getElementById('pin-propietario').value = "";
    }
}

function resetTimer() {
    clearTimeout(tempoInactividade);
    tempoInactividade = setTimeout(apagarPantalla, SEGUNDOS_INACTIVIDADE * 1000);
}

function apagarPantalla() {
    document.getElementById('pantalla-negra').style.display = 'block';
}

function despertarTablet() {
    document.getElementById('pantalla-negra').style.display = 'none';
    resetTimer();
}

['mousedown', 'mousemove', 'keypress', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, resetTimer, true);
});

// --- REXISTRO ---
async function comezarRexistro(numero) {
    totalHospedes = numero;
    const { data, error } = await _supabase.from('reservas').insert([{ fecha_entrada: new Date().toISOString().split('T')[0] }]).select();
    if (error) return alert("Error de base de datos");
    reservaId = data[0].id;
    mostrarSeccion('seccion-formulario');
}

document.getElementById('formulario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = { 
        reserva_id: reservaId, 
        nombre: document.getElementById('nombre').value,
        apellidos: document.getElementById('apellidos').value,
        codigo_documento: document.getElementById('documento').value,
        email: document.getElementById('correo').value,
        firma_base64: document.getElementById('canvas-firma').toDataURL() 
    };

    const { error } = await _supabase.from('hospedes').insert([datos]);
    if (!error) {
        if (hospedeActual < totalHospedes) {
            hospedeActual++;
            document.getElementById('formulario').reset();
            limparFirma();
            document.getElementById('titulo-formulario').innerText = `Datos del Viajero ${hospedeActual}`;
        } else {
            localStorage.setItem('hospede_rexistrado', 'true');
            verificarEstado();
        }
    }
});

// --- CAXÓN E FINALIZACIÓN ---
async function clickEnChaves() {
    const ip = "10.158.13.63";
    try {
        const res = await fetch(`http://${ip}:8080/abrir`);
        if (res.ok) {
            document.getElementById('mensaje-acceso').innerText = "✅ CAJÓN ABIERTO";
            setTimeout(() => { document.getElementById('mensaje-acceso').innerText = ""; }, 5000);
        }
    } catch (e) { alert("Error Hardware: " + e.message); }
}

async function finEstancia() {
    if (confirm("¿Finalizar estancia? Se borrarán tus datos de la tablet.")) {
        localStorage.clear();
        sessionStorage.clear();
        apagarPantalla();
        verificarEstado();
    }
}

// --- FIRMA ---
const canvas = document.getElementById('canvas-firma');
const ctx = canvas.getContext('2d');
let debuxando = false;

function limparFirma() { ctx.clearRect(0, 0, canvas.width, canvas.height); }

canvas.addEventListener('mousedown', () => debuxando = true);
canvas.addEventListener('mouseup', () => { debuxando = false; ctx.beginPath(); });
canvas.addEventListener('mousemove', (e) => {
    if (!debuxando) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
});
// Soporte táctil
canvas.addEventListener('touchstart', (e) => { debuxando = true; e.preventDefault(); });
canvas.addEventListener('touchend', () => { debuxando = false; ctx.beginPath(); });
canvas.addEventListener('touchmove', (e) => {
    if (!debuxando) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
});
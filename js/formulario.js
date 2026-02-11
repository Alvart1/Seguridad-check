// --- 1. CONFIGURACIÓN DE SUPABASE ---
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

// --- 2. VARIABLES DE ESTADO ---
const PIN_PROPIETARIO = "0000"; 
let totalHospedes = 0, hospedeActual = 1, reservaId = null;
let tempoInactividade;
const SEGUNDOS_INACTIVIDADE = 300; // 5 minutos

const canvas = document.getElementById('canvas-firma');
const ctx = canvas?.getContext('2d');
if (ctx) {
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
}

// --- 3. LÓXICA DE VISIBILIDADE E BLOQUEO ---

function mostrarSeccion(id) {
    // Esconder todas as seccións
    document.querySelectorAll('.encabezado, .viajero-bloque').forEach(sec => {
        sec.style.display = 'none';
    });
    // Mostrar a sección desexada
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

function validarPinTablet() {
    const inputPin = document.getElementById('pin-propietario').value;
    if (inputPin === PIN_PROPIETARIO) {
        sessionStorage.setItem('tablet_desbloqueada', 'true');
        document.getElementById('pin-propietario').value = "";
        verificarEstado();
    } else {
        alert("PIN incorrecto");
        document.getElementById('pin-propietario').value = "";
    }
}

// --- 4. XESTIÓN DE INACTIVIDADE (APAGADO) ---

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

// --- 5. PROCESO DE REXISTRO (SUPABASE) ---

async function comezarRexistro(numero) {
    totalHospedes = numero;
    try {
        const { data, error } = await _supabase
            .from('reservas')
            .insert([{ fecha_entrada: new Date().toISOString().split('T')[0] }])
            .select();

        if (error) throw error;
        reservaId = data[0].id;
        mostrarSeccion('seccion-formulario');
    } catch (err) {
        console.error("Erro ao crear reserva:", err);
        alert("Erro de base de datos ao iniciar rexistro.");
    }
}

document.getElementById('formulario').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Recoller datos (asegúrate de que os nomes coincidan coas túas columnas en Supabase)
    const datos = { 
        reserva_id: reservaId, 
        nombre: document.getElementById('nombre').value,
        apellidos: document.getElementById('apellidos').value,
        codigo_documento: document.getElementById('documento').value,
        email: document.getElementById('correo').value,
        firma_base64: canvas.toDataURL() 
    };

    try {
        const { error } = await _supabase.from('hospedes').insert([datos]);

        if (error) {
            console.error("Erro de Supabase:", error);
            alert("Erro ao gardar datos: " + error.message);
            return;
        }

        // Se todo vai ben, procesamos o seguinte hóspede ou finalizamos
        if (hospedeActual < totalHospedes) {
            hospedeActual++;
            document.getElementById('formulario').reset();
            limparFirma();
            document.getElementById('titulo-formulario').innerText = `Datos del Viajero ${hospedeActual}`;
            alert(`Viajero ${hospedeActual - 1} rexistrado. Faltan ${totalHospedes - (hospedeActual - 1)}.`);
        } else {
            localStorage.setItem('hospede_rexistrado', 'true');
            alert("Rexistro completo.");
            verificarEstado();
        }
    } catch (err) {
        alert("Fallo de conexión crítico.");
    }
});

// --- 6. INTERFACE DE CHAVES E FINALIZACIÓN ---

async function clickEnChaves() {
    const ip = "10.158.13.63";
    try {
        const res = await fetch(`http://${ip}:8080/abrir`);
        if (res.ok) {
            document.getElementById('mensaje-acceso').innerText = "✅ CAJÓN ABIERTO";
            setTimeout(() => { document.getElementById('mensaje-acceso').innerText = ""; }, 5000);
        } else {
            throw new Error("Resposta do servidor non válida");
        }
    } catch (e) { 
        alert("Erro ao abrir o caixón: " + e.message); 
    }
}

async function finEstancia() {
    if (confirm("¿Finalizar estancia? Borraranse os teus datos de acceso da tablet.")) {
        localStorage.clear();
        sessionStorage.clear();
        apagarPantalla();
        verificarEstado();
    }
}

// --- 7. LÓXICA DA FIRMA ---

let debuxando = false;

function limparFirma() { 
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); 
}

if (canvas) {
    // Eventos Mouse
    canvas.addEventListener('mousedown', () => debuxando = true);
    canvas.addEventListener('mouseup', () => { debuxando = false; ctx.beginPath(); });
    canvas.addEventListener('mousemove', (e) => {
        if (!debuxando) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    });

    // Eventos Táctiles (Tablet)
    canvas.addEventListener('touchstart', (e) => { 
        debuxando = true; 
        e.preventDefault(); 
    });
    canvas.addEventListener('touchend', () => { 
        debuxando = false; 
        ctx.beginPath(); 
    });
    canvas.addEventListener('touchmove', (e) => {
        if (!debuxando) return;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
        ctx.stroke();
    });
}

// --- 8. INICIO ---
window.onload = function() {
    verificarEstado();
    resetTimer();
};
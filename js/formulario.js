// --- CONFIGURACIÓN SUPABASE ---
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

let totalHospedes = 0, hospedeActual = 1, reservaId = null;

// --- CONTROL DE ACCESO E ESTADO ---
window.onload = function() {
    // Se non hai rexistro previo, amosamos o paso inicial (cantos son)
    verificarEstado();
};

function mostrarSeccion(id) {
    document.querySelectorAll('.encabezado, .viajero-bloque').forEach(sec => sec.style.display = 'none');
    const elemento = document.getElementById(id);
    if (elemento) elemento.style.display = 'block';
}

function verificarEstado() {
    const rexistrado = localStorage.getItem('hospede_rexistrado');
    if (rexistrado === 'true') {
        mostrarSeccion('seccion-final');
    } else {
        mostrarSeccion('paso-inicio');
    }
}

// --- PROCESO DE REXISTRO ---
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
        alert("Erro ao conectar coa base de datos");
    }
}

document.getElementById('formulario').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const canvas = document.getElementById('canvas-firma');
    const datos = { 
        reserva_id: reservaId, 
        nombre: document.getElementById('nombre').value,
        apellidos: document.getElementById('apellidos').value,
        codigo_documento: document.getElementById('documento').value,
        email: document.getElementById('correo').value,
        firma_base64: canvas.toDataURL() 
    };

    const { error } = await _supabase.from('hospedes').insert([datos]);
    
    if (!error) {
        if (hospedeActual < totalHospedes) {
            hospedeActual++;
            document.getElementById('formulario').reset();
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            document.getElementById('titulo-formulario').innerText = `Datos del Viajero ${hospedeActual}`;
        } else {
            localStorage.setItem('hospede_rexistrado', 'true');
            verificarEstado();
        }
    } else {
        alert("Erro ao gardar: " + error.message);
    }
});

// --- ACCIÓNS DO PANEL FINAL ---
async function clickEnChaves() {
    try {
        const res = await fetch(`http://10.158.13.63:8080/abrir`);
        if (res.ok) {
            document.getElementById('mensaje-acceso').innerText = "✅ CAJÓN ABIERTO";
            setTimeout(() => { document.getElementById('mensaje-acceso').innerText = ""; }, 5000);
        }
    } catch (e) { 
        alert("Erro ao abrir o caixón. Comproba a conexión co hardware."); 
    }
}

// ESTA É A FUNCIÓN QUE BUSCABAS: Borra todo e volve ao index.html
async function finEstancia() {
    if (confirm("¿Finalizar estancia? Se borrarán todos los datos y volverás al inicio.")) {
        // 1. Limpamos o rexistro do cliente
        localStorage.clear();
        // 2. Rediriximos á pantalla de Benvida/PIN
        window.location.href = "index.html";
    }
}

// --- LÓXICA DA FIRMA ---
const canvas = document.getElementById('canvas-firma');
const ctx = canvas.getContext('2d');
let debuxando = false;

function limparFirma() { ctx.clearRect(0, 0, canvas.width, canvas.height); }

canvas.addEventListener('mousedown', () => debuxando = true);
canvas.addEventListener('mouseup', () => { debuxando = false; ctx.beginPath(); });
canvas.addEventListener('mousemove', (e) => {
    if (!debuxando) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
});
// Soporte táctil para tablet
canvas.addEventListener('touchstart', (e) => { debuxando = true; e.preventDefault(); });
canvas.addEventListener('touchmove', (e) => {
    if (!debuxando) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
});
canvas.addEventListener('touchend', () => { debuxando = false; ctx.beginPath(); });
// --- CONFIGURACIÓN SUPABASE ---
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

let totalHospedes = 0, hospedeActual = 1, reservaId = null;

// --- CONTROL DE ACCESO ---
window.onload = function() {
    // Seguridade: Se non puxeron o PIN no index, de volta ao inicio
    if (!sessionStorage.getItem('tablet_desbloqueada')) {
        window.location.href = "index.html";
        return;
    }
    mostrarSeccion('paso-inicio');
};

function mostrarSeccion(id) {
    document.querySelectorAll('.encabezado, .viajero-bloque').forEach(sec => sec.style.display = 'none');
    const elemento = document.getElementById(id);
    if (elemento) elemento.style.display = 'block';
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
            limparFirma();
            document.getElementById('titulo-formulario').innerText = `Datos del Viajero ${hospedeActual}`;
       } else {

    try {
        // 1️⃣ Crear evento oficial de check-in
        const { error: errorEvento } = await _supabase
            .from('eventos_sistema')
            .insert([{
                reserva_id: reservaId,
                tipo_evento: 'checkin_completado',
                fecha_evento: new Date().toISOString(),
                notificado: false
            }]);

        if (errorEvento) throw errorEvento;

        // 2️⃣ Continuar flujo normal
        localStorage.setItem('hospede_rexistrado', 'true');
        window.location.href = "crear-cuenta.html";

    } catch (err) {
        alert("Error al registrar el evento del sistema: " + err.message);
    }
}

    } else {
        alert("Erro ao gardar: " + error.message);
    }
});

// --- LÓXICA DA FIRMA (O teu código que xa funciona) ---
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
canvas.addEventListener('touchstart', (e) => { debuxando = true; e.preventDefault(); });
canvas.addEventListener('touchmove', (e) => {
    if (!debuxando) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
});
canvas.addEventListener('touchend', () => { debuxando = false; ctx.beginPath(); });

// --- TIMER INACTIVIDADE ---
let tempoInactividade = setTimeout(() => window.location.href = "index.html", 300000);
document.onmousedown = () => {
    clearTimeout(tempoInactividade);
    tempoInactividade = setTimeout(() => window.location.href = "index.html", 300000);
};
// ===============================
// CONFIGURACIÓN SUPABASE
// ===============================
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'TU_PUBLIC_ANON_KEY_AQUI';
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

// ===============================
let reservaId = null;
let totalHospedes = 1;
let hospedeActual = 1;
let canvas, ctx, dibujando = false;


// ===============================
// INICIO
// ===============================
document.addEventListener("DOMContentLoaded", async () => {

    const urlParams = new URLSearchParams(window.location.search);
    reservaId = urlParams.get('reserva_id');

    if (!reservaId) {
        alert("Acceso inválido");
        window.location.href = "index.html";
        return;
    }

    // Validar reserva activa
    const { data, error } = await _supabase
        .from('reservas')
        .select('*')
        .eq('id', reservaId)
        .eq('estado_estancia', 'activa')
        .single();

    if (error || !data) {
        document.body.innerHTML = `
            <div style="display:flex;justify-content:center;align-items:center;height:100vh;">
                <h2>⚠️ Este QR ya no es válido</h2>
            </div>
        `;
        return;
    }

    canvas = document.getElementById('canvas-firma');
    if (canvas) {
        ctx = canvas.getContext('2d');
        configurarFirma();
    }

    document.getElementById('formulario')
        .addEventListener('submit', enviarFormulario);
});


// ===============================
// ENVIAR FORMULARIO
// ===============================
async function enviarFormulario(e) {
    e.preventDefault();

    const firmaImagen = canvas.toDataURL();

    const datos = {
        reserva_id: reservaId,
        nombre: document.getElementById('nombre').value,
        apellidos: document.getElementById('apellidos').value,
        genero: document.getElementById('genero').value,
        tipo_documento: document.getElementById('tipo_documento').value,
        codigo_documento: document.getElementById('documento').value,
        teléfono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value,
        fecha_nacimiento: document.getElementById('fecha_nac').value,
        email: document.getElementById('correo').value,
        nacionalidad: document.getElementById('nacionalidad').value,
        firma_base64: firmaImagen
    };

    const { error } = await _supabase
        .from('hospedes')
        .insert([datos]);

    if (error) {
        alert("Error guardando datos");
        return;
    }

    finalizarProceso();
}


// ===============================
// FINALIZAR
// ===============================
async function finalizarProceso() {

    await _supabase
        .from('reservas')
        .update({ estado_estancia: 'completada' })
        .eq('id', reservaId);

    document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;">
            <h1 style="color:#2ecc71;">✅ Registro completado</h1>
            <p>Ya puede cerrar esta página.</p>
        </div>
    `;
}


// ===============================
// FIRMA
// ===============================
function configurarFirma() {

    const parar = () => {
        dibujando = false;
        ctx.beginPath();
    };

    const mover = (e) => {
        if (!dibujando) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    canvas.addEventListener('mousedown', () => dibujando = true);
    canvas.addEventListener('mouseup', parar);
    canvas.addEventListener('mousemove', mover);

    canvas.addEventListener('touchstart', (e) => {
        dibujando = true;
        e.preventDefault();
    });

    canvas.addEventListener('touchmove', mover);
    canvas.addEventListener('touchend', parar);
}

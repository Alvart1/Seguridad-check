// ===============================
// CONFIGURACIÓN
// ===============================
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu';
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

const Public_KEY_Emailjs = '-7vKXPKDrKzQiVSrn';
const Service_ID_emailjs = 'service_cog5jua';
const Templace_ID_emailjs = 'template_5m1y4si';

// ===============================
// VARIABLES GLOBALES
// ===============================
let totalHospedes = 0;
let hospedeActual = 1;
let reservaId = null;
let canvas, ctx, debuxando = false;
let tempoInactividade;


// ===============================
// CONTROL INICIAL
// ===============================
document.addEventListener("DOMContentLoaded", async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const reservaIdURL = urlParams.get('reserva_id');

    if (!reservaIdURL) {
        alert("Acceso inválido.");
        window.location.href = "index.html";
        return;
    }

    reservaId = reservaIdURL;

    // 🔎 VALIDAMOS QUE LA RESERVA EXISTA Y ESTÉ ACTIVA
    try {
        const { data, error } = await _supabase
            .from('reservas')
            .select('*')
            .eq('id', reservaId)
            .eq('estado_estancia', 'activa')
            .single();

        if (error || !data) {
            document.body.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
                    <div style="text-align:center;">
                        <h2>⚠️ Este QR ya no es válido</h2>
                        <p>La reserva no está activa.</p>
                    </div>
                </div>
            `;
            return;
        }

    } catch (err) {
        alert("Error verificando reserva.");
        return;
    }

    // Mostramos primera pantalla
    document.getElementById("paso-inicio").style.display = "block";

    inicializarTodo();
});


// ===============================
// INICIALIZACIÓN
// ===============================
function inicializarTodo() {

    emailjs.init(Public_KEY_Emailjs);

    canvas = document.getElementById('canvas-firma');
    if (canvas) {
        ctx = canvas.getContext('2d');
        configurarFirma();
    }

    resetTimer();
    document.onmousedown = resetTimer;

    const form = document.getElementById('formulario');
    if (form) {
        form.addEventListener('submit', enviarFormulario);
    }
}


// ===============================
// LÓGICA PRINCIPAL
// ===============================
function mostrarSeccion(id) {
    document.querySelectorAll('.encabezado, .viajero-bloque')
        .forEach(sec => sec.style.display = 'none');

    document.getElementById(id).style.display = 'block';
}

function comezarRexistro(numero) {
    totalHospedes = numero;
    mostrarSeccion('seccion-formulario');
}


// ===============================
// ENVÍO DE FORMULARIO
// ===============================
async function enviarFormulario(e) {
    e.preventDefault();

    const firmaImagen = canvas.toDataURL();

    const datos = {
        reserva_id: reservaId,
        nombre: document.getElementById('nombre').value,
        apellidos: document.getElementById('apellidos').value,
        genero: document.getElementById('genero').value,
        codigo_documento: document.getElementById('documento').value,
        direccion: document.getElementById('direccion').value,
        fecha_nacimiento: document.getElementById('fecha_nac').value,
        email: document.getElementById('correo').value,
        firma_base64: firmaImagen
    };

    const { error } = await _supabase
        .from('hospedes')
        .insert([datos]);

    if (error) {
        alert("Error guardando datos: " + error.message);
        return;
    }

    if (hospedeActual < totalHospedes) {

        hospedeActual++;
        document.getElementById('formulario').reset();
        limparFirma();
        document.getElementById('titulo-formulario').innerText =
            `Datos del Viajero ${hospedeActual}`;

    } else {

        finalizarProceso();
    }
}


// ===============================
// FINALIZACIÓN
// ===============================
async function finalizarProceso() {

    try {

        await _supabase.from('eventos_sistema').insert([{
            reserva_id: reservaId,
            tipo_evento: 'checkin_completado',
            fecha_evento: new Date().toISOString(),
            notificado: false
        }]);

        await emailjs.send(Service_ID_emailjs, Templace_ID_emailjs, {
            reserva_id: reservaId,
            fecha_evento: new Date().toLocaleString(),
            mensaje: "El huésped completó el registro."
        });

        // Pantalla final móvil
        document.body.innerHTML = `
            <div style="
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                height:100vh;
                text-align:center;
                font-family:sans-serif;
                background:#f4f7f6;
                padding:20px;
            ">
                <div style="background:white;padding:40px;border-radius:20px;box-shadow:0 4px 15px rgba(0,0,0,0.1);">
                    <div style="font-size:60px;">✅</div>
                    <h1 style="color:#2ecc71;">¡Registro completado!</h1>
                    <p>Ahora puede usar la tablet para recoger sus llaves.</p>
                </div>
            </div>
        `;

    } catch (err) {
        alert("Registro guardado, pero hubo un error final.");
    }
}


// ===============================
// FIRMA
// ===============================
function configurarFirma() {

    const parar = () => {
        debuxando = false;
        ctx.beginPath();
    };

    const mover = (e) => {
        if (!debuxando) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    canvas.addEventListener('mousedown', () => debuxando = true);
    canvas.addEventListener('mouseup', parar);
    canvas.addEventListener('mousemove', mover);

    canvas.addEventListener('touchstart', (e) => {
        debuxando = true;
        e.preventDefault();
    });

    canvas.addEventListener('touchmove', mover);
    canvas.addEventListener('touchend', parar);
}

function limparFirma() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


// ===============================
// TIMER INACTIVIDAD
// ===============================
function resetTimer() {
    clearTimeout(tempoInactividade);
    tempoInactividade = setTimeout(() => {
        window.location.href = "index.html";
    }, 300000);
}

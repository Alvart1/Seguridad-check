// --- CONFIGURACIÓN ---
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 
const supabase = supabase.createClient(URL_SUPA, KEY_SUPA); // Variable unificada

const Public_KEY_Emailjs = '-7vKXPKDrKzQiVSrn';
const Service_ID_emailjs = 'service_cog5jua';
const Templace_ID_emailjs = 'template_5m1y4si';

const urlParams = new URLSearchParams(window.location.search);
const reservaIdDendeURL = urlParams.get('reserva_id');

let totalHospedes = 0, hospedeActual = 1, reservaId = null;
let canvas, ctx, debuxando = false;
let tempoInactividade;

// 🚩 CONTROL DE ERROS INICIAL
window.onerror = function(msg, url, line) {
    const debug = document.getElementById('debug-error');
    if (debug) {
        debug.style.display = 'block';
        debug.innerText = "ERRO: " + msg + " en liña " + line;
    }
    return false;
};

// --- 1. CONTROL DE ACCESO E INICIO ---
document.addEventListener("DOMContentLoaded", () => {
    const accesoQR = urlParams.get('auth') === 'ok';

    // Se non vén do QR e non está desbloqueada a sesión, volve ao inicio
    if (sessionStorage.getItem('tablet_desbloqueada') !== 'true' && !accesoQR) {
        window.location.href = "index.html";
        return;
    }

    if (accesoQR) {
        sessionStorage.setItem('tablet_desbloqueada', 'true');
    }

    // Amosar a sección de cantos hóspedes son
    const seccionInicial = document.querySelector('.encabezado'); 
    if (seccionInicial) {
        seccionInicial.style.display = 'block';
    }

    inicializarTodo();
});

function inicializarTodo() {
    // Inicializar EmailJS
    emailjs.init(Public_KEY_Emailjs);

    // Configurar Canvas para a firma
    canvas = document.getElementById('canvas-firma');
    if (canvas) {
        ctx = canvas.getContext('2d');
        configurarFirma();
    }

    resetTimer();
    
    // Escoitar o envío do formulario
    const form = document.getElementById('formulario');
    if (form) {
        form.addEventListener('submit', enviarFormulario);
    }
}

// --- 2. LÓXICA DE SECCIÓNS E REXISTRO ---

function mostrarSeccion(id) {
    document.querySelectorAll('.encabezado, .viajero-bloque, #seccion-formulario').forEach(sec => sec.style.display = 'none');
    const elemento = document.getElementById(id);
    if (elemento) elemento.style.display = 'block';
}

async function comezarRexistro(numero) {
    totalHospedes = numero;
    
    // Se xa temos a ID pola URL (vía QR), usámola
    if (reservaIdDendeURL) {
        reservaId = reservaIdDendeURL;
        mostrarSeccion('seccion-formulario');
    } else {
        // Se non, creamos unha reserva nova (uso manual)
        try {
            const { data, error } = await supabase.from('reservas').insert([{ 
                fecha_entrada: new Date().toISOString().split('T')[0] 
            }]).select();
            
            if (error) throw error;
            reservaId = data[0].id;
            mostrarSeccion('seccion-formulario');
        } catch (err) {
            alert("Erro ao conectar coa base de datos: " + err.message);
        }
    }
}

async function enviarFormulario(e) {
    e.preventDefault();
    
    // Capturar a firma en formato imaxe (Base64)
    const firmaImagen = canvas.toDataURL(); 

    const datos = { 
        reserva_id: parseInt(reservaIdDendeURL || reservaId), 
        nombre: document.getElementById('nombre').value,
        apellidos: document.getElementById('apellidos').value,
        genero: document.getElementById('genero').value, 
        codigo_documento: document.getElementById('documento').value,
        direccion: document.getElementById('direccion').value,  
        fecha_nacimiento: document.getElementById('fecha_nac').value,
        email: document.getElementById('correo').value,
        firma_base64: firmaImagen 
    };

    // GARDAR EN SUPABASE
    const { error } = await supabase.from('hospedes').insert([datos]);

    if (!error) {
        if (hospedeActual < totalHospedes) {
            // Se faltan hóspedes por rexistrar
            hospedeActual++;
            document.getElementById('formulario').reset();
            limparFirma();
            document.getElementById('titulo-formulario').innerText = `Datos do Viaxeiro ${hospedeActual}`;
            window.scrollTo(0,0);
        } else {
            // Se era o último
            finalizarProceso();
        }
    } else {
        alert("Erro ao gardar os datos: " + error.message);
    }
}

async function finalizarProceso() {
    try {
        // 1. Notificar a Supabase que o check-in está listo (para que a tablet se entere por Realtime)
        await supabase.from('eventos_sistema').insert([{
            reserva_id: parseInt(reservaIdDendeURL || reservaId),
            tipo_evento: 'checkin_completado',
            fecha_evento: new Date().toISOString(),
            notificado: false
        }]);

        // 2. Enviar email de aviso ao propietario
        emailjs.send(Service_ID_emailjs, Templace_ID_emailjs, {
            reserva_id: reservaIdDendeURL || reservaId,
            fecha_evento: new Date().toLocaleString(),
            mensaje: "O hóspede completou o rexistro e xa ten acceso ao caixón."
        });

        localStorage.setItem('hospede_rexistrado', 'true');

        // 3. Pantalla
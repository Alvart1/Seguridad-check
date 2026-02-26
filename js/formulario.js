// --- CONFIGURACIÓN ---
// --- CONFIGURACIÓN ---
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);
const Public_KEY_Emailjs = '-7vKXPKDrKzQiVSrn';
const Service_ID_emailjs = 'service_cog5jua';
const Templace_ID_emailjs = 'template_5m1y4si';

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

// --- 1. CONTROL DE ACCESO ---
document.addEventListener("DOMContentLoaded", () => {
    console.log("Páxina cargada. Comprobando acceso...");
    
    const urlParams = new URLSearchParams(window.location.search);
    const accesoQR = urlParams.get('auth') === 'ok';

    if (sessionStorage.getItem('tablet_desbloqueada') !== 'true' && !accesoQR) {
        console.log("Acceso denegado. Redirixindo...");
        window.location.href = "index.html";
        return;
    }

    if (accesoQR) {
        sessionStorage.setItem('tablet_desbloqueada', 'true');
    }

    // 🚩 FORZAMOS QUE SE VEXA A PRIMEIRA SECCIÓN
    // Asegúrate de que o ID coincide co que tes no HTML (pode ser 'seccion-inicial' ou similar)
    const seccionInicial = document.querySelector('.encabezado'); 
    if (seccionInicial) {
        seccionInicial.style.display = 'block';
    } else {
        alert("Non se atopou a sección inicial no HTML");
    }

    inicializarTodo();
});

// ... resto das funcións igual ...

// --- 2. INICIALIZACIÓN DE ELEMENTOS ---
function inicializarTodo() {
    // Inicializar EmailJS
    emailjs.init(Public_KEY_Emailjs);

    // Inicializar Canvas
    canvas = document.getElementById('canvas-firma');
    ctx = canvas.getContext('2d');
    configurarFirma();

    // Configurar Timer
    resetTimer();
    document.onmousedown = resetTimer;

    // Escoitar o envío do formulario
    document.getElementById('formulario').addEventListener('submit', enviarFormulario);
}

// --- 3. LÓXICA DE NEGOCIO ---
function mostrarSeccion(id) {
    document.querySelectorAll('.encabezado, .viajero-bloque').forEach(sec => sec.style.display = 'none');
    const elemento = document.getElementById(id);
    if (elemento) elemento.style.display = 'block';
}

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

async function enviarFormulario(e) {
    e.preventDefault();
    
    // Capturar a firma como imaxe Base64
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
        firma_base64: firmaImagen // Agora si se garda no PDF
    };

    const { error } = await _supabase.from('hospedes').insert([datos]);

    if (!error) {
        if (hospedeActual < totalHospedes) {
            hospedeActual++;
            document.getElementById('formulario').reset();
            limparFirma();
            document.getElementById('titulo-formulario').innerText = `Datos del Viajero ${hospedeActual}`;
        } else {
            finalizarProceso();
        }
    } else {
        alert("Erro ao gardar: " + error.message);
    }
}

async function finalizarProceso() {
    try {
        // Rexistrar evento
        await _supabase.from('eventos_sistema').insert([{
            reserva_id: reservaId,
            tipo_evento: 'checkin_completado',
            fecha_evento: new Date().toISOString(),
            notificado: false
        }]);

        // Enviar Email
        emailjs.send(Service_ID_emailjs, Templace_ID_emailjs, {
            reserva_id: reservaId,
            fecha_evento: new Date().toLocaleString()
        });

        localStorage.setItem('hospede_rexistrado', 'true');
        window.location.href = "crear-cuenta.html";
    } catch (err) {
        console.error(err);
    }
}

// --- 4. FUNCIÓNS AUXILIARES (Firma e Timer) ---
function configurarFirma() {
    const pouse = () => { debuxando = false; ctx.beginPath(); };
    const mover = (e) => {
        if (!debuxando) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    canvas.addEventListener('mousedown', () => debuxando = true);
    canvas.addEventListener('mouseup', pouse);
    canvas.addEventListener('mousemove', mover);
    canvas.addEventListener('touchstart', (e) => { debuxando = true; e.preventDefault(); });
    canvas.addEventListener('touchmove', mover);
    canvas.addEventListener('touchend', pouse);
}

function limparFirma() { ctx.clearRect(0, 0, canvas.width, canvas.height); }

function resetTimer() {
    clearTimeout(tempoInactividade);
    tempoInactividade = setTimeout(() => window.location.href = "index.html", 300000);
}
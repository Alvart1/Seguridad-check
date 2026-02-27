// --- CONFIGURACIÓN ---
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 
const supabase = supabase.createClient(URL_SUPA, KEY_SUPA); // <--- Variable unificada

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

// --- 1. CONTROL DE ACCESO ---
document.addEventListener("DOMContentLoaded", () => {
    const accesoQR = urlParams.get('auth') === 'ok';

    if (sessionStorage.getItem('tablet_desbloqueada') !== 'true' && !accesoQR) {
        window.location.href = "index.html";
        return;
    }

    if (accesoQR) {
        sessionStorage.setItem('tablet_desbloqueada', 'true');
    }

    const seccionInicial = document.querySelector('.encabezado'); 
    if (seccionInicial) {
        seccionInicial.style.display = 'block';
    }

    inicializarTodo();
});

function inicializarTodo() {
    emailjs.init(Public_KEY_Emailjs);
    canvas = document.getElementById('canvas-firma');
    if (canvas) {
        ctx = canvas.getContext('2d');
        configurarFirma();
    }
    resetTimer();
    document.getElementById('formulario').addEventListener('submit', enviarFormulario);
}

function mostrarSeccion(id) {
    document.querySelectorAll('.encabezado, .viajero-bloque').forEach(sec => sec.style.display = 'none');
    const elemento = document.getElementById(id);
    if (elemento) elemento.style.display = 'block';
}

async function comezarRexistro(numero) {
    totalHospedes = numero;
    if (reservaIdDendeURL) {
        reservaId = reservaIdDendeURL;
        mostrarSeccion('seccion-formulario');
    } else {
        try {
            const { data, error } = await supabase.from('reservas').insert([{ fecha_entrada: new Date().toISOString().split('T')[0] }]).select();
            if (error) throw error;
            reservaId = data[0].id;
            mostrarSeccion('seccion-formulario');
        } catch (err) {
            alert("Erro ao conectar coa base de datos");
        }
    }
}

async function enviarFormulario(e) {
    e.preventDefault();
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

    // CORREGIDO: Usamos 'supabase' sin guion
    const { error } = await supabase.from('hospedes').insert([datos]);

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
        // CORREGIDO: Usamos 'supabase' sin guion
        await supabase.from('eventos_sistema').insert([{
            reserva_id: parseInt(reservaIdDendeURL || reservaId),
            tipo_evento: 'checkin_completado',
            fecha_evento: new Date().toISOString(),
            notificado: false
        }]);

        emailjs.send(Service_ID_emailjs, Templace_ID_emailjs, {
            reserva_id: reservaIdDendeURL || reservaId,
            fecha_evento: new Date().toLocaleString(),
            mensaje: "O hóspede completou o rexistro e xa ten acceso ao caixón."
        });

        localStorage.setItem('hospede_rexistrado', 'true');

        if (reservaIdDendeURL) {
            document.body.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; font-family: sans-serif; background-color: #f4f7f6; padding: 20px;">
                    <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <div style="font-size: 60px; margin-bottom: 20px;">✅</div>
                        <h1 style="color: #2ecc71;">¡Rexistro completado!</h1>
                        <p>Agora xa podes usar a tablet da entrada para recoller as túas chaves.</p>
                    </div>
                </div>`;
        } else {
            window.location.href = "crear-cuenta.html";
        }

    } catch (err) {
        alert("O rexistro gardouse, pero houbo un erro ao finalizar.");
    }
}

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
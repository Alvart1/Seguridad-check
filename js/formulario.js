// --- CONFIGURACIÓN SUPABASE ---
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);
const Public_KEY_Emailjs = '-7vKXPKDrKzQiVSrn';
const Service_ID_emailjs = 'service_cog5jua';
const Templace_ID_emailjs = 'template_5m1y4si';

let totalHospedes = 0, hospedeActual = 1, reservaId = null;

// --- CONTROL DE ACCESO ---
// Comprobar si venimos del QR (parámetro en la URL)
const urlParams = new URLSearchParams(window.location.search);
const accesoQR = urlParams.get('auth') === 'ok';

if (sessionStorage.getItem('tablet_desbloqueada') !== 'true' && !accesoQR) {
    // Si no es la tablet y no viene con el parámetro del QR, al index
    window.location.href = "index.html";
} else {
    // Si entramos por QR en el móvil, autorizamos también esta sesión de móvil
    if (accesoQR) {
        sessionStorage.setItem('tablet_desbloqueada', 'true');
    }
}

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
    // Convertimos el dibujo del canvas a una imagen de texto (Base64)
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
        firma: firmaImagen // <--- AÑADE ESTA LÍNEA PARA QUE EL PDF TENGA FIRMA
    };

    const { error } = await _supabase.from('hospedes').insert([datos]);
    // ... resto del código
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
// 📧 Enviar email automático al propietario
emailjs.send(Service_ID_emailjs, Templace_ID_emailjs, {
    reserva_id: reservaId,
    fecha_evento: new Date().toLocaleString()
})
.then(() => {
    console.log("Email enviado correctamente");
})
.catch((error) => {
    console.error("Error enviando email:", error);
});

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

//Mensaje automatico al correo

  (function(){
    emailjs.init(Public_KEY_Emailjs);
  })();
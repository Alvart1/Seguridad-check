const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

// --- CONFIGURACIÓN E VARIABLES ---
const PIN_PROPIETARIO = "0000"; // PIN para desbloquear a tablet ao principio
let totalHospedes = 0;
let hospedeActual = 1;
let reservaId = null;
let streamCamara = null;

// Elementos do DOM
const seccionInicio = document.getElementById('paso-inicio');
const seccionForm = document.getElementById('seccion-formulario');
const seccionFinal = document.getElementById('seccion-final');
const tituloForm = document.getElementById('titulo-formulario');
const formulario = document.getElementById('formulario');
const canvasFirma = document.getElementById('canvas-firma');
const ctxFirma = canvasFirma?.getContext('2d');

// --- 1. BLOQUEO INICIAL E VERIFICACIÓN ---
window.onload = function() {
    if (!sessionStorage.getItem('tablet_desbloqueada')) {
        bloquearTablet();
    } else {
        verificarRexistro();
    }
};

function bloquearTablet() {
    let intento = prompt("Introduce el PIN de acceso a la Tablet:");
    if (intento === PIN_PROPIETARIO) {
        sessionStorage.setItem('tablet_desbloqueada', 'true');
        verificarRexistro();
    } else {
        alert("PIN incorrecto");
        bloquearTablet();
    }
}

function verificarRexistro() {
    const rexistrado = localStorage.getItem('hospede_rexistrado');
    if (rexistrado === 'true') {
        seccionInicio.style.display = 'none';
        seccionForm.style.display = 'none';
        seccionFinal.style.display = 'block';
        document.getElementById('seleccion-metodo').style.display = 'flex';
        const nome = localStorage.getItem('nome_hospede') || "Huésped";
        document.getElementById('mensaje-acceso').innerHTML = `<h2>Bienvenido, ${nome}</h2>`;
    } else {
        seccionInicio.style.display = 'block';
    }
}

// --- 2. PROCESO DE REXISTRO LEGAL ---
async function comezarRexistro(numero) {
    totalHospedes = numero;
    const { data, error } = await _supabase
        .from('reservas')
        .insert([{ fecha_entrada: new Date().toISOString().split('T')[0] }])
        .select();

    if (error) return alert("Erro ao conectar con Supabase");
    reservaId = data[0].id; 
    seccionInicio.style.display = 'none';
    seccionForm.style.display = 'block';
    actualizarTitulo();
}

function actualizarTitulo() {
    tituloForm.innerText = `Datos del Viajero ${hospedeActual} de ${totalHospedes}`;
}
 
formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = {
        reserva_id: reservaId,
        nombre: document.getElementById('nombre').value,
        apellidos: document.getElementById('apellidos').value,
        genero: document.getElementById('genero').value,
        tipo_documento: document.getElementById('tipo_documento').value,
        codigo_documento: document.getElementById('documento').value,
        telefono: document.getElementById('tlf').value,
        direccion: document.getElementById('direccion').value,
        fecha_nacimiento: document.getElementById('fecha_nac').value,
        soporte_dni: document.getElementById('soporte').value,
        email: document.getElementById('correo').value,
        nacionalidad: document.getElementById('nacionalidad').value,
        firma_base64: canvasFirma.toDataURL()
    };

    const { error } = await _supabase.from('hospedes').insert([datos]);

    if (error) {
        alert("Erro ao gardar: " + error.message);
    } else {
        if (hospedeActual < totalHospedes) {
            hospedeActual++;
            formulario.reset();
            limparFirma(); 
            actualizarTitulo();
            window.scrollTo(0, 0);
        } else {
            localStorage.setItem('hospede_rexistrado', 'true');
            localStorage.setItem('nome_hospede', datos.nombre);
            verificarRexistro();
        }
    }
});

// --- 3. ACCESO A CHAVES (PIN / FOTO) ---
function mostrarMetodo(tipo) {
    document.getElementById('seleccion-metodo').style.display = 'none';
    if (tipo === 'pin') {
        document.getElementById('metodo-pin').style.display = 'block';
    } else {
        document.getElementById('metodo-foto').style.display = 'block';
        iniciarCamara();
    }
}

function volverAlPanel() {
    document.getElementById('metodo-pin').style.display = 'none';
    document.getElementById('metodo-foto').style.display = 'none';
    document.getElementById('seleccion-metodo').style.display = 'flex';
    if (streamCamara) streamCamara.getTracks().forEach(track => track.stop());
}

async function accederConPin() {
    const nome = document.getElementById('nombre-pin').value || localStorage.getItem('nome_hospede');
    const pinIngresado = document.getElementById('pin-input').value;
    const pinGardado = localStorage.getItem('pin_usuario');

    if (!pinIngresado) return alert("Introduce un PIN");

    if (!pinGardado) {
        localStorage.setItem('pin_usuario', pinIngresado);
        alert("PIN de estancia creado.");
        await abrirCaixon(nome, 'PIN_CREACION');
    } else if (pinIngresado === pinGardado) {
        await abrirCaixon(nome, 'PIN_ACCESO');
    } else {
        alert("PIN incorrecto");
    }
}

async function accederConFoto() {
    const nome = localStorage.getItem('nome_hospede') || "Huésped";
    const video = document.getElementById('video');
    const canvasFoto = document.getElementById('canvas-foto');
    const context = canvasFoto.getContext('2d');
    context.drawImage(video, 0, 0, 320, 240);
    const fotoActual = canvasFoto.toDataURL('image/png');
    
    if (!localStorage.getItem('foto_facial')) {
        localStorage.setItem('foto_facial', fotoActual);
        alert("Identidad facial guardada.");
        await abrirCaixon(nome, 'FOTO_REGISTRO');
    } else {
        await abrirCaixon(nome, 'FOTO_RECONOCIMIENTO');
    }
    if (streamCamara) streamCamara.getTracks().forEach(track => track.stop());
}

// --- 4. COMUNICACIÓN E HARDWARE ---
async function abrirCaixon(nome, metodo) {
    const ipRaspberry = "10.158.13.63"; 
    try {
        const res = await fetch(`http://${ipRaspberry}:8080/abrir`, { mode: 'cors' });
        if (res.ok) {
            await _supabase.from('accesos_llaves').insert([{ nombre_usuario: nome, metodo_acceso: metodo }]);
            document.getElementById('metodo-pin').style.display = 'none';
            document.getElementById('metodo-foto').style.display = 'none';
            mostrarContador30s(nome);
        }
    } catch (e) {
        alert("Error de conexión con la Raspberry");
    }
}

function mostrarContador30s(nome) {
    let tiempo = 30;
    const msg = document.getElementById('mensaje-acceso');
    const intervalo = setInterval(() => {
        tiempo--;
        msg.innerHTML = `<h3 style="color: #2ecc71;">✅ Abierto</h3><b>Cerrando en: ${tiempo}s</b>`;
        if (tiempo <= 0) {
            clearInterval(intervalo);
            msg.innerHTML = "";
            volverAlPanel();
        }
    }, 1000);
}

// --- 5. FIRMA E CÁMARA ---
let debuxando = false;
canvasFirma.addEventListener('mousedown', () => debuxando = true);
canvasFirma.addEventListener('mouseup', () => { debuxando = false; ctxFirma.beginPath(); });
canvasFirma.addEventListener('mousemove', (e) => {
    if (!debuxando) return;
    const rect = canvasFirma.getBoundingClientRect();
    ctxFirma.lineWidth = 2;
    ctxFirma.lineCap = 'round';
    ctxFirma.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctxFirma.stroke();
});

function limparFirma() { ctxFirma.clearRect(0, 0, canvasFirma.width, canvasFirma.height); }

async function iniciarCamara() {
    const v = document.getElementById('video');
    try {
        streamCamara = await navigator.mediaDevices.getUserMedia({ video: true });
        v.srcObject = streamCamara;
    } catch (e) { alert("Cámara no disponible"); }
}

function pecharSesion() {
    if (confirm("¿Finalizar estancia? Se borrarán los datos de la tablet.")) {
        localStorage.clear();
        location.reload();
    }
}
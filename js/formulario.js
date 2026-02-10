const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

let totalHospedes = 0;
let hospedeActual = 1;
let reservaId = null;

const seccionInicio = document.getElementById('paso-inicio');
const seccionForm = document.getElementById('seccion-formulario');
const seccionFinal = document.getElementById('seccion-final');
const tituloForm = document.getElementById('titulo-formulario');
const formulario = document.getElementById('formulario');

// --- NOVO: COMPROBAR SE XA ESTÁ REXISTRADO AO CARGAR ---
window.onload = function() {
    const usuarioRexistrado = localStorage.getItem('hospede_rexistrado');
    const nomeGardado = localStorage.getItem('nome_hospede');

    if (usuarioRexistrado === 'true') {
        // Saltamos directo ás chaves
        seccionInicio.style.display = 'none';
        seccionForm.style.display = 'none';
        seccionFinal.style.display = 'block';
        
        // Mensaxe personalizada
        const msgAcceso = document.getElementById('mensaje-acceso');
        msgAcceso.innerHTML = `<h2 style="color: white;">Bienvenido de nuevo, ${nomeGardado}</h2>`;
    }
};

// --- PASO 1: COMEZAR ---
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

// --- PASO 2: ENVIAR HÓSPEDES ---
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
        firma_base64: document.getElementById('canvas-firma').toDataURL()
    };

    const { error } = await _supabase.from('hospedes').insert([datos]);

    if (error) {
        alert("Erro ao gardar: " + error.message);
    } else {
        if (hospedeActual < totalHospedes) {
            hospedeActual++;
            formulario.reset();
            limpar(); 
            actualizarTitulo();
            window.scrollTo(0, 0);
        } else {
            // GARDAR NA MEMORIA PARA A PRÓXIMA VEZ
            localStorage.setItem('hospede_rexistrado', 'true');
            localStorage.setItem('nome_hospede', datos.nombre);

            seccionForm.style.display = 'none';
            seccionFinal.style.display = 'block';
        }
    }
});

// --- FIRMA ---
const canvasFirma = document.getElementById('canvas-firma');
const ctxFirma = canvasFirma.getContext('2d');
let debuxando = false;

canvasFirma.addEventListener('mousedown', () => debuxando = true);
canvasFirma.addEventListener('mouseup', () => { debuxando = false; ctxFirma.beginPath(); });
canvasFirma.addEventListener('mousemove', (e) => {
    if (!debuxando) return;
    const rect = canvasFirma.getBoundingClientRect();
    ctxFirma.lineWidth = 2;
    ctxFirma.lineCap = 'round';
    ctxFirma.strokeStyle = 'black';
    ctxFirma.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctxFirma.stroke();
});

function limpar() {
    ctxFirma.clearRect(0, 0, canvasFirma.width, canvasFirma.height);
}

// --- ACCESO A LLAVES ---
function mostrarMetodo(tipo) {
    document.getElementById('seleccion-metodo').style.display = 'none';
    if (tipo === 'pin') {
        document.getElementById('metodo-pin').style.display = 'block';
    } else {
        document.getElementById('metodo-foto').style.display = 'block';
        iniciarCamara();
    }
}

let streamCamara = null;
async function iniciarCamara() {
    const video = document.getElementById('video');
    try {
        streamCamara = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = streamCamara;
    } catch (err) {
        alert("No se pudo acceder a la cámara");
    }
}

async function accionarMotorFisico() {
    const ipRaspberry = "10.158.13.63"; 
    try {
        const respuesta = await fetch(`http://${ipRaspberry}:8080/abrir`, {
            method: 'GET',
            mode: 'cors'
        });
        return respuesta.ok;
    } catch (error) {
        console.error("Error conexión:", error);
        alert("Error de conexión con el cajón físico.");
        return false;
    }
}

async function accederConPin() {
    const nome = document.getElementById('nombre-pin').value || localStorage.getItem('nome_hospede');
    const pin = document.getElementById('pin-input').value;

    if (pin === "1234" && nome) {
        const abierto = await accionarMotorFisico();
        if (abierto) {
            await _supabase.from('accesos_llaves').insert([{ nombre_usuario: nome, metodo_acceso: 'PIN' }]);
            document.getElementById('metodo-pin').style.display = 'none';
            mostrarContador30s(nome);
        }
    } else {
        alert("PIN o nombre incorrectos");
    }
}

async function accederConFoto() {
    const nome = document.getElementById('nombre-foto').value || localStorage.getItem('nome_hospede');
    if (!nome) return alert("Por favor, introduce tu nombre");

    const video = document.getElementById('video');
    const canvasFoto = document.getElementById('canvas-foto');
    const context = canvasFoto.getContext('2d');
    context.drawImage(video, 0, 0, 320, 240);
    const fotoData = canvasFoto.toDataURL('image/png');

    const abierto = await accionarMotorFisico();
    if (abierto) {
        await _supabase.from('accesos_llaves').insert([{ nombre_usuario: nome, metodo_acceso: 'FOTO', foto_base64: fotoData }]);
        if (streamCamara) streamCamara.getTracks().forEach(track => track.stop());
        document.getElementById('metodo-foto').style.display = 'none';
        mostrarContador30s(nome);
    }
}

function mostrarContador30s(nome) {
    let tiempo = 30;
    const msg = document.getElementById('mensaje-acceso');
    const intervalo = setInterval(() => {
        tiempo--;
        msg.innerHTML = `<h3>✅ Acceso concedido, ${nome}</h3><b style="color: orange;">⏳ Cajón abierto. Se cerrará en ${tiempo}s</b>`;
        if (tiempo <= 0) {
            clearInterval(intervalo);
            msg.innerHTML = `<b style="color: red;">🔒 Cajón cerrado.</b><br><br>
                             <button onclick="pecharSesion()">Salir / Nuevo Registro</button>`;
        }
    }, 1000);
}

// FUNCIÓN PARA PODER VOLVER A EMPEZAR DE CERO
function pecharSesion() {
    localStorage.clear();
    location.reload();
}
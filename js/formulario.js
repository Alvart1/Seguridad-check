// 1. CONFIGURACIÓN (Usa os teus datos das fotos)
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; // A túa clave completa
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

// 2. VARIABLES DE CONTROL
let totalHospedes = 0;
let hospedeActual = 1;
let reservaId = null;

// Elementos do HTML
const seccionInicio = document.getElementById('paso-inicio');
const seccionForm = document.getElementById('seccion-formulario');
const seccionFinal = document.getElementById('seccion-final');
const tituloForm = document.getElementById('titulo-formulario');
const formulario = document.getElementById('formulario');

// --- PASO 1: COMEZAR ---
async function comezarRexistro(numero) {
    totalHospedes = numero;
    
    // Antes de nada, creamos a reserva na base de datos para ter un ID
    const { data, error } = await _supabase
        .from('reservas')
        .insert([{ fecha_entrada: new Date().toISOString().split('T')[0] }])
        .select();

    if (error) return alert("Erro ao conectar con Supabase");
    
    reservaId = data[0].id; // Gardamos o ID para os hóspedes
    
    // Cambiamos de pantalla
    seccionInicio.style.display = 'none';
    seccionForm.style.display = 'block';
    actualizarTitulo();
}

function actualizarTitulo() {
    tituloForm.innerText = `Datos del Viajero ${hospedeActual} de ${totalHospedes}`;
}

// --- PASO 2: ENVIAR CADA HÓSPEDE ---
formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Recoller datos do formulario
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

    // Gardar en Supabase
    const { error } = await _supabase.from('hospedes').insert([datos]);

    if (error) {
        alert("Erro ao gardar: " + error.message);
    } else {
        // Se todo vai ben, comprobamos se hai máis persoas
        if (hospedeActual < totalHospedes) {
            hospedeActual++;
            formulario.reset();
            limpar(); // Limpar a firma
            actualizarTitulo();
            window.scrollTo(0, 0); // Volver arriba para o seguinte
        } else {
            // REMATAMOS
            seccionForm.style.display = 'none';
            seccionFinal.style.display = 'block';
        }
    }
});

// --- LÓXICA DA FIRMA ---
const canvas = document.getElementById('canvas-firma');
const ctx = canvas.getContext('2d');
let debuxando = false;

canvas.addEventListener('mousedown', () => debuxando = true);
canvas.addEventListener('mouseup', () => { debuxando = false; ctx.beginPath(); });
canvas.addEventListener('mousemove', (e) => {
    if (!debuxando) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
});

function limpar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


// --- LÓXICA DE ACCESO ---

function mostrarMetodo(tipo) {
    document.getElementById('seleccion-metodo').style.display = 'none';
    if (tipo === 'pin') {
        document.getElementById('metodo-pin').style.display = 'block';
    } else {
        document.getElementById('metodo-foto').style.display = 'block';
        iniciarCamara();
    }
}

async function iniciarCamara() {
    const video = document.getElementById('video');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
}

// CASO A: ACCESO CON PIN
async function accederConPin() {
    const nome = document.getElementById('nombre-pin').value;
    const pin = document.getElementById('pin-input').value;

    if (pin === "1234" && nome !== "") {
        const { error } = await _supabase.from('accesos_llaves').insert([
            { nombre_usuario: nome, metodo_acceso: 'PIN' }
        ]);
        
        if (!error) {
            alert("Acceso rexistrado. Abrindo...");
            window.location.href = URL_SUPA;
        }
    } else {
        alert("Datos incorrectos");
    }
}

// CASO B: ACCESO CON FOTO
async function accederConFoto() {
    const nome = document.getElementById('nombre-foto').value;
    if (nome === "") return alert("Pon o teu nome");

    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas-foto');
    const context = canvas.getContext('2d');
    
    // Capturar frame do video
    context.drawImage(video, 0, 0, 320, 240);
    const fotoData = canvas.toDataURL('image/png');

    // Gardar en Supabase
    const { error } = await _supabase.from('accesos_llaves').insert([
        { nombre_usuario: nome, metodo_acceso: 'FOTO', foto_base64: fotoData }
    ]);

    if (!error) {
        alert("Foto gardada e acceso concedido!");
        window.location.href = URL_SUPA;
    } else {
        alert("Erro ao gardar a foto");
    }
}

// --- FUNCIÓN PARA ACCIONAR O MOTOR (CONEXIÓN FÍSICA) ---
async function accionarMotorFisico() {
    const ipRaspberry = "10.100.89.63"; // CAMBIA ISTO pola IP da túa Raspberry
    console.log("Enviando orde de apertura á Raspberry...");

    try {
        const respuesta = await fetch(`http://${ipRaspberry}:8080/abrir`, {
            method: 'GET',
            mode: 'cors' // Importante para que o navegador non bloquee a petición
        });

        if (respuesta.ok) {
            console.log("Motor activado: Caixón aberto.");
            return true;
        }
    } catch (error) {
        console.error("Erro de conexión coa Raspberry:", error);
        alert("Non se puido conectar co caixón. Revisa a rede.");
        return false;
    }
}

// --- ACTUALIZACIÓN DAS TÚAS FUNCIÓNS DE ACCESO ---

async function accederConPin() {
    const nome = document.getElementById('nombre-pin').value;
    const pin = document.getElementById('pin-input').value;

    if (pin === "1234" && nome !== "") {
        // 1. Gardamos en Supabase
        await _supabase.from('accesos_llaves').insert([{ nombre_usuario: nome, metodo_acceso: 'PIN' }]);
        
        // 2. Abrimos o caixón físico
        const abierto = await accionarMotorFisico();
        if(abierto) mostrarContador30s();
    } else {
        alert("PIN ou nome incorrectos");
    }
}

async function accederConFoto() {
    const nome = document.getElementById('nombre-foto').value;
    if (nome === "") return alert("Pon o teu nome");

    const canvas = document.getElementById('canvas-foto');
    const fotoData = canvas.toDataURL('image/png');

    // 1. Gardamos en Supabase con foto
    await _supabase.from('accesos_llaves').insert([{ nombre_usuario: nome, metodo_acceso: 'FOTO', foto_base64: fotoData }]);

    // 2. Abrimos o caixón físico
    const abierto = await accionarMotorFisico();
    if(abierto) mostrarContador30s();
}

function mostrarContador30s() {
    let tiempo = 30;
    const msg = document.getElementById('mensaje-acceso');
    const intervalo = setInterval(() => {
        tiempo--;
        msg.innerHTML = `<b style="color: orange;">⏳ Caixón aberto. Pecharase en ${tiempo}s</b>`;
        if (tiempo <= 0) {
            clearInterval(intervalo);
            msg.innerHTML = `<b style="color: red;">🔒 Caixón pechado.</b>`;
        }
    }, 1000);
}
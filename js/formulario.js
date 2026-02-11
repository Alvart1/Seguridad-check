const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

const PIN_PROPIETARIO = "0000"; 
let totalHospedes = 0, hospedeActual = 1, reservaId = null, streamCamara = null;

const seccionInicio = document.getElementById('paso-inicio');
const seccionForm = document.getElementById('seccion-formulario');
const seccionFinal = document.getElementById('seccion-final');
const canvasFirma = document.getElementById('canvas-firma');
const ctxFirma = canvasFirma?.getContext('2d');

// --- PASO 1: BLOQUEO E ESTADO ---
window.onload = function() {
    if (!sessionStorage.getItem('tablet_desbloqueada')) {
        let intento = prompt("Introduce el PIN de la Tablet:");
        if (intento === PIN_PROPIETARIO) {
            sessionStorage.setItem('tablet_desbloqueada', 'true');
            verificarEstado();
        } else {
            alert("PIN incorrecto");
            location.reload(); 
        }
    } else {
        verificarEstado();
    }
};

function limpiarInputsAcceso() {
    if(document.getElementById('nombre-pin')) document.getElementById('nombre-pin').value = "";
    if(document.getElementById('pin-input')) document.getElementById('pin-input').value = "";
}

function verificarEstado() {
    const rexistrado = localStorage.getItem('hospede_rexistrado');
    seccionInicio.style.display = 'none';
    seccionForm.style.display = 'none';
    seccionFinal.style.display = 'none';

    if (rexistrado === 'true') {
        seccionFinal.style.display = 'block';
        document.getElementById('seleccion-metodo').style.display = 'flex';
        document.getElementById('opcion-crear-metodo').style.display = 'none';
        document.getElementById('metodo-pin').style.display = 'none';
        document.getElementById('metodo-foto').style.display = 'none';
        limpiarInputsAcceso();
    } else {
        seccionInicio.style.display = 'block';
    }
}

// --- PASO 2: REXISTRO ---
async function comezarRexistro(numero) {
    totalHospedes = numero;
    const { data, error } = await _supabase.from('reservas').insert([{ fecha_entrada: new Date().toISOString().split('T')[0] }]).select();
    if (error) return alert("Erro de conexión");
    reservaId = data[0].id;
    seccionInicio.style.display = 'none';
    seccionForm.style.display = 'block';
}

document.getElementById('formulario').addEventListener('submit', async (e) => {
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
    if (!error) {
        if (hospedeActual < totalHospedes) {
            hospedeActual++;
            document.getElementById('formulario').reset();
            limparFirma();
            document.getElementById('titulo-formulario').innerText = `Datos del Viajero ${hospedeActual}`;
        } else {
            localStorage.setItem('hospede_rexistrado', 'true');
            verificarEstado();
        }
    }
});

// --- PASO 3: CHAVES ---
function clickEnChaves() {
    const metodoElexido = localStorage.getItem('metodo_preferido');
    document.getElementById('seleccion-metodo').style.display = 'none';
    limpiarInputsAcceso();
    if (!metodoElexido) {
        document.getElementById('opcion-crear-metodo').style.display = 'flex';
    } else if (metodoElexido === 'pin') {
        document.getElementById('metodo-pin').style.display = 'block';
        document.getElementById('titulo-pin').innerText = "Identifícate para abrir";
        document.getElementById('btn-pin-accion').innerText = "Validar y Abrir";
    } else {
        document.getElementById('metodo-foto').style.display = 'block';
        iniciarCamara().then(() => setTimeout(procesarFoto, 2000));
    }
}

function prepararConfiguracion(tipo) {
    document.getElementById('opcion-crear-metodo').style.display = 'none';
    limpiarInputsAcceso();
    if (tipo === 'pin') {
        document.getElementById('metodo-pin').style.display = 'block';
        document.getElementById('titulo-pin').innerText = "Crea tu Usuario y PIN";
        document.getElementById('btn-pin-accion').innerText = "Registrar Cuenta";
    } else {
        document.getElementById('metodo-foto').style.display = 'block';
        iniciarCamara();
    }
}

async function procesarPin() {
    const user = document.getElementById('nombre-pin').value;
    const pin = document.getElementById('pin-input').value;
    const modoRegistro = !localStorage.getItem('metodo_preferido');

    if (modoRegistro) {
        if (user && pin) {
            localStorage.setItem('metodo_preferido', 'pin');
            localStorage.setItem('user_estancia', user);
            localStorage.setItem('pass_estancia', pin);
            await _supabase.from('accesos_llaves').insert([{ nombre_usuario: user, metodo_acceso: 'REGISTRO_PIN' }]);
            alert("Cuenta creada. Vuelve a entrar para abrir.");
            verificarEstado();
        }
    } else {
        if (user === localStorage.getItem('user_estancia') && pin === localStorage.getItem('pass_estancia')) {
            await abrirCaixon(user, 'ACCESO_PIN');
        } else {
            alert("Incorrecto");
            limpiarInputsAcceso();
        }
    }
}

// --- FINALIZAR (CORRECCIÓN) ---
async function finEstancia() {
    if (confirm("¿Finalizar estancia? Se abrirá el cajón y se borrarán tus datos.")) {
        const ok = await abrirCaixon('Sistema', 'FIN_ESTANCIA');
        if (ok) {
            localStorage.clear();
            sessionStorage.clear(); // Isto forza o PIN 0000 ao recargar
            location.reload(); 
        }
    }
}

async function abrirCaixon(nome, metodo) {
    const ip = "10.158.13.63";
    try {
        const res = await fetch(`http://${ip}:8080/abrir`, { mode: 'cors' });
        if (res.ok) {
            await _supabase.from('accesos_llaves').insert([{ nombre_usuario: nome, metodo_acceso: metodo }]);
            document.getElementById('mensaje-acceso').innerHTML = "✅ CAJÓN ABIERTO";
            setTimeout(verificarEstado, 5000);
            return true;
        }
    } catch (e) { alert("Error Hardware"); return false; }
}

function volverAlPanel() { verificarEstado(); }
function limparFirma() { ctxFirma.clearRect(0, 0, canvasFirma.width, canvasFirma.height); }

// Debuxar firma
let debuxando = false;
canvasFirma.addEventListener('mousedown', () => debuxando = true);
canvasFirma.addEventListener('mouseup', () => { debuxando = false; ctxFirma.beginPath(); });
canvasFirma.addEventListener('mousemove', (e) => {
    if (!debuxando) return;
    const rect = canvasFirma.getBoundingClientRect();
    ctxFirma.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctxFirma.stroke();
});
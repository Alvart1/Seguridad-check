const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

// --- 1. CONFIGURACIÓN ---
const PIN_PROPIETARIO = "0000"; 
let totalHospedes = 0, hospedeActual = 1, reservaId = null, streamCamara = null;

const seccionInicio = document.getElementById('paso-inicio');
const seccionForm = document.getElementById('seccion-formulario');
const seccionFinal = document.getElementById('seccion-final');
const canvasFirma = document.getElementById('canvas-firma');
const ctxFirma = canvasFirma?.getContext('2d');

// --- PASO 1: BLOQUEO TABLET (CORRECCIÓN) ---
window.onload = function() {
    // Aseguramos que todo estea oculto ao cargar
    seccionInicio.style.display = 'none';
    seccionForm.style.display = 'none';
    seccionFinal.style.display = 'none';

    if (!sessionStorage.getItem('tablet_desbloqueada')) {
        bloquearTablet();
    } else {
        verificarEstado();
    }
};

function bloquearTablet() {
    let intento = prompt("Introduce el PIN de la Tablet:");
    if (intento === PIN_PROPIETARIO) {
        sessionStorage.setItem('tablet_desbloqueada', 'true');
        verificarEstado();
    } else {
        alert("PIN incorrecto");
        bloquearTablet(); // Reintento forzoso
    }
}

// --- LIMPEZA DE INPUTS (CORRECCIÓN FALLO 1) ---
function limparInputsAcceso() {
    if(document.getElementById('nombre-pin')) document.getElementById('nombre-pin').value = "";
    if(document.getElementById('pin-input')) document.getElementById('pin-input').value = "";
    if(document.getElementById('mensaje-acceso')) document.getElementById('mensaje-acceso').innerText = "";
}

function verificarEstado() {
    const rexistrado = localStorage.getItem('hospede_rexistrado');
    
    // Ocultamos todo primeiro
    seccionInicio.style.display = 'none';
    seccionForm.style.display = 'none';
    seccionFinal.style.display = 'none';

    if (rexistrado === 'true') {
        seccionFinal.style.display = 'block';
        document.getElementById('seleccion-metodo').style.display = 'flex';
        document.getElementById('opcion-crear-metodo').style.display = 'none';
        document.getElementById('metodo-pin').style.display = 'none';
        document.getElementById('metodo-foto').style.display = 'none';
        limparInputsAcceso();
        pararCamara();
    } else {
        seccionInicio.style.display = 'block';
    }
}

// --- PASO 2 e 3: REXISTRO LEGAL ---
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
        genero:
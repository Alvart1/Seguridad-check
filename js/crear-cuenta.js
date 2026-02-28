/**
 * js/crear-cuenta.js
 * Conexión definitiva con la tabla 'accesos_llaves' y captura de cámara
 */

// 1. CONFIGURACIÓN
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhmd292dHJscGlwbmdob3lkdXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyOTEwODEsImV4cCI6MjA4NTg2NzA4MX0.Ddzb0ZDbr3GJme-7G__SwhB4IOd2er5aCB6Yexp7F7Y'; 

const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

let streamCamara = null; // Para controlar el encendido/apagado de la cámara

// 2. CONTROL DE INTERFAZ
async function mostrarFormulario(tipo) {
    // Limpiamos campos previos
    const nomPin = document.getElementById('nombre-pin');
    const pin = document.getElementById('pin-valor');
    const nomFoto = document.getElementById('nombre-foto');
    
    if (nomPin) nomPin.value = "";
    if (pin) pin.value = "";
    if (nomFoto) nomFoto.value = "";

    document.getElementById('paso-seleccion').style.display = 'none';
    
    if (tipo === 'pin') {
        document.getElementById('form-pin').style.display = 'block';
    } else {
        document.getElementById('form-foto').style.display = 'block';
        await iniciarCamara(); // Encendemos la cámara si es facial
    }
}

// 3. LÓGICA DE CÁMARA
async function iniciarCamara() {
    const video = document.getElementById('video-camara');
    try {
        streamCamara = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = streamCamara;
    } catch (err) {
        alert("No se pudo acceder a la cámara. Asegúrate de dar permisos.");
        console.error("Error cámara:", err);
    }
}

// 4. FUNCIÓN DE GUARDADO ÚNICA
async function guardarYVolver(metodo) {
    let nombreFinal, valorAcceso;
    
    if (metodo === 'pin') {
        nombreFinal = document.getElementById('nombre-pin').value;
        valorAcceso = document.getElementById('pin-valor').value;
        
        if (nombreFinal.trim() === "" || valorAcceso.length < 4) {
            alert("Por favor, rellena tu nombre y un PIN de 4 cifras.");
            return;
        }
    } else {
        // Captura de imagen desde el video
        nombreFinal = document.getElementById('nombre-foto').value;
        if (nombreFinal.trim() === "") {
            alert("Por favor, introduce tu nombre antes de capturar.");
            return;
        }

        const video = document.getElementById('video-camara');
        const canvas = document.getElementById('canvas-foto');
        
        // Dibujamos el frame actual en el canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convertimos la imagen a texto Base64
        valorAcceso = canvas.toDataURL('image/png');
        
        // Apagamos la cámara
        if (streamCamara) {
            streamCamara.getTracks().forEach(track => track.stop());
        }
    }

    try {
        console.log("Enviando datos a Supabase...");
        
        const { error } = await _supabase
            .from('accesos_llaves')
            .insert([{ 
                nombre_usuario: nombreFinal, 
                metodo_acceso: metodo, 
                foto_base64: valorAcceso, 
                fecha_acceso: new Date().toISOString()
            }]);

        if (error) throw error;

        // Guardado local para la sesión de la tablet
        localStorage.setItem('hospede_rexistrado', 'true');
        localStorage.setItem('metodo_acceso', metodo);
        localStorage.setItem('pin_guardado', valorAcceso); 
        localStorage.setItem('nome_cliente', nombreFinal);

        alert("¡Cuenta de acceso creada correctamente!");
        window.location.href = "acceso-llaves.html";

    } catch (err) {
        console.error("Fallo:", err);
        alert("Error de conexión: " + err.message);
    }
}
// --- ESCUCHA EN TIEMPO REAL: De la Foto al botón de "Abrir Cajón" ---

/**
 * Lóxica para o Panel de Control (acceso-llaves.html)
 */
const IP_Raspberry = "http://10.182.60.63:3000/abrir";
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 
const supabaseClient = supabase.createClient(URL_SUPA, KEY_SUPA);
window.onload = function() {
    if (sessionStorage.getItem('tablet_desbloqueada') !== 'true') {
        window.location.href = "index.html";
        return;
    }
    
    const metodo = localStorage.getItem('metodo_acceso');
    const contenedor = document.getElementById('interfaz-dinamica');
    const btnCrear = document.querySelector('.crear-cuenta'); // Seleccionamos o botón

    if (metodo) {
        // 1. Ocultamos o botón de crear conta
        if (btnCrear) btnCrear.style.display = 'none';

        // 2. Amosamos o botón de abrir
        contenedor.innerHTML = `
            <div class="panel-usuario">
                <p>Bienvenido. Tu acceso por <strong>${metodo.toUpperCase()}</strong> está listo.</p>
                <button type="button" class="btn-principal" onclick="solicitarAcceso()">
                    🔑 ABRIR CAJÓN
                </button>
            </div>
        `;
    } else {
        contenedor.innerHTML = `
            <div class="benvida">
                <p>Bienvenido. Por favor, pulsa en "Crear cuenta" para empezar.</p>
            </div>
        `;
    }
};

// --- FUNCIÓNS DE ACCIÓN ---

async function solicitarAcceso() {
    const metodo = localStorage.getItem('metodo_acceso');
    
    if (metodo === 'pin') {
        let intento = prompt("Introduce tu PIN:");
        if (intento === localStorage.getItem('pin_guardado')) {
            abrirCajonReal();
        } else {
            alert("❌ PIN Incorrecto");
        }
    } else if (metodo === 'foto') {
        await verificarRostroReal();
    }
}

async function verificarRostroReal() {
    // 1. Cargar modelos (esto solo se hace la primera vez)
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/vladmandic/face-api/master/model');
    await faceapi.nets.faceLandmark68Net.loadFromUri('https://raw.githubusercontent.com/vladmandic/face-api/master/model');
    await faceapi.nets.faceRecognitionNet.loadFromUri('https://raw.githubusercontent.com/vladmandic/face-api/master/model');

    // 2. Obtener la foto guardada
    const fotoGuardadaBase64 = localStorage.getItem('pin_guardado');
    const imgGuardada = await faceapi.fetchImage(fotoGuardadaBase64);
    
    // 3. Obtener el descriptor del rostro guardado
    const descriptorGuardado = await faceapi.detectSingleFace(imgGuardada, new faceapi.TinyFaceDetectorOptions())
                                          .withFaceLandmarks()
                                          .withFaceDescriptor();

    if (!descriptorGuardado) {
        alert("No se pudo analizar la foto original. Intenta crear la cuenta de nuevo.");
        return;
    }

    // 4. Iniciar cámara para comparar
    const video = document.getElementById('video-verificar');
    document.getElementById('contenedor-verificacion').style.display = 'block';
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;

    // 5. Esperar un momento y capturar rostro actual
    setTimeout(async () => {
        const deteccionActual = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                                             .withFaceLandmarks()
                                             .withFaceDescriptor();

        if (deteccionActual) {
            // 6. Comparar distancias (0.6 es el umbral estándar, menos es más estricto)
            const distancia = faceapi.euclideanDistance(descriptorGuardado.descriptor, deteccionActual.descriptor);
            
            if (distancia < 0.5) { // ¡Coincidencia!
                alert("✅ Rostro reconocido con éxito.");
                stream.getTracks().forEach(t => t.stop()); // Apagar cámara
                abrirCajonReal();
            } else {
                alert("❌ El rostro no coincide.");
            }
        } else {
            alert("No se detecta ningún rostro frente a la cámara.");
        }
    }, 2000); // Damos 2 segundos para que el usuario se coloque
}
async function abrirCajonReal() {
    try {
        const res = await fetch(IP_Raspberry);
        if (res.ok) {
            alert("✅ ¡Cajón abierto! Recoge tus llaves.");
        } else {
            alert("⚠️ El cajón no responde. Comprueba la conexión del hardware.");
        }
    } catch (e) {
        alert("❌ ERROR: No se pudo conectar con el servidor del cajón.");
    }
}

// --- NAVEGACIÓN ---

function crearcuenta() {
    window.location.href = "crear-cuenta.html";
}

async function confirmarFinEstancia() {

    if (!confirm("¿Seguro que quieres finalizar? Se borrarán todos tus datos y la tablet se bloqueará.")) {
        return;
    }

    try {

        // Buscar última reserva
        const { data, error } = await supabaseClient
            .from('reservas')
            .select('*')
            .order('id', { ascending: false })
            .limit(1);

        if (error || !data || data.length === 0) {
            alert("No se encontró reserva activa.");
            return;
        }

        const ultimaReserva = data[0];

        // Actualizar estado
        const { error: updateError } = await supabaseClient
            .from('reservas')
            .update({
                estado_estancia: 'finalizada'
            })
            .eq('id', ultimaReserva.id);

        if (updateError) {
            alert("Error al finalizar estancia.");
            console.error(updateError);
            return;
        }

        alert("✅ Estancia finalizada correctamente");

        // Limpiar datos y bloquear tablet
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "index.html";

    } catch (err) {
        console.error(err);
        alert("Error inesperado");
    }
}

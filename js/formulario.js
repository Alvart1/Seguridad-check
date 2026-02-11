// --- CONFIGURACIÓN DE SUPABASE ---
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

// --- CONFIGURACIÓN DE ESTADO E PIN ---
const PIN_PROPIETARIO = "0000"; 
let totalHospedes = 0, hospedeActual = 1, reservaId = null, streamCamara = null;
let tempoInactividade;
const SEGUNDOS_INACTIVIDADE = 300; // 5 minutos (300 segundos)

// --- ELEMENTOS DA INTERFACE ---
const seccionBloqueo = document.getElementById('bloqueo-tablet');
const seccionInicio = document.getElementById('paso-inicio');
const seccionForm = document.getElementById('seccion-formulario');
const seccionFinal = document.getElementById('seccion-final');
const pantallaNegra = document.getElementById('pantalla-negra');
const canvasFirma = document.getElementById('canvas-firma');
const ctxFirma = canvasFirma?.getContext('2d');

// --- 1. XESTIÓN DE BLOQUEO E INACTIVIDADE ---

function resetTimer() {
    clearTimeout(tempoInactividade);
    // Se a tablet está inactiva, "apagamos" a pantalla
    tempoInactividade = setTimeout(apagarPantalla, SEGUNDOS_INACTIVIDADE * 1000);
}

// Detectar calquera interacción para resetear o temporizador
['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, resetTimer, true);
});

function apagarPantalla() {
    pantallaNegra.style.display = 'block';
}

function despertarTablet() {
    pantallaNegra.style.display = 'none';
    verificarEstado(); // Comprobamos se debe pedir o PIN ou seguir onde estaba
}

function validarPinTablet() {
    const inputPin = document.getElementById('pin-propietario').value;
    if (inputPin === PIN_PROPIETARIO) {
        sessionStorage.setItem('tablet_desbloqueada', 'true');
        document.getElementById('pin-propietario').value = "";
        verificarEstado();
    } else {
        alert("PIN de Propietario incorrecto");
        document.getElementById('pin-propietario').value = "";
    }
}

// --- 2. CONTROL DE VISTAS ---

window.onload = function() {
    verificarEstado();
    resetTimer();
};

function verificarEstado() {
    const desbloqueada = sessionStorage.getItem('tablet_desbloqueada');
    const rexistrado = localStorage.getItem('hospede_rexistrado');

    // Ocultamos absolutamente todo antes de decidir que mostrar
    seccionBloqueo.style.display = 'none';
    seccionInicio.style.display = 'none';
    seccionForm.style.display = 'none';
    seccionFinal.style.display = 'none';

    if (!desbloqueada) {
        // Estado A: Tablet bloqueada (Interface de PIN propietario)
        seccionBloqueo.style.display = 'block';
    } else if (rexistrado === 'true') {
        // Estado B: Xa hai hóspedes (Panel de chaves)
        seccionFinal.style.display = 'block';
        configurarVistaChaves();
    } else {
        // Estado C: Tablet desbloqueada pero sen hóspedes (Pregunta inicial)
        seccionInicio.style.display = 'block';
    }
}

function configurarVistaChaves() {
    document.getElementById('seleccion-metodo').style.display = 'flex';
    document.getElementById('opcion-crear-metodo').style.display = 'none';
    document.getElementById('metodo-pin').style.display = 'none';
    document.getElementById('metodo-foto').style.display = 'none';
    if(document.getElementById('nombre-pin')) document.getElementById('nombre-pin').value = "";
    if(document.getElementById('pin-input')) document.getElementById('pin-input').value = "";
}

// --- 3. PROCESO DE REXISTRO ---

async function comezarRexistro(numero) {
    totalHospedes = numero;
    try {
        const { data, error } = await _supabase
            .from('reservas')
            .insert([{ fecha_entrada: new Date().toISOString().split('T')[0] }])
            .select();
        
        if (error) throw error;
        reservaId = data[0].id;
        
        seccionInicio.style.display = 'none';
        seccionForm.style.display = 'block';
    } catch (err) {
        alert("Error de conexión con la base de datos");
    }
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
    } else {
        alert("Error al guardar los datos");
    }
});

// --- 4. XESTIÓN DE CHAVES E CAXÓN ---

function clickEnChaves() {
    const metodoElexido = localStorage.getItem('metodo_preferido');
    document.getElementById('seleccion-metodo').style.display = 'none';

    if (!metodoElexido) {
        document.getElementById('opcion-crear-metodo').style.display = 'flex';
    } else if (metodoElexido === 'pin') {
        document.getElementById('metodo-pin').style.display = 'block';
    } else {
        document.getElementById('metodo-foto').style.display = 'block';
        iniciarCamara().then(() => setTimeout(procesarFoto, 2000));
    }
}

function prepararConfiguracion(tipo) {
    document.getElementById('opcion-crear-metodo').style.display = 'none';
    if (tipo === 'pin') {
        document.getElementById('metodo-pin').style.display = 'block';
        document.getElementById('btn-pin-accion').innerText = "Registrar PIN";
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
            alert("Acceso configurado");
            verificarEstado();
        }
    } else {
        if (user === localStorage.getItem('user_estancia') && pin === localStorage.getItem('pass_estancia')) {
            await abrirCaixon(user, 'ACCESO_PIN');
        } else {
            alert("Credenciales incorrectas");
        }
    }
}

// --- 5. FINALIZAR ESTANCIA ---

async function finEstancia() {
    if (confirm("¿Finalizar estancia? El cajón se abrirá y se borrarán tus datos.")) {
        const ok = await abrirCaixon('Sistema', 'FIN_ESTANCIA');
        if (ok) {
            localStorage.clear();
            sessionStorage.clear(); // Borramos o desbloqueo da tablet
            
            // Simulación de "apagado" imediato tras marchar
            apagarPantalla();
            verificarEstado(); 
        }
    }
}

async function abrirCaixon(nome, metodo) {
    const ip = "10.158.13.63";
    try {
        const res = await fetch(`http://${ip}:8080/abrir`, { mode: 'cors' });
        if (res.ok) {
            await _supabase.from('accesos_llaves').insert([{ nombre_usuario: nome, metodo_acceso: metodo }]);
            document.getElementById('mensaje-acceso').innerText = "✅ CAJÓN ABIERTO";
            setTimeout(verificarEstado, 5000);
            return true;
        }
    } catch (e) { 
        alert("Error de comunicación con el hardware"); 
        return false; 
    }
}

// --- AUXILIARES ---
function volverAlPanel() { verificarEstado(); }
function limparFirma() { ctxFirma.clearRect(0, 0, canvasFirma.width, canvasFirma.height); }

if(canvasFirma){
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
}
// 1. CONFIGURACIÓN (Sempre debe ir na primeira liña para que o código a coñeza)
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 

// Aquí inicializamos a variable. Agora calquera función de abaixo xa a pode usar.
const supabase = supabase.createClient(URL_SUPA, KEY_SUPA); 

// 2. VARIABLES DE ESTADO
let tempoInactividade;
let reservaIdActual = null; 
let clicsSecretos = 0;

// --- ACCESO AO PANEL DE PROPIETARIO (CLICS SECRETOS) ---
document.addEventListener("DOMContentLoaded", () => {
    const titulo = document.querySelector(".titulo h1");
    if (titulo) {
        titulo.onclick = function() {
            clicsSecretos++;
            if (clicsSecretos === 5) {
                const pass = prompt("Acceso Restringido. Introduce la clave maestra:");
                if (pass === "abc123.") {
                    window.location.href = "panel-propietario.html";
                } else {
                    alert("Acceso denegado");
                    clicsSecretos = 0;
                }
            }
            setTimeout(() => { clicsSecretos = 0; }, 3000);
        };
    }
});

// --- FUNCIÓN PRINCIPAL: DESBLOQUEO E XERACIÓN DE QR ---
async function verificarYGenerar() {
    const pinCorrecto = "1234"; 
    const input = document.getElementById("pinInput");

    if (input.value === pinCorrecto) {
        try {
            // Agora xa non dará erro de inicialización porque 'supabase' definise na liña 6
            const { data, error } = await supabase
                .from('reservas')
                .insert([{ fecha_entrada: new Date().toISOString().split('T')[0] }])
                .select();

            if (error) throw error;

            reservaIdActual = data[0].id; 
            const urlDestino = `https://alvart1.github.io/Seguridad-check/formulario.html?auth=ok&reserva_id=${reservaIdActual}`;
            
            const contenedorQR = document.getElementById("qrcode");
            contenedorQR.innerHTML = ""; 
            new QRCode(contenedorQR, {
                text: urlDestino,
                width: 250,
                height: 250
            });

            document.getElementById("pantalla-inicio").style.display = "none";
            document.getElementById("pantalla-resultado").style.display = "flex";

            activarEscoitaRealtime(reservaIdActual);
            resetTimer();

        } catch (err) {
            alert("Erro en Supabase: " + err.message);
        }
    } else {
        alert("PIN INCORRECTO");
        input.value = "";
    }
}

// --- REALTIME: ESCOITAR AO MÓBIL ---
function activarEscoitaRealtime(id) {
    supabase
      .channel('cambios-hospedes')
      .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'hospedes',
          filter: `reserva_id=eq.${id}` 
      }, (payload) => {
          confirmarRexistroExitoso(payload.new.nombre);
      }).subscribe();
}

function confirmarRexistroExitoso(nombre) {
    const resultado = document.getElementById("pantalla-resultado");
    resultado.innerHTML = `
        <div style="text-align:center; padding: 30px; background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            <h1 style="color: #2ecc71; font-size: 2.5rem;">✅ ¡Listo!</h1>
            <p style="font-size: 1.3rem; color: #333;">Benvido/a, <b>${nombre}</b>.</p>
            <p style="margin-bottom: 25px;">O teu rexistro completouse dende o móbil.</p>
            <button onclick="abrirCajon()" style="padding: 20px 40px; font-size: 1.6rem; background: #2ecc71; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; width: 100%;">
                🔓 ABRIR CAIXÓN
            </button>
        </div>
    `;
}

function abrirCajon() {
    window.location.href = "crear-cuenta.html";
}

function resetTimer() {
    clearTimeout(tempoInactividade);
    tempoInactividade = setTimeout(() => {
        sessionStorage.removeItem('tablet_desbloqueada');
        window.location.reload();
    }, 300000);
}
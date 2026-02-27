let tempoInactividade;
let reservaIdActual = null; 
let clicsSecretos = 0;

// --- ACCESO AO PANEL DE PROPIETARIO (CLICS SECRETOS) ---
document.querySelector(".titulo h1").onclick = function() {
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

// --- FUNCIÓN PRINCIPAL: DESBLOQUEO E XERACIÓN DE QR ---
async function verificarYGenerar() {
    const pinCorrecto = "1234"; 
    const input = document.getElementById("pinInput");

    if (input.value === pinCorrecto) {
        try {
            // 🚩 REVISA AQUÍ: Se usas _supabase arriba, aquí tamén
            const { data, error } = await _supabase
                .from('reservas')
                .insert([{ fecha_entrada: new Date().toISOString().split('T')[0] }])
                .select();

            if (error) throw error;

            reservaIdActual = data[0].id; 
            console.log("ID creado con éxito: " + reservaIdActual);

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

            // 🚩 REVISA AQUÍ: Chama á escoita coa variable correcta
            activarEscoitaRealtime(reservaIdActual);
            resetTimer();

        } catch (err) {
            alert("Erro ao conectar con Supabase: " + err.message);
        }
    } else {
        alert("PIN INCORRECTO");
        input.value = "";
    }
}

// --- REALTIME: ESCOITAR AO MÓBIL ---
function activarEscoitaRealtime(id) {
    console.log("Tablet agardando por: " + id);
    
    // Cambia 'supabaseClient' por '_supabase' se esa é a túa variable constante
    _supabase
      .channel('cambios-hospedes')
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'hospedes',
          filter: `reserva_id=eq.${id}` 
        }, 
        (payload) => {
            console.log('¡Rexistro detectado!', payload.new);
            confirmarRexistroExitoso(payload.new.nombre);
        }
      )
      .subscribe();
}

// --- PANTALLA DE ÉXITO FINAL ---
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

// --- XESTIÓN DE INACTIVIDADE ---
function resetTimer() {
    clearTimeout(tempoInactividade);
    const pantallaResultado = document.getElementById("pantalla-resultado");
    const qrVisible = pantallaResultado && pantallaResultado.style.display === "flex";

    if (qrVisible) {
        tempoInactividade = setTimeout(() => {
            sessionStorage.removeItem('tablet_desbloqueada');
            window.location.reload(); // Recargamos para volver ao inicio limpo
        }, 300000); // 5 minutos
    }
}

// Escoitar interaccións para o timer
document.onmousemove = resetTimer;
document.onkeypress = resetTimer;
document.ontouchstart = resetTimer;
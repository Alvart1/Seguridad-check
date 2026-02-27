// ===============================
// CONFIGURACIÓN SUPABASE
// ===============================
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; // ⚠️ pon tu anon public key real
const supabaseClient = supabase.createClient(URL_SUPA, KEY_SUPA);

// ===============================
let reservaIdActual = null;
let canalRealtime = null;
let tempoInactividade;


// ===============================
// GENERAR QR Y CREAR RESERVA REAL
// ===============================
async function verificarYGenerar() {

    const pinCorrecto = "1234";
    const input = document.getElementById("pinInput");

    if (input.value !== pinCorrecto) {
        alert("PIN INCORRECTO");
        input.value = "";
        return;
    }

    try {

        // 1️⃣ Crear reserva real
        const { data, error } = await supabaseClient
            .from('reservas')
            .insert([{ estado_estancia: 'activa' }])
            .select()
            .single();

        if (error) throw error;

        reservaIdActual = data.id;

        // 2️⃣ Crear URL QR
        const urlDestino =
            `https://alvart1.github.io/Seguridad-check/formulario.html?reserva_id=${reservaIdActual}`;

        // 3️⃣ Generar QR
        const contenedorQR = document.getElementById("qrcode");
        contenedorQR.innerHTML = "";

        new QRCode(contenedorQR, {
            text: urlDestino,
            width: 250,
            height: 250
        });

        document.getElementById("pantalla-inicio").style.display = "none";
        document.getElementById("pantalla-resultado").style.display = "flex";

        activarRealtime(reservaIdActual);
        resetTimer();

    } catch (err) {
        console.error(err);
        alert("Error creando reserva.");
    }
}


// ===============================
// REALTIME – ESCUCHAR HOSPEDES
// ===============================
function activarRealtime(id) {

    if (canalRealtime) {
        supabaseClient.removeChannel(canalRealtime);
    }

    canalRealtime = supabaseClient
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
                confirmarRegistro(payload.new.nombre);
            }
        )
        .subscribe();
}


// ===============================
// CONFIRMAR REGISTRO
// ===============================
function confirmarRegistro(nombre) {

    const resultado = document.getElementById("pantalla-resultado");

    resultado.innerHTML = `
        <div style="text-align:center;padding:30px;background:white;border-radius:15px;">
            <h1 style="color:#2ecc71;font-size:2.5rem;">✅ ¡Registro completado!</h1>
            <p style="font-size:1.3rem;">Bienvenido/a <b>${nombre}</b></p>
            <button onclick="abrirCajon()"
                style="padding:20px 40px;font-size:1.6rem;background:#2ecc71;color:white;border:none;border-radius:10px;width:100%;">
                🔓 ABRIR CAJÓN
            </button>
        </div>
    `;
}


// ===============================
// TIMER INACTIVIDAD
// ===============================
function resetTimer() {

    clearTimeout(tempoInactividade);

    tempoInactividade = setTimeout(async () => {

        if (reservaIdActual) {
            await supabaseClient
                .from('reservas')
                .update({ estado_estancia: 'expirada' })
                .eq('id', reservaIdActual);
        }

        window.location.reload();

    }, 300000); // 5 min
}

document.onmousemove = resetTimer;
document.onkeypress = resetTimer;
document.ontouchstart = resetTimer;

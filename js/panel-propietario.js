function irCamaras() {
    window.location.href = "http://10.182.60.63/zm/index.php";
}

function irReservas() {
    window.location.href = "https://supabase.com/dashboard/project/xfwovtrlpipnghoyduql/editor/17513?schema=public";
}

const IP_Raspberry = "http://10.182.60.63:3000/abrir";
async function abrirCajon() {
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
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 
const supabaseClient = supabase.createClient(URL_SUPA, KEY_SUPA);

async function finalizarEstancia() {

    try {

        // 1️⃣ Buscar la última reserva creada
        const { data, error } = await supabaseClient
            .from('reservas')
            .select('*')
            .order('id', { ascending: false })
            .limit(1);

        if (error) {
            alert("Error al buscar reserva");
            console.error(error);
            return;
        }

        if (!data || data.length === 0) {
            alert("No hay reservas registradas");
            return;
        }

        const ultimaReserva = data[0];

        // 2️⃣ Actualizar solo estado_estancia
        const { error: updateError } = await supabaseClient
            .from('reservas')
            .update({
                estado_estancia: 'finalizada'
            })
            .eq('id', ultimaReserva.id);

        if (updateError) {
            alert("Error al actualizar reserva");
            console.error(updateError);
            return;
        }

        alert("✅ Estancia finalizada correctamente");

    } catch (err) {
        console.error(err);
        alert("Error inesperado al finalizar estancia");
    }
}


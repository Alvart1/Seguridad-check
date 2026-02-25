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

        // Buscar reserva activa
        const { data, error } = await supabase
            .from('reservas')
            .select('*')
            .eq('estado', 'activa')
            .single();

        if (error || !data) {
            alert("No hay estancia activa");
            return;
        }

        // Actualizar estado
        await supabase
            .from('reservas')
            .update({
                estado: 'finalizada',
                fecha_salida: new Date().toISOString()
            })
            .eq('id', data.id);

        alert("Estancia finalizada correctamente");

    } catch (err) {
        console.error(err);
        alert("Error al finalizar estancia");
    }
}

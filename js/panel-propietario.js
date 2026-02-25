function irCamaras() {
    window.location.href = "http://10.182.60.63/zm/index.php";
}

function irBaseDatos() {
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

async function irReservas() {
    // 1. Mostrar la sección y limpiar lo anterior
    const seccion = document.getElementById('seccion-reservas');
    const tabla = document.getElementById('tabla-reservas');
    seccion.style.display = 'block';
    tabla.innerHTML = '<p>Consultando base de datos...</p>';

    try {
        // 2. Pedir a Supabase todas las reservas
        const { data, error } = await supabaseClient
            .from('reservas')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            tabla.innerHTML = '<p>No hay reservas registradas.</p>';
            return;
        }

        // 3. Crear el HTML de la tabla
        let html = `
            <table border="1" style="width:100%; border-collapse: collapse; text-align: left;">
                <thead style="background-color: #2c3e50; color: white;">
                    <tr>
                        <th style="padding: 10px;">ID</th>
                        <th style="padding: 10px;">Titular</th>
                        <th style="padding: 10px;">Email</th>
                        <th style="padding: 10px;">Estado</th>
                        <th style="padding: 10px;">Fecha</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach(reserva => {
            html += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 10px;">${reserva.id}</td>
                    <td style="padding: 10px;">${reserva.nome_titular || 'N/A'}</td>
                    <td style="padding: 10px;">${reserva.email_titular || 'N/A'}</td>
                    <td style="padding: 10px;">
                        <span style="padding: 5px; border-radius: 5px; background: ${reserva.estado_estancia === 'finalizada' ? '#e74c3c' : '#2ecc71'}; color: white;">
                            ${reserva.estado_estancia}
                        </span>
                    </td>
                    <td style="padding: 10px;">${new Date(reserva.created_at).toLocaleString()}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        tabla.innerHTML = html;

    } catch (err) {
        console.error(err);
        tabla.innerHTML = '<p style="color:red;">Error al cargar reservas. Revisa la consola.</p>';
    }
}
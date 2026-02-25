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
    let seccion = document.getElementById('seccion-reservas');
    if (!seccion) {
        seccion = document.createElement('div');
        seccion.id = 'seccion-reservas';
        seccion.style.marginLeft = "240px";
        seccion.style.padding = "20px";
        document.body.appendChild(seccion);
    }
    
    seccion.style.display = 'block';
    seccion.innerHTML = '<h2>Listado Completo de Huéspedes</h2><div id="tabla-datos">Cargando...</div>';

    try {
        const { data, error } = await supabaseClient
            .from('reservas')
            .select(`
                id,
                created_at,
                estado_estancia,
                hospedes (
                    nombre,
                    apellidos,
                    genero,
                    codigo_documento,
                    direccion,
                    email
                )
            `)
            .order('id', { ascending: false });

        if (error) throw error;

        let html = `
            <table style="width:100%; border-collapse: collapse; background: white; font-size: 14px;">
                <thead>
                    <tr style="background-color: #2c3e50; color: white; text-align: left;">
                        <th style="padding:10px;">Nombre</th>
                        <th style="padding:10px;">DNI</th>
                        <th style="padding:10px;">Género</th>
                        <th style="padding:10px;">Dirección</th>
                        <th style="padding:10px;">Email</th>
                        <th style="padding:10px;">Estado</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach(reserva => {
            (reserva.hospedes || []).forEach(h => {
                html += `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding:10px;">${h.nombre} ${h.apellidos}</td>
                        <td style="padding:10px;">${h.codigo_documento}</td>
                        <td style="padding:10px;">${h.genero || '---'}</td>
                        <td style="padding:10px;">${h.direccion || '---'}</td>
                        <td style="padding:10px;">${h.email}</td>
                        <td style="padding:10px;">
                            <span style="color: ${reserva.estado_estancia === 'finalizada' ? 'red' : 'green'}; font-weight: bold;">
                                ${reserva.estado_estancia || 'activa'}
                            </span>
                        </td>
                    </tr>
                `;
            });
        });

        html += '</tbody></table>';
        document.getElementById('tabla-datos').innerHTML = html;

    } catch (err) {
        document.getElementById('tabla-datos').innerHTML = '<p>Error: ' + err.message + '</p>';
    }
}
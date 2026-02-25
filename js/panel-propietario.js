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
    seccion.innerHTML = '<h2>Listado Detallado de Huéspedes</h2><div id="tabla-datos">Cargando...</div>';

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
                    fecha_nacimiento,
                    email
                )
            `)
            .order('id', { ascending: false });

        if (error) throw error;

        let html = `
            <table style="width:100%; border-collapse: collapse; background: white; font-size: 13px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <thead>
                    <tr style="background-color: #2c3e50; color: white; text-align: left;">
                        <th style="padding:10px;">Fecha Registro</th>
                        <th style="padding:10px;">Nombre y Apellidos</th>
                        <th style="padding:10px;">DNI / Pasaporte</th>
                        <th style="padding:10px;">Género</th>
                        <th style="padding:10px;">F. Nacimiento</th>
                        <th style="padding:10px;">Dirección</th>
                        <th style="padding:10px;">Email</th>
                        <th style="padding:10px;">Estado</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach(reserva => {
            const fechaRegistro = new Date(reserva.created_at).toLocaleString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            (reserva.hospedes || []).forEach((h, index) => {
                html += `
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="padding:10px; color: #666; ">${index === 0 ? fechaRegistro : ''}</td>
                        <td style="padding:10px; font-weight: bold; color:black;">${h.nombre} ${h.apellidos}</td>
                        <td style="padding:10px; color:black;">${h.codigo_documento}</td>
                        <td style="padding:10px; color:black;">${h.genero || '---'}</td>
                        <td style="padding:10px; color:black;">${h.fecha_nacimiento || '---'}</td>
                        <td style="padding:10px; color:black;">${h.direccion || '---'}</td>
                        <td style="padding:10px; color:black;">${h.email}</td>
                        <td style="padding:10px; color:black;">
                            ${index === 0 ? `
                            <span style="padding: 3px 7px; border-radius: 4px; color: white; font-size: 11px; background: ${reserva.estado_estancia === 'finalizada' ? '#e74c3c' : '#2ecc71'};">
                                ${reserva.estado_estancia || 'activa'}
                            </span>` : ''}
                        </td>
                    </tr>
                `;
            });
        });

        html += '</tbody></table>';
        document.getElementById('tabla-datos').innerHTML = html;

    } catch (err) {
        document.getElementById('tabla-datos').innerHTML = '<p style="color:red;">Error: ' + err.message + '</p>';
    }
}

const CLAVE_ADMIN = "propietario123"; // La clave que tú quieras

function irCamaras() {
    const pass = prompt("Introduce la clave de seguridad para ver las cámaras:");
    if (pass === CLAVE_ADMIN) {
        window.location.href = "http://10.182.60.63/zm/index.php";
    } else {
        alert("Clave incorrecta");
    }
}

// Modifica el inicio de tu función irReservas para que incluya esto:
async function irReservas() {
    const pass = prompt("Introduce la clave de seguridad para ver la base de datos:");
    if (pass !== CLAVE_ADMIN) {
        alert("Clave incorrecta");
        return;
    }
    
    // ... aquí sigue todo el código que ya teníamos de la tabla ...
    let seccion = document.getElementById('seccion-reservas');
    // (Resto del código igual)
}
const URL_SUPA = 'TU_URL';
const KEY_SUPA = 'TU_PUBLIC_KEY';
const supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

async function cargarReservas() {

    const { data, error } = await supabase
        .from('reservas')
        .select(`
            id,
            fecha_entrada,
            hospedes (
                nombre,
                apellidos,
                codigo_documento,
                firma_base64
            ),
            eventos_sistema (
                tipo_evento,
                fecha_evento,
                notificado
            )
        `);

    if (error) {
        console.error(error);
        return;
    }

    mostrarReservas(data);
}

function mostrarReservas(reservas) {

    const contenedor = document.getElementById('lista-reservas');
    contenedor.innerHTML = '';

    reservas.forEach(reserva => {

        const div = document.createElement('div');
        div.style.border = "1px solid black";
        div.style.margin = "10px";
        div.style.padding = "10px";

        div.innerHTML = `
            <h3>Reserva ID: ${reserva.id}</h3>
            <p>Fecha entrada: ${reserva.fecha_entrada}</p>
            <p>Notificado: ${
                reserva.eventos_sistema.length > 0 
                ? reserva.eventos_sistema[0].notificado 
                : 'No'
            }</p>
            <h4>Huéspedes:</h4>
            ${reserva.hospedes.map(h =>
                `<p>${h.nombre} ${h.apellidos} - ${h.codigo_documento}</p>
                 <img src="${h.firma_base64}" width="200"/>`
            ).join('')}
        `;

        contenedor.appendChild(div);
    });
}

cargarReservas();

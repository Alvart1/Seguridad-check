const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 
const supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

function mostrarSeccion(id) {
    document.querySelectorAll('.seccion')
        .forEach(sec => sec.style.display = 'none');

    document.getElementById(id).style.display = 'block';

    if (id === 'reservas') {
        cargarReservas();
    }
}

async function cargarReservas() {

    const { data, error } = await supabase
        .from('reservas')
        .select(`
            id,
            fecha_entrada,
            hospedes(nombre, apellidos, codigo_documento)
        `);

    if (error) {
        console.error(error);
        return;
    }

    const contenedor = document.getElementById('lista-reservas');
    contenedor.innerHTML = '';

    data.forEach(r => {
        const div = document.createElement('div');
        div.style.border = "1px solid #ccc";
        div.style.margin = "10px";
        div.style.padding = "10px";

        div.innerHTML = `
            <h3>Reserva ${r.id}</h3>
            <p>Fecha: ${r.fecha_entrada}</p>
            ${r.hospedes.map(h =>
                `<p>${h.nombre} ${h.apellidos} - ${h.codigo_documento}</p>`
            ).join('')}
        `;

        contenedor.appendChild(div);
    });
}

async function abrirCajon() {

    await fetch("http://IP_RASPBERRY:3000/abrir-cajon", {
        method: "POST"
    });

    alert("Cajón abierto");
}


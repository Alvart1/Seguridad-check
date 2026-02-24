function irCamaras() {
    window.location.href = "http://IP_RASPBERRY/zm";
}

function irReservas() {
    window.location.href = "reservas.html";
}

function irLlaves() {
    window.location.href = "acceso-llaves.html";
}

async function abrirCajon() {

    try {
        await fetch("http://IP_RASPBERRY:3000/abrir-cajon", {
            method: "POST"
        });

        alert("Cajón abierto correctamente");

    } catch (error) {
        alert("Error al abrir el cajón");
        console.error(error);
    }
}


function mostrarFormulario(tipo) {
    // Limpeza opcional para evitar que queden datos de probas anteriores
    if (document.getElementById('nombre-pin')) document.getElementById('nombre-pin').value = "";
    if (document.getElementById('pin-valor')) document.getElementById('pin-valor').value = "";

    document.getElementById('paso-seleccion').style.display = 'none';
    if(tipo === 'pin') {
        document.getElementById('form-pin').style.display = 'block';
    } else {
        document.getElementById('form-foto').style.display = 'block';
    }
}
       const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

async function guardarYVolver(metodo) {
    const nombre = (metodo === 'pin') ? document.getElementById('nombre-pin').value : "Usuario_Foto";
    const pinDefinido = (metodo === 'pin') ? document.getElementById('pin-valor').value : "0000";

    if (metodo === 'pin' && (nombre === "" || pinDefinido.length < 4)) {
        alert("Por favor, rellena tu nombre y un PIN de 4 cifras");
        return;
    }

    try {
        // GARDAR EN SUPABASE
        const { data, error } = await _supabase
            .from('hospedes') // Asegúrate de que este sexa o nome da túa táboa
            .insert([
                { nombre: nombre, pin: pinDefinido, metodo: metodo }
            ]);

        if (error) throw error;

        // Se todo vai ben, gardamos tamén localmente para a tablet
        localStorage.setItem('hospede_rexistrado', 'true');
        localStorage.setItem('metodo_acceso', metodo);
        localStorage.setItem('pin_guardado', pinDefinido);
        localStorage.setItem('nome_cliente', nombre);

        alert("¡Cuenta creada y vinculada con éxito!");
        window.location.href = "acceso-llaves.html";

    } catch (error) {
        console.error("Erro en Supabase:", error.message);
        alert("Erro ao gardar na base de datos: " + error.message);
    }
}
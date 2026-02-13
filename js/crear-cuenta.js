const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

async function guardarYVolver(metodo) {
    const nombre = (metodo === 'pin') ? document.getElementById('nombre-pin').value : "Usuario_Foto";
    const pinDefinido = (metodo === 'pin') ? document.getElementById('pin-valor').value : "";

    if (metodo === 'pin' && (nombre === "" || pinDefinido.length < 4)) {
        alert("Por favor, rellena tu nombre y un PIN de 4 cifras");
        return;
    }

    try {
        // GARDAR NA TÚA TÁBOA REAL: accesos_llaves
        const { data, error } = await _supabase
            .from('accesos_llaves') // Nome exacto da túa táboa na imaxe
            .insert([
                { 
                    Nombre_usuario: nombre,    // Coincide coa túa imaxe
                    método_acceso: metodo,     // Coincide coa túa imaxe
                    foto_base64: pinDefinido    // Usamos esta columna para gardar o PIN
                }
            ]);

        if (error) throw error;

        // Gardamos tamén local para que a tablet saiba que xa hai alguén
        localStorage.setItem('hospede_rexistrado', 'true');
        localStorage.setItem('metodo_acceso', metodo);
        localStorage.setItem('pin_guardado', pinDefinido);
        localStorage.setItem('nome_cliente', nombre);

        alert("¡Acceso configurado correctamente!");
        window.location.href = "acceso-llaves.html";

    } catch (error) {
        console.error("Erro en Supabase:", error.message);
        alert("Erro ao conectar coa base de datos. Revisa se o RLS está desactivado na táboa 'accesos_llaves'");
    }
}
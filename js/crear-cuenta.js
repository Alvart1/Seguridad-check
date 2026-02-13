/**
 * js/crear-cuenta.js
 * Conexión definitiva coa táboa 'accesos_llaves'
 */

// 1. CONFIGURACIÓN (HTTPS e claves correctas)
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 

// Inicialización segura
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

// 2. CONTROL DA INTERFACE
function mostrarFormulario(tipo) {
    // Limpamos campos previos
    const nom = document.getElementById('nombre-pin');
    const pin = document.getElementById('pin-valor');
    if (nom) nom.value = "";
    if (pin) pin.value = "";

    document.getElementById('paso-seleccion').style.display = 'none';
    
    if(tipo === 'pin') {
        document.getElementById('form-pin').style.display = 'block';
    } else {
        document.getElementById('form-foto').style.display = 'block';
    }
}

// 3. FUNCIÓN DE GARDADO CON ERROS DETALLADOS
async function guardarYVolver(metodo) {
    const nombreInput = document.getElementById('nombre-pin').value;
    const pinInput = document.getElementById('pin-valor').value;

    // Validación
    if (metodo === 'pin' && (nombreInput.trim() === "" || pinInput.length < 4)) {
        alert("Por favor, rellena tu nombre y un PIN de 4 cifras.");
        return;
    }

    const nombreFinal = (metodo === 'pin') ? nombreInput : "Huésped_Foto";
    const valorAcceso = (metodo === 'pin') ? pinInput : "CAPTURA_PENDIENTE";

    try {
        console.log("Enviando datos a Supabase...");

        // Usamos comiñas para asegurar que os nomes con acentos non dean problemas
        const { data, error } = await _supabase
            .from('accesos_llaves')
            .insert([
                { 
                    "Nombre_usuario": nombreFinal,
                    "método_acceso": metodo, 
                    "foto_base64": valorAcceso 
                }
            ]);

        if (error) {
            // Se Supabase rexeita a entrada (ex: RLS bloqueado)
            console.error("Erro de Supabase:", error);
            alert("Error de base de datos: " + error.message);
            return;
        }

        // Gardado local para a sesión actual
        localStorage.setItem('hospede_rexistrado', 'true');
        localStorage.setItem('metodo_acceso', metodo);
        localStorage.setItem('pin_guardado', valorAcceso);
        localStorage.setItem('nome_cliente', nombreFinal);

        alert("¡Cuenta de acceso creada correctamente!");
        window.location.href = "acceso-llaves.html";

    } catch (err) {
        // Erro de conexión ou erro de código crítico
        console.error("Erro detectado no proceso:", err);
        alert("Fallo de conexión: " + (err.message || "No se pudo contactar con el servidor."));
    }
}
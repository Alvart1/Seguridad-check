/**
 * js/crear-cuenta.js
 * Lóxica para rexistrar o acceso na táboa 'accesos_llaves' de Supabase
 */

// 1. CONFIGURACIÓN DE CONEXIÓN (Utilizando as túas credenciais)
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 

// Inicializamos o cliente de Supabase (Require ter a librería cargada no HTML)
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

// 2. FUNCIÓN PARA MOSTRAR O FORMULARIO ELIXIDO
function mostrarFormulario(tipo) {
    // Limpamos os inputs para que aparezan baleiros (seguridade e hixiene de datos)
    if (document.getElementById('nombre-pin')) document.getElementById('nombre-pin').value = "";
    if (document.getElementById('pin-valor')) document.getElementById('pin-valor').value = "";

    // Ocultamos a pantalla de selección inicial
    document.getElementById('paso-seleccion').style.display = 'none';
    
    // Amosamos o bloque que corresponde (PIN ou FOTO)
    if(tipo === 'pin') {
        document.getElementById('form-pin').style.display = 'block';
    } else {
        document.getElementById('form-foto').style.display = 'block';
        // Aquí poderías engadir a función de abrir a cámara se fose necesario
    }
}

// 3. FUNCIÓN PARA GARDAR OS DATOS E VOLVER AO PANEL
async function guardarYVolver(metodo) {
    // Capturamos os valores dos campos
    const nombreInput = document.getElementById('nombre-pin').value;
    const pinInput = document.getElementById('pin-valor').value;

    // Validación: Se é PIN, o nome e o código de 4 cifras son obrigatorios
    if (metodo === 'pin' && (nombreInput === "" || pinInput.length < 4)) {
        alert("Por favor, rellena tu nombre y un PIN de 4 cifras.");
        return;
    }

    // Para o método foto, de momento usamos valores por defecto ou baleiros
    const nombreFinal = (metodo === 'pin') ? nombreInput : "Huésped_Foto";
    const valorAcceso = (metodo === 'pin') ? pinInput : ""; // Aquí iría a foto en base64 no futuro

    try {
        // --- INSERCIÓN REAL NA TÚA TÁBOA 'accesos_llaves' ---
        const { data, error } = await _supabase
            .from('accesos_llaves')
            .insert([
                { 
                    Nombre_usuario: nombreFinal,    // Columna da túa imaxe
                    método_acceso: metodo,         // Columna da túa imaxe
                    foto_base64: valorAcceso       // Usamos esta para o PIN (columna da túa imaxe)
                }
            ]);

        if (error) {
            console.error("Erro ao gardar en Supabase:", error.message);
            alert("No se pudo conectar con la base de datos. Verifica el RLS en Supabase.");
            return;
        }

        // --- PERSISTENCIA LOCAL (Para que a tablet saiba que o proceso rematou) ---
        localStorage.setItem('hospede_rexistrado', 'true');
        localStorage.setItem('metodo_acceso', metodo);
        localStorage.setItem('pin_guardado', valorAcceso);
        localStorage.setItem('nome_cliente', nombreFinal);

        alert("¡Cuenta de acceso creada correctamente!");
        
        // Rediriximos ao panel de control de chaves
        window.location.href = "acceso-llaves.html";

    } catch (err) {
        console.error("Erro crítico:", err);
        alert("Ocurrió un error inesperado al procesar el registro.");
    }
}
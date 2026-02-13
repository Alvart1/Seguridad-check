/**
 * js/crear-cuenta.js
 * Lóxica para rexistrar o hóspede en Supabase e LocalStorage
 */

// 1. CONFIGURACIÓN DA TÚA BASE DE DATOS
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; 

// Inicializamos o cliente de Supabase
const _supabase = supabase.createClient(URL_SUPA, KEY_SUPA);

// 2. FUNCIÓN PARA CAMBIAR DE VISTA (PIN ou FOTO)
function mostrarFormulario(tipo) {
    // Limpamos os campos para que non haxa rastro de clientes anteriores
    if (document.getElementById('nombre-pin')) document.getElementById('nombre-pin').value = "";
    if (document.getElementById('pin-valor')) document.getElementById('pin-valor').value = "";

    // Ocultamos o selector principal
    document.getElementById('paso-seleccion').style.display = 'none';
    
    // Amosamos o bloque que corresponde
    if(tipo === 'pin') {
        document.getElementById('form-pin').style.display = 'block';
    } else {
        document.getElementById('form-foto').style.display = 'block';
    }
}

// 3. FUNCIÓN PARA GARDAR EN SUPABASE E VOLVER
async function guardarYVolver(metodo) {
    // Collermos os valores dos inputs
    const nombre = (metodo === 'pin') ? document.getElementById('nombre-pin').value : "Usuario_Foto";
    const pinDefinido = (metodo === 'pin') ? document.getElementById('pin-valor').value : "0000";

    // Validación básica
    if (metodo === 'pin' && (nombre === "" || pinDefinido.length < 4)) {
        alert("Por favor, rellena tu nombre y un PIN de 4 cifras");
        return;
    }

    try {
        // --- AQUÍ ESTÁ O VÍNCULO REAL COA BASE DE DATOS ---
        const { data, error } = await _supabase
            .from('hospedes') // Nome da túa táboa en Supabase
            .insert([
                { 
                    nombre: nombre, 
                    pin: pinDefinido, 
                    metodo: metodo 
                }
            ]);

        if (error) {
            console.error("Erro de Supabase:", error.message);
            alert("No se pudo guardar en la base de datos: " + error.message);
            return;
        }

        // --- GARDAR EN LOCAL (para que a tablet responda rápido) ---
        localStorage.setItem('hospede_rexistrado', 'true');
        localStorage.setItem('metodo_acceso', metodo);
        localStorage.setItem('pin_guardado', pinDefinido);
        localStorage.setItem('nome_cliente', nombre);

        alert("¡Cuenta creada y guardada en la base de datos!");
        
        // Rediriximos ao panel de control
        window.location.href = "acceso-llaves.html";

    } catch (err) {
        console.error("Erro crítico:", err);
        alert("Ocorreu un erro inesperado.");
    }
}
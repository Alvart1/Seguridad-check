/**
 * js/crear-cuenta.js
 * Conexión definitiva coa táboa 'accesos_llaves'
 */

// 1. CONFIGURACIÓN (HTTPS e claves correctas)
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhmd292dHJscGlwbmdob3lkdXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyOTEwODEsImV4cCI6MjA4NTg2NzA4MX0.Ddzb0ZDbr3GJme-7G__SwhB4IOd2er5aCB6Yexp7F7Y'; 

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
        // ... dentro da función guardarYVolver ...
const { data, error } = await _supabase
    .from('acceso_llaves')
    .insert([
        { 
            // Proba con estes nomes exactamente
            "nombre_usuario": nombreFinal, 
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
        function mostrarFormulario(tipo) {
            // Ocultamos a selección
            document.getElementById('paso-seleccion').style.display = 'none';
            
            // Mostramos o bloque correspondente
            if(tipo === 'pin') {
                document.getElementById('form-pin').style.display = 'block';
            } else {
                document.getElementById('form-foto').style.display = 'block';
            }
        }

        function guardarYVolver(metodo) {
            // Aquí é onde gardarías en Supabase ou LocalStorage
            localStorage.setItem('hospede_rexistrado', 'true');
            localStorage.setItem('metodo_acceso', metodo);
            
            alert("¡Cuenta creada correctamente!");
            window.location.href = "acceso-llaves.html";
        }
        function mostrarFormulario(tipo) {
    // Limpiar los campos antes de mostrar para que estén vacíos
    if (document.getElementById('nombre-pin')) document.getElementById('nombre-pin').value = "";
    if (document.getElementById('pin-valor')) document.getElementById('pin-valor').value = "";

    document.getElementById('paso-seleccion').style.display = 'none';
    
    if(tipo === 'pin') {
        document.getElementById('form-pin').style.display = 'block';
    } else {
        document.getElementById('form-foto').style.display = 'block';
    }
}

function guardarYVolver(metodo) {
    const nombre = (metodo === 'pin') ? document.getElementById('nombre-pin').value : "Usuario Foto";
    const pinDefinido = (metodo === 'pin') ? document.getElementById('pin-valor').value : "";

    if (metodo === 'pin' && (nombre === "" || pinDefinido.length < 4)) {
        alert("Por favor, rellena tu nombre y un PIN de 4 cifras");
        return;
    }

    // Guardamos todo en el sistema
    localStorage.setItem('hospede_rexistrado', 'true');
    localStorage.setItem('metodo_acceso', metodo);
    localStorage.setItem('pin_guardado', pinDefinido); // Guardamos el PIN para verificarlo luego
    
    alert("¡Cuenta creada correctamente!");
    window.location.href = "acceso-llaves.html";
}
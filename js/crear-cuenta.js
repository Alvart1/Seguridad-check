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
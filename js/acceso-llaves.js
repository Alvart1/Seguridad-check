/**
 * Lóxica para o Panel de Control (acceso-llaves.html)
 */

window.onload = function() {
    // SEGURIDADE: Verificamos se a tablet está desbloqueada polo propietario
    if (sessionStorage.getItem('tablet_desbloqueada') !== 'true') {
        window.location.href = "index.html";
        return;
    }
    
    // Aquí poderiamos poñer unha mensaxe de benvida se queres
    document.getElementById('interfaz-dinamica').innerHTML = `
        <div class="benvida">
            <p>Bienvenido al sistema de gestión de llaves.</p>
            <p>Por favor, pulsa en "Crear cuenta" para configurar tu acceso.</p>
        </div>
    `;
};

// Esta función é a que chamas desde o botón do teu HTML
function crearcuenta() {
    window.location.href = "crear-cuenta.html";
}

// Esta función pecha a sesión e limpa a tablet
function confirmarFinEstancia() {
    if (confirm("¿Seguro que quieres finalizar? Se borrarán tus datos y la tablet se bloqueará.")) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "index.html";
    }
}
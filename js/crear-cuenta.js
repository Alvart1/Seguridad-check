window.onload = function() {
    // 1. SEGURIDADE: Verificamos que o usuario vén de cubrir o formulario.
    // Se alguén tenta saltar directamente a esta URL sen rexistrarse, mandámolo ao inicio.
    if (localStorage.getItem('hospede_rexistrado') !== 'true') {
        window.location.href = "index.html";
    }
};

/**
 * Función que se executa ao pulsar un dos botóns
 * @param {string} metodo - Pode ser 'pin' ou 'foto'
 */
function elixirMetodo(metodo) {
    // 2. GARDAR PREFERENCIA:
    // Usamos localStorage para que esta decisión persista aínda que a tablet se apague.
    localStorage.setItem('metodo_acceso', metodo);

    // 3. CONFIRMACIÓN:
    // Unha pequena alerta para que o usuario saiba que se gardou correctamente.
    if (metodo === 'pin') {
        alert("Has seleccionado el acceso por PIN.");
    } else {
        alert("Has seleccionado el acceso por Reconocimiento Facial.");
    }

    // 4. REDIRECCIÓN:
    // Imos á pantalla final onde se controlará o caixón.
    window.location.href = "chaves.html";
}

// --- CONTROL DE INACTIVIDADE ---
// Se o cliente queda pensando moito tempo e non elixe nada, 
// a tablet bloquéase por seguridade e volve ao index.
let tempoInactividade = setTimeout(() => {
    window.location.href = "index.html";
}, 300000); // 5 minutos

document.onclick = () => {
    clearTimeout(tempoInactividade);
    tempoInactividade = setTimeout(() => {
        window.location.href = "index.html";
    }, 300000);
};
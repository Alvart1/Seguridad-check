// 1. CONFIGURACIÓN Y CLIENTE
const CLAVE_ADMIN = "abc123."; 
const IP_Raspberry = "http://10.182.60.63:3000/abrir";
const URL_SUPA = 'https://xfwovtrlpipnghoyduql.supabase.co';
const KEY_SUPA_ANON = 'sb_publishable_xi9wcDolJG6kKTnU_2O0fA_n507M8fu'; // Tu clave pública

const supabaseClient = supabase.createClient(URL_SUPA, KEY_SUPA_ANON);

// --- FUNCIONES DE ACCESO PROTEGIDO ---

function irCamaras() {
    const pass = prompt("Introduce la clave de seguridad para ver las cámaras:");
    if (pass === CLAVE_ADMIN) {
        window.location.href = "http://10.182.60.63/zm/index.php";
    } else {
        alert("Clave incorrecta");
    }
}

function irBaseDatos() {
    const pass = prompt("Introduce la clave de seguridad para acceder al panel de Supabase:");
    if (pass === CLAVE_ADMIN) {
        window.location.href = "https://supabase.com/dashboard/project/xfwovtrlpipnghoyduql/editor/17513?schema=public";
    } else {
        alert("Clave incorrecta");
    }
}

// --- FUNCIÓN DE TABLA DE RESERVAS (DENTRO DEL PANEL) ---

async function irReservas() {
    const pass = prompt("Introduce la clave de seguridad para ver el listado de huéspedes:");
    if (pass !== CLAVE_ADMIN) {
        alert("Clave incorrecta");
        return;
    }

    let seccion = document.getElementById('seccion-reservas');
    if (!seccion) {
        seccion = document.createElement('div');
        seccion.id = 'seccion-reservas';
        seccion.style.marginLeft = "240px";
        seccion.style.padding = "20px";
        document.body.appendChild(seccion);
    }
    
    seccion.style.display = 'block';
    seccion.innerHTML = '<h2>Listado Detallado de Huéspedes</h2><div id="tabla-datos">Cargando...</div>';

    try {
        const { data, error } = await supabaseClient
            .from('reservas')
            .select(`
                id,
                created_at,
                estado_estancia,
                hospedes (
                    nombre,
                    apellidos,
                    genero,
                    codigo_documento,
                    direccion,
                    fecha_nacimiento,
                    email,
                    firma_base64
                )
            `)
            .order('id', { ascending: false });

        if (error) throw error;

        let html = `
            <table style="width:100%; border-collapse: collapse; background: white; font-size: 13px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); color: black;">
                <thead>
                    <tr style="background-color: #2c3e50; color: white; text-align: left;">
                        <th style="padding:10px;">Fecha Registro</th>
                        <th style="padding:10px;">Nombre y Apellidos</th>
                        <th style="padding:10px;">DNI / Pasaporte</th>
                        <th style="padding:10px;">Género</th>
                        <th style="padding:10px;">F. Nacimiento</th>
                        <th style="padding:10px;">Dirección</th>
                        <th style="padding:10px;">Email</th>
                        <th style="padding:10px;">Estado</th>
                        <th style="padding:10px;">Parte</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach(reserva => {
            const fechaRegistro = new Date(reserva.created_at).toLocaleString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            (reserva.hospedes || []).forEach((h, index) => {
                html += `
                    <tr style="border-bottom: 1px solid #000; color: black;">
                        <td style="padding:10px;">${index === 0 ? fechaRegistro : ''}</td>
                        <td style="padding:10px; font-weight: bold;">${h.nombre} ${h.apellidos}</td>
                        <td style="padding:10px;">${h.codigo_documento}</td>
                        <td style="padding:10px;">${h.genero || '---'}</td>
                        <td style="padding:10px;">${h.fecha_nacimiento || '---'}</td>
                        <td style="padding:10px;">${h.direccion || '---'}</td>
                        <td style="padding:10px;">${h.email}</td>
                        <td style="padding:10px;">
                            ${index === 0 ? `
                            <span style="padding: 3px 7px; border-radius: 4px; color: white; font-size: 11px; background: ${reserva.estado_estancia === 'finalizada' ? '#e74c3c' : '#2ecc71'};">
                                ${reserva.estado_estancia || 'activa'}
                            </span>` : ''}
                        </td>
                        <td style="padding:10px;">
                        <button onclick='xerarPDF(${JSON.stringify(h).replace(/'/g, "&apos;")}, "${fechaRegistro}")' 
                        style="cursor:pointer; background:#3498db; color:white; border:none; padding:5px; border-radius:3px;">
                         PDF
                        </button>
                        </td>
                    </tr>
                `;
            });
        });

        html += '</tbody></table>';
        document.getElementById('tabla-datos').innerHTML = html;

    } catch (err) {
        document.getElementById('tabla-datos').innerHTML = '<p style="color:red;">Error: ' + err.message + '</p>';
    }
}

// --- OTRAS FUNCIONES ---

async function abrirCajon() {
    try {
        const res = await fetch(IP_Raspberry);
        if (res.ok) {
            alert("✅ ¡Cajón abierto!");
        } else {
            alert("⚠️ El cajón no responde.");
        }
    } catch (e) {
        alert("❌ ERROR de conexión.");
    }
}

async function finalizarEstancia() {
    try {
        const { data, error } = await supabaseClient
            .from('reservas')
            .select('*')
            .order('id', { ascending: false })
            .limit(1);

        if (error || !data.length) {
            alert("No hay reservas."); return;
        }

        const { error: updateError } = await supabaseClient
            .from('reservas')
            .update({ estado_estancia: 'finalizada' })
            .eq('id', data[0].id);

        if (!updateError) alert("✅ Estancia finalizada");
    } catch (err) {
        alert("Error inesperado");
    }
}
function xerarPDF(h, fecha) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // --- CONFIGURACIÓN DE ESTILO ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("PARTE DE ENTRADA DE VIAXEIROS", 105, 20, { align: "center" });
    
    // Liña decorativa
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DO ALOXAMENTO:", 20, 40);
    
    doc.setFont("helvetica", "normal");
    doc.text("Establecemento: O teu Aloxamento", 20, 47); // Podes cambiar isto polo nome real
    doc.text(`Data de entrada: ${fecha}`, 20, 54);

    // --- DATOS DO HÓSPEDE ---
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DO VIAXEIRO:", 20, 70);
    
    doc.setFont("helvetica", "normal");
    let y = 77; // Posición vertical inicial para os datos
    const salto = 7; // Espazo entre liñas

    doc.text(`Nome e Apelidos: ${h.nombre} ${h.apellidos}`, 20, y);
    doc.text(`DNI / Pasaporte: ${h.codigo_documento}`, 20, y + salto);
    doc.text(`Xénero: ${h.genero || 'Non especificado'}`, 20, y + (salto * 2));
    doc.text(`Data de nacemento: ${h.fecha_nacimiento || '---'}`, 20, y + (salto * 3));
    doc.text(`Enderezo: ${h.direccion || '---'}`, 20, y + (salto * 4));
    doc.text(`Email: ${h.email || '---'}`, 20, y + (salto * 5));

    // --- SECCIÓN DA FIRMA ---
    doc.setFont("helvetica", "bold");
    doc.text("FIRMA DO VIAXEIRO:", 20, 135);
    doc.rect(20, 140, 80, 40); // O recadro

    if (h.firma_base64 && h.firma_base64.startsWith('data:image')) {
        try {
            // Axustamos a firma dentro do recadro
            doc.addImage(h.firma_base64, 'PNG', 25, 145, 70, 30); 
        } catch (e) {
            doc.text("[ Erro ao cargar a firma ]", 30, 160);
        }
    } else {
        doc.setTextColor(150, 0, 0);
        doc.text("FIRMA NON DISPOÑIBLE", 35, 165);
        doc.setTextColor(0, 0, 0);
    }

    // --- PE DE PÁXINA LEGAL ---
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    const textoLegal = "Este documento é copia fiel do rexistro electrónico realizado na tablet de entrada en cumprimento da normativa vixente de seguridade cidadá.";
    const liñasLegais = doc.splitTextToSize(textoLegal, 170);
    doc.text(liñasLegais, 20, 200);

    doc.save(`Parte_${h.codigo_documento}.pdf`);
}
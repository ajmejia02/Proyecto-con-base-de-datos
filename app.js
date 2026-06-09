// ==========================================
// CONFIGURACIÓN DEL SISTEMA
// ==========================================
const CONTRASENA_ADMIN = "12345"; // <-- CAMBIA TU CONTRASEÑA AQUÍ

const HORA_LIMITE = "08:00";
const DEDUCCION_TARDE = 114; // 30% de 380 Córdobas

// ==========================================
// CONFIGURACIÓN DE FIREBASE
// Pega aquí la configuración de tu proyecto
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyA6OsgulbUi-qAW5ssOA-alimoc-YocTl4",
    authDomain: "apam-cafe.firebaseapp.com",
    projectId: "apam-cafe",
    storageBucket: "apam-cafe.appspot.com",
    messagingSenderId: "587622813873",
    appId: "TU_APP_ID" // Puedes cambiar "TU_APP_ID" por tu App ID real cuando lo desees
};

// Inicializar Firebase solo si hay configuración
let db;
if (firebaseConfig.apiKey) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
} else {
    console.warn("Firebase no está configurado. El sistema no guardará datos reales. Revisa el archivo README.md");
}

// ==========================================
// CONTROL DE LA INTERFAZ (TABS)
// ==========================================
function mostrarTab(tabName) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    // Desmarcar todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Validar si es el dashboard pero no ha iniciado sesión
    if (tabName === 'adminDashboard' && !sessionStorage.getItem('adminLogged')) {
        tabName = 'adminLogin';
    }

    // Mostrar el contenido seleccionado
    document.getElementById(tabName).classList.add('active');

    // Marcar el botón correcto
    if(tabName === 'registro') {
        document.getElementById('btnTabRegistro').classList.add('active');
    } else {
        document.getElementById('btnTabAdmin').classList.add('active');
    }

    // Si entra al dashboard, cargar datos
    if (tabName === 'adminDashboard') {
        cargarRegistros();
    }
}

function mostrarMensaje(elementId, mensaje, tipo) {
    const el = document.getElementById(elementId);
    el.textContent = mensaje;
    el.className = `mensaje ${tipo}`; // success, error, warning

    // Ocultar después de 4 segundos
    setTimeout(() => {
        el.className = 'mensaje';
    }, 4000);
}

// ==========================================
// LÓGICA DE REGISTRO DE EMPLEADOS
// ==========================================
async function registrarAsistencia(tipo) {
    const empleadoId = document.getElementById('empleadoId').value.trim().toUpperCase();

    if (!empleadoId) {
        mostrarMensaje('mensajeRegistro', 'Por favor, ingrese su ID de empleado.', 'error');
        return;
    }

    if (!db) {
        mostrarMensaje('mensajeRegistro', 'Modo de prueba: Firebase no configurado.', 'warning');
        return;
    }

    const ahora = new Date();
    const fecha = ahora.toLocaleDateString('es-NI'); // Formato local de Nicaragua (DD/MM/YYYY)
    const hora = ahora.toLocaleTimeString('es-NI', { hour12: false, hour: '2-digit', minute:'2-digit' });

    let deduccion = 0;

    // Calcular deducción solo si es entrada
    if (tipo === 'entrada') {
        if (hora > HORA_LIMITE) {
            deduccion = DEDUCCION_TARDE;
        }
    }

    const registro = {
        empleadoId: empleadoId,
        tipo: tipo,
        fecha: fecha,
        hora: hora,
        deduccion: deduccion,
        timestamp: firebase.firestore.FieldValue.serverTimestamp() // Para ordenar
    };

    try {
        // Guardar en Firestore en la colección 'asistencia'
        await db.collection('asistencia').add(registro);

        let msj = `${tipo === 'entrada' ? 'Entrada' : 'Salida'} registrada a las ${hora}.`;
        if (deduccion > 0) {
            msj += ` (Llegada tardía: Deducción de C$${deduccion})`;
            mostrarMensaje('mensajeRegistro', msj, 'warning');
        } else {
            mostrarMensaje('mensajeRegistro', msj, 'success');
        }

        document.getElementById('empleadoId').value = ''; // Limpiar input

    } catch (error) {
        console.error("Error al guardar:", error);
        mostrarMensaje('mensajeRegistro', 'Error de conexión. Intente de nuevo.', 'error');
    }
}

// ==========================================
// LÓGICA DEL ADMINISTRADOR
// ==========================================
function verificarAdmin() {
    const pass = document.getElementById('adminPass').value;

    if (pass === CONTRASENA_ADMIN) {
        sessionStorage.setItem('adminLogged', 'true');
        document.getElementById('adminPass').value = '';
        mostrarTab('adminDashboard');
    } else {
        mostrarMensaje('mensajeLogin', 'Contraseña incorrecta', 'error');
    }
}

function cerrarSesionAdmin() {
    sessionStorage.removeItem('adminLogged');
    mostrarTab('adminLogin');
}

async function cargarRegistros() {
    if (!db) return;

    const lista = document.getElementById('listaRegistros');
    lista.innerHTML = '<tr><td colspan="5" style="text-align:center;">Cargando...</td></tr>';

    try {
        // Traer registros ordenados por fecha de creación descendente
        const snapshot = await db.collection('asistencia')
                                 .orderBy('timestamp', 'desc')
                                 .limit(50) // Mostrar solo los últimos 50
                                 .get();

        lista.innerHTML = ''; // Limpiar

        if (snapshot.empty) {
            lista.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay registros</td></tr>';
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const tr = document.createElement('tr');

            let deducHtml = data.deduccion > 0
                ? `<span class="deduccion-yes">- C$${data.deduccion}</span>`
                : `<span class="deduccion-no">C$0</span>`;

            if(data.tipo === 'salida') deducHtml = '-'; // Salidas no tienen deducción

            // Función para escapar HTML y evitar XSS
            const escapeHTML = (str) => {
                const p = document.createElement('p');
                p.textContent = str;
                return p.innerHTML;
            };

            const safeEmpleadoId = escapeHTML(data.empleadoId);

            tr.innerHTML = `
                <td>${data.fecha}</td>
                <td><strong>${safeEmpleadoId}</strong></td>
                <td>${data.tipo === 'entrada' ? '🟢 Entrada' : '🔴 Salida'}</td>
                <td>${data.hora}</td>
                <td>${deducHtml}</td>
            `;
            lista.appendChild(tr);
        });

    } catch (error) {
        console.error("Error al cargar registros:", error);
        lista.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error al cargar datos. Verifica las reglas de Firestore.</td></tr>';
    }
}

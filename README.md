# Sistema de Registro de Empleados

Este es un sistema web sencillo para registrar la entrada y salida de empleados, con cálculo automático de deducciones por llegadas tardías.

## Herramientas Utilizadas

Este proyecto está construido utilizando tecnologías web estándar y un servicio de base de datos en la nube gratuito:

*   **HTML (HyperText Markup Language):** Se utiliza para crear la estructura de la página web. Define dónde van los botones, los campos de texto, las tablas y otros elementos visuales.
*   **CSS (Cascading Style Sheets):** Se encarga del diseño visual y la presentación de la página. Le da colores, tamaños, márgenes y hace que la interfaz sea agradable a la vista.
*   **JavaScript (JS):** Es el "cerebro" del programa. Se ejecuta en el navegador web y se encarga de:
    *   Capturar cuando un empleado ingresa su ID.
    *   Obtener la hora actual.
    *   Verificar si la entrada es después de las 8:00 AM.
    *   Calcular la deducción si corresponde.
    *   Enviar y recibir datos de la base de datos.
    *   Controlar el acceso al panel de administrador.
*   **Firebase (Base de Datos):** Es una plataforma de desarrollo de aplicaciones creada por Google. Para este proyecto utilizaremos **Cloud Firestore**, que es una base de datos NoSQL alojada en la nube. Es **completamente gratuita** para proyectos pequeños y de prueba (en su plan "Spark"), y es muy fácil de conectar directamente con JavaScript.

## Reglas del Sistema

*   **Horario de Entrada:** 8:00 AM.
*   **Llegada Tardía:** Se considera tardía cualquier entrada registrada a las 8:01 AM o después.
*   **Salario Diario:** 380 Córdobas.
*   **Deducción por Llegada Tardía:** 30% del salario diario (114 Córdobas).
*   **Formato de ID de Empleado:** El sistema espera que el empleado ingrese su ID (por ejemplo, `0001NP` para "Nombre y primera letra del Apellido").

---

## Instrucciones: Cómo configurar tu Base de Datos Gratuita (Firebase)

Para que el sistema guarde los registros, necesitas crear un proyecto en Firebase y conectar tu código a él. Sigue estos pasos:

### 1. Crear el proyecto en Firebase
1. Ve a [https://console.firebase.google.com/](https://console.firebase.google.com/) e inicia sesión con una cuenta de Google (Gmail).
2. Haz clic en el botón **"Agregar proyecto"** (Add project).
3. Ponle un nombre a tu proyecto (ej. "SistemaEmpleados").
4. Puedes desactivar Google Analytics por ahora y haz clic en **"Crear proyecto"**.

### 2. Configurar la Base de Datos (Cloud Firestore)
1. Una vez dentro de tu proyecto en Firebase, en el menú de la izquierda, busca la sección **"Compilación"** (Build) y haz clic en **"Firestore Database"**.
2. Haz clic en el botón **"Crear base de datos"**.
3. Te pedirá que elijas el modo de seguridad. Elige **"Comenzar en modo de prueba"** (Start in test mode). *Ojo: Esto permite que cualquiera que tenga tus credenciales pueda leer/escribir. Más adelante, para producción, deberías aprender sobre "Reglas de seguridad de Firestore"*. Haz clic en Siguiente.
4. Elige la ubicación (cualquiera que te sugiera está bien) y haz clic en **"Habilitar"**.

### 3. Obtener las credenciales para tu código
1. En el menú de la izquierda, arriba de todo, haz clic en el ícono de engranaje (⚙️) junto a "Descripción general del proyecto" y selecciona **"Configuración del proyecto"**.
2. Desplázate hacia abajo hasta la sección **"Tus apps"**.
3. Haz clic en el ícono de la web (</>).
4. Registra tu app poniéndole un apodo (ej. "web-app") y haz clic en **"Registrar app"**.
5. Te aparecerá un bloque de código que dice `const firebaseConfig = { ... }`.
6. **¡Copia todo el contenido de ese bloque!**

### 4. Conectar el código con Firebase
1. Abre el archivo llamado `app.js` en tu editor de código o bloc de notas.
2. Al principio del archivo, busca la sección que dice `// === CONFIGURACIÓN DE FIREBASE ===`.
3. Pega los datos que copiaste de Firebase reemplazando el objeto `firebaseConfig` vacío que dejé preparado.
   Se verá algo así:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyB...",
     authDomain: "tu-proyecto.firebaseapp.com",
     projectId: "tu-proyecto",
     storageBucket: "tu-proyecto.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

---

## ¿Dónde cambiar la contraseña del Administrador?

Para ingresar al Panel de Administrador, necesitas una contraseña.
Puedes cambiar esta contraseña en el archivo `app.js`.

1. Abre el archivo `app.js`.
2. Busca en la parte superior la línea que dice:
   `const CONTRASENA_ADMIN = "12345"; // <-- CAMBIA TU CONTRASEÑA AQUÍ`
3. Cambia el `"12345"` por la contraseña que tú quieras (asegúrate de mantener las comillas).

---

## Cómo usar el sistema

1. **Empleados:** Para registrar entrada o salida, el empleado debe ingresar su ID en la pestaña "Registro Empleados" y presionar el botón correspondiente ("Registrar Entrada" o "Registrar Salida").
2. **Administrador:** Para ver los registros, haz clic en la pestaña "Panel Administrador" e ingresa la contraseña configurada en `app.js`. Allí verás una tabla con todos los registros y la indicación de si hubo deducción.

// --- 1. VARIABLES DE ESTADO ---
// --- NUEVAS VARIABLES PARA SET Y DESHACER ---
let setActual = 1;
let historialRegistros = []; // Aquí guardaremos temporalmente las acciones
let nombreRivalActual = "";
let identificadorPartido = ""; // Para separar las estadísticas luego
let atletaSeleccionado = "";
let jugadaActual = "";
let zonaSeleccionada = ""; // NUEVA VARIABLE
let equipoSeleccionado = "";
// --- VARIABLES DEL MARCADOR ---
let puntosMaranatha = 0;
let puntosRival = 0;
const textoMarcadorMaranatha = document.getElementById('marcador-maranatha');
const textoMarcadorRival = document.getElementById('marcador-rival');
const textoNombreRivalMarcador = document.getElementById('nombre-rival-marcador');

// --- 2. CAPTURAR ELEMENTOS ---
const textoEstado = document.getElementById('estado-registro');
const botonesAtletas = document.querySelectorAll('.btn-jugador');
const botonesAcciones = document.querySelectorAll('.btn-accion');
const botonesZonas = document.querySelectorAll('.btn-zona'); // NUEVO
const panelZonas = document.getElementById('panel-zonas');  // NUEVO
const panelResultados = document.getElementById('panel-resultados');
const grillaResultados = document.querySelector('.grid-resultados');
// --- ELEMENTOS DE CONFIGURACIÓN ---
const vistaConfiguracion = document.getElementById('pantalla-configuracion');
const vistaCancha = document.getElementById('pantalla-cancha');
const botonIniciar = document.getElementById('btn-iniciar-encuentro');
const campoNombreRival = document.getElementById('input-nombre-rival');
const camposJugadorasRivales = document.querySelectorAll('.input-rival');
const tituloEquipoVisitante = document.querySelector('.titulo-equipo.visitante');
const botonesJugadoresRivales = document.querySelectorAll('.btn-jugador.rival');
// --- CAPTURAR NUEVOS ELEMENTOS ---
const btnSetMenos = document.getElementById('btn-set-menos');
const btnSetMas = document.getElementById('btn-set-mas');
const textoSet = document.getElementById('texto-set');
const btnDeshacer = document.getElementById('btn-deshacer');
const btnTerminar = document.getElementById('btn-terminar');

// --- LÓGICA: INICIAR EL ENCUENTRO ---
botonIniciar.addEventListener('click', function() {
    // 1. Guardar el nombre del equipo rival
    nombreRivalActual = campoNombreRival.value || "Rival Desconocido";
    textoNombreRivalMarcador.innerText = nombreRivalActual.substring(0, 3).toUpperCase(); // Muestra solo 3 letras (Ej: CBA)
    tituloEquipoVisitante.innerText = nombreRivalActual;
    
    // Generamos un ID de partido con la fecha y los rivales (Ej: Maranatha_vs_ClubA_168432)
    identificadorPartido = "Maranatha_vs_" + nombreRivalActual + "_" + Date.now();

    let fechaHoy = new Date().toISOString().split('T')[0]; 
    
    fetch('https://bright-hotels-fry.loca.lt/registrar-partido', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        'bypass-tunnel-reminder': 'true' },
        body: JSON.stringify({
            id_partido: identificadorPartido,
            equipo_visitante: nombreRivalActual,
            fecha: fechaHoy
        })
    })
    .then(res => console.log("✅ Partido guardado en historial_partidos"))
    .catch(err => console.error("❌ Error guardando historial:", err));
    // --------------------------------------------------------------

    // 2. Reemplazar los textos de los botones rojos con lo que escribimos
    camposJugadorasRivales.forEach(function(campo, indice) {
        let textoIngresado = campo.value;
        // Si no escribimos nada, le ponemos un texto por defecto
        if (textoIngresado === "") {
            textoIngresado = "Rival " + (indice + 1);
        }
        // Actualizamos el botón correspondiente en la cancha
        botonesJugadoresRivales[indice].innerText = textoIngresado;
    });

    // 3. Cambiar de pantalla
    vistaConfiguracion.classList.add('oculto');
    vistaCancha.classList.remove('oculto');
    
    textoEstado.innerText = "Partido Iniciado: Maranatha vs " + nombreRivalActual;
});

// --- LÓGICA: CONTROL DE SETS ---
btnSetMenos.addEventListener('click', function() {
    if (setActual > 1) { // El set no puede ser menor a 1
        setActual--;
        textoSet.innerText = "Set " + setActual;
    }
});

btnSetMas.addEventListener('click', function() {
    if (setActual < 5) { 
        setActual++;
        textoSet.innerText = "Set " + setActual;
        // Reiniciar marcador para el nuevo set
        puntosMaranatha = 0;
        puntosRival = 0;
        textoMarcadorMaranatha.innerText = puntosMaranatha;
        textoMarcadorRival.innerText = puntosRival;
    }
});

// --- LÓGICA: BOTÓN DESHACER (ACTUALIZADO PARA MYSQL) ---
btnDeshacer.addEventListener('click', function() {
    if (historialRegistros.length === 0) {
        alert("No hay acciones registradas para deshacer.");
        return;
    }
    
    // Sacamos el último registro de nuestra lista local
    let ultimoRegistro = historialRegistros.pop();
    
    // Verificamos si la jugada guardó su ID de la base de datos
    if (ultimoRegistro.id_db) {
        textoEstado.innerText = "Borrando de la Base de Datos...";
        
        // Le pedimos al servidor que borre ese ID específico
        fetch('https://bright-hotels-fry.loca.lt/eliminar-jugada/' + ultimoRegistro.id_db, {
            method: 'DELETE',
            headers: {
                'bypass-tunnel-reminder': 'true' // <--- LA LLAVE QUE FALTABA AQUÍ
            }
        })
        .then(respuesta => respuesta.json())
        .then(datos => {
            console.log("🗑️ --- BORRADO DE MYSQL EXITOSO ---");
            textoEstado.innerText = "¡Deshecho! Se borró a: " + ultimoRegistro.jugador;
        })
        .catch(error => {
            console.error("❌ Error al borrar:", error);
            textoEstado.innerText = "Error al deshacer en BD";
        });
        
    } else {
        // Si tocaste muy rápido y aún no había llegado el ID, lo borra al menos de la pantalla
        textoEstado.innerText = "Acción deshecha localmente.";
    }
});

btnTerminar.addEventListener('click', function() {
    let confirmacion = confirm("¿Estás seguro de que deseas terminar este partido? Se cerrará esta pantalla.");
    if (confirmacion) {
        // Recarga la página: esto borra la memoria temporal y vuelve a mostrar el menú de configuración inicial.
        window.location.reload(); 
    }
});

// --- 4. PASO 1: SELECCIONAR JUGADOR ---
botonesAtletas.forEach(function(boton) {
    boton.addEventListener('click', function() {
        atletaSeleccionado = this.innerText;
        if (this.classList.contains('rival')) {
            equipoSeleccionado = "Rival";
        } else {
            equipoSeleccionado = "Maranatha";
        }

        textoEstado.innerText = "Equipo: " + equipoSeleccionado + " | Atleta: " + atletaSeleccionado + " | Esperando acción...";


        botonesAtletas.forEach(b => b.style.borderColor = "transparent");
        this.style.borderColor = "#3498db"; 
        
        // Si cambia de jugador a mitad de camino, ocultamos los paneles inferiores
        panelZonas.classList.add('oculto');
        panelResultados.classList.add('oculto');
    });
});

// --- 5. PASO 2: SELECCIONAR ACCIÓN ---
botonesAcciones.forEach(function(boton) {
    boton.addEventListener('click', function() {
        if (atletaSeleccionado === "") {
            alert("Primero selecciona un jugador de la lista.");
            return; 
        }

        jugadaActual = this.innerText;

        // NUEVA LÓGICA: ¿Necesitamos preguntar la zona?
        if (jugadaActual === "Ataque") {
            // Si es Ataque, pedimos la zona
            textoEstado.innerText = "Equipo: " + equipoSeleccionado + " | Atleta: " + atletaSeleccionado + " | Acción: " + jugadaActual + " | Esperando zona...";
            panelZonas.classList.remove('oculto');
            panelResultados.classList.add('oculto');
        } else {
            // Para Saque, Armado, Recepción, etc., saltamos la zona
            zonaSeleccionada = "N/A"; // Le ponemos "No Aplica" para que la Base de Datos no quede vacía
            textoEstado.innerText = "Equipo: " + equipoSeleccionado + " | Atleta: " + atletaSeleccionado + " | Acción: " + jugadaActual;
            
            panelZonas.classList.add('oculto'); // Escondemos las zonas
            panelResultados.classList.remove('oculto'); // Mostramos los resultados directo
            
            // Dibujamos los botones de resultado inmediatamente
            cargarOpcionesDeResultado(jugadaActual);
        }
    });
});

// --- 6. PASO 3: SELECCIONAR ZONA (NUEVO) ---
botonesZonas.forEach(function(boton) {
    boton.addEventListener('click', function() {
        zonaSeleccionada = this.innerText;
        textoEstado.innerText = "Atleta: " + atletaSeleccionado + " | " + jugadaActual + " desde " + zonaSeleccionada;

        // Mostramos el panel de Resultados
        panelResultados.classList.remove('oculto');
        
        // Dibujamos los botones finales según la jugada
        cargarOpcionesDeResultado(jugadaActual);
    });
});

// --- 7. PASO 4: MOSTRAR BOTONES DE RESULTADO ---
function cargarOpcionesDeResultado(tipoDeJugada) {
    grillaResultados.innerHTML = ""; 
    let botonesHTML = "";

    if (tipoDeJugada === "Ataque") {
        botonesHTML = `
            <button class="btn-resultado btn-punto" onclick="guardarRegistro('Punto Directo')">🟢 Punto Directo</button>
            <button class="btn-resultado btn-neutro" onclick="guardarRegistro('Continuidad')">⚪ Continuidad</button>
            <button class="btn-resultado btn-error" onclick="guardarRegistro('Error / Bloqueado')">🔴 Error / Bloqueado</button>
        `;
    } else if (tipoDeJugada === "Recepción") {
        botonesHTML = `
            <button class="btn-resultado btn-punto" onclick="guardarRegistro('Perfecta (3)')">🟢 Perfecta (3)</button>
            <button class="btn-resultado btn-neutro" onclick="guardarRegistro('Positiva (2)')">🟡 Positiva (2)</button>
            <button class="btn-resultado btn-neutro" onclick="guardarRegistro('Negativa (1)')">🟠 Negativa (1)</button>
            <button class="btn-resultado btn-error" onclick="guardarRegistro('Error (0)')">🔴 Error (0)</button>
        `;
    } else if (tipoDeJugada === "Recepción") {
        botonesHTML = `
            <button class="btn-resultado btn-punto" onclick="guardarRegistro('Perfecta (3)')">🟢 Perfecta (3)</button>
            <button class="btn-resultado btn-neutro" onclick="guardarRegistro('Positiva (2)')">🟡 Positiva (2)</button>
            <button class="btn-resultado btn-neutro" onclick="guardarRegistro('Negativa (1)')">🟠 Negativa (1)</button>
            <button class="btn-resultado btn-error" onclick="guardarRegistro('Error (0)')">🔴 Error (0)</button>
        `;
    } else if (tipoDeJugada === "Defensa") {
        // --- NUEVA LÓGICA PARA DEFENSA ---
        botonesHTML = `
            <button class="btn-resultado btn-punto" onclick="guardarRegistro('Excelente (Perfecta)')">🟢 Excelente (Perfecta)</button>
            <button class="btn-resultado btn-neutro" onclick="guardarRegistro('Positiva (Jugable)')">🟡 Positiva (Jugable)</button>
            <button class="btn-resultado btn-neutro" onclick="guardarRegistro('Negativa (Vendida)')">🟠 Negativa (Vendida)</button>
            <button class="btn-resultado btn-error" onclick="guardarRegistro('Error')">🔴 Error</button>
        `;
    } else if (tipoDeJugada === "Armado") {
        botonesHTML = `
            <button class="btn-resultado btn-punto" onclick="guardarRegistro('Perfecto (1vs1)')">🟢 Perfecto (1vs1)</button>
            <button class="btn-resultado btn-neutro" onclick="guardarRegistro('Positivo (Doble)')">🟡 Positivo (Doble)</button>
            <button class="btn-resultado btn-neutro" onclick="guardarRegistro('Forzado / Impreciso')">🟠 Forzado / Impreciso</button>
            <button class="btn-resultado btn-error" onclick="guardarRegistro('Error (Falta)')">🔴 Error (Falta)</button>
        `;
    } else {
        botonesHTML = `
            <button class="btn-resultado btn-punto" onclick="guardarRegistro('Positivo / Punto')">🟢 Positivo / Punto</button>
            <button class="btn-resultado btn-neutro" onclick="guardarRegistro('Neutro / Sigue')">⚪ Neutro / Sigue</button>
            <button class="btn-resultado btn-error" onclick="guardarRegistro('Error')">🔴 Error</button>
        `;
    }

    grillaResultados.innerHTML = botonesHTML;
}

// --- 8. GUARDAR REGISTRO Y RESETEAR ---
// --- FUNCIÓN FINAL ACTUALIZADA CON CONEXIÓN A NODE ---
function guardarRegistro(resultadoFinal) {
    const paqueteDatos = {
        partido_id: identificadorPartido || "Sin_Configurar", // Usamos el ID de la configuración inicial
        set: setActual,
        equipo: equipoSeleccionado,
        jugador: atletaSeleccionado,
        accion: jugadaActual,
        zona: zonaSeleccionada,
        resultado: resultadoFinal
    };
    procesarPuntoAutomatico(resultadoFinal);
    
    // Guardamos en historial para el botón "Deshacer"
    historialRegistros.push(paqueteDatos);
    textoEstado.innerText = "Enviando datos...";

    // --- EL MENSAJERO (FETCH) AL SERVIDOR NODE.JS ---
    fetch('https://bright-hotels-fry.loca.lt/registrar-jugada', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'bypass-tunnel-reminder': 'true'
        },
        body: JSON.stringify(paqueteDatos) // Convertimos el paquete a texto para enviarlo
    })
    .then(respuestaServidor => respuestaServidor.json())
    .then(datosRespuesta => {
        console.log("✅ --- GUARDADO EN MYSQL ---", datosRespuesta);
        textoEstado.innerText = "¡Registrado BD! " + atletaSeleccionado + " | " + resultadoFinal;

        paqueteDatos.id_db = datosRespuesta.id;
    })
    .catch(errorRed => {
        console.error("❌ Error de red:", errorRed);
        textoEstado.innerText = "Error enviando a la Base de Datos";
    });

    // Ocultamos paneles y reseteamos variables en pantalla
    panelZonas.classList.add('oculto');
    panelResultados.classList.add('oculto');
    
    atletaSeleccionado = ""; 
    jugadaActual = "";
    zonaSeleccionada = "";
    botonesAtletas.forEach(b => b.style.borderColor = "transparent");
}

// --- LÓGICA: MARCADOR MANUAL Y AUTOMÁTICO ---
function ajustarMarcador(equipo, cantidad) {
    if(equipo === "Maranatha") {
        puntosMaranatha += cantidad;
        if(puntosMaranatha < 0) puntosMaranatha = 0; // No existen puntos negativos
        textoMarcadorMaranatha.innerText = puntosMaranatha;
    } else {
        puntosRival += cantidad;
        if(puntosRival < 0) puntosRival = 0;
        textoMarcadorRival.innerText = puntosRival;
    }
}

function procesarPuntoAutomatico(resultado) {
    // Definimos qué palabras exactas significan un punto directo
    const resultadosPunto = ['Punto Directo', 'Positivo / Punto'];
    // Definimos qué palabras exactas significan un error que le regala el punto al otro
    const resultadosError = ['Error / Bloqueado', 'Error (0)', 'Error', 'Error (Falta)'];

    let puntoParaMaranatha = false;
    let puntoParaRival = false;

    if (resultadosPunto.includes(resultado)) {
        if (equipoSeleccionado === "Maranatha") puntoParaMaranatha = true;
        else puntoParaRival = true;
    } else if (resultadosError.includes(resultado)) {
        // Si es un error, el punto va al equipo contrario
        if (equipoSeleccionado === "Maranatha") puntoParaRival = true;
        else puntoParaMaranatha = true;
    }

    // Actualizamos la pantalla
    if (puntoParaMaranatha) ajustarMarcador('Maranatha', 1);
    if (puntoParaRival) ajustarMarcador('Rival', 1);
}
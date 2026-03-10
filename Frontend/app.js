
let setActual = 1;
let historialRegistros = []; 
let nombreRivalActual = "";
let identificadorPartido = ""; 
let atletaSeleccionado = "";
let jugadaActual = "";
let zonaSeleccionada = ""; 
let equipoSeleccionado = "";
let puntosMaranatha = 0;
let puntosRival = 0;
const textoMarcadorMaranatha = document.getElementById('marcador-maranatha');
const textoMarcadorRival = document.getElementById('marcador-rival');
const textoNombreRivalMarcador = document.getElementById('nombre-rival-marcador');

const textoEstado = document.getElementById('estado-registro');
const botonesAtletas = document.querySelectorAll('.btn-jugador');
const botonesAcciones = document.querySelectorAll('.btn-accion');
const botonesZonas = document.querySelectorAll('.btn-zona'); 
const panelZonas = document.getElementById('panel-zonas');  
const panelResultados = document.getElementById('panel-resultados');
const grillaResultados = document.querySelector('.grid-resultados');

const vistaConfiguracion = document.getElementById('pantalla-configuracion');
const vistaCancha = document.getElementById('pantalla-cancha');
const botonIniciar = document.getElementById('btn-iniciar-encuentro');
const campoNombreRival = document.getElementById('input-nombre-rival');
const camposJugadorasRivales = document.querySelectorAll('.input-rival');
const tituloEquipoVisitante = document.querySelector('.titulo-equipo.visitante');
const botonesJugadoresRivales = document.querySelectorAll('.btn-jugador.rival');

const btnSetMenos = document.getElementById('btn-set-menos');
const btnSetMas = document.getElementById('btn-set-mas');
const textoSet = document.getElementById('texto-set');
const btnDeshacer = document.getElementById('btn-deshacer');
const btnTerminar = document.getElementById('btn-terminar');

botonIniciar.addEventListener('click', function() {
    nombreRivalActual = campoNombreRival.value || "Rival Desconocido";
    textoNombreRivalMarcador.innerText = nombreRivalActual.substring(0, 3).toUpperCase(); 
    tituloEquipoVisitante.innerText = nombreRivalActual;
    
    identificadorPartido = "Maranatha_vs_" + nombreRivalActual + "_" + Date.now();

    let fechaHoy = new Date().toISOString().split('T')[0]; 
    
    fetch('https://maranatha-stats.onrender.com/registrar-partido', {
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

    camposJugadorasRivales.forEach(function(campo, indice) {
        let textoIngresado = campo.value;
        if (textoIngresado === "") {
            textoIngresado = "Rival " + (indice + 1);
        }
        botonesJugadoresRivales[indice].innerText = textoIngresado;
    });

    vistaConfiguracion.classList.add('oculto');
    vistaCancha.classList.remove('oculto');
    
    textoEstado.innerText = "Partido Iniciado: Maranatha vs " + nombreRivalActual;
});

btnSetMenos.addEventListener('click', function() {
    if (setActual > 1) { 
        setActual--;
        textoSet.innerText = "Set " + setActual;
    }
});

btnSetMas.addEventListener('click', function() {
    if (setActual < 5) { 
        setActual++;
        textoSet.innerText = "Set " + setActual;
        puntosMaranatha = 0;
        puntosRival = 0;
        textoMarcadorMaranatha.innerText = puntosMaranatha;
        textoMarcadorRival.innerText = puntosRival;
    }
});

btnDeshacer.addEventListener('click', function() {
    if (historialRegistros.length === 0) {
        alert("No hay acciones registradas para deshacer.");
        return;
    }
    
    let ultimoRegistro = historialRegistros.pop();
    
    if (ultimoRegistro.id_db) {
        textoEstado.innerText = "Borrando de la Base de Datos...";
        
        fetch('https://maranatha-stats.onrender.com/eliminar-jugada/' + ultimoRegistro.id_db, {
            method: 'DELETE',
            headers: {
                'bypass-tunnel-reminder': 'true' 
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
        textoEstado.innerText = "Acción deshecha localmente.";
    }
});

btnTerminar.addEventListener('click', function() {
    let confirmacion = confirm("¿Estás seguro de que deseas terminar este partido? Se cerrará esta pantalla.");
    if (confirmacion) {
        window.location.reload(); 
    }
});

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
        
        panelZonas.classList.add('oculto');
        panelResultados.classList.add('oculto');
    });
});

botonesAcciones.forEach(function(boton) {
    boton.addEventListener('click', function() {
        if (atletaSeleccionado === "") {
            alert("Primero selecciona un jugador de la lista.");
            return; 
        }

        jugadaActual = this.innerText;

        if (jugadaActual === "Ataque") {
            textoEstado.innerText = "Equipo: " + equipoSeleccionado + " | Atleta: " + atletaSeleccionado + " | Acción: " + jugadaActual + " | Esperando zona...";
            panelZonas.classList.remove('oculto');
            panelResultados.classList.add('oculto');
        } else {
            zonaSeleccionada = "N/A";
            textoEstado.innerText = "Equipo: " + equipoSeleccionado + " | Atleta: " + atletaSeleccionado + " | Acción: " + jugadaActual;
            
            panelZonas.classList.add('oculto'); 
            panelResultados.classList.remove('oculto'); 
            
            cargarOpcionesDeResultado(jugadaActual);
        }
    });
});

botonesZonas.forEach(function(boton) {
    boton.addEventListener('click', function() {
        zonaSeleccionada = this.innerText;
        textoEstado.innerText = "Atleta: " + atletaSeleccionado + " | " + jugadaActual + " desde " + zonaSeleccionada;

        panelResultados.classList.remove('oculto');
        
        cargarOpcionesDeResultado(jugadaActual);
    });
});

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


function guardarRegistro(resultadoFinal) {
    const paqueteDatos = {
        partido_id: identificadorPartido || "Sin_Configurar", 
        set: setActual,
        equipo: equipoSeleccionado,
        jugador: atletaSeleccionado,
        accion: jugadaActual,
        zona: zonaSeleccionada,
        resultado: resultadoFinal
    };
    procesarPuntoAutomatico(resultadoFinal);
    
    historialRegistros.push(paqueteDatos);
    textoEstado.innerText = "Enviando datos...";

    fetch('https://maranatha-stats.onrender.com/registrar-jugada', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'bypass-tunnel-reminder': 'true'
        },
        body: JSON.stringify(paqueteDatos) 
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

    panelZonas.classList.add('oculto');
    panelResultados.classList.add('oculto');
    
    atletaSeleccionado = ""; 
    jugadaActual = "";
    zonaSeleccionada = "";
    botonesAtletas.forEach(b => b.style.borderColor = "transparent");
}

function ajustarMarcador(equipo, cantidad) {
    if(equipo === "Maranatha") {
        puntosMaranatha += cantidad;
        if(puntosMaranatha < 0) puntosMaranatha = 0; 
        textoMarcadorMaranatha.innerText = puntosMaranatha;
    } else {
        puntosRival += cantidad;
        if(puntosRival < 0) puntosRival = 0;
        textoMarcadorRival.innerText = puntosRival;
    }
}

function procesarPuntoAutomatico(resultado) {
    const resultadosPunto = ['Punto Directo', 'Positivo / Punto'];
    const resultadosError = ['Error / Bloqueado', 'Error (0)', 'Error', 'Error (Falta)'];

    let puntoParaMaranatha = false;
    let puntoParaRival = false;

    if (resultadosPunto.includes(resultado)) {
        if (equipoSeleccionado === "Maranatha") puntoParaMaranatha = true;
        else puntoParaRival = true;
    } else if (resultadosError.includes(resultado)) {
        if (equipoSeleccionado === "Maranatha") puntoParaRival = true;
        else puntoParaMaranatha = true;
    }

    if (puntoParaMaranatha) ajustarMarcador('Maranatha', 1);
    if (puntoParaRival) ajustarMarcador('Rival', 1);
}
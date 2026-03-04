// --- 1. CAPTURAR ELEMENTOS (MARANATHA Y RIVAL) ---
const cuerpoTablaAtaque = document.getElementById('cuerpo-tabla-ataque');
const cuerpoTablaRecepcion = document.getElementById('cuerpo-tabla-recepcion');
const cuerpoTablaArmado = document.getElementById('cuerpo-tabla-armado');

const cuerpoTablaAtaqueRival = document.getElementById('cuerpo-tabla-ataque-rival');
const cuerpoTablaRecepcionRival = document.getElementById('cuerpo-tabla-recepcion-rival');
const cuerpoTablaArmadoRival = document.getElementById('cuerpo-tabla-armado-rival');
const contenedorSets = document.getElementById('puntuacion-sets');


const selectorPartido = document.getElementById('selector-partido');

let baseDeDatosCompleta = [];

// --- 2. OBTENER DATOS ---
function cargarDatosReales() {
    fetch('https://maranatha-stats.onrender.com/obtener-estadisticas',{
        headers: { 'bypass-tunnel-reminder': 'true' }
    })
        .then(respuesta => respuesta.json())
        .then(datosBD => {
            baseDeDatosCompleta = datosBD; 
            llenarMenuPartidos(datosBD); 
            if (datosBD.length > 0) {
                let ultimoPartidoID = datosBD[datosBD.length - 1].id_partido;
                selectorPartido.value = ultimoPartidoID;
                procesarEstadisticas(ultimoPartidoID);
            }
        })
        .catch(error => console.error("❌ Error al obtener datos:", error));
}

// --- 3. MENÚ DESPLEGABLE ---
function llenarMenuPartidos(datosCrudos) {
    let partidosUnicos = [...new Set(datosCrudos.map(jugada => jugada.id_partido))];
    selectorPartido.innerHTML = ""; 
    if (partidosUnicos.length === 0) {
        selectorPartido.innerHTML = "<option>No hay partidos registrados</option>";
        return;
    }
    partidosUnicos.forEach(id => {
        let opcion = document.createElement('option');
        opcion.value = id;
        let nombreLimpio = id.split('_').slice(0, 3).join(' ');
        opcion.innerText = nombreLimpio;
        selectorPartido.appendChild(opcion);
    });
    selectorPartido.addEventListener('change', function() {
        procesarEstadisticas(this.value);
    });
}

// --- 4. LÓGICA DE PROCESAMIENTO MATEMÁTICO ---
function procesarEstadisticas(idPartidoSeleccionado) {
    // 1. Limpiamos las tablas y el marcador
    cuerpoTablaAtaque.innerHTML = ""; cuerpoTablaRecepcion.innerHTML = ""; cuerpoTablaArmado.innerHTML = "";
    cuerpoTablaSaque.innerHTML = ""; cuerpoTablaDefensa.innerHTML = "";
    cuerpoTablaAtaqueRival.innerHTML = ""; cuerpoTablaRecepcionRival.innerHTML = ""; cuerpoTablaArmadoRival.innerHTML = "";
    cuerpoTablaSaqueRival.innerHTML = ""; cuerpoTablaDefensaRival.innerHTML = "";
    contenedorSets.innerHTML = "";

    // Diccionarios de Atletas
    let resAtaque = {}; let resRecepcion = {}; let resArmado = {}; let resSaque = {}; let resDefensa = {};
    let resAtaqueRival = {}; let resRecepcionRival = {}; let resArmadoRival = {}; let resSaqueRival = {}; let resDefensaRival = {};

    // NUEVO: Diccionario para guardar el puntaje de cada set
    let marcadorSets = {};
    const resultadosPunto = ['Punto Directo', 'Positivo / Punto'];
    const resultadosError = ['Error / Bloqueado', 'Error (0)', 'Error', 'Error (Falta)'];

    let datosFiltrados = baseDeDatosCompleta.filter(jugada => jugada.id_partido === idPartidoSeleccionado);

    datosFiltrados.forEach(accion => {
        let nombre = accion.jugador;
        let esMaranatha = accion.equipo === "Maranatha";
        
        // --- NUEVA LÓGICA: CALCULAR MARCADOR AL VUELO ---
        // Si la jugada tiene un set (ej: 1), lo usamos. Si no, asumimos que es el Set 1.
        let numSet = accion.set || 1; 
        
        // Si es la primera vez que vemos este set, creamos sus contadores en 0
        if (!marcadorSets[numSet]) {
            marcadorSets[numSet] = { maranatha: 0, rival: 0 };
        }

        // Sumamos puntos según quién hizo el punto o quién cometió el error
        if (resultadosPunto.includes(accion.resultado)) {
            if (esMaranatha) marcadorSets[numSet].maranatha++;
            else marcadorSets[numSet].rival++;
        } else if (resultadosError.includes(accion.resultado)) {
            if (esMaranatha) marcadorSets[numSet].rival++;
            else marcadorSets[numSet].maranatha++;
        }

        // --- LÓGICA EXISTENTE DE ESTADÍSTICAS (Ataque, Saque, etc.) ---
        let dicAtaque = esMaranatha ? resAtaque : resAtaqueRival;
        let dicRec = esMaranatha ? resRecepcion : resRecepcionRival;
        let dicArm = esMaranatha ? resArmado : resArmadoRival;
        let dicSaque = esMaranatha ? resSaque : resSaqueRival;
        let dicDef = esMaranatha ? resDefensa : resDefensaRival;

        if (accion.accion === "Ataque") {
            if (!dicAtaque[nombre]) dicAtaque[nombre] = { total: 0, puntos: 0, fallos: 0, sigue: 0 };
            dicAtaque[nombre].total++;
            if (accion.resultado === "Punto Directo") dicAtaque[nombre].puntos++;
            else if (accion.resultado === "Error / Bloqueado") dicAtaque[nombre].fallos++;
            else if (accion.resultado === "Continuidad") dicAtaque[nombre].sigue++;
        }
        else if (accion.accion === "Recepción") {
            if (!dicRec[nombre]) dicRec[nombre] = { total: 0, perfectas: 0, positivas: 0, negativas: 0, errores: 0 };
            dicRec[nombre].total++;
            if (accion.resultado === "Perfecta (3)") dicRec[nombre].perfectas++;
            else if (accion.resultado === "Positiva (2)") dicRec[nombre].positivas++;
            else if (accion.resultado === "Negativa (1)") dicRec[nombre].negativas++;
            else if (accion.resultado === "Error (0)") dicRec[nombre].errores++;
        }
        else if (accion.accion === "Armado") {
            if (!dicArm[nombre]) dicArm[nombre] = { total: 0, perfectos: 0, positivos: 0, forzados: 0, errores: 0 };
            dicArm[nombre].total++;
            if (accion.resultado === "Perfecto (1vs1)") dicArm[nombre].perfectos++;
            else if (accion.resultado === "Positivo (Doble)") dicArm[nombre].positivos++;
            else if (accion.resultado === "Forzado / Impreciso") dicArm[nombre].forzados++;
            else if (accion.resultado === "Error (Falta)") dicArm[nombre].errores++;
        }
        else if (accion.accion === "Saque") {
            if (!dicSaque[nombre]) dicSaque[nombre] = { total: 0, aces: 0, positivos: 0, errores: 0 };
            dicSaque[nombre].total++;
            if (accion.resultado === "Positivo / Punto") dicSaque[nombre].aces++;
            else if (accion.resultado === "Neutro / Sigue") dicSaque[nombre].positivos++;
            else if (accion.resultado === "Error") dicSaque[nombre].errores++;
        }
        else if (accion.accion === "Bloqueo" || accion.accion === "Defensa") {
            if (!dicDef[nombre]) dicDef[nombre] = { bloqueos: 0, excelente: 0, positiva: 0, error: 0 };
            if (accion.accion === "Bloqueo" && accion.resultado === "Positivo / Punto") dicDef[nombre].bloqueos++;
            else if (accion.resultado.includes("Excelente")) dicDef[nombre].excelente++;
            else if (accion.resultado.includes("Positiva")) dicDef[nombre].positiva++;
            else if (accion.resultado === "Error") dicDef[nombre].error++;
        }
    });

    // --- NUEVO: DIBUJAR LOS CUADRITOS DEL MARCADOR EN PANTALLA ---
    if (Object.keys(marcadorSets).length === 0) {
        contenedorSets.innerHTML = "<span style='color: #7f8c8d;'>No hay puntos registrados en este partido.</span>";
    } else {
        Object.keys(marcadorSets).sort().forEach(numSet => {
            let ptsMar = marcadorSets[numSet].maranatha;
            let ptsRiv = marcadorSets[numSet].rival;
            
            // Pintamos el borde superior dependiendo de quién va ganando
            let colorBorde = ptsMar > ptsRiv ? '#2980b9' : (ptsRiv > ptsMar ? '#c0392b' : '#bdc3c7');

            contenedorSets.innerHTML += `
                <div style="background: #ecf0f1; padding: 10px 20px; border-radius: 8px; border-top: 5px solid ${colorBorde}; min-width: 100px;">
                    <strong style="display: block; margin-bottom: 5px; color: #34495e;">Set ${numSet}</strong>
                    <span style="font-size: 1.5rem; font-weight: bold; color: #2c3e50;">${ptsMar}</span>
                    <span style="margin: 0 5px; color: #7f8c8d;">-</span>
                    <span style="font-size: 1.5rem; font-weight: bold; color: #c0392b;">${ptsRiv}</span>
                </div>
            `;
        });
    }

    // --- DIBUJAR TABLAS ESTADÍSTICAS ---
    dibujarTablaAtaque(resAtaque, cuerpoTablaAtaque); dibujarTablaAtaque(resAtaqueRival, cuerpoTablaAtaqueRival);
    dibujarTablaRecepcion(resRecepcion, cuerpoTablaRecepcion); dibujarTablaRecepcion(resRecepcionRival, cuerpoTablaRecepcionRival);
    dibujarTablaArmado(resArmado, cuerpoTablaArmado); dibujarTablaArmado(resArmadoRival, cuerpoTablaArmadoRival);
    dibujarTablaSaque(resSaque, cuerpoTablaSaque); dibujarTablaSaque(resSaqueRival, cuerpoTablaSaqueRival);
    dibujarTablaDefensa(resDefensa, cuerpoTablaDefensa); dibujarTablaDefensa(resDefensaRival, cuerpoTablaDefensaRival);
}

// --- FUNCIONES AUXILIARES PARA DIBUJAR (Para no repetir código) ---
function dibujarTablaAtaque(diccionario, elementoHTML) {
    Object.keys(diccionario).forEach(nombre => {
        let info = diccionario[nombre];
        let pctError = info.total > 0 ? (info.fallos / info.total) * 100 : 0;
        let efectividad = info.total > 0 ? ((info.puntos - info.fallos) / info.total) * 100 : 0;
        elementoHTML.innerHTML += `<tr>
            <td><strong>${nombre}</strong></td><td>${info.total}</td><td>${info.puntos}</td><td>${info.sigue}</td><td>${info.fallos}</td>
            <td class="resaltado-rojo">${pctError.toFixed(1)}%</td><td class="resaltado-verde">${efectividad.toFixed(1)}%</td>
        </tr>`;
    });
}

function dibujarTablaRecepcion(diccionario, elementoHTML) {
    Object.keys(diccionario).forEach(nombre => {
        let info = diccionario[nombre];
        let efectividadRec = info.total > 0 ? ((info.perfectas + info.positivas) / info.total) * 100 : 0;
        elementoHTML.innerHTML += `<tr>
            <td><strong>${nombre}</strong></td><td>${info.total}</td><td>${info.perfectas}</td><td>${info.positivas}</td><td>${info.negativas}</td>
            <td class="resaltado-rojo">${info.errores}</td><td class="resaltado-verde">${efectividadRec.toFixed(1)}%</td>
        </tr>`;
    });
}

function dibujarTablaArmado(diccionario, elementoHTML) {
    Object.keys(diccionario).forEach(nombre => {
        let info = diccionario[nombre];
        let pctPerfecto = info.total > 0 ? (info.perfectos / info.total) * 100 : 0;
        elementoHTML.innerHTML += `<tr>
            <td><strong>${nombre}</strong></td><td>${info.total}</td><td class="resaltado-verde">${info.perfectos}</td><td>${info.positivos}</td>
            <td>${info.forzados}</td><td class="resaltado-rojo">${info.errores}</td><td><strong>${pctPerfecto.toFixed(1)}%</strong></td>
        </tr>`;
    });
}

function dibujarTablaSaque(diccionario, elementoHTML) {
    Object.keys(diccionario).forEach(nombre => {
        let info = diccionario[nombre];
        let eficacia = info.total > 0 ? ((info.aces + info.positivos - info.errores) / info.total) * 100 : 0;
        elementoHTML.innerHTML += `<tr>
            <td><strong>${nombre}</strong></td><td>${info.total}</td><td>${info.aces}</td><td>${info.positivos}</td>
            <td class="resaltado-rojo">${info.errores}</td><td class="resaltado-verde">${eficacia.toFixed(1)}%</td>
        </tr>`;
    });
}

function dibujarTablaDefensa(diccionario, elementoHTML) {
    Object.keys(diccionario).forEach(nombre => {
        let info = diccionario[nombre];
        elementoHTML.innerHTML += `<tr>
            <td><strong>${nombre}</strong></td><td>${info.bloqueos}</td><td>${info.excelente}</td><td>${info.positiva}</td>
            <td class="resaltado-rojo">${info.error}</td>
        </tr>`;
    });
}

cargarDatosReales();

const urlBackend = 'https://maranatha-stats.onrender.com';
const cancha = document.getElementById('cancha-resultados');
const canvas = document.getElementById('lienzo-resultados');
const ctx = canvas.getContext('2d');
const selectorJugadora = document.getElementById('filtro-jugadora');

let todosLosAtaques = []; 

function ajustarCanvas() {
    canvas.width = cancha.offsetWidth;
    canvas.height = cancha.offsetHeight;
}
window.addEventListener('resize', () => {
    ajustarCanvas();
    actualizarDashboard(); 
});

async function cargarDatos() {
    try {
        const respuesta = await fetch(`${urlBackend}/obtener-scout`);
        const datos = await respuesta.json();
        todosLosAtaques = datos;

        console.log("Datos recibidos de la BD:", todosLosAtaques);

        llenarSelectorJugadoras();
        ajustarCanvas();
        actualizarDashboard(); 
        
    } catch (error) {
        console.error("Error al cargar los datos:", error);
    }
}

function llenarSelectorJugadoras() {
    const jugadorasUnicas = [...new Set(todosLosAtaques.map(ataque => ataque.atacante))];
    
    selectorJugadora.innerHTML = '<option value="Todas">Todas las jugadoras</option>';
    
    jugadorasUnicas.forEach(jugadora => {
        const opcion = document.createElement('option');
        opcion.value = jugadora;
        opcion.textContent = jugadora;
        selectorJugadora.appendChild(opcion);
    });
}

selectorJugadora.addEventListener('change', actualizarDashboard);

function actualizarDashboard() {
    const jugadoraSeleccionada = selectorJugadora.value;
    
    let ataquesFiltrados = todosLosAtaques;
    if (jugadoraSeleccionada !== "Todas") {
        ataquesFiltrados = todosLosAtaques.filter(ataque => ataque.atacante === jugadoraSeleccionada);
    }

    calcularTendenciaArmado(ataquesFiltrados);
    dibujarTrayectorias(ataquesFiltrados);
}

function calcularTendenciaArmado(ataques) {
    const total = ataques.length;
    if (total === 0) {
        document.getElementById('porc-z4').textContent = "0%";
        document.getElementById('porc-z3').textContent = "0%";
        document.getElementById('porc-z2').textContent = "0%";
        document.getElementById('porc-zaguero').textContent = "0%";
        return;
    }

    let z4 = 0, z3 = 0, z2 = 0, zaguero = 0;

    ataques.forEach(ataque => {
        const origen = String(ataque.zona_origen); 
        if (origen === "4") z4++;
        else if (origen === "3") z3++;
        else if (origen === "2") z2++;
        else if (origen === "1" || origen === "5" || origen === "6") zaguero++;
    });

    document.getElementById('porc-z4').textContent = Math.round((z4 / total) * 100) + "%";
    document.getElementById('porc-z3').textContent = Math.round((z3 / total) * 100) + "%";
    document.getElementById('porc-z2').textContent = Math.round((z2 / total) * 100) + "%";
    document.getElementById('porc-zaguero').textContent = Math.round((zaguero / total) * 100) + "%";
}

function dibujarTrayectorias(ataques) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    ataques.forEach(ataque => {
        const xOrigen = ataque.origen_x * canvas.width;
        const yOrigen = ataque.origen_y * canvas.height;
        const xDestino = ataque.destino_x * canvas.width;
        const yDestino = ataque.destino_y * canvas.height;

        let colorLinea = "#ffffff";
        if (ataque.resultado === "Punto Directo") colorLinea = "#28a745"; 
        else if (ataque.resultado === "Continuidad (Sigue)") colorLinea = "#ced4da"; 
        else if (ataque.resultado === "Error de Ataque") colorLinea = "#dc3545"; 
        else if (ataque.resultado === "Bloqueado") colorLinea = "#343a40"; 

        ctx.beginPath();
        ctx.moveTo(xOrigen, yOrigen);
        ctx.lineTo(xDestino, yDestino);
        ctx.strokeStyle = colorLinea;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(xDestino, yDestino, 6, 0, 2 * Math.PI);
        ctx.fillStyle = colorLinea;
        ctx.fill();
    });
}

cargarDatos();
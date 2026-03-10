const cancha = document.getElementById('cancha');
const canvas = document.getElementById('lienzo-dibujo');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('modal-resultado');
const botonesJugadoras = document.querySelectorAll('.btn-jugadora');

const btnPunto = document.querySelector('.btn-res.punto');
const btnSigue = document.querySelector('.btn-res.sigue');
const btnError = document.querySelector('.btn-res.error');
const btnBloqueo = document.querySelector('.btn-res.bloqueo');
const btnCancelar = document.querySelector('.btn-cancelar');

let dibujando = false;
let origenX = 0, origenY = 0;
let destinoX = 0, destinoY = 0;
let zonaOrigen = "";
let zonaDestino = "";
let jugadoraActiva = "#4 - Central"; 

botonesJugadoras.forEach(boton => {
    boton.addEventListener('click', (e) => {
        botonesJugadoras.forEach(b => b.classList.remove('activa'));
        e.target.classList.add('activa');
        jugadoraActiva = e.target.innerText;
    });
});

function ajustarCanvas() {
    canvas.width = cancha.offsetWidth;
    canvas.height = cancha.offsetHeight;
}
window.addEventListener('resize', ajustarCanvas);
ajustarCanvas(); 

function obtenerCoordenadas(evento) {
    const rect = cancha.getBoundingClientRect();
    const clienteX = evento.touches ? evento.touches[0].clientX : evento.clientX;
    const clienteY = evento.touches ? evento.touches[0].clientY : evento.clientY;
    return {
        x: clienteX - rect.left,
        y: clienteY - rect.top
    };
}

function iniciarDibujo(e) {
    e.preventDefault();
    dibujando = true;
    const coords = obtenerCoordenadas(e);
    origenX = coords.x;
    origenY = coords.y;
    
    zonaOrigen = e.target.getAttribute('data-zona') || "Fuera";
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function dibujarLinea(e) {
    if (!dibujando) return;
    e.preventDefault();
    const coords = obtenerCoordenadas(e);
    destinoX = coords.x;
    destinoY = coords.y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(origenX, origenY);
    ctx.lineTo(destinoX, destinoY);
    ctx.strokeStyle = '#ffffff'; 
    ctx.lineWidth = 4; 
    ctx.lineCap = 'round'; 
    ctx.stroke();
}

function terminarDibujo(e) {
    if (!dibujando) return;
    dibujando = false;
    
    const clienteX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clienteY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    
    const elementoDestino = document.elementFromPoint(clienteX, clienteY);
    zonaDestino = elementoDestino ? elementoDestino.getAttribute('data-zona') || "Fuera" : "Fuera";
    
    modal.classList.remove('oculto');
}

cancha.addEventListener('mousedown', iniciarDibujo);
cancha.addEventListener('mousemove', dibujarLinea);
cancha.addEventListener('mouseup', terminarDibujo);

cancha.addEventListener('touchstart', iniciarDibujo, {passive: false});
cancha.addEventListener('touchmove', dibujarLinea, {passive: false});
cancha.addEventListener('touchend', terminarDibujo);


function registrarAtaque(resultado) {
    const datosScout = {
        id_partido: "Maranatha vs Rival Prueba", 
        atacante: jugadoraActiva,
        zona_origen: zonaOrigen,
        zona_destino: zonaDestino,
        resultado: resultado
    };

    fetch('https://maranatha-stats.onrender.com/registrar-scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosScout)
    })
    .then(respuesta => respuesta.text())
    .then(mensaje => {
        console.log("Respuesta del servidor:", mensaje);
        cerrarModal();
    })
    .catch(error => {
        console.error("Error al enviar los datos:", error);
        alert("Hubo un problema de conexión al guardar la jugada.");
        cerrarModal();
    });
}

function cerrarModal() {
    modal.classList.add('oculto');
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
}

btnPunto.addEventListener('click', () => registrarAtaque("Punto Directo"));
btnSigue.addEventListener('click', () => registrarAtaque("Continuidad (Sigue)"));
btnError.addEventListener('click', () => registrarAtaque("Error de Ataque"));
btnBloqueo.addEventListener('click', () => registrarAtaque("Bloqueado"));
btnCancelar.addEventListener('click', cerrarModal);
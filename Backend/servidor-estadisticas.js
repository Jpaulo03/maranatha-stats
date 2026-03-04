const servidorExpress = require('express');
const conectorMySQL = require('mysql2');
const cors = require('cors');

const aplicacion = servidorExpress();

// Configuraciones básicas
aplicacion.use(cors());
aplicacion.use(servidorExpress.json()); // Permite leer el "paquete de datos" que enviamos

// --- 1. CONEXIÓN A LA BASE DE DATOS WORKBENCH ---
const conexionBD = conectorMySQL.createConnection({
    host: 'localhost',
    user: 'root',      // Tu usuario de Workbench (usualmente 'root')
    password: 'admin',      // Pon aquí la contraseña de tu MySQL (si tienes)
    database: 'volley_stats'
});

conexionBD.connect((error) => {
    if (error) {
        console.error('❌ Error conectando a MySQL:', error);
        return;
    }
    console.log('✅ ¡Conectado exitosamente a la base de datos de Voleibol!');
});

// --- 2. RUTA PARA RECIBIR Y GUARDAR LA JUGADA ---
aplicacion.post('/registrar-jugada', (peticion, respuesta) => {
    // Aquí recibimos el paquete que armamos en el frontend
    const paquete = peticion.body; 

    // La instrucción SQL limpia
    const consultaSQL = `INSERT INTO registro_acciones 
        (id_partido, numero_set, equipo, jugador, accion, zona, resultado) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    // Los datos exactos en el orden de los signos de interrogación
    const valoresAGuardar = [
        paquete.partido_id,
        paquete.set,
        paquete.equipo,
        paquete.jugador,
        paquete.accion,
        paquete.zona,
        paquete.resultado
    ];

    // Ejecutamos la inserción en Workbench
    conexionBD.query(consultaSQL, valoresAGuardar, (errorBD, resultados) => {
        if (errorBD) {
            console.error('❌ Error guardando la jugada:', errorBD);
            respuesta.status(500).send('Hubo un problema al guardar');
        } else {
            console.log('🏐 Acción registrada en BD con ID:', resultados.insertId);
            respuesta.status(200).send({ mensaje: 'Registro exitoso', id: resultados.insertId });
        }
    });
});

// --- NUEVA RUTA: ELIMINAR JUGADA (DESHACER) ---
// Usamos el método DELETE y recibimos el ID por la URL
aplicacion.delete('/eliminar-jugada/:id', (peticion, respuesta) => {
    const idParaBorrar = peticion.params.id;
    
    // La instrucción SQL para borrar exactamente esa fila
    const consultaBorrar = "DELETE FROM registro_acciones WHERE id_accion = ?";

    conexionBD.query(consultaBorrar, [idParaBorrar], (errorBD, resultados) => {
        if (errorBD) {
            console.error('❌ Error al borrar en BD:', errorBD);
            respuesta.status(500).send('Error intentando borrar');
        } else {
            console.log('🗑️ Acción eliminada de la BD. ID:', idParaBorrar);
            respuesta.status(200).send({ mensaje: 'Borrado exitoso' });
        }
    });
});

// --- NUEVA RUTA: OBTENER TODAS LAS ESTADÍSTICAS ---
aplicacion.get('/obtener-estadisticas', (peticion, respuesta) => {
    // Pedimos toda la tabla a MySQL
    const consultaSQL = "SELECT * FROM registro_acciones";
    
    conexionBD.query(consultaSQL, (errorBD, resultados) => {
        if (errorBD) {
            console.error('❌ Error obteniendo datos:', errorBD);
            respuesta.status(500).send('Error al consultar la base de datos');
        } else {
            console.log('📊 Datos enviados al Dashboard. Total filas:', resultados.length);
            // Enviamos los datos en formato JSON a la página web
            respuesta.status(200).json(resultados);
        }
    });
});


// --- NUEVA RUTA: GUARDAR HISTORIAL DEL PARTIDO ---
aplicacion.post('/registrar-partido', (peticion, respuesta) => {
    const paquete = peticion.body; 

    const consultaSQL = `INSERT INTO historial_partidos 
        (id_partido, equipo_local, equipo_visitante, fecha) 
        VALUES (?, ?, ?, ?)`;
    
    const valoresAGuardar = [
        paquete.id_partido,
        "Maranatha", // Siempre seremos locales en esta app
        paquete.equipo_visitante,
        paquete.fecha
    ];

    conexionBD.query(consultaSQL, valoresAGuardar, (errorBD, resultados) => {
        if (errorBD) {
            console.error('❌ Error guardando el partido en el historial:', errorBD);
            respuesta.status(500).send('Hubo un problema');
        } else {
            console.log('📝 Nuevo partido creado en la BD:', paquete.id_partido);
            respuesta.status(200).send({ mensaje: 'Partido guardado en historial' });
        }
    });
});

// --- 3. ENCENDER EL SERVIDOR ---
const PUERTO = process.env.PORT || 3000;

aaplicacion.listen(puerto, () => {
    console.log("Servidor encendido en el puerto: " + puerto);
});

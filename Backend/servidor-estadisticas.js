const servidorExpress = require('express');
const conectorMySQL = require('mysql2');
const cors = require('cors');

const aplicacion = servidorExpress();

aplicacion.use(cors());
aplicacion.use(servidorExpress.json()); 

const conexionBD = conectorMySQL.createPool({
    host: 'bwpbgxyijdpjonpghqko-mysql.services.clever-cloud.com',
    user: 'utgx1uufaesjth8q',      
    password: 'azn4zWU2Eqbh3ahEItvw',
    database: 'bwpbgxyijdpjonpghqko',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

console.log("¡Cerebro conectado a la base de datos! Listo para el Scouting.");

conexionBD.getConnection((err, connection) => {
    if (err) {
        console.error('Error al conectar a la BD:', err);
    } else {
        console.log('¡Conexión inteligente a Clever Cloud establecida!');
        connection.release(); 
    }
});

aplicacion.post('/registrar-jugada', (peticion, respuesta) => {
    const paquete = peticion.body; 

    const consultaSQL = `INSERT INTO registro_acciones 
        (id_partido, numero_set, equipo, jugador, accion, zona, resultado) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    const valoresAGuardar = [
        paquete.partido_id,
        paquete.set,
        paquete.equipo,
        paquete.jugador,
        paquete.accion,
        paquete.zona,
        paquete.resultado
    ];

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

aplicacion.delete('/eliminar-jugada/:id', (peticion, respuesta) => {
    const idParaBorrar = peticion.params.id;
    
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

aplicacion.get('/obtener-estadisticas', (peticion, respuesta) => {
    const consultaSQL = "SELECT * FROM registro_acciones";
    
    conexionBD.query(consultaSQL, (errorBD, resultados) => {
        if (errorBD) {
            console.error('❌ Error obteniendo datos:', errorBD);
            respuesta.status(500).send('Error al consultar la base de datos');
        } else {
            console.log('📊 Datos enviados al Dashboard. Total filas:', resultados.length);
            respuesta.status(200).json(resultados);
        }
    });
});


aplicacion.post('/registrar-partido', (peticion, respuesta) => {
    const paquete = peticion.body; 

    const consultaSQL = `INSERT INTO historial_partidos 
        (id_partido, equipo_local, equipo_visitante, fecha) 
        VALUES (?, ?, ?, ?)`;
    
    const valoresAGuardar = [
        paquete.id_partido,
        "Maranatha", 
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

aplicacion.post('/registrar-scout', (peticion, respuesta) => {
    const { id_partido, atacante, zona_origen, zona_destino, origen_x, origen_y, destino_x, destino_y, resultado } = peticion.body;
    
    const consulta = "INSERT INTO scout_rival (id_partido, atacante, zona_origen, zona_destino, origen_x, origen_y, destino_x, destino_y, resultado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    conexionBD.query(consulta, [id_partido, atacante, zona_origen, zona_destino, origen_x, origen_y, destino_x, destino_y, resultado], (error, resultados) => {
        if (error) {
            console.error("Error al guardar el scout:", error);
            respuesta.status(500).send("Hubo un error al guardar en la base de datos.");
        } else {
            console.log("¡Tiro del rival guardado con precisión milimétrica!");
            respuesta.send("Jugada guardada");
        }
    });
});

aplicacion.get('/obtener-scout', (peticion, respuesta) => {
    const consulta = "SELECT * FROM scout_rival ORDER BY fecha DESC";
    
    conexionBD.query(consulta, (error, resultados) => {
        if (error) {
            console.error("Error al obtener datos del scout:", error);
            respuesta.status(500).send("Error al leer la base de datos");
        } else {
            console.log("Enviando " + resultados.length + " trazos de scouting a la pantalla.");
            respuesta.json(resultados); 
        }
    });
});

const PUERTO = process.env.PORT || 3000;

aplicacion.listen(PUERTO, () => {
    console.log("Servidor encendido en el puerto: " + PUERTO);
});

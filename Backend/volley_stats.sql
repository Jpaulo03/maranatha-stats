CREATE DATABASE IF NOT EXISTS volley_stats;
USE volley_stats;

CREATE TABLE registro_acciones (
    id_accion INT AUTO_INCREMENT PRIMARY KEY,
    id_partido VARCHAR(100) NOT NULL,   
    numero_set INT NOT NULL,            
    equipo VARCHAR(50) NOT NULL,        
    jugador VARCHAR(50) NOT NULL,    
    accion VARCHAR(50) NOT NULL,      
    zona VARCHAR(50) NOT NULL,         
    resultado VARCHAR(50) NOT NULL,   
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE historial_partidos (
    id_partido VARCHAR(100) PRIMARY KEY,
    equipo_local VARCHAR(50) NOT NULL,
    equipo_visitante VARCHAR(50) NOT NULL,
    fecha DATE NOT NULL
);

SELECT * FROM registro_acciones;
SELECT * FROM historial_partidos;

TRUNCATE TABLE registro_acciones;
TRUNCATE TABLE historial_partidos;


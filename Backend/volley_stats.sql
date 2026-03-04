-- 1. Creamos la base de datos (si no existe) y la usamos
CREATE DATABASE IF NOT EXISTS volley_stats;
USE volley_stats;

-- 2. Creamos la tabla principal que recibirá cada "tap" de la tablet
CREATE TABLE registro_acciones (
    id_accion INT AUTO_INCREMENT PRIMARY KEY,
    id_partido VARCHAR(100) NOT NULL,   -- Recibirá: "Maranatha_vs_cba_168432"
    numero_set INT NOT NULL,            -- Recibirá: 1, 2, 3...
    equipo VARCHAR(50) NOT NULL,        -- Recibirá: "Maranatha" o "Rival"
    jugador VARCHAR(50) NOT NULL,       -- Recibirá: "#7 - Eliana"
    accion VARCHAR(50) NOT NULL,        -- Recibirá: "Ataque", "Defensa", etc.
    zona VARCHAR(50) NOT NULL,          -- Recibirá: "Zona 4", "N/A", etc.
    resultado VARCHAR(50) NOT NULL,     -- Recibirá: "Punto Directo", "Excelente", etc.
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Guarda la hora exacta del clic
);

-- 3. (Opcional pero recomendado) Una tabla para registrar los partidos creados
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


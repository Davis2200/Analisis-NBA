-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS sports_stats;
USE sports_stats;

-- Tabla para equipos
CREATE TABLE IF NOT EXISTS teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    sport_type VARCHAR(50) NOT NULL
);

-- Tabla para partidos
CREATE TABLE IF NOT EXISTS matches (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    team1_id INT NOT NULL,
    team2_id INT NOT NULL,
    match_date DATE NOT NULL,
    result VARCHAR(50),
    FOREIGN KEY (team1_id) REFERENCES teams(team_id),
    FOREIGN KEY (team2_id) REFERENCES teams(team_id)
);

-- Tabla para estadísticas de partidos
CREATE TABLE IF NOT EXISTS match_stats (
    stat_id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    team_id INT NOT NULL,
    points INT,
    assists INT,
    rebounds INT,
    FOREIGN KEY (match_id) REFERENCES matches(match_id),
    FOREIGN KEY (team_id) REFERENCES teams(team_id)
);

USE sports_stats;

-- Crear tabla de equipos
CREATE TABLE IF NOT EXISTS teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    sport_type VARCHAR(50) NOT NULL
);

-- Insertar datos de ejemplo
INSERT INTO teams (team_name, sport_type) VALUES ('Lakers', 'Basketball');
INSERT INTO teams (team_name, sport_type) VALUES ('Warriors', 'Basketball');

-- Consultar datos
SELECT * FROM teams;


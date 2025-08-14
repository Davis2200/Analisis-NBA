-- Crear la base de datos
CREATE DATABASE nba_stats;

-- Conectarse a la base de datos
\c nba_stats

-- Teams table
CREATE TABLE teams (
    team_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    conference VARCHAR(20),
    division VARCHAR(50)
);

-- Players table
CREATE TABLE players (
    player_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(5),
    height VARCHAR(10),
    weight INT,
    birth_date DATE,
    team_id INT,
    FOREIGN KEY (team_id) REFERENCES teams(team_id)
);

-- Seasons table
CREATE TABLE seasons (
    season_id SERIAL PRIMARY KEY,
    start_year INT NOT NULL,
    end_year INT NOT NULL,
    type VARCHAR(20) -- Regular, Playoffs, Preseason
);

-- Games table
CREATE TABLE games (
    game_id SERIAL PRIMARY KEY,
    season_id INT,
    date_from DATE,
    home_team_id INT,
    away_team_id INT,
    home_points INT,
    away_points INT,
    FOREIGN KEY (season_id) REFERENCES seasons(season_id),
    FOREIGN KEY (home_team_id) REFERENCES teams(team_id),
    FOREIGN KEY (away_team_id) REFERENCES teams(team_id)
);

-- Player statistics table
CREATE TABLE player_statistics (
    statistic_id SERIAL PRIMARY KEY,
    game_id INT NOT NULL,
    team_id INT NOT NULL,
    team_abbreviation VARCHAR(10),
    player_id INT NOT NULL,
    player_name VARCHAR(100),
    start_position VARCHAR(5),
    min VARCHAR(10),            -- Formato MM:SS o decimal
    fgm INT,                    -- Tiros de campo anotados
    fga INT,                    -- Tiros de campo intentados
    fg_pct FLOAT,               -- Porcentaje de tiros de campo
    fg3m INT,                   -- Triples anotados
    fg3a INT,                   -- Triples intentados
    fg3_pct FLOAT,              -- Porcentaje de triples
    ftm INT,                    -- Tiros libres anotados
    fta INT,                    -- Tiros libres intentados
    ft_pct FLOAT,               -- Porcentaje de tiros libres
    oreb INT,                   -- Rebotes ofensivos
    dreb INT,                   -- Rebotes defensivos
    reb INT,                    -- Rebotes totales
    ast INT,                    -- Asistencias
    stl INT,                    -- Robos
    blk INT,                    -- Tapones
    "to" INT,                   -- Pérdidas (TO es palabra reservada)
    pf INT,                     -- Faltas personales
    pts INT,                    -- Puntos
    plus_minus INT,             -- Plus/Minus
    season VARCHAR(10),         -- Temporada (ej. "2022-23")
    
    -- Claves foráneas
    FOREIGN KEY (game_id) REFERENCES games(game_id),
    FOREIGN KEY (team_id) REFERENCES teams(team_id),
    FOREIGN KEY (player_id) REFERENCES players(player_id)
); 
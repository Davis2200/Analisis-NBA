SELECT
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    ccu.column_name,
    ccu2.table_schema AS referenced_table_schema,
    ccu2.table_name AS referenced_table_name,
    ccu2.column_name AS referenced_column_name
FROM
    information_schema.table_constraints tc
LEFT JOIN
    information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
    AND tc.table_schema = ccu.table_schema
LEFT JOIN
    information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
LEFT JOIN
    information_schema.constraint_column_usage ccu2
    ON rc.unique_constraint_name = ccu2.constraint_name
    AND rc.unique_constraint_schema = ccu2.table_schema
WHERE
    tc.table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY
    tc.table_schema,
    tc.table_name,
    tc.constraint_name;



-- Primero, añadir campos faltantes a games
ALTER TABLE games ADD COLUMN scheduled_date TIMESTAMP;
ALTER TABLE games ADD COLUMN status VARCHAR(20) CHECK (status IN ('scheduled', 'in_progress', 'completed', 'postponed'));

-- Migrar datos de game_schedule a games
UPDATE games g
SET 
    scheduled_date = gs.scheduled_date,
    status = gs.status,
	home_team_id = gs.home_team_id,
	away_team_id = gs.visitor_team_id
FROM game_schedule gs
WHERE g.game_id = gs.game_id;

-- Eliminar las columnas redundantes después de migrar
ALTER TABLE games DROP COLUMN IF EXISTS date;
ALTER TABLE games DROP COLUMN IF EXISTS time;

-- Eliminar la tabla game_schedule si ya no es necesaria
DROP TABLE IF EXISTS game_schedule;



-- Añadir columnas faltantes a player_game_performance
ALTER TABLE player_game_performance
ADD COLUMN IF NOT EXISTS three_p_made INT,
ADD COLUMN IF NOT EXISTS three_p_attempted INT,
ADD COLUMN IF NOT EXISTS rebounds_offensive INT,
ADD COLUMN IF NOT EXISTS rebounds_defensive INT,
ADD COLUMN IF NOT EXISTS plus_minus INT;

-- Migrar datos de player_statistics si es necesario
UPDATE player_game_performance pgp
SET 
	 = ps.,
	 = ps.
FROM player_statistics ps
WHERE pgp.game_id = ps.game_id AND pgp.player_id = ps.player_id;

alter table player_game_performance
	add column free_throws_made int,
	add column free_throws_attempted int,
	add column free_throws_percentage numeric (5,2),
	add column field_goal_made int, 
	add column field_goal_attempted int, 
	add column field_goal_percentage numeric (5,2),
	add column personal_fouls int;

alter table player_game_performance
	add column three_p_percentage double precision;

alter table player_game_performance 
	alter column free_throws_percentage type double precision,
	alter column field_goal_percentage type double precision;
	


INSERT INTO player_game_performance (game_id, player_id,points, assists,
	rebounds, steals,blocks,turnovers, minutes_played, three_p_made,
	three_p_attempted,rebounds_offensive, rebounds_defensive, plus_minus,free_throws_made,
	free_throws_attempted,free_throws_percentage,field_goal_made,field_goal_attempted,
	field_goal_percentage,personal_fouls,three_p_percentage)
SELECT game_id, player_id, pts, ast, reb,stl,blk,"to", "min", fg3m,
	fg3a,oreb,dreb,plus_minus, ftm, fta, ft_pct, fgm, fga, fg_pct, pf,fg3_pct
FROM player_statistics;

select * from player_statistics;

select * from player_game_performance;

alter table player_game_performance 
	alter column minutes_played type varchar(15);

truncate table player_game_performance;

DROP TABLE IF EXISTS player_statistics;


-- Eliminar la tabla redundante si ya no es necesaria
DROP TABLE IF EXISTS player_statistics;


ALTER TABLE game_results
ADD COLUMN IF NOT EXISTS home_team_id INT REFERENCES teams(team_id),
ADD COLUMN IF NOT EXISTS away_team_id INT REFERENCES teams(team_id),
ADD COLUMN IF NOT EXISTS home_score INT,
ADD COLUMN IF NOT EXISTS away_score INT;


INSERT INTO game_results (
    game_id,
    home_team_id,
    away_team_id,
    home_score,
    away_score,
    home_team_score,
    away_team_score,
    winner_team_id
)
SELECT 
    g.game_id,
    g.home_team_id,
    g.away_team_id,
    g.home_points,
    g.away_points,
    g.home_points,
    g.away_points,
    CASE 
        WHEN g.home_points > g.away_points THEN g.home_team_id 
        ELSE g.away_team_id 
    END AS winner_team_id
FROM 
    games g
WHERE 
    g.home_points IS NOT NULL AND g.away_points IS NOT NULL;


-- Para game_results
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'game_results';

-- Para games
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'games';

select * from games;

select * from game_results;



CREATE TABLE IF NOT EXISTS player_team_history (
    history_id SERIAL PRIMARY KEY,
    player_id INT REFERENCES players(player_id),
    team_id INT REFERENCES teams(team_id),
    season_id INT REFERENCES seasons(season_id),
    start_date DATE,
    end_date DATE,
    UNIQUE (player_id, team_id, season_id)
);

-- Migrar datos iniciales desde players
INSERT INTO player_team_history (player_id, team_id, start_date)
SELECT player_id, team_id, CURRENT_DATE FROM players WHERE team_id IS NOT NULL;


-- Crear tabla para estadísticas de equipo por partido si no existe
CREATE TABLE IF NOT EXISTS team_game_stats (
    stat_id SERIAL PRIMARY KEY,
    game_id INT REFERENCES games(game_id),
    team_id INT REFERENCES teams(team_id),
    pts INT NOT NULL,
    fg_made INT NOT NULL,
    fg_attempted INT NOT NULL,
    three_p_made INT NOT NULL,
    three_p_attempted INT NOT NULL,
    ft_made INT NOT NULL,
    ft_attempted INT NOT NULL,
    rebounds_total INT NOT NULL,
    rebounds_offensive INT NOT NULL,
    rebounds_defensive INT NOT NULL,
    assists INT NOT NULL,
    steals INT NOT NULL,
    blocks INT NOT NULL,
    turnovers INT NOT NULL,
    fouls INT NOT NULL,
    UNIQUE (game_id, team_id)
);

-- Puedes poblar esta tabla con un procedimiento que agregue las estadísticas de los jugadores
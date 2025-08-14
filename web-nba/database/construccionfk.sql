SELECT DISTINCT player_id FROM player_statistics
WHERE player_id NOT IN (SELECT player_id FROM players);

SELECT DISTINCT team_id FROM player_statistics
WHERE team_id NOT IN (SELECT team_id FROM teams);

SELECT DISTINCT game_id FROM player_statistics 
WHERE game_id NOT IN (SELECT game_id FROM games);

SELECT * 
FROM player_statistics
WHERE game_id = 2022300116;



DELETE FROM player_statistics WHERE player_id NOT IN (SELECT player_id FROM players);

DELETE FROM player_statistics WHERE team_id NOT IN (SELECT team_id FROM teams);

DELETE FROM player_statistics WHERE game_id NOT IN (SELECT game_id FROM games);


ALTER TABLE player_statistics 
ADD CONSTRAINT fk_player 
FOREIGN KEY (player_id) REFERENCES players(player_id);

ALTER TABLE player_statistics 
ADD CONSTRAINT fk_team 
FOREIGN KEY (team_id) REFERENCES teams(team_id);

ALTER TABLE player_statistics 
ADD CONSTRAINT fk_game 
FOREIGN KEY (game_id) REFERENCES games(game_id);

alter table player_stats 
	drop table player_stats;



drop table player_stats;

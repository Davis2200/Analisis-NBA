select * from player_statistics;

select * from games;

select * from players;

select * from teams;

select * from seasons;




--eliminacion de brithdate
alter table players
	drop column birth_date;

alter table players
	add column team char(10);


--Consulta de restricciones en las tablas 

SELECT 
    table_name, 
    column_name, 
    data_type, 
    character_maximum_length
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'  -- o tu esquema
    AND data_type LIKE '%character%';

--modificacion de tamaños y tipos 

alter table players alter column "position" type varchar(30);

alter table player_statistics alter column start_position type varchar(30);
alter table player_statistics alter column min type varchar(30);
alter table player_statistics alter column season type varchar(30);



-- Consulta para encontrar las constraints de clave foránea en tu tabla
SELECT conname AS constraint_name,
       conrelid::regclass AS table_name,
       pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE contype = 'f'
AND conrelid = 'player_statistics'::regclass;

-- Eliminar una clave foránea específica
ALTER TABLE player_statistics 
DROP CONSTRAINT player_statistics_team_id_fkey;
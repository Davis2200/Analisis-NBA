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


--obtencion del esquema de la base de datos 

SELECT
    t.table_schema,
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    tc.constraint_type,
    kcu2.table_name AS references_table,
    kcu2.column_name AS references_column
FROM 
    information_schema.tables t
    LEFT JOIN information_schema.columns c 
        ON t.table_name = c.table_name AND t.table_schema = c.table_schema
    LEFT JOIN information_schema.key_column_usage kcu 
        ON c.table_name = kcu.table_name 
        AND c.column_name = kcu.column_name
        AND c.table_schema = kcu.table_schema
    LEFT JOIN information_schema.table_constraints tc 
        ON kcu.constraint_name = tc.constraint_name
        AND kcu.table_schema = tc.table_schema
    LEFT JOIN information_schema.key_column_usage kcu2 
        ON tc.constraint_name = kcu2.constraint_name
        AND kcu2.ordinal_position != kcu.ordinal_position
WHERE 
    t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY 
    t.table_name, 
    c.ordinal_position;
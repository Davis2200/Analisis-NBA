CREATE OR REPLACE FUNCTION get_upcoming_weekly_games()
RETURNS TABLE (
    game_id integer,
    game_date date,
    game_time time,
    home_team varchar,
    away_team varchar,
    stadium varchar
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.game_id,
        g.scheduled_date::date,
        g.scheduled_date::time,
        ht.name,
        at.name,
        s.arena_name
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    JOIN stadiums s ON ht.team_id = s.team_id
    WHERE g.scheduled_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '7 days')
    AND g.status = 'scheduled'
    ORDER BY g.scheduled_date;
END;
$$ LANGUAGE plpgsql;


select * from get_upcoming_weekly_games();

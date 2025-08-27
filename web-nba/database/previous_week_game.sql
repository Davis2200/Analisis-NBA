CREATE OR REPLACE FUNCTION get_previous_weekly_games()
RETURNS TABLE (
    game_id integer,
    game_date date,
    home_team varchar,
    away_team varchar,
    home_score integer,
    away_score integer,
    winner varchar
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.game_id,
        g.scheduled_date::date,
        ht.name,
        at.name,
        gr.home_score,
        gr.away_score,
        CASE WHEN gr.home_score > gr.away_score THEN ht.name ELSE at.name END AS winner
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    JOIN game_results gr ON g.game_id = gr.game_id
    WHERE g.scheduled_date BETWEEN DATE_TRUNC('week', CURRENT_DATE) AND CURRENT_DATE
    ORDER BY g.scheduled_date DESC;
END;
$$ LANGUAGE plpgsql;



SELECT * FROM get_previous_weekly_games();


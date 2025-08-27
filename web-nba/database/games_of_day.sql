CREATE OR REPLACE FUNCTION get_daily_games_with_stats_func(
    IN p_game_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    game_id integer,
    game_time timestamp,
    home_team varchar,
    away_team varchar,
    stadium varchar,
    stadium_location varchar,
    home_score integer,
    away_score integer,
    home_pts integer,
    home_fg text,
    home_fg_pct numeric,
    home_3p text,
    home_3p_pct numeric,
    away_pts integer,
    away_fg text,
    away_fg_pct numeric,
    away_3p text,
    away_3p_pct numeric,
    capacity integer,
    opened_year integer
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.game_id,
        g.scheduled_date,
        ht.name,
        at.name,
        s.arena_name,
        s.location,
        gr.home_score,
        gr.away_score,
        tgs_home.pts,
        tgs_home.fg_made || '/' || tgs_home.fg_attempted,
        ROUND(tgs_home.fg_made::DECIMAL / NULLIF(tgs_home.fg_attempted, 0) * 100, 1),
        tgs_home.three_p_made || '/' || tgs_home.three_p_attempted,
        ROUND(tgs_home.three_p_made::DECIMAL / NULLIF(tgs_home.three_p_attempted, 0) * 100, 1),
        tgs_away.pts,
        tgs_away.fg_made || '/' || tgs_away.fg_attempted,
        ROUND(tgs_away.fg_made::DECIMAL / NULLIF(tgs_away.fg_attempted, 0) * 100, 1),
        tgs_away.three_p_made || '/' || tgs_away.three_p_attempted,
        ROUND(tgs_away.three_p_made::DECIMAL / NULLIF(tgs_away.three_p_attempted, 0) * 100, 1),
        s.capacity,
        s.opened_year
    FROM 
        games g
    JOIN 
        teams ht ON g.home_team_id = ht.team_id
    JOIN 
        teams at ON g.away_team_id = at.team_id
    JOIN 
        stadiums s ON ht.team_id = s.team_id
    LEFT JOIN 
        game_results gr ON g.game_id = gr.game_id
    LEFT JOIN 
        team_game_stats tgs_home ON g.game_id = tgs_home.game_id AND g.home_team_id = tgs_home.team_id
    LEFT JOIN 
        team_game_stats tgs_away ON g.game_id = tgs_away.game_id AND g.away_team_id = tgs_away.team_id
    WHERE 
        g.scheduled_date::date = p_game_date
    ORDER BY 
        g.scheduled_date;
END;
$$;


SELECT * FROM get_daily_games_with_stats_func();

SELECT * FROM get_daily_games_with_stats_func('2025-10-02');
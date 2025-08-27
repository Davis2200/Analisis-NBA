CREATE OR REPLACE PROCEDURE get_daily_games_with_stats(
    IN p_game_date DATE DEFAULT CURRENT_DATE,
    OUT result_cursor REFCURSOR
)
LANGUAGE plpgsql
AS $$
BEGIN
    OPEN result_cursor FOR
    SELECT 
        g.game_id,
        g.scheduled_date AS game_time,
        ht.name AS home_team,
        at.name AS away_team,
        s.name AS stadium,
        gr.home_score,
        gr.away_score,
        tgs_home.pts AS home_pts,
        tgs_home.fg_made || '/' || tgs_home.fg_attempted AS home_fg,
        ROUND(tgs_home.fg_made::DECIMAL / NULLIF(tgs_home.fg_attempted, 0) * 100, 1) AS home_fg_pct,
        tgs_home.three_p_made || '/' || tgs_home.three_p_attempted AS home_3p,
        ROUND(tgs_home.three_p_made::DECIMAL / NULLIF(tgs_home.three_p_attempted, 0) * 100, 1) AS home_3p_pct,
        tgs_away.pts AS away_pts,
        tgs_away.fg_made || '/' || tgs_away.fg_attempted AS away_fg,
        ROUND(tgs_away.fg_made::DECIMAL / NULLIF(tgs_away.fg_attempted, 0) * 100, 1) AS away_fg_pct,
        tgs_away.three_p_made || '/' || tgs_away.three_p_attempted AS away_3p,
        ROUND(tgs_away.three_p_made::DECIMAL / NULLIF(tgs_away.three_p_attempted, 0) * 100, 1) AS away_3p_pct
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
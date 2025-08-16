const express = require('express');
const router = express.Router();
const pool = require('../database');

// Todos los equipos con información básica
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                t.team_id,
                t.team_name,
                t.abbreviation,
                t.conference,
                t.division,
                s.stadium_name,
                s.city
            FROM teams t
            LEFT JOIN stadiums s ON t.team_id = s.team_id
            ORDER BY t.team_name`;
        
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Detalle completo de un equipo
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const teamQuery = `
            SELECT 
                t.*, 
                s.stadium_name,
                s.capacity,
                s.city,
                s.year_founded
            FROM teams t
            LEFT JOIN stadiums s ON t.team_id = s.team_id
            WHERE t.team_id = $1`;
        
        const { rows: [team] } = await pool.query(teamQuery, [id]);
        
        if (!team) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        res.json(team);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Clasificación de equipos por conferencia
router.get('/clasificacion/:conference', async (req, res) => {
    try {
        const { conference } = req.params;
        const validConferences = ['East', 'West'];
        
        if (!validConferences.includes(conference)) {
            return res.status(400).json({ error: 'Conferencia no válida. Use East o West' });
        }

        const query = `
            SELECT 
                ts.team_id,
                t.team_name,
                t.conference,
                t.division,
                ts.wins,
                ts.losses,
                ROUND(ts.wins::numeric / (ts.wins + ts.losses), 3) AS win_percentage,
                ts.home_record,
                ts.away_record,
                ts.last_10
            FROM team_standings ts
            JOIN teams t ON ts.team_id = t.team_id
            WHERE t.conference = $1
            ORDER BY win_percentage DESC, wins DESC`;
        
        const { rows } = await pool.query(query, [conference]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Estadísticas de rendimiento de un equipo
router.get('/:id/estadisticas', async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Obtener estadísticas básicas
        const statsQuery = `
            SELECT 
                ts.*,
                ROUND(ts.wins::numeric / (ts.wins + ts.losses), 3) AS win_percentage
            FROM team_standings ts
            WHERE ts.team_id = $1`;
        
        // 2. Obtener últimos 5 partidos
        const lastGamesQuery = `
            SELECT 
                gs.game_id,
                gs.scheduled_date,
                CASE 
                    WHEN gs.home_team_id = $1 THEN 'home' 
                    ELSE 'away' 
                END AS game_type,
                CASE 
                    WHEN gs.home_team_id = $1 THEN vt.team_name
                    ELSE ht.team_name 
                END AS opponent,
                gr.home_score,
                gr.visitor_score,
                CASE
                    WHEN (gs.home_team_id = $1 AND gr.home_score > gr.visitor_score) OR
                         (gs.visitor_team_id = $1 AND gr.visitor_score > gr.home_score) THEN 'W'
                    ELSE 'L'
                END AS result
            FROM game_schedule gs
            JOIN teams ht ON gs.home_team_id = ht.team_id
            JOIN teams vt ON gs.visitor_team_id = vt.team_id
            LEFT JOIN game_results gr ON gs.game_id = gr.game_id
            WHERE (gs.home_team_id = $1 OR gs.visitor_team_id = $1)
              AND gs.status = 'completed'
            ORDER BY gs.scheduled_date DESC
            LIMIT 5`;
        
        const [{ rows: [stats] }, { rows: lastGames }] = await Promise.all([
            pool.query(statsQuery, [id]),
            pool.query(lastGamesQuery, [id])
        ]);

        if (!stats) {
            return res.status(404).json({ error: 'Estadísticas no encontradas' });
        }

        res.json({
            ...stats,
            last_games: lastGames
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Jugadores de un equipo
router.get('/:id/jugadores', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                p.player_id,
                p.player_name,
                p.position,
                p.jersey_number,
                p.height,
                p.weight,
                p.age
            FROM players p
            WHERE p.team_id = $1
            ORDER BY p.player_name`;
        
        const { rows } = await pool.query(query, [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Próximos partidos de un equipo
router.get('/:id/proximos-partidos', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                gs.game_id,
                gs.scheduled_date,
                CASE 
                    WHEN gs.home_team_id = $1 THEN 'vs' 
                    ELSE '@' 
                END AS game_type,
                CASE 
                    WHEN gs.home_team_id = $1 THEN vt.team_name
                    ELSE ht.team_name 
                END AS opponent,
                s.stadium_name,
                s.city
            FROM game_schedule gs
            JOIN teams ht ON gs.home_team_id = ht.team_id
            JOIN teams vt ON gs.visitor_team_id = vt.team_id
            LEFT JOIN stadiums s ON 
                CASE 
                    WHEN gs.home_team_id = $1 THEN gs.home_team_id 
                    ELSE gs.visitor_team_id 
                END = s.team_id
            WHERE (gs.home_team_id = $1 OR gs.visitor_team_id = $1)
              AND gs.scheduled_date > NOW()
              AND gs.status = 'scheduled'
            ORDER BY gs.scheduled_date
            LIMIT 5`;
        
        const { rows } = await pool.query(query, [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
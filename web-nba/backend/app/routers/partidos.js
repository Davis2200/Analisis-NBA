const express = require('express');
const router = express.Router();
const pool = require('../database'); // Asegúrate de tener tu conexión a PostgreSQL configurada

// 1. Partidos para hoy
router.get('/hoy', async (req, res) => {
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const query = `
            SELECT 
                gs.game_id,
                gs.scheduled_date,
                ht.team_name AS home_team,
                vt.team_name AS visitor_team,
                s.stadium_name,
                gs.status
            FROM game_schedule gs
            JOIN teams ht ON gs.home_team_id = ht.team_id
            JOIN teams vt ON gs.visitor_team_id = vt.team_id
            LEFT JOIN stadiums s ON ht.team_id = s.team_id
            WHERE DATE(gs.scheduled_date) = $1
            ORDER BY gs.scheduled_date`;
        
        const { rows } = await pool.query(query, [hoy]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener partidos de hoy' });
    }
});

// 2. Partidos anteriores (pasados)
router.get('/anteriores', async (req, res) => {
    try {
        const query = `
            SELECT 
                gs.game_id,
                gs.scheduled_date,
                ht.team_name AS home_team,
                vt.team_name AS visitor_team,
                gr.home_score,
                gr.visitor_score,
                gr.winner_team_id
            FROM game_schedule gs
            JOIN teams ht ON gs.home_team_id = ht.team_id
            JOIN teams vt ON gs.visitor_team_id = vt.team_id
            LEFT JOIN game_results gr ON gs.game_id = gr.game_id
            WHERE gs.scheduled_date < NOW() AND gs.status = 'completed'
            ORDER BY gs.scheduled_date DESC
            LIMIT 20`;
        
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener partidos anteriores' });
    }
});

// 3. Partidos futuros
router.get('/futuros', async (req, res) => {
    try {
        const query = `
            SELECT 
                gs.game_id,
                gs.scheduled_date,
                ht.team_name AS home_team,
                vt.team_name AS visitor_team,
                s.stadium_name,
                gs.status
            FROM game_schedule gs
            JOIN teams ht ON gs.home_team_id = ht.team_id
            JOIN teams vt ON gs.visitor_team_id = vt.team_id
            LEFT JOIN stadiums s ON ht.team_id = s.team_id
            WHERE gs.scheduled_date > NOW()
            ORDER BY gs.scheduled_date
            LIMIT 20`;
        
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener partidos futuros' });
    }
});

// 4. Detalle de partido específico
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                gs.*,
                ht.team_name AS home_team_name,
                vt.team_name AS visitor_team_name,
                s.stadium_name,
                gr.home_score,
                gr.visitor_score
            FROM game_schedule gs
            JOIN teams ht ON gs.home_team_id = ht.team_id
            JOIN teams vt ON gs.visitor_team_id = vt.team_id
            LEFT JOIN stadiums s ON ht.team_id = s.team_id
            LEFT JOIN game_results gr ON gs.game_id = gr.game_id
            WHERE gs.game_id = $1`;
        
        const { rows } = await pool.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Partido no encontrado' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener detalle del partido' });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const pool = require('../database');

// Estadísticas detalladas de un jugador en un partido específico
router.get('/jugador/:player_id/partido/:game_id', async (req, res) => {
    try {
        const { player_id, game_id } = req.params;
        const query = `
            SELECT 
                p.*,
                t.team_name,
                gs.scheduled_date,
                ht.team_name AS home_team,
                vt.team_name AS visitor_team
            FROM player_game_performance p
            JOIN game_schedule gs ON p.game_id = gs.game_id
            JOIN teams t ON p.team_id = t.team_id
            JOIN teams ht ON gs.home_team_id = ht.team_id
            JOIN teams vt ON gs.visitor_team_id = vt.team_id
            WHERE p.player_id = $1 AND p.game_id = $2`;
        
        const { rows } = await pool.query(query, [player_id, game_id]);
        res.json(rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Medidas de tendencia central para un jugador (temporada completa)
router.get('/jugador/:player_id/tendencia-central', async (req, res) => {
    try {
        const { player_id } = req.params;
        
        // Consulta para calcular medidas estadísticas
        const query = `
            SELECT
                -- Medidas básicas
                COUNT(*) AS partidos_jugados,
                ROUND(AVG(puntos), 2) AS media_puntos,
                ROUND(AVG(rebotes), 2) AS media_rebotes,
                ROUND(AVG(asistencias), 2) AS media_asistencias,
                ROUND(AVG(robos), 2) AS media_robos,
                ROUND(AVG(tapones), 2) AS media_tapones,
                ROUND(AVG(minutos_jugados), 2) AS media_minutos,
                ROUND(AVG(fg_percentage), 4) AS media_fg_percentage,
                ROUND(AVG(tres_percentage), 4) AS media_tres_percentage,
                ROUND(AVG(ft_percentage), 4) AS media_ft_percentage,
                
                -- Medianas (percentil 50)
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY puntos) AS mediana_puntos,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY rebotes) AS mediana_rebotes,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY asistencias) AS mediana_asistencias,
                
                -- Máximos
                MAX(puntos) AS max_puntos,
                MAX(rebotes) AS max_rebotes,
                MAX(asistencias) AS max_asistencias,
                
                -- Mínimos
                MIN(puntos) AS min_puntos,
                MIN(rebotes) AS min_rebotes,
                MIN(asistencias) AS min_asistencias,
                
                -- Desviación estándar
                ROUND(STDDEV(puntos), 2) AS desviacion_puntos,
                ROUND(STDDEV(rebotes), 2) AS desviacion_rebotes,
                ROUND(STDDEV(asistencias), 2) AS desviacion_asistencias
            FROM player_game_performance
            WHERE player_id = $1`;
        
        // Consulta para obtener la moda (valor más frecuente) de puntos
        const modaQuery = `
            SELECT puntos AS moda_puntos
            FROM (
                SELECT puntos, COUNT(*) AS frecuencia
                FROM player_game_performance
                WHERE player_id = $1
                GROUP BY puntos
                ORDER BY frecuencia DESC
                LIMIT 1
            ) subq`;
        
        const [{ rows: [stats] }, { rows: [moda] }] = await Promise.all([
            pool.query(query, [player_id]),
            pool.query(modaQuery, [player_id])
        ]);

        if (!stats.partidos_jugados) {
            return res.status(404).json({ error: 'Jugador no encontrado o sin datos' });
        }

        res.json({
            ...stats,
            ...moda,
            eficiencia: calcularEficiencia(stats)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Función para calcular métricas de eficiencia
function calcularEficiencia(stats) {
    return {
        eficiencia_jugador: stats.media_puntos + stats.media_rebotes + stats.media_asistencias,
        valoracion: (stats.media_puntos * 1) + 
                   (stats.media_rebotes * 0.7) + 
                   (stats.media_asistencias * 0.9),
        true_shooting: stats.media_puntos / 
                      (2 * (stats.media_fg_attempted + 0.44 * stats.media_ft_attempted))
    };
}

// Evolución de estadísticas por segmentos de la temporada
router.get('/jugador/:player_id/evolucion', async (req, res) => {
    try {
        const { player_id } = req.params;
        
        const query = `
            SELECT
                DATE_TRUNC('month', gs.scheduled_date) AS mes,
                COUNT(*) AS partidos,
                ROUND(AVG(puntos), 2) AS avg_puntos,
                ROUND(AVG(rebotes), 2) AS avg_rebotes,
                ROUND(AVG(asistencias), 2) AS avg_asistencias,
                ROUND(AVG(fg_percentage), 3) AS avg_fg_percentage
            FROM player_game_performance p
            JOIN game_schedule gs ON p.game_id = gs.game_id
            WHERE p.player_id = $1
            GROUP BY mes
            ORDER BY mes`;
        
        const { rows } = await pool.query(query, [player_id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Comparativa entre jugadores
router.get('/comparativa', async (req, res) => {
    try {
        const { player1, player2 } = req.query;
        
        if (!player1 || !player2) {
            return res.status(400).json({ error: 'Debes proporcionar dos player_id' });
        }

        const query = `
            SELECT
                p.player_id,
                pl.player_name,
                COUNT(*) AS partidos,
                ROUND(AVG(puntos), 2) AS media_puntos,
                ROUND(AVG(rebotes), 2) AS media_rebotes,
                ROUND(AVG(asistencias), 2) AS media_asistencias,
                ROUND(AVG(fg_percentage), 3) AS fg_percentage
            FROM player_game_performance p
            JOIN players pl ON p.player_id = pl.player_id
            WHERE p.player_id IN ($1, $2)
            GROUP BY p.player_id, pl.player_name`;
        
        const { rows } = await pool.query(query, [player1, player2]);
        
        if (rows.length !== 2) {
            return res.status(404).json({ error: 'Uno o ambos jugadores no encontrados' });
        }

        res.json({
            jugador1: rows.find(r => r.player_id == player1),
            jugador2: rows.find(r => r.player_id == player2)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
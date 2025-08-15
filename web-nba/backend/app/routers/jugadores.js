const express = require('express');
const router = express.Router();
const { Player, Game, Team, PlayerStatistic, Season } = require('../models');

// 1️⃣ Lista todos los jugadores
router.get('/', async (req, res) => {
  try {
    const jugadores = await Player.findAll({
      include: { model: Team, attributes: ['name', 'city'] }
    });
    res.json(jugadores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2️⃣ Estadísticas de un jugador por ID
router.get('/:id/estadisticas', async (req, res) => {
  try {
    const stats = await PlayerStatistic.findAll({
      where: { player_id: req.params.id },
      include: [
        { model: Game, attributes: ['date_from', 'home_points', 'away_points'] },
        { model: Team, attributes: ['name'] }
      ]
    });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3️⃣ Próximos enfrentamientos de un equipo
router.get('/equipo/:id/proximos', async (req, res) => {
  try {
    const hoy = new Date();
    const juegos = await Game.findAll({
      where: { 
        date_from: { [require('sequelize').Op.gte]: hoy },
        [require('sequelize').Op.or]: [
          { home_team_id: req.params.id },
          { away_team_id: req.params.id }
        ]
      },
      include: [
        { model: Team, as: 'HomeTeam', attributes: ['name', 'city'] },
        { model: Team, as: 'AwayTeam', attributes: ['name', 'city'] }
      ],
      order: [['date_from', 'ASC']]
    });
    res.json(juegos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4️⃣ Boxscore de un partido
router.get('/partido/:id/boxscore', async (req, res) => {
  try {
    const boxscore = await PlayerStatistic.findAll({
      where: { game_id: req.params.id },
      include: [
        { model: Player, attributes: ['name', 'position'] },
        { model: Team, attributes: ['name'] }
      ]
    });
    res.json(boxscore);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

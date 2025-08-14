const express = require('express');
const router = express.Router();
const { playerCrud } = require('../crud');

// Obtener jugador por ID
router.get('/:id', async (req, res) => {
  try {
    const player = await playerCrud.getById(req.params.id);
    if (!player) return res.status(404).send('Jugador no encontrado');
    res.json(player);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Crear nuevo jugador
router.post('/', async (req, res) => {
  try {
    const newPlayer = await playerCrud.create(req.body);
    res.status(201).json(newPlayer);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
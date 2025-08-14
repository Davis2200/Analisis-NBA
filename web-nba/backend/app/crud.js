const { Season, Team, Player, Game, PlayerStatistic } = require('./models');

// Ejemplo de creación
async function createExample() {
  const season = await Season.create({
    start_year: 2023,
    end_year: 2024,
    type: 'Regular'
  });

  const team1 = await Team.create({
    name: 'Lakers',
    city: 'Los Angeles',
    conference: 'West',
    division: 'Pacific'
  });

  const team2 = await Team.create({
    name: 'Celtics',
    city: 'Boston',
    conference: 'East',
    division: 'Atlantic'
  });

  const player = await Player.create({
    name: 'LeBron James',
    position: 'SF',
    height: '6-9',
    weight: 250,
    team_id: team1.team_id,
    team: 'LAL'
  });

  const game = await Game.create({
    season_id: season.season_id,
    date_from: new Date(),
    home_team_id: team1.team_id,
    away_team_id: team2.team_id,
    home_points: 110,
    away_points: 105
  });

  const stat = await PlayerStatistic.create({
    game_id: game.game_id,
    team_id: team1.team_id,
    player_id: player.player_id,
    pts: 30,
    reb: 10,
    ast: 8
  });
}

// Ejemplo de consulta
async function getGameWithDetails(gameId) {
  return await Game.findByPk(gameId, {
    include: [
      { model: Season },
      { model: Team, as: 'HomeTeam' },
      { model: Team, as: 'AwayTeam' },
      {
        model: PlayerStatistic,
        include: [Player, Team]
      }
    ]
  });
}
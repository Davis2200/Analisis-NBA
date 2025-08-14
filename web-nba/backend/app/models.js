const sequelize = require('./database');
const { DataTypes } = require('sequelize');

// Modelo Season
const Season = sequelize.define('Season', {
  season_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  start_year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  end_year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(20)
  }
}, {
  tableName: 'seasons',
  timestamps: false
});

// Modelo Team
const Team = sequelize.define('Team', {
  team_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(100)
  },
  conference: {
    type: DataTypes.STRING(20)
  },
  division: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'teams',
  timestamps: false
});

// Modelo Player
const Player = sequelize.define('Player', {
  player_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  position: {
    type: DataTypes.STRING(30)
  },
  height: {
    type: DataTypes.STRING(10)
  },
  weight: {
    type: DataTypes.INTEGER
  },
  team: {
    type: DataTypes.CHAR(10)
  }
}, {
  tableName: 'players',
  timestamps: false
});

// Modelo Game
const Game = sequelize.define('Game', {
  game_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date_from: {
    type: DataTypes.DATE
  },
  home_points: {
    type: DataTypes.INTEGER
  },
  away_points: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'games',
  timestamps: false
});

// Modelo PlayerStatistic
const PlayerStatistic = sequelize.define('PlayerStatistic', {
  statistic_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  team_abbreviation: {
    type: DataTypes.STRING(10)
  },
  player_name: {
    type: DataTypes.STRING(100)
  },
  start_position: {
    type: DataTypes.STRING(30)
  },
  min: {
    type: DataTypes.STRING(30)
  },
  fgm: {
    type: DataTypes.INTEGER
  },
  fga: {
    type: DataTypes.INTEGER
  },
  fg_pct: {
    type: DataTypes.FLOAT
  },
  fg3m: {
    type: DataTypes.INTEGER
  },
  fg3a: {
    type: DataTypes.INTEGER
  },
  fg3_pct: {
    type: DataTypes.FLOAT
  },
  ftm: {
    type: DataTypes.INTEGER
  },
  fta: {
    type: DataTypes.INTEGER
  },
  ft_pct: {
    type: DataTypes.FLOAT
  },
  oreb: {
    type: DataTypes.INTEGER
  },
  dreb: {
    type: DataTypes.INTEGER
  },
  reb: {
    type: DataTypes.INTEGER
  },
  ast: {
    type: DataTypes.INTEGER
  },
  stl: {
    type: DataTypes.INTEGER
  },
  blk: {
    type: DataTypes.INTEGER
  },
  to: {
    type: DataTypes.INTEGER
  },
  pf: {
    type: DataTypes.INTEGER
  },
  pts: {
    type: DataTypes.INTEGER
  },
  plus_minus: {
    type: DataTypes.INTEGER
  },
  season: {
    type: DataTypes.STRING(30)
  }
}, {
  tableName: 'player_statistics',
  timestamps: false
});

// Relaciones entre modelos

// Season -> Game (1:N)
Season.hasMany(Game, {
  foreignKey: 'season_id'
});
Game.belongsTo(Season, {
  foreignKey: 'season_id'
});

// Team -> Game (como home_team) (1:N)
Team.hasMany(Game, {
  foreignKey: 'home_team_id',
  as: 'HomeGames'
});
Game.belongsTo(Team, {
  foreignKey: 'home_team_id',
  as: 'HomeTeam'
});

// Team -> Game (como away_team) (1:N)
Team.hasMany(Game, {
  foreignKey: 'away_team_id',
  as: 'AwayGames'
});
Game.belongsTo(Team, {
  foreignKey: 'away_team_id',
  as: 'AwayTeam'
});

// Team -> Player (1:N)
Team.hasMany(Player, {
  foreignKey: 'team_id'
});
Player.belongsTo(Team, {
  foreignKey: 'team_id'
});

// Player -> PlayerStatistic (1:N)
Player.hasMany(PlayerStatistic, {
  foreignKey: 'player_id'
});
PlayerStatistic.belongsTo(Player, {
  foreignKey: 'player_id'
});

// Game -> PlayerStatistic (1:N)
Game.hasMany(PlayerStatistic, {
  foreignKey: 'game_id'
});
PlayerStatistic.belongsTo(Game, {
  foreignKey: 'game_id'
});

// Team -> PlayerStatistic (1:N)
Team.hasMany(PlayerStatistic, {
  foreignKey: 'team_id'
});
PlayerStatistic.belongsTo(Team, {
  foreignKey: 'team_id'
});

module.exports = {
  Season,
  Team,
  Player,
  Game,
  PlayerStatistic,
  sequelize
};
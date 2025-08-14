const { sequelize } = require('./app/database');

async function test() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a PostgreSQL!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

test();
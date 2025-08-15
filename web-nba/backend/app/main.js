const express = require('express');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const jugadoresRouter = require('./routers/jugadores');

dotenv.config();
const app = express();
app.use(express.json());

app.use('/jugadores', jugadoresRouter);

sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión DB exitosa');
    app.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Servidor en http://localhost:${process.env.PORT || 3000}`);
    });
  })
  .catch(err => console.error('❌ Error DB:', err));

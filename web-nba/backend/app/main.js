const express = require('express');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const jugadoresRouter = require('./routers/jugadores');
const partidosRouter = require('./routers/partidos');
const equiposRouter = require('./routers/equipos');
const estadisticasRouter = require('./routers/estadisticas');
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:54360'
}));
  

dotenv.config();
const app = express();
app.use(express.json());

// Registra TODOS los routers (esto es lo que faltaba)
app.use('/api/jugadores', jugadoresRouter);  // ✅
app.use('/api/partidos', partidosRouter);    // ✅
app.use('/api/equipos', equiposRouter);      // ✅
app.use('/api/estadisticas', estadisticasRouter); // ✅

sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión DB exitosa');
    app.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Servidor en http://localhost:${process.env.PORT || 3000}`);
      console.log('📌 Endpoints disponibles:');
      console.log('- http://localhost:3000/api/jugadores');
      console.log('- http://localhost:3000/api/partidos');
      console.log('- http://localhost:3000/api/equipos');
      console.log('- http://localhost:3000/api/estadisticas');
    });
  })
  .catch(err => console.error('❌ Error DB:', err));
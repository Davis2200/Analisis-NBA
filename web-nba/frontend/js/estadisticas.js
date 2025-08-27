import { fetchData, mostrarCarga, mostrarError } from './app.js';

export async function cargarEstadisticasJugador(playerId) {
  const contenedor = document.getElementById('estadisticas-container');
  mostrarCarga(contenedor);

  try {
    const stats = await fetchData(`estadisticas/jugador/${playerId}/tendencia-central`);
    renderEstadisticas(contenedor, stats);
  } catch (error) {
    mostrarError(contenedor, error);
  }
}

function renderEstadisticas(contenedor, stats) {
  contenedor.innerHTML = `
    <div class="stats-card">
      <h3>Estadísticas</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Puntos promedio:</span>
          <span class="stat-value">${stats.media_puntos}</span>
        </div>
        <!-- Agrega más estadísticas según necesites -->
      </div>
    </div>
  `;
}
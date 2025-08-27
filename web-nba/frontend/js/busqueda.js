import { fetchData } from './app.js';

export function initSearch() {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const resultsContainer = document.getElementById('search-results');

  // Búsqueda al hacer clic o presionar Enter
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  // Búsqueda en tiempo real (opcional)
  searchInput.addEventListener('input', (e) => {
    if (e.target.value.length > 2) {
      performSearch();
    } else {
      resultsContainer.innerHTML = '';
    }
  });

  async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    try {
      const players = await fetchData(`estadisticas/buscar/jugador/${encodeURIComponent(query)}`);
      displayResults(players);
    } catch (error) {
      resultsContainer.innerHTML = `
        <div class="search-error">Error en la búsqueda: ${error.message}</div>
      `;
    }
  }

  function displayResults(players) {
    if (players.length === 0) {
      resultsContainer.innerHTML = '<div class="no-results">No se encontraron jugadores</div>';
      return;
    }

    resultsContainer.innerHTML = players.map(player => `
      <div class="search-result-item" data-id="${player.player_id}">
        <span class="player-name">${player.player_name}</span>
        <span class="team-name">${player.team_name}</span>
      </div>
    `).join('');

    // Agrega evento clic a los resultados
    document.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        window.location.href = `#/jugador/${item.dataset.id}`;
        loadPlayerDetails(item.dataset.id);
      });
    });
  }
}

// Función para cargar detalles del jugador
async function loadPlayerDetails(playerId) {
  const mainContent = document.getElementById('contenido-principal');
  mainContent.innerHTML = '<div class="loading">Cargando jugador...</div>';

  try {
    const stats = await fetchData(`estadisticas/jugador/${playerId}/tendencia-central`);
    renderPlayerDetails(stats);
  } catch (error) {
    mainContent.innerHTML = `<div class="error">Error al cargar datos: ${error.message}</div>`;
  }
}

function renderPlayerDetails(playerData) {
  // Implementa esta función según cómo quieras mostrar los datos
}
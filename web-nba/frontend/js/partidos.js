import { fetchData, mostrarCarga, mostrarError } from './app.js';

// 1. Define la URL base de tu API (¡importante que coincida con tu backend!)
const API_BASE_URL = 'http://localhost:3000/api'; // Asegúrate que el puerto sea correcto

console.log("URL completa:", `${API_BASE_URL}/partidos/hoy`);
const testData = await fetch(`${API_BASE_URL}/partidos/hoy`);
console.log("Respuesta cruda:", await testData.text());

export async function cargarPartidos(tipo) {
  const contenedor = document.getElementById('partidos-hoy');
  mostrarCarga(contenedor);

  try {
    // 2. Mapea los tipos de partidos a los endpoints correctos de tu backend
    const endpoints = {
      hoy: 'partidos/hoy',
      anteriores: 'partidos/anteriores',
      futuros: 'partidos/futuros'
    };

    // 3. Verifica que el tipo sea válido
    if (!endpoints[tipo]) {
      throw new Error(`Tipo de partido no válido: ${tipo}`);
    }

    // 4. Usa la URL completa para la solicitud
    const data = await fetchData(`${API_BASE_URL}/${endpoints[tipo]}`);
    renderPartidos(contenedor, data, tipo);
  } catch (error) {
    mostrarError(contenedor, error);
  }
}

function renderPartidos(contenedor, partidos, tipo) {
  if (!partidos || partidos.length === 0) {
    contenedor.innerHTML = `<p class="text-muted">No hay partidos ${tipo === 'hoy' ? 'hoy' : tipo}</p>`;
    return;
  }

  // 5. Asegúrate que los datos tengan la estructura esperada
  contenedor.innerHTML = partidos.map(partido => {
    // Verifica que existan las propiedades necesarias
    const homeTeam = partido.home_team || 'Equipo desconocido';
    const awayTeam = partido.visitor_team || 'Equipo desconocido';
    const gameDate = partido.scheduled_date ? new Date(partido.scheduled_date).toLocaleString() : 'Fecha no disponible';
    const stadium = partido.stadium_name || 'Estadio no disponible';
    const gameId = partido.game_id || '';

    return `
      <div class="game-card">
        <div class="teams">
          <span class="home-team">${homeTeam}</span>
          <span class="vs">vs</span>
          <span class="away-team">${awayTeam}</span>
        </div>
        <div class="game-details">
          <span class="date">${gameDate}</span>
          <span class="stadium">${stadium}</span>
        </div>
        <button class="btn-details" data-id="${gameId}">Ver detalles</button>
      </div>
    `;
  }).join('');

  // 6. Agrega event listeners a los botones (opcional)
  document.querySelectorAll('.btn-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const gameId = btn.dataset.id;
      // Aquí puedes implementar la navegación a los detalles
      console.log('Ver detalles del partido:', gameId);
      // Ejemplo: window.location.href = `#/partido/${gameId}`;
    });
  });
}
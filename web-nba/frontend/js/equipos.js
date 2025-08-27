import { fetchData, mostrarCarga, mostrarError } from './app.js';

export async function cargarEquipos() {
  const contenedor = document.getElementById('contenido-equipos'); // Necesitarás este contenedor en tu HTML
  mostrarCarga(contenedor);

  try {
    const equipos = await fetchData('equipos');
    renderEquipos(contenedor, equipos);
  } catch (error) {
    mostrarError(contenedor, error);
  }
}

function renderEquipos(contenedor, equipos) {
  contenedor.innerHTML = `
    <div class="team-grid">
      ${equipos.map(equipo => `
        <div class="team-card">
          <h3>${equipo.team_name}</h3>
          <p>${equipo.city} | ${equipo.conference}</p>
          <button class="btn-details" data-id="${equipo.team_id}">Ver jugadores</button>
        </div>
      `).join('')}
    </div>
  `;
}
import { initSearch } from './busqueda.js';
import { cargarPartidosHoy, initPartidosListeners } from './partidos.js';
import { initDarkMode } from './theme.js';

export function initApp() {
  // 1. Sistema de búsqueda
  initSearch();
  
  // 2. Carga contenido inicial
  cargarPartidosHoy();
  
  // 3. Configura interacciones
  initPartidosListeners();
  initDarkMode();
  
  // 4. Router básico
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange(); // Procesar ruta actual al cargar
}

function handleRouteChange() {
  const hash = window.location.hash;
  if (hash.includes('#/jugador/')) {
    const playerId = hash.split('/')[1];
    cargarDetallesJugador(playerId);
  }
}

// Iniciar todo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);
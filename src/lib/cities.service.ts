/**
 * Service to fetch Brazilian cities from IBGE API
 * IBGE (Instituto Brasileiro de Geografia e Estatística) provides free city data
 */

const IBGE_BASE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades';

interface City {
  id: number;
  nome: string;
}

interface State {
  id: number;
  nome: string;
  sigla: string;
}

/**
 * Get list of Brazilian states
 */
export async function getStates(): Promise<State[]> {
  try {
    const response = await fetch(`${IBGE_BASE_URL}/estados?orderBy=nome`);
    if (!response.ok) {
      throw new Error(`Failed to fetch states: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('[CitiesService] Loaded states:', data.length);
    return data;
  } catch (error) {
    console.error('[CitiesService] Error loading states:', error);
    return [];
  }
}

/**
 * Get cities for a specific state
 * @param stateId - IBGE state ID or state abbreviation
 */
export async function getCitiesByState(stateId: string | number): Promise<City[]> {
  try {
    const response = await fetch(`${IBGE_BASE_URL}/estados/${stateId}/municipios?orderBy=nome`);
    if (!response.ok) {
      throw new Error(`Failed to fetch cities: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('[CitiesService] Loaded cities for state:', stateId, 'count:', data.length);
    return data;
  } catch (error) {
    console.error('[CitiesService] Error loading cities:', error);
    return [];
  }
}

/**
 * Search for a city by name (searches all states)
 * @param query - City name to search for
 */
export async function searchCities(query: string): Promise<City[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    // First, get all states
    const states = await getStates();

    // Search in all states
    const allCities: City[] = [];
    for (const state of states) {
      const cities = await getCitiesByState(state.id);
      const filtered = cities.filter(city =>
        city.nome.toLowerCase().includes(query.toLowerCase())
      );
      allCities.push(...filtered);
    }

    // Remove duplicates and sort
    const uniqueCities = Array.from(new Map(allCities.map(city => [city.nome, city])).values());
    uniqueCities.sort((a, b) => a.nome.localeCompare(b.nome));

    console.log('[CitiesService] Search results for "' + query + '":', uniqueCities.length);
    return uniqueCities;
  } catch (error) {
    console.error('[CitiesService] Error searching cities:', error);
    return [];
  }
}

/**
 * Get popular cities in São Paulo state (as a default)
 */
export async function getPopularCities(): Promise<City[]> {
  // São Paulo state ID is 35
  return getCitiesByState(35);
}

import axios from "axios";

const MICRO_API_BASE_URL = process.env.NEXT_PUBLIC_MICRO_API_URL || "";

// Client-side In-memory Cache for high-performance instant lookups
const senseCache = new Map<string, number>();

/**
 * Fetch total weather / FahfonSense stations for a specific municipality from Micro-API
 */
export async function fetchSenseDeviceCount(municipalityId: string): Promise<number> {
  if (!municipalityId) return 0;
  if (senseCache.has(municipalityId)) {
    return senseCache.get(municipalityId) || 0;
  }

  if (!MICRO_API_BASE_URL) {
    return 0;
  }

  try {
    const res = await axios.get(`${MICRO_API_BASE_URL}/weather/aggregated-stations`, {
      params: {
        municipality_id: municipalityId,
      },
      timeout: 8000,
    });

    let count = 0;
    if (typeof res.data?.total === "number") {
      count = res.data.total;
    } else if (Array.isArray(res.data?.data)) {
      count = res.data.data.length;
    } else if (Array.isArray(res.data)) {
      count = res.data.length;
    }

    senseCache.set(municipalityId, count);
    return count;
  } catch {
    senseCache.set(municipalityId, 0);
    return 0;
  }
}

/**
 * Concurrently fetch SENSE device counts for an array of cities in batches
 */
export async function fetchSenseDeviceCountsForCities(
  cities: Array<{ id: string }>
): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  if (!cities || cities.length === 0) return results;

  // Process in concurrent batches of 8 to maintain high responsiveness without exhausting browser sockets
  const BATCH_SIZE = 8;
  for (let i = 0; i < cities.length; i += BATCH_SIZE) {
    const batch = cities.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(async (city) => {
      const count = await fetchSenseDeviceCount(city.id);
      results.set(city.id, count);
    });

    await Promise.allSettled(batchPromises);
  }

  return results;
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import HeroCover from './components/HeroCover';
import Filters from './components/Filters';
import AsteroidList from './components/AsteroidList';
import ChartsPanel from './components/ChartsPanel';
import { Moon, Sun, Telescope } from 'lucide-react';

const DEFAULT_API_KEY = import.meta.env.VITE_NASA_API_KEY || '6mqEnLOnF1ES47a2VHZUUU5XMmhPATHNMbWMv9IG';

function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function flattenFeed(feed) {
  const out = [];
  Object.entries(feed.near_earth_objects || {}).forEach(([date, items]) => {
    items.forEach((it) => {
      const ca = (it.close_approach_data || [])[0] || {};
      const miss = ca.miss_distance || {};
      const vel = ca.relative_velocity || {};
      const diam = it.estimated_diameter?.kilometers || {};
      out.push({
        id: it.id,
        name: it.name,
        nasa_jpl_url: it.nasa_jpl_url,
        is_potentially_hazardous_asteroid: it.is_potentially_hazardous_asteroid,
        estimated_diameter_km_min: Number(diam.estimated_diameter_min) || 0,
        estimated_diameter_km_max: Number(diam.estimated_diameter_max) || 0,
        close_approach_date_full: ca.close_approach_date_full || date,
        orbiting_body: ca.orbiting_body,
        miss_distance_km: Number(miss.kilometers) || 0,
        miss_distance_lunar: Number(miss.lunar) || 0,
        miss_distance_au: Number(miss.astronomical) || 0,
        velocity_kmh: Number(vel.kilometers_per_hour) || 0,
        velocity_kms: Number(vel.kilometers_per_second) || 0,
      });
    });
  });
  // Sort by closest approach distance
  return out.sort((a, b) => a.miss_distance_km - b.miss_distance_km);
}

export default function App() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('nasa_api_key') || DEFAULT_API_KEY);
  const [filters, setFilters] = useState({ range: 'today', minSize: 0, hazardOnly: false, minVelocity: 0, query: '' });
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [dark]);

  const fetchAsteroids = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const start = todayStr(0);
      const end = filters.range === 'week' ? todayStr(7) : start;
      const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      const flat = flattenFeed(data);
      setAsteroids(flat);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [apiKey, filters.range]);

  useEffect(() => {
    fetchAsteroids();
  }, [fetchAsteroids]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return asteroids.filter((a) => {
      const diameterKm = (a.estimated_diameter_km_min + a.estimated_diameter_km_max) / 2;
      if (filters.minSize && diameterKm < filters.minSize) return false;
      if (filters.hazardOnly && !a.is_potentially_hazardous_asteroid) return false;
      if (filters.minVelocity && a.velocity_kmh < filters.minVelocity) return false;
      if (q && !(a.name.toLowerCase().includes(q) || String(a.id).includes(q))) return false;
      return true;
    });
  }, [asteroids, filters]);

  // Summary stats
  const stats = useMemo(() => {
    if (filtered.length === 0) return { count: 0, largest: null, fastest: null, closest: null };
    const bySize = [...filtered].sort((a, b) => ((b.estimated_diameter_km_min + b.estimated_diameter_km_max) - (a.estimated_diameter_km_min + a.estimated_diameter_km_max)));
    const largest = bySize[0];
    const fastest = [...filtered].sort((a, b) => b.velocity_kmh - a.velocity_kmh)[0];
    const closest = [...filtered].sort((a, b) => a.miss_distance_km - b.miss_distance_km)[0];
    return { count: filtered.length, largest, fastest, closest };
  }, [filtered]);

  function saveApiKey(k) {
    setApiKey(k);
    localStorage.setItem('nasa_api_key', k);
  }

  async function handleSelectAsteroid(a) {
    // Lazy load detailed info
    try {
      const url = `https://api.nasa.gov/neo/rest/v1/neo/${a.id}?api_key=${apiKey}`;
      const res = await fetch(url);
      const info = await res.json();
      const details = {
        ...a,
        absolute_magnitude_h: info.absolute_magnitude_h,
        first_observation_date: info.orbital_data?.first_observation_date,
        orbital_period_days: Number(info.orbital_data?.orbital_period) || undefined,
        aphelion_distance_au: Number(info.orbital_data?.aphelion_distance) || undefined,
        perihelion_distance_au: Number(info.orbital_data?.perihelion_distance) || undefined,
        inclination_deg: Number(info.orbital_data?.inclination) || undefined,
        is_sentry_object: info.is_sentry_object,
      };
      // Show a lightweight details dialog
      const infoLines = [
        `Name: ${details.name}`,
        `Abs Magnitude (H): ${details.absolute_magnitude_h}`,
        `First Observation: ${details.first_observation_date || '-'}`,
        `Orbital Period (days): ${details.orbital_period_days || '-'}`,
        `Aphelion (au): ${details.aphelion_distance_au || '-'}`,
        `Perihelion (au): ${details.perihelion_distance_au || '-'}`,
        `Inclination (deg): ${details.inclination_deg || '-'}`,
        `Potentially Hazardous: ${details.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}`,
        `Sentry Object: ${details.is_sentry_object ? 'Yes' : 'No'}`,
      ];
      alert(infoLines.join('\n'));
    } catch (e) {
      alert('Failed to load details');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white dark:from-black dark:via-black dark:to-black text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <Telescope className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold">NeoWatch</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="password"
              className="hidden sm:block px-3 py-1.5 rounded-md border border-gray-300 dark:border-white/10 bg-white/80 dark:bg-white/5 text-sm"
              defaultValue={apiKey}
              onBlur={(e) => saveApiKey(e.target.value.trim())}
              title="NASA API Key"
              placeholder="NASA API Key"
            />
            <button
              onClick={() => setDark((d) => !d)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} {dark ? 'Light' : 'Dark'}
            </button>
          </div>
        </header>

        <HeroCover />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Filters onChange={setFilters} />

            <div className="bg-white/70 dark:bg-white/5 backdrop-blur rounded-xl p-4 shadow-sm border border-black/5 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="text-sm">
                  Showing <span className="font-semibold">{filters.range === 'week' ? '7 days' : 'today'}</span> • Matches: <span className="font-semibold">{asteroids.length}</span>
                </div>
                {stats.largest && (
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    Largest: <span className="font-semibold">{stats.largest.name}</span>
                  </div>
                )}
                {stats.closest && (
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    Closest: <span className="font-semibold">{stats.closest.name}</span>
                  </div>
                )}
                {stats.fastest && (
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    Fastest: <span className="font-semibold">{stats.fastest.name}</span>
                  </div>
                )}
              </div>

              <AsteroidList asteroids={filtered} loading={loading} error={error} onSelect={handleSelectAsteroid} />
            </div>
          </div>

          <div className="space-y-4">
            <ChartsPanel asteroids={filtered} />

            <div className="p-4 bg-indigo-600 text-white rounded-xl shadow-sm">
              <div className="font-semibold mb-1">Did you know?</div>
              <p className="text-sm opacity-90">
                Lunar Distance (LD) is the average distance from Earth to the Moon, about 384,400 km. Many near-Earth asteroids pass within a few LD of our planet.
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-10 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Data courtesy of NASA NeoWs. This site is for educational and visualization purposes.
        </footer>
      </div>
    </div>
  );
}

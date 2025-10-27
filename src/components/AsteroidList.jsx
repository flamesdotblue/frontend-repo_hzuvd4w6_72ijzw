import { useState } from 'react';
import { Activity, ArrowRight, ExternalLink, Loader2, ShieldAlert } from 'lucide-react';

function formatNumber(n, digits = 0) {
  if (n === undefined || n === null || isNaN(n)) return '-';
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: digits });
}

export default function AsteroidList({ asteroids, loading, error, onSelect }) {
  const [expanded, setExpanded] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-indigo-600">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading latest near-Earth objects...
      </div>
    );
  }
  if (error) {
    return <div className="text-red-600 py-6">{error}</div>;
  }
  if (!asteroids || asteroids.length === 0) {
    return <div className="py-6 text-gray-600 dark:text-gray-300">No asteroids match your filters.</div>;
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-white/10">
      {asteroids.map((a) => {
        const diameterKm = (a.estimated_diameter_km_min + a.estimated_diameter_km_max) / 2;
        const isHaz = a.is_potentially_hazardous_asteroid;
        return (
          <li key={a.id} className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelect(a)}
                    className="text-indigo-700 dark:text-indigo-300 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    {a.name}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  {isHaz && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
                      <ShieldAlert className="h-3 w-3" /> Hazardous
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  <span className="mr-3">Diameter: {formatNumber(diameterKm, 3)} km</span>
                  <span className="mr-3">Closest: {a.close_approach_date_full}</span>
                  <span className="mr-3">Miss: {formatNumber(a.miss_distance_km, 0)} km ({formatNumber(a.miss_distance_lunar, 2)} LD)</span>
                  <span>Velocity: {formatNumber(a.velocity_kmh, 0)} km/h</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <a
                  href={a.nasa_jpl_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-300 hover:underline"
                  title="Open NASA JPL data"
                >
                  NASA Page <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <Activity className="h-4 w-4" /> Orbit snapshot
                </button>
              </div>
            </div>

            {expanded === a.id && (
              <div className="mt-3 text-xs text-gray-600 dark:text-gray-300 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>Orbiting body: {a.orbiting_body || '-'}</div>
                <div>Approach: {a.close_approach_date_full}</div>
                <div>Relative vel (km/s): {formatNumber(a.velocity_kms, 2)}</div>
                <div>Miss (au): {formatNumber(a.miss_distance_au, 6)}</div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

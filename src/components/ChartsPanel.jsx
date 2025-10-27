function numberFormat(n) {
  if (n === undefined || n === null || isNaN(n)) return 0;
  return Number(n);
}

function SizeBarChart({ data }) {
  const sorted = [...data]
    .sort((a, b) => b.diameter_km - a.diameter_km)
    .slice(0, 10);
  const max = Math.max(1, ...sorted.map((d) => d.diameter_km));

  return (
    <div className="p-4 bg-white/70 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/10">
      <div className="text-sm font-semibold mb-3">Largest asteroids (km)</div>
      <div className="space-y-2">
        {sorted.map((d) => (
          <div key={d.id} className="flex items-center gap-3">
            <div className="truncate text-xs text-gray-600 dark:text-gray-300 w-40" title={d.name}>{d.name}</div>
            <div className="h-3 flex-1 bg-indigo-100 dark:bg-indigo-900/30 rounded">
              <div
                className="h-full bg-indigo-600 rounded"
                style={{ width: `${(d.diameter_km / max) * 100}%` }}
              />
            </div>
            <div className="w-16 text-right text-xs text-gray-700 dark:text-gray-200">
              {d.diameter_km.toFixed(3)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DistanceVelocityScatter({ data }) {
  const maxDist = Math.max(1, ...data.map((d) => d.miss_distance_lunar));
  const maxVel = Math.max(1, ...data.map((d) => d.velocity_kmh));
  const points = data.slice(0, 60);

  return (
    <div className="p-4 bg-white/70 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/10">
      <div className="text-sm font-semibold mb-3">Approach distance (LD) vs velocity (km/h)</div>
      <svg viewBox="0 0 100 60" className="w-full h-48">
        <rect x="0" y="0" width="100" height="60" className="fill-indigo-50 dark:fill-indigo-950/30" />
        {points.map((p) => {
          const x = (numberFormat(p.miss_distance_lunar) / maxDist) * 95 + 3;
          const y = 57 - (numberFormat(p.velocity_kmh) / maxVel) * 50;
          const r = Math.max(0.8, Math.min(4, (p.diameter_km / 1) * 1.5));
          return (
            <circle
              key={p.id}
              cx={x}
              cy={y}
              r={r}
              className={p.is_hazardous ? 'fill-amber-500' : 'fill-indigo-600'}
              opacity="0.8"
            />
          );
        })}
        <line x1="3" y1="57" x2="98" y2="57" stroke="currentColor" className="text-gray-400" strokeWidth="0.5" />
        <line x1="3" y1="5" x2="3" y2="57" stroke="currentColor" className="text-gray-400" strokeWidth="0.5" />
      </svg>
      <div className="mt-2 text-[10px] text-gray-600 dark:text-gray-300 flex justify-between">
        <span>0 LD</span>
        <span>Distance</span>
        <span>{maxDist.toFixed(1)} LD</span>
      </div>
    </div>
  );
}

export default function ChartsPanel({ asteroids }) {
  const dataset = asteroids.map((a) => ({
    id: a.id,
    name: a.name,
    diameter_km: (a.estimated_diameter_km_min + a.estimated_diameter_km_max) / 2,
    velocity_kmh: a.velocity_kmh,
    miss_distance_lunar: a.miss_distance_lunar,
    is_hazardous: a.is_potentially_hazardous_asteroid,
  }));

  if (dataset.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SizeBarChart data={dataset} />
      <DistanceVelocityScatter data={dataset} />
    </div>
  );
}

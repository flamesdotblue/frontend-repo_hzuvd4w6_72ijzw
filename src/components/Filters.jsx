import { useState, useEffect } from 'react';
import { Calendar, Search, Zap } from 'lucide-react';

export default function Filters({ onChange }) {
  const [range, setRange] = useState('today'); // 'today' | 'week'
  const [minSize, setMinSize] = useState(''); // km
  const [hazardOnly, setHazardOnly] = useState(false);
  const [minVelocity, setMinVelocity] = useState(''); // km/h
  const [query, setQuery] = useState('');

  useEffect(() => {
    onChange({ range, minSize: Number(minSize) || 0, hazardOnly, minVelocity: Number(minVelocity) || 0, query });
  }, [range, minSize, hazardOnly, minVelocity, query, onChange]);

  return (
    <div className="w-full bg-white/70 dark:bg-white/5 backdrop-blur rounded-xl p-4 shadow-sm border border-black/5 dark:border-white/10">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Date Range</label>
          <div className="flex gap-2">
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition ${range === 'today' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setRange('today')}
            >
              <Calendar className="h-4 w-4" /> Today
            </button>
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition ${range === 'week' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setRange('week')}
            >
              <Calendar className="h-4 w-4" /> 7 Days
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Min Size (km)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={minSize}
            onChange={(e) => setMinSize(e.target.value)}
            className="w-36 px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/40 text-gray-800 dark:text-white"
            placeholder="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Min Velocity (km/h)</label>
          <input
            type="number"
            min="0"
            step="100"
            value={minVelocity}
            onChange={(e) => setMinVelocity(e.target.value)}
            className="w-44 px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/40 text-gray-800 dark:text-white"
            placeholder="20000"
          />
        </div>

        <div className="flex items-center gap-2 mt-1">
          <input id="haz" type="checkbox" checked={hazardOnly} onChange={(e) => setHazardOnly(e.target.checked)} />
          <label htmlFor="haz" className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1">
            <Zap className="h-4 w-4 text-amber-500" /> Potentially Hazardous
          </label>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Search</label>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/40 text-gray-800 dark:text-white"
              placeholder="Name or ID"
            />
          </div>
        </div>

        <div className="self-stretch flex items-end">
          <div className="hidden lg:block text-xs text-gray-500 dark:text-gray-400">Filters update automatically</div>
        </div>
      </div>
    </div>
  );
}

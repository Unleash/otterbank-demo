import { useState } from 'react';
import { getRegion, setRegion, REGIONS } from '../lib/api.js';

// Part of the app chrome, always visible. Picking a region updates the
// shared value in the api client, so every poll after the change carries
// the new region; nothing else needs to know it moved.
export default function RegionSelect() {
  const [region, setLocal] = useState(getRegion);

  const handleChange = (event) => {
    setRegion(event.target.value);
    setLocal(event.target.value);
  };

  return (
    <label className="flex items-center gap-2">
      <span className="hidden font-mono text-xs text-muted sm:inline">region</span>
      <select
        value={region}
        onChange={handleChange}
        aria-label="Data residency region"
        className="min-h-9 cursor-pointer rounded-full border border-line bg-surface-raised px-3 font-mono text-xs text-cream transition-colors hover:border-muted focus:outline-none focus:border-lavender"
      >
        {REGIONS.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </label>
  );
}

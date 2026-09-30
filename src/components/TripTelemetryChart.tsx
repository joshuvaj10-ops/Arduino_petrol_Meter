import React, { useState } from 'react';
import { Activity, Gauge, TrendingUp, Droplet } from 'lucide-react';
import { TelemetryHistoryPoint } from '../types';

interface TripTelemetryChartProps {
  history: TelemetryHistoryPoint[];
}

export const TripTelemetryChart: React.FC<TripTelemetryChartProps> = ({ history }) => {
  const [activeChannel, setActiveChannel] = useState<'all' | 'mileage' | 'fuel' | 'speed'>('all');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (history.length < 2) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-slate-100">Live Telemetry Waveform</h3>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">Sampling: 1.0s</span>
        </div>
        <div className="py-12 text-center text-xs text-slate-500 italic">
          Drive the vehicle or send pulses to plot real-time telemetry curves.
        </div>
      </div>
    );
  }

  // Dimensions of SVG canvas
  const width = 800;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const pointsCount = history.length;
  const maxSpeed = Math.max(80, ...history.map((h) => h.speedKmh));
  const maxMileage = Math.max(30, ...history.map((h) => h.mileageKmPerL));

  // Compute (x, y) coordinates for each series
  const getX = (i: number) => padding.left + (i / (pointsCount - 1)) * chartWidth;
  
  // Speed: 0 to maxSpeed -> 0 to chartHeight
  const getYSpeed = (speed: number) =>
    padding.top + chartHeight - (speed / maxSpeed) * chartHeight;

  // Fuel: 0 to 100% -> 0 to chartHeight
  const getYFuel = (fuel: number) =>
    padding.top + chartHeight - (fuel / 100) * chartHeight;

  // Mileage: 0 to maxMileage -> 0 to chartHeight
  const getYMileage = (mileage: number) =>
    padding.top + chartHeight - (Math.min(maxMileage, mileage) / maxMileage) * chartHeight;

  // Generate SVG path string
  const createPath = (getYFunc: (val: number) => number, key: keyof TelemetryHistoryPoint) => {
    return history
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getYFunc(pt[key] as number).toFixed(1)}`)
      .join(' ');
  };

  const speedPath = createPath(getYSpeed, 'speedKmh');
  const fuelPath = createPath(getYFuel, 'fuelPercent');
  const mileagePath = createPath(getYMileage, 'mileageKmPerL');

  const hoveredPoint = hoverIndex !== null && history[hoverIndex] ? history[hoverIndex] : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
      {/* Header and Channel Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold text-slate-100">Live Multi-Channel Telemetry Stream</h3>
          <span className="text-[11px] font-mono text-slate-400">· {pointsCount} samples</span>
        </div>

        {/* Channel Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveChannel('all')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeChannel === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setActiveChannel('speed')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeChannel === 'speed'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-3 h-3 text-amber-400" />
            <span>Speed</span>
          </button>
          <button
            onClick={() => setActiveChannel('fuel')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeChannel === 'fuel'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplet className="w-3 h-3 text-cyan-400" />
            <span>Fuel %</span>
          </button>
          <button
            onClick={() => setActiveChannel('mileage')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeChannel === 'mileage'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Mileage</span>
          </button>
        </div>
      </div>

      {/* Interactive SVG Chart Stage */}
      <div className="relative w-full overflow-hidden bg-slate-950/80 rounded-lg border border-slate-800/80 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * width;
            const normalizedX = (relX - padding.left) / chartWidth;
            const index = Math.round(normalizedX * (pointsCount - 1));
            if (index >= 0 && index < pointsCount) {
              setHoverIndex(index);
            }
          }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((frac, i) => {
            const y = padding.top + frac * chartHeight;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {Math.round((1 - frac) * 100)}%
                </text>
              </g>
            );
          })}

          {/* Paths */}
          {(activeChannel === 'all' || activeChannel === 'speed') && (
            <path
              d={speedPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {(activeChannel === 'all' || activeChannel === 'fuel') && (
            <path
              d={fuelPath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {(activeChannel === 'all' || activeChannel === 'mileage') && (
            <path
              d={mileagePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover Crosshair */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={height - padding.bottom}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              {/* Highlight circle on active curve */}
              <circle
                cx={getX(hoverIndex)}
                cy={getYMileage(history[hoverIndex].mileageKmPerL)}
                r="4"
                fill="#10b981"
                stroke="#022c22"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip HUD */}
        {hoveredPoint && hoverIndex !== null && (
          <div
            className="absolute top-4 right-4 bg-slate-900/95 border border-slate-700/80 p-2.5 rounded-md shadow-xl text-xs font-mono space-y-1 z-20 pointer-events-none backdrop-blur-sm"
          >
            <div className="text-[10px] text-slate-400 pb-1 border-b border-slate-800">
              Sample #{hoverIndex + 1} (T+{hoveredPoint.timeSec}s)
            </div>
            <div className="flex justify-between gap-4 text-amber-400">
              <span>Speed:</span>
              <span className="font-bold">{hoveredPoint.speedKmh.toFixed(0)} km/h</span>
            </div>
            <div className="flex justify-between gap-4 text-cyan-400">
              <span>Fuel Remaining:</span>
              <span className="font-bold">{hoveredPoint.fuelPercent}% ({hoveredPoint.fuelLiters.toFixed(2)}L)</span>
            </div>
            <div className="flex justify-between gap-4 text-slate-300">
              <span>Distance:</span>
              <span className="font-bold">{hoveredPoint.distanceKm.toFixed(2)} km</span>
            </div>
            <div className="flex justify-between gap-4 text-emerald-400">
              <span>Mileage:</span>
              <span className="font-bold">{hoveredPoint.mileageKmPerL.toFixed(2)} KM/L</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Channel keys */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400 rounded-full" />
            <span>Speed (km/h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 rounded-full" />
            <span>Fuel Level (%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 rounded-full" />
            <span>Mileage (KM/L)</span>
          </div>
        </div>
        <span className="font-mono text-[11px]">Hover over graph for crosshair readout</span>
      </div>
    </div>
  );
};

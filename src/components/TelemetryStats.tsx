import React from 'react';
import { Gauge, Milestone, Fuel, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';
import { CalculatedTelemetry, DeviceConfig } from '../types';

interface TelemetryStatsProps {
  telemetry: CalculatedTelemetry;
  config: DeviceConfig;
  onChangePrice: (price: number) => void;
  onChangeCurrency: (currency: string) => void;
}

export const TelemetryStats: React.FC<TelemetryStatsProps> = ({
  telemetry,
  config,
  onChangePrice,
  onChangeCurrency,
}) => {
  const tripFuelCost = telemetry.fuelConsumedLiters * config.fuelPricePerLiter;

  return (
    <div className="space-y-4">
      {/* 4 Primary Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Mileage (KM/L) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fuel Economy</span>
            </span>
            <span className="font-mono text-emerald-400 font-semibold">Real-Time</span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold font-mono text-slate-100 tabular-nums">
              {telemetry.mileageKmPerL.toFixed(2)}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400">KM/L</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{telemetry.mileageMpgUs.toFixed(1)} MPG (US)</span>
            <span>·</span>
            <span>
              {telemetry.mileageLPer100Km > 0 ? telemetry.mileageLPer100Km.toFixed(1) : '—'} L/100km
            </span>
          </div>
        </div>

        {/* KPI 2: Distance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium flex items-center gap-1.5">
              <Milestone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Total Distance</span>
            </span>
            <span className="font-mono text-cyan-400 font-semibold">Odometer</span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold font-mono text-slate-100 tabular-nums">
              {telemetry.distanceKm.toFixed(2)}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400">KM</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{telemetry.distanceMeters.toFixed(0)} meters</span>
            <span>·</span>
            <span>{(telemetry.distanceKm * 0.621371).toFixed(2)} miles</span>
          </div>
        </div>

        {/* KPI 3: Fuel Remaining */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              <span>Fuel Remaining</span>
            </span>
            <span
              className={`font-mono font-semibold text-xs ${
                telemetry.fuelPercent <= 15 ? 'text-rose-400' : 'text-amber-400'
              }`}
            >
              {telemetry.fuelPercent <= 15 ? 'RESERVE' : 'NORMAL'}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold font-mono text-slate-100 tabular-nums">
              {telemetry.fuelLevelLiters.toFixed(2)}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400">Liters</span>
            <span className="ml-auto font-mono text-sm font-semibold text-amber-300">
              {telemetry.fuelPercent}%
            </span>
          </div>

          {/* Mini progress bar */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80">
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  telemetry.fuelPercent <= 15 ? 'bg-rose-500' : 'bg-amber-400'
                }`}
                style={{ width: `${telemetry.fuelPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 4: Range to Empty (DTE) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>Projected Range</span>
            </span>
            <span className="font-mono text-indigo-400 font-semibold">DTE</span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold font-mono text-slate-100 tabular-nums">
              {telemetry.estimatedRangeKm.toFixed(1)}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400">KM</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Burned: {telemetry.fuelConsumedLiters.toFixed(2)} L</span>
            <span>·</span>
            <span>
              Cost: {config.currencySymbol}
              {tripFuelCost.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Engineering Calculation Insights & Zero-Division Safety callout */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">
                Arduino Calculation Logic Breakdown
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                <code className="text-cyan-300 font-mono">
                  mileage = distanceKm / (fuelCapacity - fuelLevel + 0.01);
                </code>
                <br />
                <span className="text-slate-400">
                  Current math:{' '}
                  <span className="font-mono text-slate-300">
                    {telemetry.distanceKm.toFixed(2)} km / ({config.fuelCapacity.toFixed(1)} -{' '}
                    {telemetry.fuelLevelLiters.toFixed(2)} + 0.01) ={' '}
                    <span className="text-emerald-300 font-semibold">
                      {telemetry.mileageKmPerL.toFixed(2)} KM/L
                    </span>
                  </span>
                </span>
              </p>
            </div>
          </div>

          {/* Fuel Price & Cost Configurator */}
          <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 shrink-0">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px]">Fuel Price / Litre:</span>
              <div className="flex items-center gap-1 mt-0.5">
                <select
                  value={config.currencySymbol}
                  onChange={(e) => onChangeCurrency(e.target.value)}
                  className="bg-slate-800 text-slate-200 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-700"
                >
                  <option value="$">$ (USD)</option>
                  <option value="₹">₹ (INR)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                </select>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="10"
                  value={config.fuelPricePerLiter}
                  onChange={(e) => onChangePrice(Number(e.target.value))}
                  className="w-16 bg-slate-800 text-slate-100 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

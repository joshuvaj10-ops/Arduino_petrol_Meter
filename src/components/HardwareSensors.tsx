import React from 'react';
import { Disc, Fuel, Zap, Play, Square, Gauge, Droplets, RotateCw } from 'lucide-react';
import { DeviceConfig, HardwareState, CalculatedTelemetry } from '../types';

interface HardwareSensorsProps {
  config: DeviceConfig;
  hardware: HardwareState;
  telemetry: CalculatedTelemetry;
  onSinglePulse: () => void;
  onResetPulses: () => void;
  onToggleDrive: () => void;
  onChangeSpeed: (speed: number) => void;
  onChangeAnalog: (val: number) => void;
  onQuickFuel: (percent: number) => void;
  onToggleAutoConsume: () => void;
  onChangeWheelCircumference: (circ: number) => void;
  onChangeFuelCapacity: (cap: number) => void;
}

export const HardwareSensors: React.FC<HardwareSensorsProps> = ({
  config,
  hardware,
  telemetry,
  onSinglePulse,
  onResetPulses,
  onToggleDrive,
  onChangeSpeed,
  onChangeAnalog,
  onQuickFuel,
  onToggleAutoConsume,
  onChangeWheelCircumference,
  onChangeFuelCapacity,
}) => {
  const { pulseCount, analogValue, isDriving, driveSpeedKmh, isAutoConsuming, pulseFrequencyHz } = hardware;

  // Wheel preset sizes
  const wheelPresets = [
    { label: 'Scooter 10" (1.30m)', value: 1.3 },
    { label: 'Default (2.00m)', value: 2.0 },
    { label: 'Motorcycle 17" (1.92m)', value: 1.92 },
    { label: 'Bicycle 28" / 700c (2.14m)', value: 2.14 },
    { label: 'Car 195/65-R15 (1.99m)', value: 1.99 },
  ];

  // Fuel tank preset sizes
  const tankPresets = [
    { label: '3.5 L (Scooter)', value: 3.5 },
    { label: '5.0 L (Default / Moped)', value: 5.0 },
    { label: '12.0 L (Motorcycle)', value: 12.0 },
    { label: '45.0 L (Compact Car)', value: 45.0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* ----------------- SENSOR 1: IR WHEEL SENSOR (PIN 2) ----------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Disc className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <span>IR Pulse Speed Sensor</span>
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">
                    Pin 2 (INT0)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Interrupt: FALLING · INPUT_PULLUP</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  isDriving
                    ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse'
                    : 'bg-slate-700'
                }`}
                title={isDriving ? 'Continuous pulses active' : 'Idle'}
              />
              <span className="text-xs font-mono text-slate-400">
                {pulseFrequencyHz.toFixed(1)} Hz
              </span>
            </div>
          </div>

          {/* Interactive Wheel & Pulse Trigger Zone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-950/70 p-4 rounded-lg border border-slate-800/80 mb-4">
            {/* Animated Rotating Wheel Graphic */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Wheel Outer Rim */}
                <div
                  className={`w-20 h-20 rounded-full border-4 border-slate-700 border-dashed transition-transform ${
                    isDriving ? 'border-cyan-500' : 'border-slate-600'
                  }`}
                  style={{
                    animation: isDriving
                      ? `spin ${Math.max(0.12, 3.6 / (driveSpeedKmh || 1))}s linear infinite`
                      : 'none',
                  }}
                />
                {/* Center Hub */}
                <div className="absolute w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>
                {/* Optical Slit / Magnet Indicator */}
                <div
                  className={`absolute -top-1 w-2.5 h-3 bg-cyan-400 rounded-sm shadow-[0_0_6px_#22d3ee] ${
                    isDriving ? 'opacity-100' : 'opacity-70'
                  }`}
                  title="Optical Reflector / Magnet trigger"
                />
              </div>
              <span className="text-[11px] font-mono text-slate-400 mt-1">Wheel Rotations</span>
            </div>

            {/* Pulse Stats */}
            <div className="sm:col-span-2 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Pulse Count:</span>
                <span className="font-mono text-xl font-bold text-cyan-300 tabular-nums">
                  {pulseCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Calculated Distance:</span>
                <span className="font-mono text-sm font-semibold text-slate-200 tabular-nums">
                  {telemetry.distanceKm.toFixed(3)} km{' '}
                  <span className="text-xs text-slate-400">({telemetry.distanceMeters.toFixed(1)} m)</span>
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Interrupt Trigger:</span>
                <span className="font-mono text-xs text-emerald-400">countPulse()</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={onSinglePulse}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-md transition-colors shadow-sm active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>+1 Pulse (Turn Wheel)</span>
                </button>
                <button
                  onClick={onResetPulses}
                  className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-md border border-slate-700 transition-colors"
                  title="Reset Pulse Count to 0"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Drive Simulator (Continuous Pulses) */}
          <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>Trip Driving Simulator</span>
              </label>
              <button
                onClick={onToggleDrive}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                  isDriving
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
                }`}
              >
                {isDriving ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                <span>{isDriving ? 'Stop Driving' : 'Start Driving'}</span>
              </button>
            </div>

            {/* Speed Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Simulated Vehicle Speed:</span>
                <span className="font-mono font-bold text-amber-300 tabular-nums">
                  {driveSpeedKmh} km/h{' '}
                  <span className="text-[10px] text-slate-400">
                    ({(driveSpeedKmh / 3.6).toFixed(1)} m/s)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="140"
                step="5"
                value={driveSpeedKmh}
                onChange={(e) => onChangeSpeed(Number(e.target.value))}
                className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span>5 km/h</span>
                <span>40 km/h (City)</span>
                <span>80 km/h (Highway)</span>
                <span>140 km/h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wheel Circumference Parameter */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium">wheelCircumference:</span>
            <span className="font-mono font-semibold text-cyan-400 tabular-nums">
              {config.wheelCircumference.toFixed(2)} m
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {wheelPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => onChangeWheelCircumference(preset.value)}
                className={`px-2 py-1 text-[11px] rounded transition-colors ${
                  Math.abs(config.wheelCircumference - preset.value) < 0.01
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ----------------- SENSOR 2: ANALOG FUEL SENSOR (PIN A0) ----------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Fuel className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <span>Fuel Float Sensor</span>
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
                    Pin A0
                  </span>
                </h3>
                <p className="text-xs text-slate-400">analogRead() · 10-Bit ADC (0-1023)</p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-xs text-slate-300">
                {telemetry.analogVoltage.toFixed(2)} V
              </span>
              <p className="text-[10px] font-mono text-slate-400">ADC: {analogValue}</p>
            </div>
          </div>

          {/* Interactive Fuel Tank & Arm Float Graphic */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/70 p-4 rounded-lg border border-slate-800/80 mb-4">
            {/* Cutaway Petrol Tank Graphic */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-20 h-28 bg-slate-900 rounded-lg border-2 border-slate-700 overflow-hidden shadow-inner flex flex-col justify-end">
                {/* Fuel Level Liquid */}
                <div
                  className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 transition-all duration-300 relative"
                  style={{ height: `${telemetry.fuelPercent}%` }}
                >
                  {/* Wave surface shimmer */}
                  <div className="absolute -top-1 left-0 right-0 h-2 bg-amber-300/40 rounded-full blur-[1px]" />
                </div>

                {/* Float Arm Indicator */}
                <div
                  className="absolute w-3 h-3 rounded-full bg-slate-100 border border-slate-800 shadow-md transition-all duration-300 left-8"
                  style={{ bottom: `calc(${telemetry.fuelPercent}% - 6px)` }}
                />

                {/* Markings */}
                <div className="absolute inset-y-0 right-1 flex flex-col justify-between py-1 text-[8px] font-mono text-slate-400 select-none">
                  <span>F</span>
                  <span>3/4</span>
                  <span>1/2</span>
                  <span>1/4</span>
                  <span>E</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400 mt-1">Petrol Tank</span>
            </div>

            {/* Readouts & Quick Fill */}
            <div className="sm:col-span-2 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Fuel Level:</span>
                <span className="font-mono text-xl font-bold text-amber-300 tabular-nums">
                  {telemetry.fuelPercent}%{' '}
                  <span className="text-sm font-normal text-slate-300">
                    ({telemetry.fuelLevelLiters.toFixed(2)} L)
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Fuel Consumed:</span>
                <span className="font-mono text-sm font-semibold text-rose-300 tabular-nums">
                  {telemetry.fuelConsumedLiters.toFixed(2)} L
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Arduino Mapping:</span>
                <span className="font-mono text-xs text-slate-400">
                  map({analogValue}, 0, 1023, 0, 100)
                </span>
              </div>

              {/* Quick Fill Buttons */}
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 block mb-1">Quick Tank Presets:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => onQuickFuel(100)}
                    className="py-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium rounded border border-slate-700 transition-colors text-center"
                  >
                    Full (100%)
                  </button>
                  <button
                    onClick={() => onQuickFuel(50)}
                    className="py-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium rounded border border-slate-700 transition-colors text-center"
                  >
                    Half (50%)
                  </button>
                  <button
                    onClick={() => onQuickFuel(15)}
                    className="py-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] font-medium rounded border border-slate-700 transition-colors text-center"
                  >
                    Reserve (15%)
                  </button>
                  <button
                    onClick={() => onQuickFuel(0)}
                    className="py-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 text-[11px] font-medium rounded border border-slate-700 transition-colors text-center"
                  >
                    Empty (0%)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Analog Slider & Auto-Consumption */}
          <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/60">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">ADC Potentiometer Value:</span>
                <span className="font-mono font-bold text-amber-300 tabular-nums">
                  {analogValue} / 1023 ({(analogValue / 10.23).toFixed(0)}%)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1023"
                value={analogValue}
                onChange={(e) => onChangeAnalog(Number(e.target.value))}
                className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Auto-consumption toggle */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-xs text-slate-300">Burn Petrol While Driving</span>
              </div>
              <button
                onClick={onToggleAutoConsume}
                className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                  isAutoConsuming
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-300 border border-slate-700'
                }`}
              >
                {isAutoConsuming ? 'Burning Active' : 'Off (Static Fuel)'}
              </button>
            </div>
          </div>
        </div>

        {/* Tank Capacity Parameter */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium">fuelCapacity:</span>
            <span className="font-mono font-semibold text-amber-400 tabular-nums">
              {config.fuelCapacity.toFixed(1)} L
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tankPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => onChangeFuelCapacity(preset.value)}
                className={`px-2 py-1 text-[11px] rounded transition-colors ${
                  Math.abs(config.fuelCapacity - preset.value) < 0.1
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Cpu, Zap, Info, CheckCircle2 } from 'lucide-react';
import { HardwareState, CalculatedTelemetry, DeviceConfig } from '../types';

interface CircuitDiagramProps {
  hardware: HardwareState;
  telemetry: CalculatedTelemetry;
  config: DeviceConfig;
}

export const CircuitDiagram: React.FC<CircuitDiagramProps> = ({
  hardware,
  telemetry,
  config,
}) => {
  const [selectedPin, setSelectedPin] = useState<string | null>('pin2');

  const pinDetails: Record<
    string,
    { title: string; color: string; desc: string; voltage: string; codeRef: string }
  > = {
    pin2: {
      title: 'Digital Pin 2 (INT0) — IR Pulse Sensor',
      color: 'text-cyan-400',
      voltage: hardware.isDriving ? 'PULSING (0V / 5V)' : '5.0V (PULLUP HIGH)',
      desc: 'Configured with pinMode(irSensor, INPUT_PULLUP). The internal ~20kΩ pullup keeps pin HIGH. When the IR phototransistor / magnetic reed switch closes to GND, it pulls pin 2 LOW, triggering the FALLING interrupt.',
      codeRef: 'attachInterrupt(digitalPinToInterrupt(2), countPulse, FALLING);',
    },
    pinA0: {
      title: 'Analog Pin A0 — Fuel Float Level Sensor',
      color: 'text-amber-400',
      voltage: `${telemetry.analogVoltage.toFixed(2)} V (${hardware.analogValue} / 1023 ADC)`,
      desc: 'Connected to the wiper of the fuel tank resistive float sensor (or 10k potentiometer). The 10-bit Successive Approximation ADC converts 0V–5V into discrete integer values from 0 to 1023.',
      codeRef: 'int sensorValue = analogRead(fuelSensor);',
    },
    i2c: {
      title: 'I2C Bus (A4 SDA / A5 SCL) — 16x2 LCD Backpack',
      color: 'text-indigo-400',
      voltage: '5.0V Bus (PCF8574T @ 0x27)',
      desc: 'Uses Wire.h hardware I2C bus: A4 is SDA (Serial Data) and A5 is SCL (Serial Clock). Controls the HD44780 16x2 LCD via an 8-bit expander chip using only 2 MCU pins instead of 6-8 parallel wires.',
      codeRef: 'LiquidCrystal_I2C lcd(0x27, 16, 2);',
    },
    power: {
      title: '5V & GND Power Rails',
      color: 'text-emerald-400',
      voltage: hardware.isMcuPowered ? '5.0V DC Regulated' : '0.0V (Off)',
      desc: 'Provides steady 5V DC and common Ground reference for the Arduino MCU, IR sensor module, fuel tank sender, and 1602 LCD with LED backlight (~25mA current draw).',
      codeRef: 'pinMode(irSensor, INPUT_PULLUP); // internal 5V rail',
    },
  };

  const currentInfo = pinDetails[selectedPin || 'pin2'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Hardware Pinout & Circuit Schematic
          </h3>
          <span className="text-[11px] font-mono text-slate-400">· ATmega328P (Uno / Nano)</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Bus Status</span>
        </div>
      </div>

      {/* Schematic Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {/* Module 1: IR Sensor */}
        <button
          onClick={() => setSelectedPin('pin2')}
          className={`p-3 rounded-lg border text-left transition-all ${
            selectedPin === 'pin2'
              ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-slate-200">IR Sensor</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-900/40 text-cyan-300 border border-cyan-700/50">
              Pin 2
            </span>
          </div>
          <div className="space-y-1 text-[11px] font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Signal:</span>
              <span className="text-cyan-400 font-bold">
                {hardware.isDriving ? 'PULSING' : 'HIGH'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Mode:</span>
              <span>FALLING (INT0)</span>
            </div>
          </div>
        </button>

        {/* Module 2: Fuel Sensor */}
        <button
          onClick={() => setSelectedPin('pinA0')}
          className={`p-3 rounded-lg border text-left transition-all ${
            selectedPin === 'pinA0'
              ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-slate-200">Fuel Float</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-700/50">
              Pin A0
            </span>
          </div>
          <div className="space-y-1 text-[11px] font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Analog:</span>
              <span className="text-amber-400 font-bold">
                {telemetry.analogVoltage.toFixed(2)}V
              </span>
            </div>
            <div className="flex justify-between">
              <span>ADC Value:</span>
              <span>{hardware.analogValue} / 1023</span>
            </div>
          </div>
        </button>

        {/* Module 3: I2C LCD */}
        <button
          onClick={() => setSelectedPin('i2c')}
          className={`p-3 rounded-lg border text-left transition-all ${
            selectedPin === 'i2c'
              ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-slate-200">16x2 LCD</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-900/40 text-indigo-300 border border-indigo-700/50">
              A4 / A5
            </span>
          </div>
          <div className="space-y-1 text-[11px] font-mono text-slate-400">
            <div className="flex justify-between">
              <span>SDA / SCL:</span>
              <span className="text-indigo-400 font-bold">{config.i2cAddress}</span>
            </div>
            <div className="flex justify-between">
              <span>Backlight:</span>
              <span className="text-slate-300">
                {hardware.isLcdBacklightOn ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
          </div>
        </button>

        {/* Module 4: Power Rail */}
        <button
          onClick={() => setSelectedPin('power')}
          className={`p-3 rounded-lg border text-left transition-all ${
            selectedPin === 'power'
              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-slate-200">Power Rails</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-700/50">
              5V & GND
            </span>
          </div>
          <div className="space-y-1 text-[11px] font-mono text-slate-400">
            <div className="flex justify-between">
              <span>VCC Rail:</span>
              <span className="text-emerald-400 font-bold">
                {hardware.isMcuPowered ? '+5.0V' : '0.0V'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Current:</span>
              <span>~65 mA</span>
            </div>
          </div>
        </button>
      </div>

      {/* Selected Component Technical Spec Box */}
      {currentInfo && (
        <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className={`font-semibold ${currentInfo.color}`}>{currentInfo.title}</span>
            <span className="font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {currentInfo.voltage}
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed">{currentInfo.desc}</p>
          <div className="bg-slate-900/90 p-2 rounded border border-slate-800/80 font-code text-cyan-300 text-[11px]">
            {currentInfo.codeRef}
          </div>
        </div>
      )}

      {/* Hardware Wiring Checklist */}
      <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <span className="font-semibold text-slate-300 block mb-1">Wiring Verification Checklist:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>IR OUT → Arduino Pin 2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Fuel Wiper → Arduino Pin A0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>LCD SDA → A4 & SCL → A5</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Common GND connected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>I2C Address jumper verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>INPUT_PULLUP mode active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

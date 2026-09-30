import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Power,
  RotateCcw,
  Play,
  Square,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import {
  DeviceConfig,
  HardwareState,
  CalculatedTelemetry,
  SerialLogEntry,
  TelemetryHistoryPoint,
} from './types';
import { calculateTelemetry } from './utils/arduinoLogic';
import { Lcd1602Display } from './components/Lcd1602Display';
import { HardwareSensors } from './components/HardwareSensors';
import { TelemetryStats } from './components/TelemetryStats';
import { SerialMonitor } from './components/SerialMonitor';
import { CircuitDiagram } from './components/CircuitDiagram';
import { CodeInspector } from './components/CodeInspector';
import { TripTelemetryChart } from './components/TripTelemetryChart';

export default function App() {
  // Device Configuration (synced with Arduino sketch variables)
  const [config, setConfig] = useState<DeviceConfig>({
    wheelCircumference: 2.0, // meters (from Arduino sketch)
    fuelCapacity: 5.0, // litres (from Arduino sketch)
    i2cAddress: '0x27', // LiquidCrystal_I2C(0x27, 16, 2)
    irPin: 2, // const int irSensor = 2
    fuelPin: 'A0', // const int fuelSensor = A0
    loopDelayMs: 1000, // delay(1000)
    invertFuelSensor: false,
    fuelPricePerLiter: 1.5,
    currencySymbol: '$',
  });

  // Physical Hardware Simulation State
  const [hardware, setHardware] = useState<HardwareState>({
    pulseCount: 1420, // Initial odometer count for demonstration
    analogValue: 798, // ~78% initial fuel level
    isDriving: false,
    driveSpeedKmh: 48,
    isAutoConsuming: true,
    consumptionRateKmPerL: 42,
    isMcuPowered: true,
    isLcdBacklightOn: true,
    lcdTheme: 'blue',
    lcdContrast: 85,
    bootStep: 'ready',
    lastPulseTimestamp: Date.now(),
    pulseFrequencyHz: 0,
  });

  // Serial Monitor Log Stream
  const [serialLogs, setSerialLogs] = useState<SerialLogEntry[]>([]);
  const [isSerialPaused, setIsSerialPaused] = useState(false);
  const [baudRate, setBaudRate] = useState(9600);

  // Time-Series Telemetry History (for chart)
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryHistoryPoint[]>([]);

  // Navigation tab for focused work
  const [activeTab, setActiveTab] = useState<'console' | 'sensors' | 'schematic' | 'code' | 'charts'>('console');

  // Calculate live telemetry derived state
  const telemetry: CalculatedTelemetry = calculateTelemetry(
    hardware.pulseCount,
    hardware.analogValue,
    config
  );

  // References for timing loops
  const hardwareRef = useRef(hardware);
  hardwareRef.current = hardware;

  const configRef = useRef(config);
  configRef.current = config;

  const telemetryRef = useRef(telemetry);
  telemetryRef.current = telemetry;

  const isSerialPausedRef = useRef(isSerialPaused);
  isSerialPausedRef.current = isSerialPaused;

  // 1. Vehicle Driving Physics Loop: generates pulses & fuel consumption
  useEffect(() => {
    if (!hardware.isDriving || !hardware.isMcuPowered) {
      setHardware((prev) => ({ ...prev, pulseFrequencyHz: 0 }));
      return;
    }

    const intervalMs = 100; // 10 Hz physics step
    const timer = setInterval(() => {
      setHardware((prev) => {
        if (!prev.isDriving || !prev.isMcuPowered) return prev;

        // Speed in m/s = kmh / 3.6
        const speedMps = prev.driveSpeedKmh / 3.6;
        const circ = configRef.current.wheelCircumference;
        const pulsesPerSec = speedMps / circ;
        const pulsesThisStep = pulsesPerSec * (intervalMs / 1000);

        // Accumulated whole pulses
        const newCount = prev.pulseCount + pulsesThisStep;

        // Optional fuel burn during driving
        let newAnalog = prev.analogValue;
        if (prev.isAutoConsuming && prev.analogValue > 10) {
          // Distance in km covered in this step
          const distanceKmStep = (speedMps * (intervalMs / 1000)) / 1000;
          // Burned litres = distance / mileage
          const fuelBurnedLitres = distanceKmStep / prev.consumptionRateKmPerL;
          // Convert burned litres back to ADC units (0-1023 represents fuelCapacity litres)
          const adcDelta = (fuelBurnedLitres / configRef.current.fuelCapacity) * 1023;
          newAnalog = Math.max(0, prev.analogValue - adcDelta);
        }

        return {
          ...prev,
          pulseCount: newCount,
          analogValue: newAnalog,
          pulseFrequencyHz: pulsesPerSec,
        };
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [hardware.isDriving, hardware.isMcuPowered]);

  // 2. Arduino loop() execution: runs every loopDelayMs (1000ms by default)
  useEffect(() => {
    if (!hardware.isMcuPowered || hardware.bootStep !== 'ready') return;

    const loopTimer = setInterval(() => {
      const curTelem = telemetryRef.current;
      const curHw = hardwareRef.current;

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(
        Math.floor(now.getMilliseconds() / 100)
      )}`;

      // Push to Serial Monitor if not paused
      if (!isSerialPausedRef.current) {
        const newEntry: SerialLogEntry = {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: timeStr,
          fuelPercent: curTelem.fuelPercent,
          fuelLitres: curTelem.fuelLevelLiters,
          distanceKm: curTelem.distanceKm,
          mileageKmPerL: curTelem.mileageKmPerL,
          rawText: curTelem.serialLine,
        };

        setSerialLogs((prev) => [...prev.slice(-120), newEntry]);
      }

      // Record to time-series chart history
      setTelemetryHistory((prev) => {
        const elapsed = prev.length;
        const newPoint: TelemetryHistoryPoint = {
          timeSec: elapsed,
          speedKmh: curHw.isDriving ? curHw.driveSpeedKmh : 0,
          distanceKm: curTelem.distanceKm,
          fuelPercent: curTelem.fuelPercent,
          fuelLiters: curTelem.fuelLevelLiters,
          mileageKmPerL: curTelem.mileageKmPerL,
        };
        return [...prev.slice(-40), newPoint];
      });
    }, config.loopDelayMs);

    return () => clearInterval(loopTimer);
  }, [hardware.isMcuPowered, hardware.bootStep, config.loopDelayMs]);

  // Handlers
  const handleSinglePulse = () => {
    if (!hardware.isMcuPowered) return;
    setHardware((prev) => ({
      ...prev,
      pulseCount: prev.pulseCount + 1,
    }));
  };

  const handleResetPulses = () => {
    setHardware((prev) => ({ ...prev, pulseCount: 0 }));
  };

  const handleToggleDrive = () => {
    setHardware((prev) => ({ ...prev, isDriving: !prev.isDriving }));
  };

  const handleChangeSpeed = (speed: number) => {
    setHardware((prev) => ({ ...prev, driveSpeedKmh: speed }));
  };

  const handleChangeAnalog = (val: number) => {
    setHardware((prev) => ({ ...prev, analogValue: val }));
  };

  const handleQuickFuel = (percent: number) => {
    const adc = Math.round((percent / 100) * 1023);
    setHardware((prev) => ({ ...prev, analogValue: adc }));
  };

  const handleToggleAutoConsume = () => {
    setHardware((prev) => ({ ...prev, isAutoConsuming: !prev.isAutoConsuming }));
  };

  const handleTogglePower = () => {
    setHardware((prev) => {
      const nextPower = !prev.isMcuPowered;
      return {
        ...prev,
        isMcuPowered: nextPower,
        bootStep: nextPower ? 'booting' : 'off',
        isDriving: nextPower ? prev.isDriving : false,
      };
    });

    if (!hardware.isMcuPowered) {
      setTimeout(() => {
        setHardware((prev) => ({ ...prev, bootStep: 'ready' }));
      }, 2000);
    }
  };

  const handleResetMcu = () => {
    if (!hardware.isMcuPowered) return;
    setHardware((prev) => ({ ...prev, bootStep: 'booting' }));
    setTimeout(() => {
      setHardware((prev) => ({ ...prev, bootStep: 'ready' }));
    }, 2000);
  };

  const handleToggleBacklight = () => {
    setHardware((prev) => ({ ...prev, isLcdBacklightOn: !prev.isLcdBacklightOn }));
  };

  const handleChangeLcdTheme = (theme: 'blue' | 'green' | 'amber') => {
    setHardware((prev) => ({ ...prev, lcdTheme: theme }));
  };

  const handleChangeContrast = (contrast: number) => {
    setHardware((prev) => ({ ...prev, lcdContrast: contrast }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ---------------- 1. TOP BAR CONTRACT ---------------- */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <a href="/" className="text-base sm:text-lg font-bold tracking-tight text-slate-100 hover:text-cyan-400 transition-colors flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>PetrolMeter Lab</span>
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('console')}
            className={`transition-colors hover:text-slate-100 ${
              activeTab === 'console' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : ''
            }`}
          >
            Dashboard & LCD
          </button>
          <button
            onClick={() => setActiveTab('sensors')}
            className={`transition-colors hover:text-slate-100 ${
              activeTab === 'sensors' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : ''
            }`}
          >
            Sensors & Drive Lab
          </button>
          <button
            onClick={() => setActiveTab('schematic')}
            className={`transition-colors hover:text-slate-100 ${
              activeTab === 'schematic' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : ''
            }`}
          >
            Circuit & Pinout
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`transition-colors hover:text-slate-100 ${
              activeTab === 'charts' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : ''
            }`}
          >
            Live Waveforms
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`transition-colors hover:text-slate-100 ${
              activeTab === 'code' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : ''
            }`}
          >
            Arduino Code & Export
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          {/* Quick Drive Button */}
          <button
            onClick={handleToggleDrive}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              hardware.isDriving
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
            }`}
          >
            {hardware.isDriving ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{hardware.isDriving ? 'Stop Trip' : 'Simulate Drive'}</span>
          </button>

          {/* Quick Reset MCU */}
          <button
            onClick={handleResetMcu}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Reboot MCU / Run setup()"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ---------------- 2. MAIN WORKSPACE CONTAINER ---------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Project Intro & System Metadata Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-semibold text-slate-100">Arduino Sketch:</span>
            <span className="font-mono text-cyan-400">Petrol Meter & Real-Time Mileage Computer</span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-slate-400">IR INT0 (Pin 2)</span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-slate-400">Fuel A0</span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-slate-400">I2C LCD 1602 ({config.i2cAddress})</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  hardware.isMcuPowered
                    ? hardware.bootStep === 'ready'
                      ? 'bg-emerald-400'
                      : 'bg-amber-400 animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
              <span>
                {hardware.isMcuPowered
                  ? hardware.bootStep === 'ready'
                    ? 'MCU RUNNING'
                    : 'BOOTING...'
                  : 'MCU POWER OFF'}
              </span>
            </div>
            <span>·</span>
            <span>Wheel: {config.wheelCircumference.toFixed(2)}m</span>
            <span>·</span>
            <span>Tank: {config.fuelCapacity.toFixed(1)}L</span>
          </div>
        </div>

        {/* ----------------- SECTION 1: HARDWARE LCD 16x2 DIGITAL TWIN ----------------- */}
        <section aria-label="LiquidCrystal Display Section">
          <Lcd1602Display
            hardware={hardware}
            row0Text={telemetry.lcdRow0}
            row1Text={telemetry.lcdRow1}
            i2cAddress={config.i2cAddress}
            onTogglePower={handleTogglePower}
            onResetMcu={handleResetMcu}
            onToggleBacklight={handleToggleBacklight}
            onChangeTheme={handleChangeLcdTheme}
            onChangeContrast={handleChangeContrast}
          />
        </section>

        {/* ----------------- SECTION 2: TELEMETRY KPI METRICS & CALCULATIONS ----------------- */}
        <section aria-label="Live Telemetry Stats">
          <TelemetryStats
            telemetry={telemetry}
            config={config}
            onChangePrice={(p) => setConfig({ ...config, fuelPricePerLiter: p })}
            onChangeCurrency={(c) => setConfig({ ...config, currencySymbol: c })}
          />
        </section>

        {/* ----------------- SECTION 3: SENSORS HARDWARE LAB ----------------- */}
        <section aria-label="Virtual Sensors Lab">
          <HardwareSensors
            config={config}
            hardware={hardware}
            telemetry={telemetry}
            onSinglePulse={handleSinglePulse}
            onResetPulses={handleResetPulses}
            onToggleDrive={handleToggleDrive}
            onChangeSpeed={handleChangeSpeed}
            onChangeAnalog={handleChangeAnalog}
            onQuickFuel={handleQuickFuel}
            onToggleAutoConsume={handleToggleAutoConsume}
            onChangeWheelCircumference={(circ) => setConfig({ ...config, wheelCircumference: circ })}
            onChangeFuelCapacity={(cap) => setConfig({ ...config, fuelCapacity: cap })}
          />
        </section>

        {/* ----------------- SECTION 4: SERIAL MONITOR & REAL-TIME LOGS ----------------- */}
        <section aria-label="Arduino Serial Monitor">
          <SerialMonitor
            logs={serialLogs}
            isPaused={isSerialPaused}
            onTogglePause={() => setIsSerialPaused(!isSerialPaused)}
            onClear={() => setSerialLogs([])}
            baudRate={baudRate}
            onChangeBaud={(b) => setBaudRate(b)}
          />
        </section>

        {/* ----------------- SECTION 5: LIVE TIME-SERIES TELEMETRY CURVES ----------------- */}
        <section aria-label="Telemetry Charts">
          <TripTelemetryChart history={telemetryHistory} />
        </section>

        {/* ----------------- SECTION 6: CIRCUIT SCHEMATIC & PINOUT MAP ----------------- */}
        <section aria-label="Hardware Circuit Schematic">
          <CircuitDiagram
            hardware={hardware}
            telemetry={telemetry}
            config={config}
          />
        </section>

        {/* ----------------- SECTION 7: ARDUINO CODE & INO EXPORTER ----------------- */}
        <section aria-label="Arduino Code Inspector">
          <CodeInspector
            config={config}
            onChangeConfig={(newCfg) => setConfig(newCfg)}
          />
        </section>
      </main>

      {/* ----------------- FOOTER ----------------- */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Arduino Petrol Meter Simulator</span>
            <span>·</span>
            <span>IR Wheel Counter & Analog Fuel Gauge</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>LiquidCrystal_I2C 0x27</span>
            <span>·</span>
            <span>ATmega328P</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

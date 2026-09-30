import React, { useState } from 'react';
import { Code, Copy, Download, Check, Sparkles, BookOpen, Settings } from 'lucide-react';
import { DeviceConfig } from '../types';
import { generateArduinoCode } from '../utils/arduinoLogic';

interface CodeInspectorProps {
  config: DeviceConfig;
  onChangeConfig: (newConfig: DeviceConfig) => void;
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({
  config,
  onChangeConfig,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'tuning' | 'docs'>('code');

  const generatedCode = generateArduinoCode(config);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadIno = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Petrol_Meter.ino';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Top Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-100">Arduino Sketch (.ino)</span>
          </div>

          <div className="flex items-center p-0.5 bg-slate-900 rounded border border-slate-800">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'code'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sketch Code
            </button>
            <button
              onClick={() => setActiveTab('tuning')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'tuning'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hardware Tuning
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'docs'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Engineering Guide
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors text-xs font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <button
            onClick={handleDownloadIno}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors text-xs font-medium shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Petrol_Meter.ino</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Code View */}
      {activeTab === 'code' && (
        <div className="relative p-4 bg-slate-950 overflow-x-auto max-h-[500px] custom-scrollbar">
          <pre className="font-code text-xs text-slate-300 leading-relaxed">
            <code>
              {generatedCode.split('\n').map((line, idx) => {
                // Syntax coloring highlighting
                const isComment = line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*');
                const isInclude = line.trim().startsWith('#include');
                const isType = line.includes('volatile') || line.includes('float') || line.includes('const int') || line.includes('void');

                let lineStyle = 'text-slate-300';
                if (isComment) lineStyle = 'text-slate-500 italic';
                else if (isInclude) lineStyle = 'text-indigo-400 font-semibold';
                else if (isType) lineStyle = 'text-cyan-300';

                return (
                  <div key={idx} className="flex hover:bg-slate-900/60 rounded px-1">
                    <span className="w-8 shrink-0 text-slate-600 select-none font-mono text-[11px] text-right pr-3">
                      {idx + 1}
                    </span>
                    <span className={lineStyle}>{line}</span>
                  </div>
                );
              })}
            </code>
          </pre>
        </div>
      )}

      {/* Tab 2: Calibration & Hardware Tuning */}
      {activeTab === 'tuning' && (
        <div className="p-6 bg-slate-950 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs text-slate-400">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>Customize Arduino parameters and export directly to your board</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Wheel circumference input */}
            <div className="space-y-2 bg-slate-900/70 p-4 rounded-lg border border-slate-800">
              <label className="font-semibold text-slate-200 block">
                Wheel Circumference (meters)
              </label>
              <p className="text-slate-400 text-[11px]">
                Measures the distance covered per single interrupt pulse from the IR sensor.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="5.0"
                  value={config.wheelCircumference}
                  onChange={(e) =>
                    onChangeConfig({ ...config, wheelCircumference: Number(e.target.value) })
                  }
                  className="w-24 bg-slate-800 text-cyan-300 font-mono text-sm px-2.5 py-1 rounded border border-slate-700"
                />
                <span className="font-mono text-slate-400">meters / pulse</span>
              </div>
            </div>

            {/* Fuel capacity input */}
            <div className="space-y-2 bg-slate-900/70 p-4 rounded-lg border border-slate-800">
              <label className="font-semibold text-slate-200 block">
                Fuel Tank Capacity (Litres)
              </label>
              <p className="text-slate-400 text-[11px]">
                The usable fuel capacity of your fuel tank or reservoir.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="120"
                  value={config.fuelCapacity}
                  onChange={(e) =>
                    onChangeConfig({ ...config, fuelCapacity: Number(e.target.value) })
                  }
                  className="w-24 bg-slate-800 text-amber-300 font-mono text-sm px-2.5 py-1 rounded border border-slate-700"
                />
                <span className="font-mono text-slate-400">Litres</span>
              </div>
            </div>

            {/* I2C Address */}
            <div className="space-y-2 bg-slate-900/70 p-4 rounded-lg border border-slate-800">
              <label className="font-semibold text-slate-200 block">
                I2C LCD Module Address
              </label>
              <p className="text-slate-400 text-[11px]">
                PCF8574 modules are usually 0x27; PCF8574A modules are 0x3F.
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={config.i2cAddress}
                  onChange={(e) => onChangeConfig({ ...config, i2cAddress: e.target.value })}
                  className="bg-slate-800 text-slate-200 font-mono text-sm px-3 py-1 rounded border border-slate-700"
                >
                  <option value="0x27">0x27 (Default PCF8574)</option>
                  <option value="0x3F">0x3F (PCF8574A chip)</option>
                  <option value="0x20">0x20</option>
                  <option value="0x38">0x38</option>
                </select>
              </div>
            </div>

            {/* Invert Fuel Sensor Toggle */}
            <div className="space-y-2 bg-slate-900/70 p-4 rounded-lg border border-slate-800">
              <label className="font-semibold text-slate-200 block">
                Fuel Sensor Polarity
              </label>
              <p className="text-slate-400 text-[11px]">
                Toggle if your float resistance decreases when full (common in automotive senders).
              </p>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={config.invertFuelSensor}
                  onChange={(e) =>
                    onChangeConfig({ ...config, invertFuelSensor: e.target.checked })
                  }
                  className="rounded accent-amber-500 bg-slate-800 border-slate-700"
                />
                <span className="text-slate-300">Invert ADC reading (1023 - sensorValue)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Detailed Engineering Guide */}
      {activeTab === 'docs' && (
        <div className="p-6 bg-slate-950 space-y-5 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h4 className="font-semibold text-slate-100">
              Technical Analysis of the Arduino Implementation
            </h4>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
              <h5 className="font-semibold text-cyan-300">
                1. Why is `volatile unsigned long pulseCount` used?
              </h5>
              <p className="text-slate-400">
                Variables shared between an Interrupt Service Routine (ISR) like{' '}
                <code className="text-slate-200">countPulse()</code> and main execution loop must be
                qualified with <code className="text-slate-200">volatile</code>. This prevents the
                compiler from optimizing the variable into a CPU register, ensuring the latest pulse
                value is read directly from SRAM in every loop cycle.
              </p>
            </div>

            <div className="p-3.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
              <h5 className="font-semibold text-cyan-300">
                2. Why `pinMode(irSensor, INPUT_PULLUP)` and `FALLING`?
              </h5>
              <p className="text-slate-400">
                ATmega328P has internal 20kΩ pull-up resistors. By using{' '}
                <code className="text-slate-200">INPUT_PULLUP</code>, you avoid needing an external
                physical resistor on the breadboard. When the IR phototransistor or magnet triggers,
                it connects the pin to GND, creating a crisp falling edge that fires the hardware
                interrupt instantly.
              </p>
            </div>

            <div className="p-3.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
              <h5 className="font-semibold text-cyan-300">
                3. The Secret of `+ 0.01` in the Mileage Calculation
              </h5>
              <p className="text-slate-400">
                Formula:{' '}
                <code className="text-emerald-300">
                  mileage = distanceKm / (fuelCapacity - fuelLevel + 0.01);
                </code>
                <br />
                When you fill the tank 100%, <code className="text-slate-200">fuelCapacity - fuelLevel = 0</code>.
                Without <code className="text-slate-200">+ 0.01</code>, division by zero would occur,
                resulting in <code className="text-rose-400">inf</code> or <code className="text-rose-400">ovf</code>{' '}
                on the 16x2 LCD! The 0.01 epsilon keeps the denominator safely non-zero.
              </p>
            </div>

            <div className="p-3.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
              <h5 className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recommended Real-World Enhancements</span>
              </h5>
              <ul className="list-disc list-inside text-slate-400 space-y-1 pt-1">
                <li>
                  <strong className="text-slate-200">Fuel Slosh Filtering:</strong> Vehicle fuel
                  sloshes when turning and braking. Adding a simple moving average (e.g. 10-sample
                  exponential smoothing filter) stops the fuel percentage from jumping.
                </li>
                <li>
                  <strong className="text-slate-200">Odometer EEPROM Persistence:</strong> Using{' '}
                  <code className="text-slate-200">EEPROM.put()</code> allows saving distance every
                  few kilometers so total mileage survives vehicle ignition shutoff.
                </li>
                <li>
                  <strong className="text-slate-200">Software Debounce:</strong> Check{' '}
                  <code className="text-slate-200">micros() - lastInterruptTime &gt; 5000</code> in
                  ISR to prevent multiple triggers from mechanical switch bounce or optical noise.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

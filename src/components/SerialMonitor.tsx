import React, { useRef, useEffect } from 'react';
import { Terminal, Copy, Download, Trash2, Pause, Play, Check } from 'lucide-react';
import { SerialLogEntry } from '../types';

interface SerialMonitorProps {
  logs: SerialLogEntry[];
  isPaused: boolean;
  onTogglePause: () => void;
  onClear: () => void;
  baudRate: number;
  onChangeBaud: (baud: number) => void;
}

export const SerialMonitor: React.FC<SerialMonitorProps> = ({
  logs,
  isPaused,
  onTogglePause,
  onClear,
  baudRate,
  onChangeBaud,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleCopy = () => {
    const text = logs.map((l) => `[${l.timestamp}] ${l.rawText}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    const headers = 'Timestamp,Fuel_Percent,Fuel_Litres,Distance_KM,Mileage_KM_L\n';
    const rows = logs
      .map(
        (l) =>
          `"${l.timestamp}",${l.fuelPercent},${l.fuelLitres},${l.distanceKm},${l.mileageKmPerL}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `petrol_meter_telemetry_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col h-[400px]">
      {/* Serial Monitor Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">Arduino Serial Monitor</span>
          <span className="font-mono text-[11px] text-slate-400">· COM3 / dev/ttyUSB0</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Baud rate */}
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-400 font-mono">Baud:</span>
            <select
              value={baudRate}
              onChange={(e) => onChangeBaud(Number(e.target.value))}
              className="bg-slate-800 text-emerald-400 font-mono px-2 py-0.5 rounded border border-slate-700 text-xs focus:outline-none"
            >
              <option value="4800">4800 baud</option>
              <option value="9600">9600 baud (code)</option>
              <option value="19200">19200 baud</option>
              <option value="115200">115200 baud</option>
            </select>
          </div>

          {/* Autoscroll checkbox */}
          <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded accent-emerald-500 bg-slate-800 border-slate-700"
            />
            <span>Autoscroll</span>
          </label>

          {/* Pause / Resume */}
          <button
            onClick={onTogglePause}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Copy logs */}
          <button
            onClick={handleCopy}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors"
            title="Copy logs to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            disabled={logs.length === 0}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors"
            title="Export CSV Telemetry"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear */}
          <button
            onClick={onClear}
            className="p-1.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 rounded border border-slate-700 transition-colors"
            title="Clear Monitor"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div
        ref={scrollRef}
        className="flex-1 p-3.5 bg-slate-950 font-code text-xs overflow-y-auto custom-scrollbar space-y-1 select-text"
      >
        {logs.length === 0 ? (
          <div className="text-slate-600 italic py-8 text-center select-none">
            --- Serial output stream idle. Power on MCU to receive telemetry packets ---
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-baseline gap-2 leading-relaxed hover:bg-slate-900/60 rounded px-1">
              <span className="text-slate-500 text-[11px] select-none shrink-0 font-mono">
                [{log.timestamp}]
              </span>
              <span className="text-slate-300 font-mono whitespace-pre-wrap break-all">
                <span className="text-amber-400">Fuel: </span>
                <span className="text-slate-100 font-bold">{log.fuelPercent}%</span>
                <span className="text-slate-500"> | </span>
                <span className="text-amber-300">Fuel Litres: </span>
                <span className="text-slate-100 font-bold">{log.fuelLitres.toFixed(1)} L</span>
                <span className="text-slate-500"> | </span>
                <span className="text-cyan-400">Distance: </span>
                <span className="text-slate-100 font-bold">{log.distanceKm.toFixed(1)} KM</span>
                <span className="text-slate-500"> | </span>
                <span className="text-emerald-400">Mileage: </span>
                <span className="text-emerald-300 font-bold">{log.mileageKmPerL.toFixed(2)} KM/L</span>
              </span>
            </div>
          ))
        )}
      </div>

      {/* Terminal Footer status */}
      <div className="px-4 py-1.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>9600-8-N-1 · Line Ending: Both NL & CR</span>
        </div>
        <span>{logs.length} packet{logs.length === 1 ? '' : 's'} recorded</span>
      </div>
    </div>
  );
};

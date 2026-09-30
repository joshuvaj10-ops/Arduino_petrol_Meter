import React from 'react';
import { Sun, Moon, RotateCcw, Power, Sliders, Cpu } from 'lucide-react';
import { HardwareState } from '../types';

interface Lcd1602DisplayProps {
  hardware: HardwareState;
  row0Text: string;
  row1Text: string;
  i2cAddress: string;
  onTogglePower: () => void;
  onResetMcu: () => void;
  onToggleBacklight: () => void;
  onChangeTheme: (theme: 'blue' | 'green' | 'amber') => void;
  onChangeContrast: (contrast: number) => void;
}

export const Lcd1602Display: React.FC<Lcd1602DisplayProps> = ({
  hardware,
  row0Text,
  row1Text,
  i2cAddress,
  onTogglePower,
  onResetMcu,
  onToggleBacklight,
  onChangeTheme,
  onChangeContrast,
}) => {
  const { isMcuPowered, isLcdBacklightOn, lcdTheme, lcdContrast, bootStep } = hardware;

  // Determine LCD colors based on theme & backlight state
  const getThemeStyles = () => {
    if (!isMcuPowered || !isLcdBacklightOn) {
      return {
        screenBg: 'bg-slate-900',
        activeTextColor: 'text-slate-600',
        inactiveCellBg: 'text-slate-800/20',
        borderGlow: 'border-slate-800',
        ambientGlow: 'shadow-inner',
      };
    }

    if (lcdTheme === 'blue') {
      return {
        screenBg: 'bg-[#0a3594]',
        activeTextColor: 'text-[#e0f2fe]',
        inactiveCellBg: 'text-[#1e4cb8]/30',
        borderGlow: 'border-[#1e4cb8]/60 shadow-[0_0_24px_rgba(14,165,233,0.25)]',
        ambientGlow: 'shadow-[inset_0_0_30px_rgba(2,132,199,0.35)]',
      };
    }

    if (lcdTheme === 'green') {
      return {
        screenBg: 'bg-[#65a30d]',
        activeTextColor: 'text-[#142304]',
        inactiveCellBg: 'text-[#4d7c0f]/35',
        borderGlow: 'border-[#4d7c0f]/60 shadow-[0_0_24px_rgba(132,204,22,0.25)]',
        ambientGlow: 'shadow-[inset_0_0_30px_rgba(77,124,15,0.4)]',
      };
    }

    // amber
    return {
      screenBg: 'bg-[#854d0e]',
      activeTextColor: 'text-[#1c1204]',
      inactiveCellBg: 'text-[#713f12]/35',
      borderGlow: 'border-[#713f12]/60 shadow-[0_0_24px_rgba(245,158,11,0.25)]',
      ambientGlow: 'shadow-[inset_0_0_30px_rgba(180,83,9,0.4)]',
    };
  };

  const themeStyle = getThemeStyles();

  // Render text for line 0 and line 1
  let displayLine0 = '                ';
  let displayLine1 = '                ';

  if (isMcuPowered) {
    if (bootStep === 'booting') {
      displayLine0 = 'Petrol Meter    ';
      displayLine1 = 'Starting...     ';
    } else if (bootStep === 'ready') {
      displayLine0 = row0Text.padEnd(16, ' ').slice(0, 16);
      displayLine1 = row1Text.padEnd(16, ' ').slice(0, 16);
    }
  }

  // Calculate contrast opacity for active characters
  const contrastFactor = Math.max(0.15, Math.min(1.0, lcdContrast / 75));

  const renderLcdLine = (text: string) => {
    const chars = text.split('');
    return (
      <div className="flex justify-between items-center gap-[2px]">
        {chars.map((char, idx) => (
          <div
            key={idx}
            className="relative flex-1 aspect-[5/8] flex items-center justify-center rounded-[1px] select-none text-center"
            style={{ minWidth: '13px' }}
          >
            {/* Subtle background matrix placeholder for inactive segments */}
            <span
              className={`absolute inset-0 flex items-center justify-center font-lcd text-xs md:text-sm ${themeStyle.inactiveCellBg} pointer-events-none select-none`}
            >
              8
            </span>
            {/* Active character */}
            <span
              className={`relative z-10 font-lcd text-sm md:text-base font-semibold leading-none ${themeStyle.activeTextColor}`}
              style={{
                opacity: char === ' ' ? 0 : contrastFactor,
                textShadow:
                  isLcdBacklightOn && isMcuPowered
                    ? lcdTheme === 'blue'
                      ? '0 0 4px rgba(224, 242, 254, 0.6)'
                      : '0 0 2px rgba(0, 0, 0, 0.4)'
                    : 'none',
              }}
            >
              {char}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
      {/* Header bar of LCD module */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 font-code text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>HD44780 1602A + PCF8574</span>
          </div>
          <span className="font-code text-slate-400">Addr: {i2cAddress}</span>
        </div>

        {/* Quick LCD Control Actions */}
        <div className="flex items-center gap-1.5">
          {/* Backlight toggle */}
          <button
            onClick={onToggleBacklight}
            disabled={!isMcuPowered}
            title={isLcdBacklightOn ? 'Turn Backlight Off (lcd.noBacklight())' : 'Turn Backlight On (lcd.backlight())'}
            className={`p-1.5 rounded text-xs transition-colors ${
              isLcdBacklightOn && isMcuPowered
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
          >
            {isLcdBacklightOn ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Reset MCU */}
          <button
            onClick={onResetMcu}
            disabled={!isMcuPowered}
            title="Reset Microcontroller (Re-run setup())"
            className="p-1.5 rounded text-xs bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Power toggle */}
          <button
            onClick={onTogglePower}
            title={isMcuPowered ? 'Cut 5V Power' : 'Supply 5V Power'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              isMcuPowered
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            <Power className="w-3 h-3" />
            <span>{isMcuPowered ? '5V ON' : 'POWER OFF'}</span>
          </button>
        </div>
      </div>

      {/* Physical LCD Bezel and Glass */}
      <div className="relative mx-auto max-w-xl p-3 bg-gradient-to-b from-slate-800 to-slate-950 rounded-lg border-2 border-slate-700 shadow-xl">
        {/* PCB Silkscreen & 4 Screws */}
        <div className="absolute top-1.5 left-2 text-[9px] font-code text-slate-500 select-none tracking-wider">
          QC PASS · 16x2 I2C
        </div>
        <div className="absolute top-1.5 right-2 text-[9px] font-code text-slate-500 select-none">
          REV 1.3
        </div>

        {/* Screw holes */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full border border-slate-600 bg-slate-800 pointer-events-none" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full border border-slate-600 bg-slate-800 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full border border-slate-600 bg-slate-800 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-slate-600 bg-slate-800 pointer-events-none" />

        {/* Screen Bezel / Metallic Frame */}
        <div className="my-2 p-3 sm:p-4 bg-slate-950 rounded-md border border-slate-800 shadow-inner">
          {/* Active Liquid Crystal Glass Area */}
          <div
            className={`relative p-3 sm:p-4 rounded transition-all duration-300 ${themeStyle.screenBg} ${themeStyle.borderGlow} ${themeStyle.ambientGlow} border overflow-hidden`}
          >
            {/* Subtle LCD dot grid texture */}
            <div className="absolute inset-0 lcd-grid-pattern opacity-40 pointer-events-none" />

            {/* Display Lines */}
            <div className="relative z-10 space-y-2 py-1">
              {/* Row 0 */}
              <div className="bg-black/10 rounded px-1.5 py-1">
                {renderLcdLine(displayLine0)}
              </div>
              {/* Row 1 */}
              <div className="bg-black/10 rounded px-1.5 py-1">
                {renderLcdLine(displayLine1)}
              </div>
            </div>

            {/* Glass Glare Sheen Reflection */}
            <div className="absolute -top-12 -left-12 w-48 h-36 bg-white/5 rotate-25 blur-sm pointer-events-none" />
          </div>
        </div>

        {/* I2C Backpack & Trimmer Potentiometer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400">
          {/* Theme selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-400">Backlight:</span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-800/80 rounded border border-slate-700/60">
              <button
                onClick={() => onChangeTheme('blue')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  lcdTheme === 'blue'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Blue
              </button>
              <button
                onClick={() => onChangeTheme('green')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  lcdTheme === 'green'
                    ? 'bg-lime-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Green
              </button>
              <button
                onClick={() => onChangeTheme('amber')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  lcdTheme === 'amber'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Amber
              </button>
            </div>
          </div>

          {/* Contrast Trimmer Potentiometer */}
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-mono text-slate-400">Contrast (10k Trimmer):</span>
            <input
              type="range"
              min="20"
              max="100"
              value={lcdContrast}
              onChange={(e) => onChangeContrast(Number(e.target.value))}
              className="w-20 sm:w-24 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="font-code text-[11px] text-slate-300 w-8">{lcdContrast}%</span>
          </div>

          {/* I2C Pins indicator */}
          <div className="flex items-center gap-1 text-[10px] font-code">
            <span className="text-emerald-400">GND</span>
            <span className="text-slate-600">·</span>
            <span className="text-red-400">VCC</span>
            <span className="text-slate-600">·</span>
            <span className="text-cyan-400">SDA (A4)</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400">SCL (A5)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

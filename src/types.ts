export interface DeviceConfig {
  wheelCircumference: number; // in meters (default 2.0)
  fuelCapacity: number; // in litres (default 5.0)
  i2cAddress: string; // '0x27' | '0x3F'
  irPin: number; // Pin 2
  fuelPin: string; // Pin A0
  loopDelayMs: number; // 1000ms
  invertFuelSensor: boolean;
  fuelPricePerLiter: number; // e.g. 1.50
  currencySymbol: string; // '$', '€', '₹', '£'
}

export interface HardwareState {
  pulseCount: number;
  analogValue: number; // 0 to 1023
  isDriving: boolean;
  driveSpeedKmh: number; // 0 to 160
  isAutoConsuming: boolean;
  consumptionRateKmPerL: number; // baseline expected vehicle economy (e.g. 40 km/l)
  isMcuPowered: boolean;
  isLcdBacklightOn: boolean;
  lcdTheme: 'blue' | 'green' | 'amber';
  lcdContrast: number; // 0 to 100
  bootStep: 'off' | 'booting' | 'ready';
  lastPulseTimestamp: number;
  pulseFrequencyHz: number;
}

export interface CalculatedTelemetry {
  distanceMeters: number;
  distanceKm: number;
  fuelPercent: number;
  fuelLevelLiters: number;
  fuelConsumedLiters: number;
  mileageKmPerL: number;
  mileageMpgUs: number;
  mileageLPer100Km: number;
  estimatedRangeKm: number;
  analogVoltage: number;
  lcdRow0: string;
  lcdRow1: string;
  serialLine: string;
}

export interface SerialLogEntry {
  id: string;
  timestamp: string;
  fuelPercent: number;
  fuelLitres: number;
  distanceKm: number;
  mileageKmPerL: number;
  rawText: string;
}

export interface TelemetryHistoryPoint {
  timeSec: number;
  speedKmh: number;
  distanceKm: number;
  fuelPercent: number;
  fuelLiters: number;
  mileageKmPerL: number;
}

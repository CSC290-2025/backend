// source/traffic/services/timing.service.ts
import type { TrafficLightCycleConfig, DensityLevel } from '../types';

/**
 * Traffic Light Timing Calculation Service
 * Calculates optimal traffic light timing based on traffic density
 */

// Base timing configuration (in seconds)
const BASE_TIMING = {
  yellow: 3, // Yellow light is typically constant
  minGreen: 15, // Minimum green light duration
  maxGreen: 90, // Maximum green light duration
  minRed: 20, // Minimum red light duration
  maxRed: 120, // Maximum red light duration
};

/**
 * Calculate traffic light timing based on density level
 * Higher density = longer green time to clear more vehicles
 */
const calculateTimingByDensity = (
  densityLevel: number
): TrafficLightCycleConfig => {
  let greenDuration: number;
  let redDuration: number;

  switch (densityLevel) {
    case 1: // LOW - minimal traffic
      greenDuration = 20;
      redDuration = 40;
      break;

    case 2: // MODERATE - normal traffic
      greenDuration = 35;
      redDuration = 50;
      break;

    case 3: // HIGH - heavy traffic
      greenDuration = 60;
      redDuration = 60;
      break;

    case 4: // SEVERE - very heavy traffic
      greenDuration = 75;
      redDuration = 45; // Shorter red to move traffic faster
      break;

    default:
      greenDuration = 30;
      redDuration = 45;
  }

  const yellowDuration = BASE_TIMING.yellow;
  const totalCycle = greenDuration + yellowDuration + redDuration;

  return {
    greenDuration,
    yellowDuration,
    redDuration,
    totalCycle,
  };
};

/**
 * Calculate timing based on vehicle count estimate
 * More vehicles = longer green time
 */
const calculateTimingByVehicleCount = (
  vehicleCount: number
): TrafficLightCycleConfig => {
  // Assume each vehicle needs ~2 seconds to pass
  const secondsNeeded = vehicleCount * 2;

  // Calculate green duration with bounds
  const greenDuration = Math.max(
    BASE_TIMING.minGreen,
    Math.min(secondsNeeded, BASE_TIMING.maxGreen)
  );

  // Red duration is inversely proportional to green
  // When one direction has high traffic, give it more green time
  const redDuration = Math.max(
    BASE_TIMING.minRed,
    Math.min(90 - (greenDuration - 30), BASE_TIMING.maxRed)
  );

  const yellowDuration = BASE_TIMING.yellow;
  const totalCycle = greenDuration + yellowDuration + redDuration;

  return {
    greenDuration,
    yellowDuration,
    redDuration,
    totalCycle,
  };
};

/**
 * Calculate timing based on traffic speed
 * Slower speed = more congestion = longer green time
 */
const calculateTimingBySpeed = (speedKmh: number): TrafficLightCycleConfig => {
  let densityLevel: number;

  if (speedKmh >= 40) {
    densityLevel = 1; // LOW
  } else if (speedKmh >= 25) {
    densityLevel = 2; // MODERATE
  } else if (speedKmh >= 15) {
    densityLevel = 3; // HIGH
  } else {
    densityLevel = 4; // SEVERE
  }

  return calculateTimingByDensity(densityLevel);
};

/**
 * Calculate adaptive timing considering multiple factors
 */
const calculateAdaptiveTiming = (params: {
  densityLevel: number;
  vehicleCount?: number;
  speedKmh?: number;
  timeOfDay?: Date;
}): TrafficLightCycleConfig => {
  const { densityLevel, vehicleCount, speedKmh, timeOfDay } = params;

  // Start with density-based calculation
  const timing = calculateTimingByDensity(densityLevel);

  // Adjust based on time of day (rush hour vs off-peak)
  if (timeOfDay) {
    const hour = timeOfDay.getHours();
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);

    if (isRushHour) {
      // Extend green time during rush hour
      timing.greenDuration = Math.min(
        timing.greenDuration * 1.2,
        BASE_TIMING.maxGreen
      );
      timing.totalCycle =
        timing.greenDuration + timing.yellowDuration + timing.redDuration;
    }
  }

  // Fine-tune based on speed if available
  if (speedKmh !== undefined && speedKmh < 20) {
    // Very slow traffic - increase green slightly
    timing.greenDuration = Math.min(
      timing.greenDuration + 10,
      BASE_TIMING.maxGreen
    );
    timing.totalCycle =
      timing.greenDuration + timing.yellowDuration + timing.redDuration;
  }

  return timing;
};

/**
 * Calculate timing for intersection with multiple traffic lights
 * Ensures coordinated timing to prevent gridlock
 */
const calculateCoordinatedTiming = (
  trafficLights: Array<{ id: number; densityLevel: number }>
): Map<number, TrafficLightCycleConfig> => {
  const timingMap = new Map<number, TrafficLightCycleConfig>();

  // Find the highest density to set base cycle time
  const maxDensity = Math.max(...trafficLights.map((tl) => tl.densityLevel));
  const baseTiming = calculateTimingByDensity(maxDensity);

  // Ensure all lights have synchronized cycle time
  for (const light of trafficLights) {
    const individualTiming = calculateTimingByDensity(light.densityLevel);

    // Adjust to match base cycle time
    const cycleDiff = baseTiming.totalCycle - individualTiming.totalCycle;

    timingMap.set(light.id, {
      ...individualTiming,
      greenDuration: individualTiming.greenDuration + Math.floor(cycleDiff / 2),
      redDuration: individualTiming.redDuration + Math.ceil(cycleDiff / 2),
      totalCycle: baseTiming.totalCycle,
    });
  }

  return timingMap;
};

/**
 * Get recommended color based on current cycle position
 */
const getRecommendedColor = (
  elapsedSeconds: number,
  timing: TrafficLightCycleConfig
): number => {
  const position = elapsedSeconds % timing.totalCycle;

  if (position < timing.greenDuration) {
    return 3; // GREEN
  } else if (position < timing.greenDuration + timing.yellowDuration) {
    return 2; // YELLOW
  } else {
    return 1; // RED
  }
};

export {
  calculateTimingByDensity,
  calculateTimingByVehicleCount,
  calculateTimingBySpeed,
  calculateAdaptiveTiming,
  calculateCoordinatedTiming,
  getRecommendedColor,
  BASE_TIMING,
};

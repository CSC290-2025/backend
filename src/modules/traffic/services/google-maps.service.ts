// source/services/google-maps.service.ts
import type { GoogleMapsTrafficData, DensityLevel } from '../types';

/**
 * Google Maps API Integration Service
 * Handles traffic density calculations using Google Maps APIs
 */

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const DIRECTIONS_API_URL =
  'https://maps.googleapis.com/maps/api/directions/json';

/**
 * Calculate traffic density using Google Maps Directions API
 * This uses traffic data to estimate congestion levels
 */
const calculateTrafficDensity = async (
  latitude: number,
  longitude: number
): Promise<GoogleMapsTrafficData> => {
  try {
    // Create a small radius around the traffic light to check traffic
    const radiusKm = 0.5; // 500 meters
    const origin = `${latitude},${longitude}`;

    // Create destination points in 4 directions (N, S, E, W)
    const destinations = [
      `${latitude + radiusKm / 111},${longitude}`, // North
      `${latitude - radiusKm / 111},${longitude}`, // South
      `${latitude},${longitude + radiusKm / (111 * Math.cos((latitude * Math.PI) / 180))}`, // East
      `${latitude},${longitude - radiusKm / (111 * Math.cos((latitude * Math.PI) / 180))}`, // West
    ];

    const trafficData: Array<{
      duration: number;
      durationInTraffic: number;
      distance: number;
    }> = [];

    // Query traffic data for each direction
    for (const destination of destinations) {
      const url = `${DIRECTIONS_API_URL}?origin=${origin}&destination=${destination}&departure_time=now&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];

        trafficData.push({
          duration: leg.duration.value, // seconds without traffic
          durationInTraffic:
            leg.duration_in_traffic?.value || leg.duration.value, // seconds with traffic
          distance: leg.distance.value, // meters
        });
      }
    }

    // Calculate average traffic delay ratio
    let totalDelayRatio = 0;
    let totalSpeed = 0;

    for (const data of trafficData) {
      const delayRatio = data.durationInTraffic / data.duration;
      totalDelayRatio += delayRatio;

      // Calculate speed in km/h
      const speedMps = data.distance / data.durationInTraffic;
      const speedKmh = speedMps * 3.6;
      totalSpeed += speedKmh;
    }

    const avgDelayRatio = totalDelayRatio / trafficData.length;
    const avgSpeedKmh = totalSpeed / trafficData.length;

    // Determine congestion level based on delay ratio
    let congestionLevel: GoogleMapsTrafficData['congestionLevel'];
    let density: number;

    if (avgDelayRatio < 1.2) {
      congestionLevel = 'LOW';
      density = 1;
    } else if (avgDelayRatio < 1.5) {
      congestionLevel = 'MODERATE';
      density = 2;
    } else if (avgDelayRatio < 2.0) {
      congestionLevel = 'HIGH';
      density = 3;
    } else {
      congestionLevel = 'SEVERE';
      density = 4;
    }

    return {
      density,
      speedKmh: Math.round(avgSpeedKmh * 100) / 100,
      congestionLevel,
    };
  } catch (error) {
    console.error('Error calculating traffic density:', error);
    // Return default low traffic if API fails
    return {
      density: 1,
      speedKmh: 50,
      congestionLevel: 'LOW',
    };
  }
};

/**
 * Get nearby traffic data using Places API (alternative method)
 */
const getNearbyTrafficData = async (
  latitude: number,
  longitude: number
): Promise<GoogleMapsTrafficData> => {
  // This is a simplified version - in production, you might want to use
  // Google's Traffic Layer or Road API for more accurate data
  return calculateTrafficDensity(latitude, longitude);
};

/**
 * Convert density number to level string
 */
const getDensityLevel = (density: number): DensityLevel => {
  switch (density) {
    case 1:
      return 'LOW';
    case 2:
      return 'MODERATE';
    case 3:
      return 'HIGH';
    case 4:
      return 'SEVERE';
    default:
      return 'LOW';
  }
};

/**
 * Validate Google Maps API key
 */
const validateApiKey = (): boolean => {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === '') {
    console.warn('Google Maps API key not configured');
    return false;
  }
  return true;
};

export {
  calculateTrafficDensity,
  getNearbyTrafficData,
  getDensityLevel,
  validateApiKey,
};

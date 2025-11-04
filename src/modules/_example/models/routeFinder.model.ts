import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const mapVehicleType = (vehicleType: string, lineName: string): string => {
  if (lineName.includes('ARL')) {
    return 'ARL (Airport Rail Link)';
  }
  if (
    lineName.includes('Sukhumvit Line') ||
    lineName.includes('Silom Line') ||
    lineName.includes('BTS')
  ) {
    return 'BTS (Sky Train)';
  }
  if (
    lineName.includes('MRT') ||
    lineName.includes('Blue Line') ||
    lineName.includes('Purple Line')
  ) {
    return 'MRT (Subway)';
  }

  switch (vehicleType) {
    case 'BUS':
      return 'Bus';
    case 'SUBWAY':
      return 'Subway/Metro Rail';
    case 'HEAVY_RAIL':
    case 'TRAIN':
      return 'Train/Heavy Rail';
    case 'FERRY':
      return 'Ferry';
    default:
      return vehicleType;
  }
};

const getStopTypeLabel = (mappedVehicleType: string): string => {
  if (mappedVehicleType.includes('Bus')) return 'Bus Stop';
  if (mappedVehicleType.includes('BTS')) return 'BTS Station';
  if (mappedVehicleType.includes('MRT')) return 'MRT Station (Subway)';
  if (mappedVehicleType.includes('ARL')) return 'ARL Station';
  return 'Stop / Terminal';
};

const extractRouteDetails = (route: any) => {
  if (!route.legs || route.legs.length === 0) return null;

  const leg = route.legs[0];
  const detailedSteps: any[] = [];

  leg.steps.forEach((step: any) => {
    const stepDetail: any = {
      instruction: step.html_instructions.replace(/<\/?b>/g, ''),
      travel_mode: step.travel_mode,
      duration: step.duration.text,
    };

    if (step.travel_mode === 'TRANSIT' && step.transit_details) {
      const transit = step.transit_details;
      const originalLineName = transit.line.name;
      const lineShortName = transit.line.short_name;
      const vehicleType = transit.line.vehicle.type;

      const mappedVehicleType = mapVehicleType(vehicleType, originalLineName);
      stepDetail.vehicle_type = mappedVehicleType;

      let displayLineName = originalLineName;
      if (
        vehicleType === 'BUS' &&
        lineShortName &&
        lineShortName !== originalLineName
      ) {
        displayLineName = `${lineShortName}: ${originalLineName}`;
      }
      stepDetail.line_name = displayLineName;

      const stopTypeLabel = getStopTypeLabel(mappedVehicleType);
      stepDetail.departure_stop_type = stopTypeLabel;
      stepDetail.arrival_stop_type = stopTypeLabel;

      stepDetail.num_stops = transit.num_stops;
      stepDetail.departure_stop = transit.departure_stop.name;
      stepDetail.arrival_stop = transit.arrival_stop.name;
    }

    detailedSteps.push(stepDetail);
  });

  return {
    start_address: leg.start_address,
    end_address: leg.end_address,
    distance: leg.distance,
    duration: leg.duration,
    detailedSteps: detailedSteps,
    fare: route.fare,
  };
};

export const getRoutes = async (
  origin: string,
  destination: string,
  waypoints: string
) => {
  const googleMapsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=${waypoints}&mode=transit&alternatives=true&key=${GOOGLE_API_KEY}`;

  try {
    const response = await axios.get(googleMapsUrl);
    const data = response.data;

    if (data.status === 'OK' && data.routes && data.routes.length > 0) {
      const allRoutes = data.routes;

      const allRoutesSummarized = allRoutes
        .map(extractRouteDetails)
        .filter((route: any) => route !== null);

      const fastestRouteSummary = allRoutesSummarized.reduce(
        (prev: any, current: any) => {
          return prev.duration.value < current.duration.value ? prev : current;
        }
      );

      return {
        allRoutesSummarized: allRoutesSummarized,
        fastestRouteSummary: fastestRouteSummary,
      };
    } else {
      const errorMessage =
        data.error_message ||
        `Google API status: ${data.status || 'UNKNOWN'}. No valid routes found.`;
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error fetching route stops:', error);
    throw error;
  }
};

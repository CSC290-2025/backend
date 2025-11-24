import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_API_KEY = process.env.G16_VITE_GOOGLE_MAPS_API_KEY;

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

  let formattedFare = null;
  if (route.fare) {
    formattedFare = {
      value: route.fare.value,
      currency: route.fare.currency,
      text: route.fare.text,
    };
  }

  return {
    start_address: leg.start_address,
    end_address: leg.end_address,
    distance: leg.distance,
    duration: leg.duration,
    detailedSteps: detailedSteps,
    fare: formattedFare,
    // 🟢 เพิ่ม Polyline เพื่อส่งกลับ Frontend
    overview_polyline: route.overview_polyline,
  };
};

const TRANSIT_TYPES =
  'bus_station|subway_station|train_station|transit_station';

const findNearestTransitStop = async (
  lat: number,
  lng: number
): Promise<string> => {
  const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&type=${TRANSIT_TYPES}&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(nearbySearchUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const nearestStop = data.results[0];
      return nearestStop.name;
    }
    return `${lat},${lng}`;
  } catch (error) {
    return `${lat},${lng}`;
  }
};

/**
 * [แก้ไขแล้ว] ปรับปรุงตรรกะการกำหนด Origin/Destination และแก้ไข Missing Return Path
 * เพื่อป้องกันไม่ให้ฟังก์ชันคืนค่าเป็น undefined
 */
export const getRoutes = async (
  origin: string | undefined,
  origLat: string | undefined,
  origLng: string | undefined,
  destination: string | undefined,
  destLat: string | undefined,
  destLng: string | undefined,
  waypoints: string = ''
) => {
  let finalOrigin = '';
  let finalDestination = '';

  // 1. กำหนด ORIGIN: ใช้ GPS ก่อน แล้วตามด้วยชื่อ
  if (origLat && origLng) {
    finalOrigin = `${origLat},${origLng}`;
  } else if (origin && origin.length > 0) {
    finalOrigin = origin;
  }

  // 2. กำหนด DESTINATION: ใช้ GPS ก่อน แล้วตามด้วยชื่อ
  if (destLat && destLng) {
    finalDestination = `${destLat},${destLng}`;
  } else if (destination && destination.length > 0) {
    finalDestination = destination;
  }

  // 3. ตรวจสอบว่ามี Origin และ Destination หรือไม่
  if (!finalOrigin || !finalDestination) {
    // ในทางปฏิบัติ Controller ได้ตรวจสอบแล้ว แต่ควรมีใน Model เพื่อความปลอดภัย
    throw new Error('Missing Origin or Destination coordinates/name.');
  }

  const encodedOrigin = encodeURIComponent(finalOrigin);
  const encodedDestination = encodeURIComponent(finalDestination);

  const currentTimestamp = Math.floor(Date.now() / 1000);

  const googleMapsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodedOrigin}&destination=${encodedDestination}&waypoints=${waypoints}&mode=transit&alternatives=true&departure_time=${currentTimestamp}&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(googleMapsUrl);
    const data = await response.json();

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

      // 🎯 RETURN PATH 1: ส่งผลลัพธ์ที่ถูกต้อง
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

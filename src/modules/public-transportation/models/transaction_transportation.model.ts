import axios from 'axios';
import prisma from '@/config/client';
import { Decimal } from '@prisma/client/runtime/library';
import { MetroCardService, WalletService } from '@/modules/Financial';

const GOOGLE_API_KEY = process.env.G16_VITE_GOOGLE_MAPS_API_KEY;

// 💡 ฟังก์ชันใหม่: Reverse Geocoding เพื่อดึงชื่อสถานที่จากพิกัด
async function reverseGeocode(lat: string, lng: string): Promise<string> {
  const GEOCODE_URL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
  try {
    const response = await axios.get(GEOCODE_URL);
    const data = response.data;

    if (data.status === 'OK' && data.results.length > 0) {
      // ใช้ formatted_address และตัดเอาส่วนแรก (ชื่อสถานที่หลัก)
      return (
        data.results[0].formatted_address.split(',')[0].trim() ||
        'Location Found'
      );
    }
    return `Coords: ${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
  } catch (error) {
    console.error('Reverse Geocoding Failed:', error);
    // 💡 คืนค่าที่ระบุ Error เพื่อไม่ให้ Promise.all ล้มเหลว
    return 'Location Unknown (API Error)';
  }
}

export const FARE_CONSTANTS = {
  MAX_FARES: {
    BTS: 59.0,
    MRT_BLUE: 42.0,
    MRT_PURPLE: 20.0,
    ARL: 45.0,
    AC_BUS: 25.0,
    BRT: 15.0,
    NON_AC_BUS: 8.0,
    FERRY: 20.0,
  },
  RAIL_FARE_TABLE: {
    BTS: [16, 16, 23, 26, 30, 33, 37, 40, 44, 44, 59, 59, 59, 59, 59, 59],
    MRT_BLUE: [16, 16, 19, 21, 23, 26, 28, 30, 33, 35, 37, 40, 42, 42, 42, 42],
    MRT_PURPLE: [
      14, 17, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
    ],
    ARL: [15, 15, 20, 25, 30, 35, 40, 45, 45, 45, 45, 45, 45, 45, 45, 45],
  },
  ROAD_FARE_RULES: {
    AC_BUS: { base: 15.0, rate: 0.5, max: 25.0 },
    BRT: { base: 15.0, rate: 0.0, max: 15.0 },
    NON_AC_BUS: { base: 8.0, rate: 0.0, max: 8.0 },
    FERRY: { base: 10.0, rate: 0.3, max: 20.0 },
  },
};

async function getActualDistance(
  origLat: string,
  origLng: string,
  destLat: string,
  destLng: string
): Promise<number> {
  const drivingUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origLat},${origLng}&destination=${destLat},${destLng}&mode=driving&key=${GOOGLE_API_KEY}`;
  try {
    const response = await axios.get(drivingUrl);
    const data = response.data;
    if (data.status === 'OK' && data.routes.length > 0) {
      const distanceMeters = data.routes[0].legs[0].distance.value;
      return distanceMeters / 1000;
    }
  } catch (e) {
    console.error('Google Distance API failed:', e);
  }
  return 0;
}

async function getStationCount(
  origLat: string,
  origLng: string,
  destLat: string,
  destLng: string
): Promise<number> {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const transitUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origLat},${origLng}&destination=${destLat},${destLng}&mode=transit&departure_time=${currentTimestamp}&key=${GOOGLE_API_KEY}`;

  try {
    const response = await axios.get(transitUrl);
    const data = response.data;
    if (data.status === 'OK' && data.routes.length > 0) {
      let totalStops = 0;
      const steps = data.routes[0].legs[0].steps;
      steps.forEach((step: any) => {
        if (step.travel_mode === 'TRANSIT' && step.transit_details) {
          totalStops += step.transit_details.num_stops || 0;
        }
      });
      return totalStops;
    }
  } catch (e) {
    console.error('Google Transit Stops API failed:', e);
  }
  return 0;
}

function safelyParseLocation(locationData: any): {
  lat: string;
  lng: string;
  name?: string;
} {
  if (typeof locationData === 'string') {
    return JSON.parse(locationData);
  }
  return locationData;
}

async function calculateSegmentFare(
  startLoc: { lat: string; lng: string },
  endLoc: { lat: string; lng: string },
  vehicleTypeKey: keyof typeof FARE_CONSTANTS.MAX_FARES
): Promise<number> {
  const type = vehicleTypeKey;
  const maxFare = FARE_CONSTANTS.MAX_FARES[type] || 15.0;

  if (
    FARE_CONSTANTS.RAIL_FARE_TABLE[
      type as keyof typeof FARE_CONSTANTS.RAIL_FARE_TABLE
    ]
  ) {
    const stationCount = await getStationCount(
      startLoc.lat,
      startLoc.lng,
      endLoc.lat,
      endLoc.lng
    );
    const fareArray =
      FARE_CONSTANTS.RAIL_FARE_TABLE[
        type as keyof typeof FARE_CONSTANTS.RAIL_FARE_TABLE
      ];

    if (stationCount > 0) {
      const index = Math.min(stationCount, fareArray.length - 1);
      return fareArray[index];
    }
  } else if (
    FARE_CONSTANTS.ROAD_FARE_RULES[
      type as keyof typeof FARE_CONSTANTS.ROAD_FARE_RULES
    ]
  ) {
    const rules =
      FARE_CONSTANTS.ROAD_FARE_RULES[
        type as keyof typeof FARE_CONSTANTS.ROAD_FARE_RULES
      ];
    if (rules.rate === 0) {
      return rules.base;
    }
    const distanceKm = await getActualDistance(
      startLoc.lat,
      startLoc.lng,
      endLoc.lat,
      endLoc.lng
    );
    let actualFare = rules.base + distanceKm * rules.rate;

    if (actualFare > rules.max) {
      actualFare = rules.max;
    }
    return Math.ceil(actualFare);
  }
  return maxFare;
}

async function calculateMultiSegmentFare(
  tapInLocation: any,
  tapOutLocation: any
): Promise<number> {
  const orig = safelyParseLocation(tapInLocation);
  const dest = safelyParseLocation(tapOutLocation);

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const transitUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${orig.lat},${orig.lng}&destination=${dest.lat},${dest.lng}&mode=transit&departure_time=${currentTimestamp}&key=${GOOGLE_API_KEY}`;

  try {
    const response = await axios.get(transitUrl);
    const data = response.data;
    if (data.status === 'OK' && data.routes.length > 0) {
      let totalFare = 0;
      const steps = data.routes[0].legs[0].steps;

      const typeMap: { [key: string]: keyof typeof FARE_CONSTANTS.MAX_FARES } =
        {
          SUBWAY: 'MRT_BLUE',
          HEAVY_RAIL: 'BTS',
          COMMUTER_TRAIN: 'ARL',
          BUS: 'AC_BUS',
          FERRY: 'FERRY',
        };

      for (const step of steps) {
        if (step.travel_mode === 'TRANSIT' && step.transit_details) {
          const googleType = step.transit_details.line.vehicle.type;
          const start = step.transit_details.departure_stop.location;
          const end = step.transit_details.arrival_stop.location;

          const fareKey = typeMap[googleType] || 'AC_BUS';

          const segmentFare = await calculateSegmentFare(
            { lat: start.lat, lng: start.lng },
            { lat: end.lat, lng: end.lng },
            fareKey
          );
          totalFare += segmentFare;
        }
      }
      return totalFare;
    }
  } catch (e) {
    console.error('Google Transit Route API failed:', e);
  }

  return 59.0;
}

export const handleTapTransaction = async (
  cardId: number,
  locationData: any,
  vehicleType: string
) => {
  // 💡 บังคับให้ cardId เป็น Number เพื่อให้แน่ใจว่าเข้ากันได้กับ DB
  const numericCardId = Number(cardId);
  if (isNaN(numericCardId)) throw new Error('Invalid Card ID provided.');

  const card = await MetroCardService.getMetroCardById(numericCardId);

  const pendingTransaction =
    (await prisma.transportation_transactions.findFirst({
      where: {
        card_id: numericCardId,
        status: 'PENDING_IN',
      },
    })) as any;

  const type =
    vehicleType.toUpperCase() as keyof typeof FARE_CONSTANTS.MAX_FARES;
  const maxFare = FARE_CONSTANTS.MAX_FARES[type] || 50.0;
  const maxFareDecimal = new Decimal(maxFare);

  if (pendingTransaction) {
    const tapInLocationData = pendingTransaction.tap_in_location as string;
    const ActualFare = await calculateMultiSegmentFare(
      tapInLocationData,
      locationData
    );
    const ActualFareDecimal = new Decimal(ActualFare);
    try {
      await MetroCardService.transferToTransportation(
        card.card_number,
        ActualFare
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || (error as Error).message;
      throw new Error(
        `Fare Deduction Failed via Finance Service: ${errorMessage}. Please check your Metro Card balance.`
      );
    }
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transportation_transactions.update({
        where: { id: pendingTransaction.id },
        data: {
          status: 'COMPLETED',
          tap_out_location: JSON.stringify(locationData),
          amount: ActualFareDecimal,
        } as any,
      });

      return {
        type: 'TAP_OUT',
        charged: ActualFare,
        transactionId: transaction.id,
        message: 'Fare deducted via external service',
      };
    });
  } else {
    return prisma.$transaction(async (tx) => {
      const newTransaction = await tx.transportation_transactions.create({
        data: {
          card_id: numericCardId,
          status: 'PENDING_IN',
          tap_in_location: JSON.stringify(locationData),
          amount: maxFareDecimal,
        } as any,
      });

      return {
        type: 'TAP_IN',
        maxFareReserved: maxFare,
        transactionId: newTransaction.id,
      };
    });
  }
};
/**
 * ดึงประวัติการทำธุรกรรมการขนส่งล่าสุดสำหรับบัตรที่กำหนด
 * @param cardId ID ของ MetroCard
 * @param limit จำนวนรายการที่ต้องการ (ค่าเริ่มต้นคือ 5)
 * @returns Array ของรายการธุรกรรม
 */
export const getTransportationHistory = async (
  cardId: number,
  limit: number = 6
) => {
  // 💡 การแก้ไข: การแปลงเป็น Number ที่เข้มงวด
  const numericCardId = Number(cardId);
  if (isNaN(numericCardId)) {
    console.warn(
      `[History Query] ID is NaN/Invalid: ${cardId}. Returning empty array.`
    );
    return [];
  }

  // 💡 NEW LOG: ตรวจสอบค่า ID ที่ Model ได้รับก่อน Query
  console.log(
    `[History Query] Attempting to query DB for card_id: ${numericCardId} (Type: ${typeof numericCardId})`
  );

  try {
    const history = await prisma.transportation_transactions.findMany({
      where: {
        card_id: numericCardId, // 💡 ใช้ค่าที่ถูกบังคับชนิดแล้ว
        status: {
          in: ['COMPLETED', 'PENDING_IN'],
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
      select: {
        id: true,
        status: true,
        tap_in_location: true,
        tap_out_location: true,
        amount: true,
        created_at: true,
      },
    });

    // 💡 NEW LOG: ตรวจสอบผลลัพธ์ที่ได้จาก Prisma
    console.log(
      `[History Query] Prisma returned ${history.length} transactions.`
    );

    // ถ้าไม่มีข้อมูล ให้คืนค่าทันที
    if (history.length === 0) {
      return [];
    }

    // 💡 แก้ไข: ใช้ Promise.all เพื่อทำการ Reverse Geocoding พร้อมกัน
    const historyWithNames = await Promise.all(
      history.map(async (tx) => {
        let type: 'IN' | 'OUT';
        let locationName: string = 'Unknown Location';
        let chargedAmount: number | undefined;

        // 💡 ฟังก์ชันช่วยสำหรับการแปลง JSON อย่างปลอดภัย
        const safeParse = (data: any) => {
          if (!data || typeof data !== 'string') return null;
          try {
            return JSON.parse(data);
          } catch (e) {
            return null;
          }
        };

        if (tx.status === 'COMPLETED') {
          type = 'OUT';
          chargedAmount = tx.amount?.toNumber();

          const parsedLocation = safeParse(tx.tap_out_location);

          if (parsedLocation && parsedLocation.lat && parsedLocation.lng) {
            // ทำ Reverse Geocode ถ้ามีพิกัด
            locationName = await reverseGeocode(
              parsedLocation.lat,
              parsedLocation.lng
            );
          } else if (parsedLocation?.name) {
            // ใช้ชื่อที่ถูกบันทึกไว้ ถ้ามี
            locationName = parsedLocation.name;
          } else {
            locationName = 'Destination Unknown';
          }
        } else {
          // PENDING_IN (Tap In)
          type = 'IN';
          chargedAmount = undefined;

          const parsedLocation = safeParse(tx.tap_in_location);

          if (parsedLocation && parsedLocation.lat && parsedLocation.lng) {
            // ทำ Reverse Geocode ถ้ามีพิกัด
            locationName = await reverseGeocode(
              parsedLocation.lat,
              parsedLocation.lng
            );
          } else if (parsedLocation?.name) {
            // ใช้ชื่อที่ถูกบันทึกไว้ ถ้ามี
            locationName = parsedLocation.name;
          } else {
            locationName = 'Origin Unknown';
          }
        }

        return {
          id: tx.id,
          type: type,
          locationName: locationName,
          timestamp: tx.created_at.toISOString(),
          chargedAmount: chargedAmount,
        };
      })
    );

    return historyWithNames;
  } catch (error) {
    console.error('Error fetching transportation history:', error);
    throw new Error('Failed to retrieve transportation history.');
  }
};

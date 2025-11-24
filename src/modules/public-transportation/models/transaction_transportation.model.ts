import axios from 'axios';
import prisma from '@/config/client';
import { Decimal } from '@prisma/client/runtime/library';

const GOOGLE_API_KEY = process.env.G08_VITE_GOOGLE_MAPS_API_KEY;

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

// 🟢 Helper Function ใหม่: จัดการการ Parse JSON อย่างปลอดภัย
function safelyParseLocation(locationData: any): { lat: string; lng: string } {
  if (typeof locationData === 'string') {
    // ข้อมูลจาก DB (JSON String)
    return JSON.parse(locationData);
  }
  // ข้อมูลจาก Controller/Request Body (Object)
  return locationData;
}

async function calculateActualFare(
  tapInLocation: any,
  tapOutLocation: any,
  vehicleType: string
): Promise<number> {
  const type =
    vehicleType.toUpperCase() as keyof typeof FARE_CONSTANTS.MAX_FARES;
  const maxFare = FARE_CONSTANTS.MAX_FARES[type] || 15.0;

  // 🟢 ใช้ safelyParseLocation กับข้อมูลทั้ง Tap IN และ Tap OUT
  const orig = safelyParseLocation(tapInLocation);
  const dest = safelyParseLocation(tapOutLocation);
  const { lat: origLat, lng: origLng } = orig;
  const { lat: destLat, lng: destLng } = dest;

  if (
    FARE_CONSTANTS.RAIL_FARE_TABLE[
      type as keyof typeof FARE_CONSTANTS.RAIL_FARE_TABLE
    ]
  ) {
    const stationCount = await getStationCount(
      origLat,
      origLng,
      destLat,
      destLng
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
      origLat,
      origLng,
      destLat,
      destLng
    );
    let actualFare = rules.base + distanceKm * rules.rate;

    if (actualFare > rules.max) {
      actualFare = rules.max;
    }
    return Math.ceil(actualFare);
  }

  return maxFare;
}

export const handleTapTransaction = async (
  cardId: number,
  locationData: any,
  vehicleType: string
) => {
  return prisma.$transaction(async (tx) => {
    const card = await tx.digital_cards.findUnique({ where: { id: cardId } });

    if (!card || card.status !== 'active') {
      throw new Error('Invalid or inactive card.');
    }

    const type =
      vehicleType.toUpperCase() as keyof typeof FARE_CONSTANTS.MAX_FARES;
    const maxFare = FARE_CONSTANTS.MAX_FARES[type] || 50.0;
    const maxFareDecimal = new Decimal(maxFare);

    const pendingTransaction = (await tx.transportation_transactions.findFirst({
      where: { card_id: cardId, status: 'PENDING_IN' },
    })) as any;

    if (pendingTransaction) {
      const tapInLocationData = pendingTransaction.tap_in_location as string;

      // 🟢 ส่ง locationData (Object) ตรง ๆ เพราะ calculateActualFare จะจัดการ Parse แล้ว
      const ActualFare = await calculateActualFare(
        tapInLocationData,
        locationData,
        vehicleType
      );
      const ActualFareDecimal = new Decimal(ActualFare);

      if (card.balance === null || card.balance.toNumber() < ActualFare) {
        throw new Error(
          'Insufficient funds to complete transaction. Please top up.'
        );
      }

      await tx.transportation_transactions.update({
        where: { id: pendingTransaction.id },
        data: {
          status: 'COMPLETED',
          tap_out_location: JSON.stringify(locationData),
          amount: ActualFareDecimal,
        } as any,
      });

      await tx.digital_cards.update({
        where: { id: cardId },
        data: {
          balance: { decrement: ActualFareDecimal },
        } as any,
      });

      return {
        type: 'TAP_OUT',
        charged: ActualFare,
        transactionId: pendingTransaction.id,
      };
    } else {
      if (card.balance === null || card.balance.toNumber() < maxFare) {
        throw new Error('Insufficient funds for travel authorization.');
      }

      const newTransaction = await tx.transportation_transactions.create({
        data: {
          digital_cards: { connect: { id: cardId } },
          status: 'PENDING_IN',
          tap_in_location: JSON.stringify(locationData),
          amount: maxFareDecimal,
        } as any,
      });

      const createdTransaction = await tx.transportation_transactions.findFirst(
        {
          where: { card_id: cardId, status: 'PENDING_IN' },
          orderBy: { created_at: 'desc' },
        }
      );

      return {
        type: 'TAP_IN',
        maxFareReserved: maxFare,
        transactionId: createdTransaction?.id,
      };
    }
  });
};

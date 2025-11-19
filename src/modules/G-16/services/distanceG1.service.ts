
// console.log(process.env.G16_VITE_GOOGLE_MAPS_API_KEY);
const GOOGLE_MAPS_API_KEY = process.env.G16_VITE_GOOGLE_MAPS_API_KEY;
// // const DISTANCE_MATRIX_URL =
// //   'https://maps.googleapis.com/maps/api/distancematrix/json';


export interface DistanceElement {
  status: string;
  distance: {
    value: number;
    text: string;
  };
  duration: {
    value: number;
    text: string;
  };
}

export interface DistanceResponse {
  status: string;
  originAddresses: string[];
  destinationAddresses: string[];
  rows: Array<{
    elements: DistanceElement[];
  }>;
}

export async function distanceMatrix(
  origin: string,
  destination: string
): Promise<DistanceResponse> {

  if (!origin || !destination) {
    throw new Error('Origin and destination are required');
  }

  const url =
    `https://maps.googleapis.com/maps/api/distancematrix/json` +
    `?origins=${encodeURIComponent(origin)}` +
    `&destinations=${encodeURIComponent(destination)}` +
    `&mode=driving` +
    `&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google Maps Error: ${data.status}`);
    }

    const element = data.rows[0]?.elements[0];

    if (!element || element.status !== 'OK') {
      throw new Error(
        `Cannot calculate distance: ${element?.status || 'Unknown error'}`
      );
    }

    
    return {
      status: 'OK',
      originAddresses: data.origin_addresses,
      destinationAddresses: data.destination_addresses,
      rows: [
        {
          elements: [
            {
              status: element.status,
              distance: {
                value: element.distance?.value || 0,
                text: element.distance?.text || '',
              },
              duration: {
                value: element.duration?.value || 0,
                text: element.duration?.text || '',
              },
            },
          ],
        },
      ],
    };
  } catch (error) {
    console.error('Distance calculation error:', error);
    throw error;
  }
}

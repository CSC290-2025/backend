import type { Context } from 'hono';
import { getRoutes } from '../models/routeFinder.model';
import { getTransitLinesOnly } from '../models/routeFinder.model';

export const getRoutesController = async (c: Context) => {
  const origLat = c.req.query('origLat') || c.req.query('lat');
  const origLng = c.req.query('origLng') || c.req.query('lng');
  const origin = c.req.query('origin');

  const destination = c.req.query('destination');
  const destLat = c.req.query('destLat');
  const destLng = c.req.query('destLng');

  const waypoints = c.req.query('waypoints');

  const hasOriginString = origin && origin.length > 0;
  const hasOriginGPS = origLat && origLng;
  const hasDestinationString = destination && destination.length > 0;
  const hasDestinationGPS = destLat && destLng;

  if (
    (!hasOriginString && !hasOriginGPS) ||
    (!hasDestinationString && !hasDestinationGPS)
  ) {
    return c.json(
      {
        success: false,
        message:
          'Missing required parameters: Must provide either (origin or origLat/origLng) AND either (destination or destLat/destLng).',
      },
      400
    );
  }

  try {
    const { allRoutesSummarized, fastestRouteSummary } = await getRoutes(
      origin as string,
      origLat as string,
      origLng as string,
      destination as string,
      destLat as string,
      destLng as string,
      waypoints as string
    );

    const path = c.req.path;

    if (path.includes('/fastest')) {
      return c.json({ success: true, fastestRoute: fastestRouteSummary });
    } else if (path.includes('/all')) {
      return c.json({ success: true, allRoutes: allRoutesSummarized });
    }

    return c.json({
      success: true,
      allRoutes: allRoutesSummarized,
      fastestRouteSummary,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return c.json({ success: false, message: error.message }, 500);
    } else {
      return c.json({ success: false, message: 'Unknown error occurred' }, 500);
    }
  }
};
export const getTransitLinesController = async (c: Context) => {
  const origLat = c.req.query('origLat');
  const origLng = c.req.query('origLng');
  const destLat = c.req.query('destLat');
  const destLng = c.req.query('destLng');

  const originText = c.req.query('originText');
  const destinationText = c.req.query('destinationText');

  const hasLatLngPair = origLat && origLng && destLat && destLng;
  const hasTextPair = originText && destinationText;

  if (!hasLatLngPair && !hasTextPair) {
    return c.json(
      {
        success: false,
        message:
          'Missing required parameters: Must provide either complete Lat/Lng pairs (origLat, origLng, destLat, destLng) OR complete Text pairs (originText, destinationText).',
      },
      400
    );
  }

  try {
    const transitLines = await getTransitLinesOnly(
      origLat || null,
      origLng || null,
      destLat || null,
      destLng || null,
      originText || null,
      destinationText || null
    );

    return c.json({
      success: true,
      data: transitLines,
      count: transitLines.length,
      message: 'Transit lines retrieved successfully.',
    });
  } catch (error: unknown) {
    console.error('Error in getTransitLinesController:', error);
    return c.json(
      {
        success: false,
        message: 'Unable to fetch transit lines.',
      },
      500
    );
  }
};

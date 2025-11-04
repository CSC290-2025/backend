import type { Context } from 'hono';
import { getRoutes } from '../models/routeFinder.model';

export const getRoutesController = async (c: Context) => {
  const lat = c.req.query('lat');
  const lng = c.req.query('lng');
  const origin = c.req.query('origin');
  const destination = c.req.query('destination');
  const waypoints = c.req.query('waypoints');

  const hasOrigin = origin && origin.length > 0;
  const hasGPS = lat && lng;

  if (!destination || (!hasOrigin && !hasGPS)) {
    return c.json(
      {
        success: false,
        message:
          'Missing required parameters: destination, and either (origin) or (lat and lng).',
      },
      400
    );
  }

  try {
    const { allRoutesSummarized, fastestRouteSummary } = await getRoutes(
      origin as string,
      lat as string,
      lng as string,
      destination as string,
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

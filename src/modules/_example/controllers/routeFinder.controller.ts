import type { Context } from 'hono';
import { getRoutes } from '../models/routeFinder.model';

export const getRoutesController = async (c: Context) => {
  const origin = c.req.query('origin');
  const destination = c.req.query('destination');
  const waypoints = c.req.query('waypoints');

  try {
    const { allRoutesSummarized, fastestRouteSummary } = await getRoutes(
      origin as string,
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

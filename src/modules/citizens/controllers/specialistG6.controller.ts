import type { Context, Handler } from 'hono';
import { userSpecialistService } from '../services/specialistG6.service';

export const userSpecialistController = {
  getUserSpecialists: (async (c: Context) => {
    try {
      const userId = Number(c.req.param('id'));

      if (isNaN(userId)) {
        return c.json({ success: false, message: 'Invalid user ID' }, 400);
      }

      const data = await userSpecialistService.getUserSpecialists(userId);

      return c.json(
        {
          success: true,
          message:
            data.specialists.length > 0
              ? `Fetched ${data.specialists.length} specialties for user ID ${userId}`
              : `No specialists found for user ID ${userId}`,
          data,
        },
        200
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          message: error.message || 'Failed to fetch user specialties',
        },
        400
      );
    }
  }) as Handler<any, any, any>,
};

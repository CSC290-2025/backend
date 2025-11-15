import type { Context } from 'hono';
import { OnsiteSessionService } from '@/modules/Know_AI/services';
import { successResponse } from '@/utils/response.ts';

const getAllOnsiteSession = async (c: Context) => {
  const data = await OnsiteSessionService.getAllOnsiteSession();
  return successResponse(c, { data }, 200);
};

const getOnsiteSessionById = async (c: Context) => {
  const onsiteSessionId = Number(c.req.param('sessionId'));
  const data = await OnsiteSessionService.getOnsiteSessionById(onsiteSessionId);
  return successResponse(c, { data }, 200);
};

const createOnsiteSession = async (c: Context) => {
  const body = await c.req.json();
  const data = await OnsiteSessionService.createOnsiteSession(body);
  return successResponse(c, { data }, 201, 'Create report successfully');
};

const deleteOnsiteSession = async (c: Context) => {
  const onsiteSessionId = Number(c.req.param('sessionId'));
  const data = await OnsiteSessionService.deleteOnsiteSession(onsiteSessionId);
  return successResponse(c, { data }, 200, 'Delete successfully');
};

export {
  getAllOnsiteSession,
  getOnsiteSessionById,
  createOnsiteSession,
  deleteOnsiteSession,
};

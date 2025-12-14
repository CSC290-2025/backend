// import type { Context, Handler } from 'hono';
// import { ReceiverRequestsService } from '../services';
// import { successResponse } from '@/utils/response';

// const getAllRequests: Handler = async (c: Context) => {
//   const requests = await ReceiverRequestsService.getAllRequests();
//   return successResponse(c, { requests });
// };

// const getRequestById: Handler = async (c: Context) => {
//   const id = Number(c.req.param('id'));
//   const request = await ReceiverRequestsService.getRequestById(id);
//   return successResponse(c, { request });
// };

// const getUserRequests: Handler = async (c: Context) => {
//   const userId = c.get('user')?.id;
//   const requests = await ReceiverRequestsService.getUserRequests(userId);
//   return successResponse(c, { requests });
// };

// const getPostRequests: Handler = async (c: Context) => {
//   const postId = Number(c.req.param('postId'));
//   const userId = c.get('user')?.id;
//   const requests = await ReceiverRequestsService.getPostRequests(
//     postId,
//     userId
//   );
//   return successResponse(c, { requests });
// };

// const createRequest: Handler = async (c: Context) => {
//   const body = await c.req.json();
//   const userId = c.get('user')?.id;
//   const request = await ReceiverRequestsService.createRequest(body, userId);
//   return successResponse(c, { request }, 201, 'Request created successfully');
// };

// const deleteRequest: Handler = async (c: Context) => {
//   const id = Number(c.req.param('id'));
//   const userId = c.get('user')?.id;
//   await ReceiverRequestsService.deleteRequest(id, userId);
//   return successResponse(c, null, 200, 'Request cancelled successfully');
// };

// const updateRequestStatus: Handler = async (c: Context) => {
//   const id = Number(c.req.param('id'));
//   const body = await c.req.json();
//   const userId = c.get('user')?.id;
//   const request = await ReceiverRequestsService.updateRequestStatus(
//     id,
//     body,
//     userId
//   );
//   return successResponse(c, { request }, 200, 'Request status updated');
// };

// const getRequestsByUserId: Handler = async (c: Context) => {
//   const userId = Number(c.req.param('userId'));
//   const requests = await ReceiverRequestsService.getPostsByUserId(userId);
//   return successResponse(c, { requests });
// };

// export {
//   getAllRequests,
//   getRequestById,
//   getUserRequests,
//   getPostRequests,
//   createRequest,
//   deleteRequest,
//   updateRequestStatus,
//   getRequestsByUserId,
// };

import type { Context, Handler } from 'hono';
import { ReceiverRequestsService } from '../services';
import { successResponse } from '@/utils/response';
import type { JwtPayload } from '../../Auth/types/auth.types';

const getAllRequests: Handler = async (c: Context) => {
  const requests = await ReceiverRequestsService.getAllRequests();
  return successResponse(c, { requests });
};

const getRequestById: Handler = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const request = await ReceiverRequestsService.getRequestById(id);
  return successResponse(c, { request });
};

const getUserRequests: Handler = async (c: Context) => {
  const user = c.get('user') as JwtPayload;
  const userId = user?.userId;

  const requests = await ReceiverRequestsService.getUserRequests(userId);
  return successResponse(c, { requests });
};

const getPostRequests: Handler = async (c: Context) => {
  const postId = Number(c.req.param('postId'));
  const user = c.get('user') as JwtPayload;
  const userId = user?.userId;
  const requests = await ReceiverRequestsService.getPostRequests(
    postId,
    userId
  );
  return successResponse(c, { requests });
};

// const createRequest: Handler = async (c: Context) => {
//   const body = await c.req.json();
//   const user = c.get('user') as JwtPayload;
//   const userId = user?.userId;

//   const request = await ReceiverRequestsService.createRequest(body, userId);
//   return successResponse(c, { request }, 201, 'Request created successfully');
// };

const createRequest: Handler = async (c: Context) => {
  const body = await c.req.json();
  const user = c.get('user') as JwtPayload; // ดึงข้อมูลจาก Token

  // ✅ 1. ดึง ID จาก Token โดยตรง (ไม่ต้องพึ่ง Service หรือ Body)
  // ปกติ Token จะมี field 'userId' หรือ 'id' หรือ 'sub'
  const userId = user?.userId || (user as any)?.id || (user as any)?.sub;

  if (!userId) {
    return c.json({ error: 'Unauthorized: Invalid Token' }, 401);
  }

  // ✅ 2. ส่ง userId ที่ได้จาก Token ไปบันทึก
  // แปลง postId ให้ตรงกับที่ Service ต้องการด้วย
  const requestData = {
    post_id: Number(body.postId || body.post_id),
  };

  const request = await ReceiverRequestsService.createRequest(
    requestData,
    Number(userId)
  );
  return successResponse(c, { request }, 201, 'Request created successfully');
};

const deleteRequest: Handler = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const user = c.get('user') as JwtPayload;
  const userId = user?.userId;

  await ReceiverRequestsService.deleteRequest(id, userId);
  return successResponse(c, null, 200, 'Request cancelled successfully');
};

const updateRequestStatus: Handler = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const user = c.get('user') as JwtPayload;
  const userId = user?.userId;

  const request = await ReceiverRequestsService.updateRequestStatus(
    id,
    body,
    userId
  );
  return successResponse(c, { request }, 200, 'Request status updated');
};

const getRequestsByUserId: Handler = async (c: Context) => {
  const userId = Number(c.req.param('userId'));
  const requests = await ReceiverRequestsService.getPostsByUserId(userId);
  return successResponse(c, { requests });
};

export {
  getAllRequests,
  getRequestById,
  getUserRequests,
  getPostRequests,
  createRequest,
  deleteRequest,
  updateRequestStatus,
  getRequestsByUserId,
};

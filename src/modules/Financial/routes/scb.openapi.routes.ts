import { ScbController } from '../controllers';
import { ScbEventEmitter } from '../utils';
import { ScbSchemas } from '../schemas';
import type { OpenAPIHono } from '@hono/zod-openapi';
import { streamSSE } from 'hono/streaming';

const setupScbRoutes = (app: OpenAPIHono) => {
  app.openapi(ScbSchemas.createQrRoute, ScbController.createQrCode);
  app.openapi(ScbSchemas.paymentConfirmRoute, ScbController.paymentConfirm);
  app.openapi(ScbSchemas.verifyPaymentRoute, ScbController.verifyPayment);

  app.get('/scb/stream', (c) => {
    const ref1 = c.req.query('ref1');
    if (!ref1) return c.json({ message: 'ref1 required' }, 400);

    return streamSSE(c, async (stream) => {
      const eventName = `scb:confirmed:${ref1}`;
      const handler = (data: unknown) =>
        stream.writeSSE({ data: JSON.stringify(data) });

      // Use `once` because this endpoint expects a single confirmation message
      // per ref1; `once` automatically removes the listener after it's
      // triggered. Keep explicit cleanup on abort if client disconnects.
      ScbEventEmitter.once(eventName, handler);
      stream.onAbort(() => {
        ScbEventEmitter.off(eventName, handler);
      });

      // Keep the connection alive indefinitely (or until client disconnects)
      await new Promise(() => {});
    });
  });

  // Server-Sent Events endpoint for SCB payment confirmations. The client
  // should pass the `ref1` query parameter and listen for a single event.
  // This endpoint uses the Node ReadableStream API to stream events.
};

export { setupScbRoutes };

import Pusher from 'pusher';

const PUSHER_APP_ID = process.env.G11_PUSHER_APP_ID!;
const PUSHER_KEY = process.env.G11_PUSHER_KEY!;
const PUSHER_SECRET = process.env.G11_PUSHER_SECRET!;
const PUSHER_CLUSTER = process.env.G11_PUSHER_CLUSTER!;

const pusher = new Pusher({
  appId: PUSHER_APP_ID,
  key: PUSHER_KEY,
  secret: PUSHER_SECRET,
  cluster: PUSHER_CLUSTER,
  useTLS: true,
});

/**
 * Trigger an event on a channel. All data is JSON-serializable.
 * Exported so other modules (e.g. SCB model) can notify clients via Pusher.
 */
const triggerEvent = async (
  channel: string,
  event: string,
  payload: Record<string, unknown>
) => {
  try {
    // The pusher.trigger API is async when called with callback-less form
    // but the library returns a promise — we keep this helper async.
    await pusher.trigger(channel, event, payload);
  } catch (err) {
    console.error('Pusher trigger failed:', err);
    throw err;
  }
};

export { pusher, triggerEvent };

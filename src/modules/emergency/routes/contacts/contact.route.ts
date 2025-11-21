import { Hono } from 'hono';
import { ContactController } from '@/modules/emergency/controllers';

export function contactRoutes() {
  const app = new Hono();

  app.post('/contacts', ContactController.createContact);
  app.patch('/contacts', ContactController.updateContact);
  app.get('/contacts/:userId', ContactController.findContactByUserId);

  return app;
}

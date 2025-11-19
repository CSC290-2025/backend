import { Hono } from 'hono';
import { ContactController } from '@/modules/emergency/controllers';

export function contactRoutes() {
  const app = new Hono();

  app.post('/contact', ContactController.createContact);
  app.patch('/contact', ContactController.updateContact);
  app.get('/contact/:userId', ContactController.findContactByUserId);

  return app;
}

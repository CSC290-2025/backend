import { Hono } from 'hono';
import { UserSpecialtyG1Controller } from '../controllers';

const userSpecialtyG1Route = new Hono();
userSpecialtyG1Route.post(
  '/user-specialty',
  UserSpecialtyG1Controller.createUserSpecialty
);

export { userSpecialtyG1Route };

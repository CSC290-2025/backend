import { Hono } from 'hono';
import { handleCreateDigitalCard } from '../controllers/digital_card.controller';

const cardRoute = new Hono();

cardRoute.post('/card', handleCreateDigitalCard);

export default cardRoute;

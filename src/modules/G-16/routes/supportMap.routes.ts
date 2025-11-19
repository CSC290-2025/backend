import { Hono } from "hono";
import { calculateDistance } from "../controllers/distance.controller";

const distanceRoutes = new Hono();

distanceRoutes.
post('/distance', calculateDistance);

export { distanceRoutes};
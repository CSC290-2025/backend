import { serve } from "@hono/node-server";
import { Hono } from "hono";
import config from "./config/env";
import { errorHandler } from "./middlewares/error";

const app = new Hono();

app.onError(errorHandler);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

serve(
  {
    fetch: app.fetch,
    port: config.port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

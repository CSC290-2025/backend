// src/controllers/detect.controller.ts
import type { Context } from 'hono';
import { detectDangerFromImage } from '../services/gemini.service';
import { addMarker } from '../services/marker.service';
import { ValidationError } from '@/errors';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'] as const;
const THRESHOLD = 0.8;
const DANGER_MARKER_TYPE_ID = 999;

export async function detectHarm(c: Context) {
  const body = await c.req.parseBody();
  const file = body['image'];

  if (!(file instanceof File)) {
    throw new ValidationError('Please upload file image');
  }

  if (!ALLOWED.includes(file.type as any)) {
    throw new ValidationError('Unsupport file type');
  }

  const lat = Number(body['lat']);
  const lng = Number(body['lng']);
  const hasLoc =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

  // call AI to detect : is_danger, confidence, danger_types, reasons
  const buffer = Buffer.from(await file.arrayBuffer());
  const ai = await detectDangerFromImage(buffer, file.type);

  const is_danger = Boolean(ai.is_danger);
  const confidence = Math.min(1, Math.max(0, Number(ai.confidence) || 0));
  const danger_types = Array.isArray(ai.danger_types)
    ? ai.danger_types
    : ai.danger_types
      ? [String(ai.danger_types)]
      : [];
  const reasons = Array.isArray(ai.reasons)
    ? ai.reasons
    : ai.reasons
      ? [String(ai.reasons)]
      : [];

  // if it danger and have cordinates create the marker
  let marker: any = null;
  if (is_danger && confidence >= THRESHOLD && hasLoc) {
    const title = danger_types[0] ?? 'danger';
    const description = `AI detected: ${title} (${Math.round(confidence * 100)}%)`;

    marker = await addMarker({
      lat,
      lng,
      marker_type_id: DANGER_MARKER_TYPE_ID,
      title,
      description,
      confidence,
      categories: danger_types,
    });
  }

  // send result to frontend
  return c.json({
    ok: true,
    is_danger,
    confidence, // 0..1
    danger_types, // string[]
    reasons, // string[]
    threshold: THRESHOLD,
    over_threshold: is_danger && confidence >= THRESHOLD,
    marker, // { id, lat, lng, ... }
  });
}

// src/controllers/detect.controller.ts
import type { Context } from 'hono';
import { detectDangerFromImage } from '../services/gemini.service';
import { addMarker } from '../services/marker.service';
import { ValidationError } from '@/errors';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'] as const;
const THRESHOLD = 0.8;
const DANGER_MARKER_TYPE_ID = 999;

//normalize value to string
function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v));
  }
  if (value != null) {
    return [String(value)];
  }
  return [];
}

export async function detectHarm(c: Context) {
  const body = await c.req.parseBody();
  const file = body['image'];

  // 1) Validate file
  if (!(file instanceof File)) {
    throw new ValidationError('Please upload file image');
  }

  if (!ALLOWED.includes(file.type as (typeof ALLOWED)[number])) {
    throw new ValidationError('Unsupport file type');
  }

  // 2) Validate location
  const lat = Number(body['lat']);
  const lng = Number(body['lng']);
  const checkCordinate =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

  // 3) Call AI to detect danger from image
  const buffer = Buffer.from(await file.arrayBuffer());
  const ai = await detectDangerFromImage(buffer, file.type);

  const is_danger = Boolean(ai.is_danger);

  const rawConfidence = Number(ai.confidence) || 0;
  const confidence = Math.min(1, Math.max(0, rawConfidence));

  const danger_types = toStringArray(ai.danger_types);
  const reasons = toStringArray(ai.reasons);

  // 4) Create marker if dangerous
  let marker: any = null;
  const over_threshold = is_danger && confidence >= THRESHOLD;

  if (over_threshold && checkCordinate) {
    const title = danger_types[0] ?? 'danger';
    const description = `AI detected: ${title} (${Math.round(
      confidence * 100
    )}%)`;

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

  // 5) Send result to frontend
  return c.json({
    ok: true,
    is_danger,
    confidence, // 0..1
    danger_types, // string[]
    reasons, // string[]
    threshold: THRESHOLD,
    over_threshold,
    marker, // { id, lat, lng, ... } or null
  });
}

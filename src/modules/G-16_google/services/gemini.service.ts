// src/modules/_example/services/gemini.service.ts
import { GoogleGenAI } from '@google/genai';
const apiKey = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1' });
import { ValidationError, InternalServerError } from '@/errors';

const RAW = process.env.GEMINI_MODEL || 'models/gemini-2.0-flash-001';
// .trim()
// .replace(/^['"]|['"]$/g, "");
const MODEL = RAW.startsWith('models/') ? RAW : `models/${RAW}`;

//prompt
const PROMPT = `You are a safety checker. Return ONLY JSON like:
{"is_danger":boolean,"confidence":number,"danger_types":string[],"reasons":string[]}`;

//result
export type DetectResult = {
  is_danger: boolean;
  confidence: number;
  danger_types: string[];
  reasons: string[];
};

// pull text from gemini
function extractText(res: any): string {
  const rt = res?.response?.text;
  if (typeof rt === 'function') return rt();
  if (typeof rt === 'string') return rt;
  const t = res?.text;
  if (typeof t === 'function') return t();
  if (typeof t === 'string') return t;
  const parts =
    res?.response?.candidates?.[0]?.content?.parts ??
    res?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const s = parts
      .map((p: any) => p?.text)
      .filter(Boolean)
      .join(' ');
    if (s) return s;
  }
  throw new InternalServerError('Gemini did not return text');
}

export async function detectDangerFromImage(
  buffer: Buffer,
  mimeType: string
): Promise<DetectResult> {
  if (!buffer?.length) throw new ValidationError('Empty image buffer');
  if (!mimeType) throw new ValidationError('Missing mimeType');
  let res: any;
  try {
    res = await ai.models.generateContent({
      model: MODEL, // models/...
      contents: [
        {
          role: 'user',
          parts: [
            { text: PROMPT },
            { inlineData: { data: buffer.toString('base64'), mimeType } },
          ],
        },
      ],
    });
  } catch (e: any) {
    // show reason
    const v =
      e?.error?.details?.flatMap((d: any) => d?.fieldViolations || []) || [];
    const fv = v[0];
    const msg =
      (fv?.field && fv?.description
        ? `${fv.field}: ${fv.description}`
        : null) ||
      e?.error?.message ||
      e?.message ||
      'Gemini error';
    throw new InternalServerError(`Gemini request failed (model=${MODEL})`);
  }

  const raw = extractText(res);

  // change to jason
  try {
    return JSON.parse(raw) as DetectResult;
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) throw new InternalServerError('Gemini returned non-JSON response');
    return JSON.parse(m[0]) as DetectResult;
  }
}

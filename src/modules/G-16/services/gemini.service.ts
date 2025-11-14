// // src/modules/_example/services/gemini.service.ts
// import { GoogleGenAI } from '@google/genai';
// const apiKey = process.env.G16_GOOGLE_GEMINI_API_KEY!;
// const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1' });
// import { ValidationError, InternalServerError } from '@/errors';

// const RAW = process.env.G16_GEMINI_MODEL || 'models/gemini-2.0-flash-001';
// const MODEL = RAW.startsWith('models/') ? RAW : `models/${RAW}`;

// //prompt
// const PROMPT = `You are a safety checker. Return ONLY JSON like:
// {"is_danger":boolean,"confidence":number,"danger_types":string[],"reasons":string[]}`;

// //result
// export type DetectResult = {
//   is_danger: boolean;
//   confidence: number;
//   danger_types: string[];
//   reasons: string[];
// };

// // pull text from Gemini response in different possible formats
// function extractText(res: any): string {
//   // 1) Case when SDK provides response.text or response.text()
//   if (res?.response?.text) {
//     return typeof res.response.text === 'function'
//       ? res.response.text()
//       : res.response.text;
//   }

//   // 2) Case when the text is located at res.text or res.text()
//   if (res?.text) {
//     return typeof res.text === 'function' ? res.text() : res.text;
//   }

//   // 3) Common Gemini format: text stored inside candidates[0].content.parts[].text
//   const parts = res?.response?.candidates?.[0]?.content?.parts;
//   if (Array.isArray(parts)) {
//     return parts
//       .map((p: any) => p.text)
//       .filter(Boolean)
//       .join(' ');
//   }
//   // 4) Text not found in the response
//   throw new InternalServerError('Gemini did not return text');
// }

// //check input
// export async function detectDangerFromImage(
//   buffer: Buffer,
//   mimeType: string
// ): Promise<DetectResult> {
//   if (!buffer?.length) throw new ValidationError('Empty image buffer');
//   if (!mimeType) throw new ValidationError('Missing mimeType');
//   let res: any;
//   try {
//     res = await ai.models.generateContent({
//       model: MODEL, // models/...
//       contents: [
//         {
//           role: 'user',
//           parts: [
//             { text: PROMPT },
//             { inlineData: { data: buffer.toString('base64'), mimeType } },
//           ],
//         },
//       ],
//     });
//   } catch (e: any) {
//     console.error('Gemini error:', e);
//     throw new InternalServerError(`Gemini request failed (model=${MODEL})`);
//   }

//   const raw = extractText(res);

//   // change to json
//   try {
//     return JSON.parse(raw) as DetectResult;
//   } catch {
//     const m = raw.match(/\{[\s\S]*\}/);
//     if (!m) throw new InternalServerError('Gemini returned non-JSON response');
//     return JSON.parse(m[0]) as DetectResult;
//   }
// }
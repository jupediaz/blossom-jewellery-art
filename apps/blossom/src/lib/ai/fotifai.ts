/**
 * Fotifai adapter — routes image generation through the central Fotifai engine
 * (api.fotifai.com) instead of the embedded Gemini engine.
 *
 * The REST API is the universal, platform-agnostic contract (storefront spec §3):
 * Blossom sends only IDs/photos and receives URLs; all prompt/model logic lives in
 * Fotifai. This adapter intentionally returns the SAME shape as the embedded
 * `generateImageWithReferences` so callers swap with a one-line change.
 *
 * Enabled when FOTIFAI_API_KEY is set. The API key is read server-side only and
 * never reaches the browser.
 */

const BASE = (process.env.FOTIFAI_API_URL || 'https://api.fotifai.com').replace(/\/$/, '');
const KEY = process.env.FOTIFAI_API_KEY || '';
const OLHA_MODEL_ID = process.env.FOTIFAI_OLHA_MODEL_ID || '';

export function isFotifaiEnabled(): boolean {
  return !!KEY;
}

interface FotifaiResult {
  imageBase64: string; // data URL, matching the embedded engine's output shape
}

const h = () => ({ 'X-API-Key': KEY, 'Content-Type': 'application/json' });

async function poll(jobId: string, timeoutMs = 5 * 60_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/v1/images/jobs/${jobId}`, { headers: { 'X-API-Key': KEY } });
    if (!r.ok) throw new Error(`Fotifai poll ${r.status}`);
    const j = await r.json();
    const status = j.status ?? j.job?.status;
    if (status === 'completed') {
      const url = j.output_url ?? j.outputUrl ?? j.job?.output_url;
      if (!url) throw new Error('Fotifai job completed without output URL');
      return url as string;
    }
    if (status === 'failed') throw new Error(`Fotifai job failed: ${j.error_message ?? j.errorMessage ?? 'unknown'}`);
    await new Promise((res) => setTimeout(res, 3000));
  }
  throw new Error('Fotifai job timed out');
}

async function toDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch generated image ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get('content-type') || 'image/png';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

/**
 * Generate through Fotifai: clean the product photo (product_enhance), then
 * compose it with the Olha avatar when a model is requested (scene_generate).
 * Returns one data-URL image, matching the embedded engine's result shape.
 */
export async function generateViaFotifai(params: {
  /** Product photo as a data URL or bare base64. */
  productImageBase64: string;
  /** Free-text scene direction from the admin. */
  prompt: string;
  /** Whether to compose with the Olha avatar (scene) or just clean the product (packshot). */
  includeModel: boolean;
}): Promise<FotifaiResult[]> {
  if (!KEY) throw new Error('FOTIFAI_API_KEY not configured');

  // 1) ephemeral product + photo upload
  const created = await fetch(`${BASE}/v1/products`, {
    method: 'POST',
    headers: h(),
    body: JSON.stringify({ name: `blossom-${Date.now()}`, category: 'jewellery' }),
  });
  if (!created.ok) throw new Error(`Fotifai create product ${created.status}: ${await created.text()}`);
  const productId = (await created.json()).id as string;

  const raw = params.productImageBase64.replace(/^data:[^;]+;base64,/, '');
  const mime = params.productImageBase64.match(/^data:([^;]+);/)?.[1] || 'image/png';
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
  const fd = new FormData();
  fd.append('file', new Blob([Buffer.from(raw, 'base64')], { type: mime }), `product.${ext}`);
  const up = await fetch(`${BASE}/v1/products/${productId}/photos`, {
    method: 'POST',
    headers: { 'X-API-Key': KEY },
    body: fd,
  });
  if (!up.ok) throw new Error(`Fotifai upload ${up.status}: ${await up.text()}`);

  // 2) choose the job: scene with Olha, or packshot-only
  const useModel = params.includeModel && !!OLHA_MODEL_ID;
  const body = useModel
    ? { type: 'scene_generate', productId, modelId: OLHA_MODEL_ID, prompt: params.prompt }
    : { type: 'product_enhance', productId, prompt: params.prompt || undefined };
  const job = await fetch(`${BASE}/v1/images/transform`, { method: 'POST', headers: h(), body: JSON.stringify(body) });
  if (!job.ok) throw new Error(`Fotifai transform ${job.status}: ${await job.text()}`);
  const jobId = ((await job.json()).job?.id) as string;

  const url = await poll(jobId);
  return [{ imageBase64: await toDataUrl(url) }];
}

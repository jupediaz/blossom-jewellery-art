# AI Avatar Pipeline - Blossom Jewellery Art

## Overview

Pipeline for creating AI-generated model images of Olha wearing Blossom Jewellery
in curated environments (luxury studios, botanical gardens, editorial settings).

## Architecture

### Phase 1: Image Enhancement (Gemini - Ready Now)

Uses Google Gemini (NanoBanana) to enhance existing product photos:
- Background replacement (studio, garden, marble surfaces)
- Lighting improvement
- Product photo cleanup

**Script**: `enhance-photos.ts`
**Model**: `gemini-3-pro-image-preview` (NanoBanana Pro)
**API Key**: Uses `GOOGLE_GEMINI_API_KEY` from `.env.local`

### Phase 2: Avatar Training (Flux LoRA - Setup Required)

Train a LoRA model on Olha's reference photos for consistent character generation.

**Reference photos**: 12 images in `/public/images/models/ref-*.jpg`
- Various angles, lighting conditions, and expressions
- With and without sunglasses
- Indoor and outdoor settings

**Training options**:

#### Option A: Replicate (Recommended)
```bash
# Install CLI
npm install -g replicate

# Train Flux LoRA
replicate train \
  --model ostris/flux-dev-lora-trainer \
  --input images=@training-data.zip \
  --input trigger_word="OLHA_BLOSSOM" \
  --input steps=1500 \
  --input lr=1e-4
```
Cost: ~$5-10 per training run

#### Option B: fal.ai
```bash
# Via API
curl -X POST https://queue.fal.run/fal-ai/flux-lora-fast-training \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "images_data_url": "https://..../training-data.zip",
    "trigger_word": "OLHA_BLOSSOM",
    "steps": 1000
  }'
```
Cost: ~$3-5 per training run

#### Option C: RunPod (Self-hosted)
For maximum control and unlimited generations.
Cost: ~$0.50/hr GPU rental

### Phase 3: Generation Pipeline

Once LoRA is trained, generate images with prompts like:
```
"OLHA_BLOSSOM wearing handcrafted polymer clay rose earrings,
elegant pose, botanical garden background, golden hour lighting,
fashion editorial photography, 85mm lens, shallow depth of field"
```

## Reference Photo Inventory

| File | Description | Angle | Use |
|------|-------------|-------|-----|
| ref-01 | Portrait with orchids | Front-right, half face | Face structure |
| ref-02 | Portrait with flowers | Front-left | Full face, hair |
| ref-03 | Sunglasses, beach | Three-quarter | Body proportions |
| ref-04 | Blue earrings, beach | Three-quarter up | Jawline, neck |
| ref-05 | Green earrings, palm | Three-quarter up | Hair, shoulders |
| ref-06 | Yellow set, beach | Three-quarter | Full upper body |
| ref-07 | Red bracelet, beach | Three-quarter down | Arms, hands |
| ref-08 | Pink set, beach | Front | Full upper body |
| ref-09 | Lavender necklace | Front | Chest, neck, face |
| ref-10 | Red lips, folk | Close-up front | Face detail |
| ref-11 | Grey top, folk | Close-up front | Face, neck |
| ref-12 | Lavender folk | Close-up front | Face, neck |

## Ideal Generated Scenarios

1. **Editorial Studio**: White/grey backdrop, ring lights, professional setup
2. **Botanical Garden**: Lush greenery, flowers, natural light
3. **Mediterranean Terrace**: Stone, bougainvillea, sea in background
4. **Luxury Interior**: Marble, velvet, soft warm lighting
5. **Art Gallery**: Clean walls, minimalist, spotlights on jewelry
6. **Sunset Beach**: Golden hour, waves, Mediterranean coast

/**
 * AI Photo Enhancement Pipeline for Blossom Jewellery Art
 *
 * Uses Google Gemini (NanoBanana Pro) to enhance product photos:
 * - Replace backgrounds with professional studio settings
 * - Improve lighting and color balance
 * - Generate lifestyle shots from flat-lay photos
 *
 * Reuses Gemini integration pattern from image-metadata project.
 *
 * Usage:
 *   npx tsx scripts/ai-avatar/enhance-photos.ts [command] [options]
 *
 * Commands:
 *   enhance-bg   Replace background of a product photo
 *   lifestyle    Generate lifestyle context for a product photo
 *   batch        Process all products in a collection folder
 *
 * Requirements:
 *   GOOGLE_GEMINI_API_KEY in .env.local
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";

// Load env
const envPath = path.resolve(__dirname, "../../.env.local");
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";
const envVars: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) envVars[key.trim()] = rest.join("=").trim();
});

const API_KEY = envVars.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Error: GOOGLE_GEMINI_API_KEY not found in .env.local");
  console.error("Add it from the image-metadata project or get a new one from Google AI Studio");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Models (NanoBanana family)
const MODELS = {
  pro: "gemini-3-pro-image-preview", // Highest quality, slower
  flash: "gemini-2.5-flash-image", // Fast, good quality
} as const;

type ModelKey = keyof typeof MODELS;

interface EnhanceOptions {
  imagePath: string;
  prompt: string;
  model?: ModelKey;
  outputPath?: string;
}

async function imageToBase64(filePath: string): Promise<{ base64: string; mimeType: string }> {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = ext === ".png" ? "image/png" : "image/jpeg";
  return { base64: buffer.toString("base64"), mimeType };
}

async function enhanceImage(options: EnhanceOptions): Promise<string> {
  const { imagePath, prompt, model = "pro", outputPath } = options;

  console.log(`Processing: ${path.basename(imagePath)}`);
  console.log(`Model: ${MODELS[model]} (${model})`);
  console.log(`Prompt: ${prompt}`);

  const { base64, mimeType } = await imageToBase64(imagePath);

  const genModel = genAI.getGenerativeModel({
    model: MODELS[model],
    generationConfig: {
      // @ts-expect-error - Gemini image generation config
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  const result = await genModel.generateContent([
    {
      inlineData: { data: base64, mimeType },
    },
    {
      text: `${prompt}\n\nIMPORTANT: Preserve the jewelry details exactly as they appear in the original image. The jewelry pieces are handcrafted polymer clay art and every detail matters. Maintain the exact colors, textures, and proportions of the jewelry.`,
    },
  ]);

  const response = result.response;
  const parts = response.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData) {
      const outputFile =
        outputPath ||
        imagePath.replace(/(\.\w+)$/, `-enhanced$1`);

      const imageBuffer = Buffer.from(part.inlineData.data, "base64");
      fs.writeFileSync(outputFile, imageBuffer);
      console.log(`Saved: ${outputFile} (${(imageBuffer.length / 1024).toFixed(0)}KB)`);
      return outputFile;
    }
  }

  throw new Error("No image returned from Gemini");
}

// Background enhancement presets
const PRESETS = {
  "studio-white": "Replace the background with a clean white professional photography studio with soft ring light lighting. Keep the subject and jewelry exactly as they are.",
  "studio-marble": "Replace the background with an elegant marble surface and soft diffused studio lighting. Keep the subject and jewelry exactly as they are.",
  "botanical-garden": "Place this scene in a lush botanical garden with soft natural light filtering through green leaves and colorful flowers. Keep the subject and jewelry exactly as they are.",
  "mediterranean-terrace": "Set this scene on a Mediterranean terrace with stone railing, bougainvillea flowers, and a glimpse of blue sea in the background. Golden hour lighting. Keep the subject and jewelry exactly as they are.",
  "luxury-velvet": "Place the jewelry on a dark navy velvet fabric with soft side lighting creating elegant shadows. Professional product photography style.",
  "art-gallery": "Set this in a minimalist white art gallery with soft spotlighting. Clean, contemporary, prestigious atmosphere.",
} as const;

type PresetKey = keyof typeof PRESETS;

// CLI
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help") {
    console.log(`
AI Photo Enhancement Pipeline - Blossom Jewellery Art

Commands:
  enhance <image> <preset>    Enhance a single image with a preset background
  batch <folder> <preset>     Process all images in a folder
  custom <image> <prompt>     Custom prompt for an image

Presets:
  ${Object.keys(PRESETS).join("\n  ")}

Examples:
  npx tsx scripts/ai-avatar/enhance-photos.ts enhance public/images/products/yellow-roses/yellow-roses-set-flatlay.jpg studio-marble
  npx tsx scripts/ai-avatar/enhance-photos.ts batch public/images/products/orchid-dreams studio-white
  npx tsx scripts/ai-avatar/enhance-photos.ts custom public/images/products/red-roses/red-roses-sand-heart.jpg "Place on elegant black velvet"
`);
    return;
  }

  switch (command) {
    case "enhance": {
      const imagePath = args[1];
      const preset = args[2] as PresetKey;
      if (!imagePath || !preset || !PRESETS[preset]) {
        console.error("Usage: enhance <image-path> <preset>");
        console.error("Presets:", Object.keys(PRESETS).join(", "));
        process.exit(1);
      }
      await enhanceImage({
        imagePath: path.resolve(imagePath),
        prompt: PRESETS[preset],
      });
      break;
    }
    case "batch": {
      const folder = args[1];
      const preset = args[2] as PresetKey;
      if (!folder || !preset || !PRESETS[preset]) {
        console.error("Usage: batch <folder> <preset>");
        process.exit(1);
      }
      const files = fs.readdirSync(path.resolve(folder)).filter((f) => /\.(jpg|jpeg|png)$/i.test(f));
      console.log(`Processing ${files.length} images with preset: ${preset}`);
      for (const file of files) {
        try {
          await enhanceImage({
            imagePath: path.resolve(folder, file),
            prompt: PRESETS[preset],
          });
        } catch (err) {
          console.error(`Failed: ${file}`, err);
        }
      }
      break;
    }
    case "custom": {
      const imagePath = args[1];
      const prompt = args.slice(2).join(" ");
      if (!imagePath || !prompt) {
        console.error('Usage: custom <image-path> "your custom prompt"');
        process.exit(1);
      }
      await enhanceImage({
        imagePath: path.resolve(imagePath),
        prompt,
      });
      break;
    }
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

main().catch(console.error);

import type { ScenePreset } from './types'

export const scenePresets: ScenePreset[] = [
  {
    id: 'garden',
    label: 'Garden',
    promptSuffix:
      'Set in a sunlit botanical garden with soft natural light filtering through leaves. Lush greenery and delicate flowers in the background, warm golden hour tones.',
  },
  {
    id: 'studio-portrait',
    label: 'Studio Portrait',
    promptSuffix:
      'Professional studio setting with soft diffused lighting. Clean neutral backdrop with subtle gradient. Fashion editorial style, sharp focus on the jewelry.',
  },
  {
    id: 'mediterranean',
    label: 'Mediterranean',
    promptSuffix:
      'Mediterranean coastal setting with warm terracotta tones, whitewashed walls, and soft afternoon sunlight. Olive branches and natural stone textures.',
  },
  {
    id: 'artisan-workshop',
    label: 'Artisan Workshop',
    promptSuffix:
      'Intimate artisan workshop setting with natural wood surfaces, handcraft tools softly blurred in background. Warm window light, authentic maker aesthetic.',
  },
  {
    id: 'flat-lay',
    label: 'Instagram Flat Lay',
    promptSuffix:
      'Overhead flat lay composition on a marble or linen surface. Styled with dried flowers, fabric swatches, and natural elements. Clean, Instagram-ready aesthetic.',
  },
]

export const enhancementPresets: ScenePreset[] = [
  {
    id: 'white-bg',
    label: 'White Background',
    promptSuffix:
      'Place the product on a clean white background with professional product photography lighting. Soft shadows, crisp detail.',
  },
  {
    id: 'studio-lighting',
    label: 'Studio Lighting',
    promptSuffix:
      'Studio lighting with soft shadows on an elegant display surface. Professional product photography, sharp detail on the jewelry.',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle Setting',
    promptSuffix:
      'Place in a lifestyle setting with natural light and Mediterranean feel. Warm tones, natural textures.',
  },
  {
    id: 'cleanup',
    label: 'Clean Up',
    promptSuffix:
      'Clean up imperfections, enhance detail and color. Sharpen focus on the jewelry. Professional retouching quality.',
  },
]

export const compositionPresets: ScenePreset[] = [
  {
    id: 'wearing-closeup',
    label: 'Wearing Close-up',
    promptSuffix:
      'Close-up shot of the model wearing the jewelry. Focus on the piece with soft bokeh background. Beauty editorial style.',
  },
  {
    id: 'full-body-editorial',
    label: 'Full Body Editorial',
    promptSuffix:
      'Full body editorial fashion shot of the model wearing the jewelry. Magazine-quality composition and lighting.',
  },
  {
    id: 'product-focus-model',
    label: 'Product Focus with Model',
    promptSuffix:
      'The model holds or displays the jewelry piece. Focus on the product with the model providing context. Professional marketing image.',
  },
]

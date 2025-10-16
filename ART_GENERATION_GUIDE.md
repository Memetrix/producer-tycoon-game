# Art Generation Guide

## Overview
This guide explains how to generate all 220+ game art assets using the fal.ai flux-dev model.

## Prerequisites
- FAL_KEY environment variable must be set
- BLOB_READ_WRITE_TOKEN environment variable must be set
- All CSV files must be present in the project root

## CSV Files
1. `art-assets-01-equipment.csv` - 60 equipment images (6 categories × 10 levels)
2. `art-assets-02-artists.csv` - 80 artist portraits (8 artists × 10 levels)
3. `art-assets-03-ui-elements.csv` - 44 UI elements (skills, contracts, labels, achievements, tasks)
4. `art-assets-04-backgrounds.csv` - 36 backgrounds (loading screens, stages, menus, results)

**Total: 220 images**

## Generation Script
The script `scripts/generate-all-art.ts` will:
1. Read each CSV file
2. Generate images using fal-ai/flux/dev model
3. Upload to Vercel Blob storage
4. Save results to `art-generation-results.json`

## Running the Script

### Option 1: Generate All Images (Recommended for initial run)
\`\`\`bash
npx tsx scripts/generate-all-art.ts
\`\`\`

### Option 2: Generate Only HIGH Priority Images
Uncomment lines 62-65 in the script to skip MEDIUM and LOW priority images.

## Model Settings
- **Model**: fal-ai/flux/dev
- **Image Size**: square (512x512 or 1024x1024 depending on asset)
- **Inference Steps**: 28 (good quality/speed balance)
- **Guidance Scale**: 3.5 (optimal for cel-shaded style)
- **Safety Checker**: Disabled (for artistic freedom)

## Style Consistency
All prompts include:
- "cel-shaded art style"
- "bold black outlines"
- "flat vibrant colors"
- "2000s video game aesthetic like Jet Set Radio"
- "no photorealism"

## Rate Limiting
The script includes a 2-second delay between generations to avoid rate limiting.

**Estimated time**: 
- All 220 images: ~15-20 minutes
- HIGH priority only (~140 images): ~10-12 minutes

## Output
Generated images will be:
1. Uploaded to Vercel Blob storage
2. URLs saved in `art-generation-results.json`
3. Ready to use in the game

## Integration
After generation, update the game code to use the new blob URLs:
1. Equipment images in `components/studio-screen.tsx`
2. Artist portraits in artist components
3. UI elements in respective components
4. Backgrounds in screen components

## Troubleshooting
- **Rate limit errors**: Increase delay between generations (line 76)
- **Generation failures**: Check FAL_KEY and prompt length
- **Upload failures**: Check BLOB_READ_WRITE_TOKEN
- **Out of memory**: Generate in smaller batches (one CSV at a time)

## Cost Estimate
- fal-ai/flux/dev: ~$0.025 per image
- 220 images × $0.025 = ~$5.50 total

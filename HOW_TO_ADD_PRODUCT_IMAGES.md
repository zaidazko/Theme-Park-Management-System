# How to Add Custom Product Images

## Current Setup

Right now, your merchandise shop displays **real stock photography** from Unsplash based on product categories:
- Apparel (t-shirts, hoodies, jackets) → clothing photos
- Accessories (caps, bags, keychains) → accessory photos
- Toys (plush, collectibles) → toy photos
- Home goods (mugs, blankets) → home decor photos

This looks much better than text placeholders! However, you can replace these with your **own custom product images**.

---

## Option 1: Use Current Stock Photos (Already Done! ✅)

The system is already showing actual product photography. You can use this as-is for now and add custom images later.

---

## Option 2: Add Your Own Custom Product Images

### Step 1: Prepare Your Images

**Image Requirements:**
- Format: JPG or PNG
- Recommended size: 800x800px (square)
- File size: Under 500KB each
- Background: White or transparent preferred

### Step 2: Name Your Images

Convert product names to filenames using this pattern:
- Remove special characters
- Replace spaces with hyphens
- Make lowercase

**Examples:**
```
"ThrillWorld Classic Logo Tee" → thrillworld-classic-logo-tee.jpg
"Steel Dragon Pullover Hoodie" → steel-dragon-pullover-hoodie.jpg
"3D Coaster Track Keychain" → 3d-coaster-track-keychain.jpg
```

### Step 3: Place Images in Folder

Save all product images to:
```
frontend/public/merchandise/
```

### Step 4: Test

The system will automatically:
1. Try to load your custom image from `/merchandise/[filename].jpg`
2. If not found, fall back to the stock photo

---

## Where to Get Product Images

### Free Stock Photos (Current Default)
- ✅ Already implemented with Unsplash
- High-quality professional photos
- Works immediately

### Create AI-Generated Images
Use AI tools to generate product mockups:

**Midjourney Prompts:**
```
theme park t-shirt with roller coaster logo, product photography, white background, professional lighting

plush dragon mascot toy, theme park souvenir, cute style, product photo, studio lighting

coffee mug with theme park design, ceramic, professional product photography, white background
```

**DALL-E / Stable Diffusion:**
- Similar prompts work well
- Generate 1024x1024 images
- Download and resize to 800x800

### Design Your Own Mockups
- **Canva**: Use t-shirt/product templates
- **Photoshop**: Create professional mockups
- **Figma**: Design and export

### Purchase Stock Photography
- **Shutterstock** - Professional product photos
- **Adobe Stock** - High-quality images
- **iStock** - Affordable options

### Hire a Product Photographer
- Professional photos of physical merchandise
- Best for real products you're selling

---

## Quick Example

Let's say you have a product called **"ThrillWorld Classic Logo Tee"**:

1. Create/find an image of a t-shirt
2. Save it as: `thrillworld-classic-logo-tee.jpg`
3. Place in: `frontend/public/merchandise/`
4. Refresh the shop page
5. Your custom image now appears!

If the custom image isn't found, it automatically shows a stock photo of apparel.

---

## Pro Tips

### Use Consistent Styling
- Same background color (white preferred)
- Same lighting angle
- Same product positioning
- Consistent shadows

### Optimize File Sizes
```bash
# Use tools like:
- TinyPNG.com (web-based)
- ImageOptim (Mac)
- JPEG-Optimizer (online)
```

### Test Different Angles
- Front view for apparel
- 3/4 angle for accessories
- Multiple views for complex items

### Add Context
- Show scale with hands/models
- Include lifestyle shots
- Display color variations

---

## Current Product List (Starter Collection)

Here are the filenames for the 22 starter products:

**Apparel:**
1. `thrillworld-classic-logo-tee.jpg`
2. `steel-dragon-pullover-hoodie.jpg`
3. `glow-in-dark-coaster-track-hoodie.jpg`
4. `thrillworld-windbreaker-jacket.jpg`
5. `limited-edition-30th-anniversary-hoodie.jpg`

**Accessories:**
6. `thrillworld-snapback-cap.jpg`
7. `3d-coaster-track-keychain.jpg`
8. `collector-pin-set-5-pack.jpg`
9. `thrillworld-mini-backpack.jpg`
10. `light-up-coaster-car-keychain.jpg`

**Toys:**
11. `roller-coaster-bear-plush.jpg`
12. `giant-thrillworld-dragon-plush.jpg`
13. `die-cast-coaster-train-model.jpg`
14. `souvenir-popcorn-bucket-dragon.jpg`
15. `light-up-coaster-track-display.jpg`

**Home:**
16. `thrillworld-ceramic-coffee-mug.jpg`
17. `steel-dragon-insulated-tumbler.jpg`
18. `led-neon-sign-thrillworld-logo.jpg`
19. `throw-blanket-park-map-design.jpg`
20. `souvenir-refillable-cup-park-special.jpg`

**Test Items:**
21. `sold-out-steel-dragon-i-survived-tee.jpg`
22. `low-stock-crystal-coaster-sculpture.jpg`

---

## Bulk Image Generation Script

If you want to generate placeholder images for all products at once:

```javascript
// Save this as generate-placeholders.js
const fs = require('fs');
const products = [
  "ThrillWorld Classic Logo Tee",
  "Steel Dragon Pullover Hoodie",
  // ... add all products
];

products.forEach(product => {
  const filename = product.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  console.log(`Need image: ${filename}.jpg`);
});
```

---

## Troubleshooting

### Image Not Showing?
1. Check filename matches exactly (lowercase, hyphens)
2. Verify file is in `frontend/public/merchandise/`
3. Refresh browser (Ctrl+F5)
4. Check browser console for errors

### Image Too Large?
- Resize to 800x800px max
- Compress using TinyPNG.com
- Convert to JPG if using PNG

### Wrong Image Appearing?
- Clear browser cache
- Check filename spelling
- Verify file extension is `.jpg`

---

## Summary

**Current Status:** ✅ Your shop already shows real product photography from Unsplash!

**To add custom images:**
1. Create/find product images (800x800px)
2. Name them correctly (lowercase with hyphens)
3. Save to `frontend/public/merchandise/`
4. System automatically uses them

**No custom images?** No problem! Stock photos are already working and look professional.

---

Need help? The system is designed to work great with or without custom images!

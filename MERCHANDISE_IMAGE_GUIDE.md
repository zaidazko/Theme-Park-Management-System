# ThrillWorld Merchandise - Image Guide

## Overview
This guide will help you add images for each merchandise item. Images enhance the shopping experience and make the merchandise more appealing.

## Quick Setup (For Testing)

### Option 1: Use Placeholder Images (Fastest)
You can use placeholder image services for quick testing:

```javascript
// Modify CommodityPurchase.jsx to use placeholder images
const getItemImage = (itemName) => {
  // Use a placeholder service with consistent colors
  const hash = itemName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F', 'BB8FCE', '85C1E2'];
  const color = colors[hash % colors.length];

  return `https://via.placeholder.com/300x300/${color}/FFFFFF?text=${encodeURIComponent(itemName.substring(0, 20))}`;
};
```

### Option 2: Use Category Icons (Recommended for MVP)
Use emoji or icon fonts for quick visual representation:
- Apparel: 👕 🧥 👖
- Accessories: 🧢 🎒 🔑
- Toys: 🧸 🎁 🎪
- Home: ☕ 🖼️ 💡
- Special: ⭐ 🎉 🏆

### Option 3: Real Images (Production Ready)

#### Where to Get Images

1. **Free Stock Photos:**
   - [Unsplash](https://unsplash.com) - Search: "theme park merchandise", "roller coaster", "souvenir"
   - [Pexels](https://pexels.com) - Search: "apparel", "toys", "merchandise"
   - [Pixabay](https://pixabay.com) - Search similar keywords

2. **Create AI Images:**
   - [Midjourney](https://midjourney.com) - Best quality
   - [DALL-E](https://openai.com/dall-e-2) - Good for specific items
   - [Stable Diffusion](https://stablediffusion.com) - Free option

   Example prompts:
   - "theme park t-shirt with roller coaster logo, product photography, white background"
   - "plush dragon toy mascot, theme park souvenir, professional product photo"
   - "coffee mug with theme park design, side view, clean background"

3. **Design Your Own:**
   - Use Canva to create mockups
   - Use Photoshop/GIMP for professional designs
   - Create SVG logos in Figma

## Image Specifications

### Technical Requirements
- **Format:** JPG or PNG (PNG for transparency)
- **Size:** 800x800px (will be scaled down automatically)
- **Aspect Ratio:** 1:1 (square) preferred
- **File Size:** Under 500KB each
- **Background:** White or transparent preferred

### Naming Convention
Save images in `frontend/public/merchandise/` with this format:
```
[category]-[item-name].jpg

Examples:
apparel-thrillworld-classic-tee.jpg
accessory-snapback-cap.jpg
toy-dragon-plush.jpg
home-coffee-mug.jpg
special-anniversary-hoodie.jpg
```

## Merchandise Item Image Suggestions

### APPAREL & WEARABLES

**T-Shirts:**
- `apparel-classic-logo-tee.jpg` - White t-shirt with ThrillWorld logo on chest
- `apparel-steel-dragon-tee.jpg` - Black tee with coaster graphic
- `apparel-twisted-cyclone-tee.jpg` - Dark grey with ride design
- `apparel-vintage-1995-tee.jpg` - Vintage wash with retro logo

**Hoodies:**
- `apparel-premium-zip-hoodie.jpg` - Navy zip-up with embroidered logo
- `apparel-steel-dragon-hoodie.jpg` - Black pullover with large back graphic
- `apparel-glow-hoodie.jpg` - Dark hoodie with glow-in-dark track design
- `apparel-anniversary-hoodie.jpg` - Premium burgundy with gold embroidery

**Jackets:**
- `apparel-windbreaker.jpg` - Light blue windbreaker with ThrillWorld across back
- `apparel-explorer-jacket.jpg` - Utility jacket with multiple pockets
- `apparel-varsity-jacket.jpg` - Classic letterman style with patches

**Sweats:**
- `apparel-jogger-pants.jpg` - Grey joggers with small logo
- `apparel-crew-sweatshirt.jpg` - Comfortable crew neck in multiple colors

### ACCESSORIES & SMALL WEARABLES

**Caps & Hats:**
- `accessory-snapback-cap.jpg` - Classic snapback with 3D embroidered logo
- `accessory-steel-dragon-hat.jpg` - Fitted cap with ride name
- `accessory-dad-hat.jpg` - Vintage-style unstructured cap
- `accessory-bucket-hat.jpg` - Bucket hat with all-over print

**Keychains & Pins:**
- `accessory-3d-keychain.jpg` - Metal coaster track keychain
- `accessory-enamel-pin.jpg` - Colorful enamel pin with logo
- `accessory-pin-set.jpg` - Collection of 5 pins in display card
- `accessory-lightup-keychain.jpg` - LED light-up coaster car

**Lanyards:**
- `accessory-season-pass-lanyard.jpg` - Woven lanyard with carabiner
- `accessory-ride-tracker-lanyard.jpg` - Lanyard with tracking card

**Bags & Wallets:**
- `accessory-mini-backpack.jpg` - Stylish mini backpack
- `accessory-sling-bag.jpg` - Waterproof sling bag
- `accessory-blueprint-wallet.jpg` - Wallet with coaster blueprint design
- `accessory-cardholder.jpg` - Slim cardholder with ticket design

### TOYS, PLUSH & COLLECTIBLES

**Plush Toys:**
- `toy-coaster-bear.jpg` - Teddy bear in ThrillWorld shirt
- `toy-giant-dragon.jpg` - Large dragon plush mascot
- `toy-mini-mascot.jpg` - Small plush collection
- `toy-golden-dragon.jpg` - Premium gold-colored dragon

**Action Figures & Models:**
- `collectible-diecast-train.jpg` - Metal coaster train model
- `collectible-building-kit.jpg` - Model kit in box
- `collectible-mascot-figure.jpg` - Detailed figurine
- `collectible-light-display.jpg` - Illuminated coaster track

**Novelty Items:**
- `toy-popcorn-bucket.jpg` - Dragon-shaped popcorn container
- `toy-glow-sticks.jpg` - Package of colorful glow sticks
- `toy-bubble-wand.jpg` - Light-up bubble maker

### HOME, DECOR & LIFESTYLE

**Mugs & Drinkware:**
- `home-ceramic-mug.jpg` - Classic coffee mug with logo
- `home-insulated-tumbler.jpg` - Stainless steel tumbler
- `home-color-changing-mug.jpg` - Heat-reactive mug
- `home-refillable-cup.jpg` - Plastic souvenir cup with straw
- `home-water-bottle.jpg` - Sport water bottle

**Stationery:**
- `home-notebook-set.jpg` - Set of 3 notebooks
- `home-blueprint-poster.jpg` - Coaster design posters
- `home-pen-set.jpg` - Premium pen and pencil set
- `home-photo-frame.jpg` - Magnetic frame set

**Home Decor:**
- `home-neon-sign.jpg` - LED neon light
- `home-wall-art.jpg` - Canvas print of coaster
- `home-ornament-set.jpg` - Holiday ornaments
- `home-throw-blanket.jpg` - Soft blanket with park map
- `home-pillow.jpg` - Decorative throw pillow

**Storage & Snacks:**
- `home-snack-containers.jpg` - Set of 3 containers
- `home-lunch-box.jpg` - Metal lunch box with graphics
- `home-cooler-bag.jpg` - Insulated cooler

### SPECIAL EVENT & LIMITED EDITION

**Anniversary Collection:**
- `special-anniversary-coin.jpg` - Commemorative collector coin
- `special-anniversary-pin.jpg` - Limited edition pin badge
- `special-anniversary-book.jpg` - Park history book
- `special-founders-tee.jpg` - Premium founders edition shirt

**Ride-Specific:**
- `special-i-survived-tee.jpg` - "I Survived" graphic tee
- `special-face-mask.jpg` - Themed face covering
- `special-photo-magnet.jpg` - Ride photo magnet
- `special-trading-cards.jpg` - Full set of cards

**Seasonal:**
- `special-fright-fest-hoodie.jpg` - Halloween event hoodie
- `special-holiday-ornaments.jpg` - Christmas ornament collection
- `special-beach-towel.jpg` - Summer themed towel
- `special-halloween-mask.jpg` - Glow mask for Halloween

**Premium:**
- `special-leather-jacket.jpg` - High-end embroidered jacket
- `special-crystal-sculpture.jpg` - Crystal coaster art piece
- `special-autographed-photo.jpg` - Framed signed photo
- `special-vip-gift-box.jpg` - Luxury gift set

## Implementation Steps

### Step 1: Create Image Directory
```bash
mkdir -p frontend/public/merchandise
```

### Step 2: Add Images
Place all image files in `frontend/public/merchandise/` directory.

### Step 3: Update CommodityPurchase Component
Add image support to the component:

```jsx
// In CommodityPurchase.jsx
const getItemImage = (commodityName) => {
  // Convert name to filename format
  const filename = commodityName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Return image path or fallback to placeholder
  return `/merchandise/${filename}.jpg`;
};

// In the JSX, replace the emoji icon with:
<img
  src={getItemImage(item.commodityName)}
  alt={item.commodityName}
  onError={(e) => {
    // Fallback to placeholder if image not found
    e.target.src = `https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=${encodeURIComponent(item.commodityName.substring(0, 15))}`;
  }}
  style={{
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '15px'
  }}
/>
```

## Quick Test Setup

For immediate testing, you can use the placeholder approach:

1. The images will auto-generate based on item names
2. Each category will have consistent colors
3. No need to download/create images initially
4. Replace with real images when ready

## Tips for Best Results

1. **Consistency:** Use same lighting and background for all photos
2. **Focus:** Product should fill 70-80% of frame
3. **Quality:** High resolution but optimized file size
4. **Variety:** Show different angles or colors if available
5. **Branding:** Include subtle ThrillWorld branding on products

## Example AI Image Prompts

Use these with AI image generators:

```
ThrillWorld theme park t-shirt mockup, roller coaster graphic, professional product photography, white background, centered, high quality, 4k

Plush dragon mascot toy, cute style, theme park souvenir, turquoise and purple colors, soft lighting, product photo, white background

Coffee mug with theme park logo, ceramic, side view showing handle, clean white background, studio lighting, product photography

Snapback baseball cap, embroidered logo, front view, premium quality, theme park merchandise, professional photo, white background

Limited edition hoodie, dark blue, gold embroidery, front and back view, anniversary edition, premium apparel photography
```

---

**Need Help?**
- Test with placeholders first, then gradually add real images
- Focus on top 20 best-selling items for initial launch
- Use consistent styling across all product images
- Consider hiring a product photographer for professional shots

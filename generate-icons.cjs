// Simple icon generator for GreenBlu.ai
// Creates PNG icons with a teal circle and "GB" text

const fs = require('fs');
const path = require('path');

// SVG template for the icon
function createIconSVG(size) {
  const fontSize = size * 0.45;
  const circleRadius = size * 0.4;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient circle -->
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#14b8a6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0891b2;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Circle background -->
  <circle cx="${size/2}" cy="${size/2}" r="${circleRadius}" fill="url(#gradient)" />

  <!-- GB text -->
  <text x="${size/2}" y="${size/2 + fontSize/3}"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="white"
        text-anchor="middle">GB</text>
</svg>`;
}

// Create SVG files (browsers can use these directly in many cases)
const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG files
sizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const svgPath = path.join(iconsDir, `icon-${size}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`Created ${svgPath}`);
});

console.log('\nSVG icons created successfully!');
console.log('\nTo convert to PNG (if needed):');
console.log('Install: npm install sharp');
console.log('Or use online converter or Chrome will accept SVG in many cases');

// Try to convert to PNG if sharp is available
try {
  const sharp = require('sharp');

  console.log('\nConverting SVG to PNG...');

  Promise.all(sizes.map(async size => {
    const svgPath = path.join(iconsDir, `icon-${size}.svg`);
    const pngPath = path.join(iconsDir, `icon-${size}.png`);

    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(pngPath);

    console.log(`Created ${pngPath}`);
  })).then(() => {
    console.log('\nAll PNG icons created successfully!');
  }).catch(err => {
    console.error('Error converting to PNG:', err.message);
  });

} catch (err) {
  console.log('\nNote: Sharp not installed. SVG files created.');
  console.log('To create PNGs, run: npm install sharp && node generate-icons.js');
}

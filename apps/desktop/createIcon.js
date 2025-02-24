const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create a 16x16 canvas for the icon
const canvas = createCanvas(16, 16);
const ctx = canvas.getContext('2d');

// Draw a simple circle
ctx.beginPath();
ctx.arc(8, 8, 6, 0, Math.PI * 2);
ctx.fillStyle = 'black';
ctx.fill();

// Save as PNG
const buffer = canvas.toBuffer('image/png');
const assetsDir = path.join(__dirname, 'assets');

if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}

fs.writeFileSync(path.join(assetsDir, 'icon.png'), buffer); 
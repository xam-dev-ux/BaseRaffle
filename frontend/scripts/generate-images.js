import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '../public/images');

// Ensure directory exists
mkdirSync(publicDir, { recursive: true });

// Icon 1024x1024
const iconSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="200" fill="#0052FF"/>
  <circle cx="512" cy="380" r="160" stroke="white" stroke-width="40" fill="none"/>
  <path d="M512 540 L512 700" stroke="white" stroke-width="40" stroke-linecap="round"/>
  <circle cx="512" cy="780" r="35" fill="white"/>
</svg>`;

// Splash 200x200
const splashSvg = `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#0a0a0f"/>
  <circle cx="100" cy="75" r="32" stroke="#0052FF" stroke-width="8" fill="none"/>
  <path d="M100 107 L100 145" stroke="#0052FF" stroke-width="8" stroke-linecap="round"/>
  <circle cx="100" cy="162" r="7" fill="#0052FF"/>
</svg>`;

// Hero 1200x630 (OG image size)
const heroSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0a0a0f"/>
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0052FF;stop-opacity:0.4" />
      <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:0.4" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#grad)"/>
  <circle cx="600" cy="200" r="90" stroke="#0052FF" stroke-width="16" fill="none"/>
  <path d="M600 290 L600 370" stroke="#0052FF" stroke-width="16" stroke-linecap="round"/>
  <circle cx="600" cy="410" r="16" fill="#0052FF"/>
  <text x="600" y="510" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="64" font-weight="bold">BaseRaffle</text>
  <text x="600" y="570" text-anchor="middle" fill="#9CA3AF" font-family="Arial, sans-serif" font-size="24">Provably Fair Raffles on Base</text>
</svg>`;

async function generateImages() {
  console.log('Generating PNG images...');

  // Icon 1024x1024
  await sharp(Buffer.from(iconSvg))
    .png()
    .toFile(join(publicDir, 'icon-1024.png'));
  console.log('Created icon-1024.png');

  // Splash 200x200
  await sharp(Buffer.from(splashSvg))
    .png()
    .toFile(join(publicDir, 'splash-200.png'));
  console.log('Created splash-200.png');

  // Hero/OG 1200x630
  await sharp(Buffer.from(heroSvg))
    .png()
    .toFile(join(publicDir, 'og-image.png'));
  console.log('Created og-image.png');

  console.log('Done!');
}

generateImages().catch(console.error);

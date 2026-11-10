import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcLogo = path.join(root, 'public', 'assets', 'Slow_Darija_Logo.png');
const publicDir = path.join(root, 'public');
const appDir = path.join(root, 'app');

function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(count, 4); // count

  let offset = 6 + count * 16;
  const dirEntries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.width === 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height === 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    dirEntries.push(entry);
    offset += item.buffer.length;
  }
  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map((p) => p.buffer)]);
}

async function generate() {
  console.log('Generating favicons and mobile app icons from Slow_Darija_Logo.png...');

  const iconConfigs = [
    // Browser / PC standard
    { name: 'favicon-16x16.png', width: 16, height: 16 },
    { name: 'favicon-32x32.png', width: 32, height: 32 },
    { name: 'favicon-48x48.png', width: 48, height: 48 },
    { name: 'favicon-96x96.png', width: 96, height: 96 },

    // Apple / iOS / macOS
    { name: 'apple-touch-icon.png', width: 180, height: 180 },
    { name: 'apple-touch-icon-180x180.png', width: 180, height: 180 },
    { name: 'apple-touch-icon-152x152.png', width: 152, height: 152 },
    { name: 'apple-touch-icon-120x120.png', width: 120, height: 120 },
    { name: 'apple-touch-icon-76x76.png', width: 76, height: 76 },

    // Android / PWA
    { name: 'android-chrome-192x192.png', width: 192, height: 192 },
    { name: 'android-chrome-512x512.png', width: 512, height: 512 },

    // Windows Tiles
    { name: 'mstile-70x70.png', width: 70, height: 70 },
    { name: 'mstile-144x144.png', width: 144, height: 144 },
    { name: 'mstile-150x150.png', width: 150, height: 150 },
    { name: 'mstile-310x310.png', width: 310, height: 310 },
  ];

  for (const cfg of iconConfigs) {
    const dest = path.join(publicDir, cfg.name);
    await sharp(srcLogo)
      .resize(cfg.width, cfg.height, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(dest);
    console.log(`✓ ${cfg.name} (${cfg.width}x${cfg.height})`);
  }

  // Windows wide tile (310x150)
  await sharp(srcLogo)
    .resize(310, 150, {
      fit: 'contain',
      background: { r: 13, g: 148, b: 136, alpha: 0 },
    })
    .png()
    .toFile(path.join(publicDir, 'mstile-310x150.png'));
  console.log(`✓ mstile-310x150.png (310x150)`);

  // Maskable icons for Android (with 15% safe padding)
  const maskable192 = await sharp(srcLogo)
    .resize(154, 154, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .extend({
      top: 19,
      bottom: 19,
      left: 19,
      right: 19,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toFile(path.join(publicDir, 'android-chrome-maskable-192x192.png'));
  console.log(`✓ android-chrome-maskable-192x192.png`);

  const maskable512 = await sharp(srcLogo)
    .resize(410, 410, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toFile(path.join(publicDir, 'android-chrome-maskable-512x512.png'));
  console.log(`✓ android-chrome-maskable-512x512.png`);

  // Multi-resolution favicon.ico (16, 32, 48)
  const icoSizes = [16, 32, 48];
  const icoPngs = await Promise.all(
    icoSizes.map(async (s) => ({
      width: s,
      height: s,
      buffer: await sharp(srcLogo)
        .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer(),
    }))
  );
  const icoBuffer = createIco(icoPngs);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  console.log(`✓ favicon.ico (16, 32, 48 bundled into public/ and app/)`);

  // Next.js App Router icon & apple-icon files
  fs.copyFileSync(path.join(publicDir, 'apple-touch-icon.png'), path.join(appDir, 'apple-icon.png'));
  fs.copyFileSync(path.join(publicDir, 'favicon-32x32.png'), path.join(appDir, 'icon.png'));
  console.log(`✓ app/apple-icon.png and app/icon.png`);

  // site.webmanifest
  const webmanifest = {
    name: 'Slow Darija',
    short_name: 'SlowDarija',
    description: 'Learn Moroccan Darija naturally, without rushing it.',
    start_url: '/darija_learning/',
    scope: '/darija_learning/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0d9488',
    icons: [
      {
        src: '/darija_learning/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        src: '/darija_learning/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/darija_learning/favicon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/darija_learning/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/darija_learning/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/darija_learning/android-chrome-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/darija_learning/android-chrome-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  fs.writeFileSync(
    path.join(publicDir, 'site.webmanifest'),
    JSON.stringify(webmanifest, null, 2),
    'utf8'
  );
  fs.writeFileSync(
    path.join(publicDir, 'manifest.json'),
    JSON.stringify(webmanifest, null, 2),
    'utf8'
  );
  console.log(`✓ site.webmanifest and manifest.json`);

  // browserconfig.xml for Windows Start screen
  const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square70x70logo src="/darija_learning/mstile-70x70.png"/>
      <square150x150logo src="/darija_learning/mstile-150x150.png"/>
      <wide310x150logo src="/darija_learning/mstile-310x150.png"/>
      <square310x310logo src="/darija_learning/mstile-310x310.png"/>
      <TileColor>#0d9488</TileColor>
    </tile>
  </msapplication>
</browserconfig>
`;
  fs.writeFileSync(path.join(publicDir, 'browserconfig.xml'), browserconfig, 'utf8');
  console.log(`✓ browserconfig.xml`);

  console.log('\nAll favicons and platform icons successfully generated!');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});

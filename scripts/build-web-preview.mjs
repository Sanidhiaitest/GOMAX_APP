#!/usr/bin/env node
// Builds a single self-contained HTML file from the Expo web export, so the
// app can be viewed as one static file (e.g. published as a Claude Artifact,
// or emailed around) with no external requests.
//
// Usage: node scripts/build-web-preview.mjs
// Requires `npx expo export --platform web` to have been run first (or run
// via the "preview:web" npm script, which does both).
//
// How it works: Metro's web bundle references each font/image asset by its
// literal absolute path (e.g. "/assets/node_modules/@expo-google-fonts/inter/
// 400Regular/Inter_400Regular.<hash>.ttf") as a plain string constant. Rather
// than intercepting fetch/XHR at runtime (which misses browser-native loads
// like @font-face and <img src>), we directly substitute each of those path
// strings inside the bundle text for a data: URI before inlining — whatever
// mechanism later reads that string gets the embedded bytes for free.

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, 'web-preview.html');

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npx expo export --platform web` first.');
  process.exit(1);
}

const MIME = {
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

function toDataUri(absPath) {
  const ext = absPath.slice(absPath.lastIndexOf('.'));
  const mime = MIME[ext] || 'application/octet-stream';
  const b64 = readFileSync(absPath).toString('base64');
  return `data:${mime};base64,${b64}`;
}

// Every asset the app actually requests at runtime (custom fonts, the one
// icon font in use, and the logo art) — matched by filename prefix since
// Metro content-hashes filenames and nests font weights in subdirectories.
// Discovered empirically via a headless-browser network trace — see
// assets/README.md if this list needs to grow (new font weight, new icon
// family import, new logo variant).
const ASSET_FILENAME_PREFIXES = [
  'Inter_400Regular.',
  'Inter_500Medium.',
  'Inter_600SemiBold.',
  'Inter_700Bold.',
  'Roboto_400Regular.',
  'Roboto_500Medium.',
  'Roboto_600SemiBold.',
  'Roboto_700Bold.',
  'Ionicons.',
  'gomax-logo-full-orange.',
  'gomax-logo-full-navy.',
  'gomax-mark-orange.',
  'gomax-mark-navy.',
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const allFiles = walk(DIST);

function safeReplaceAll(haystack, needle, replacement) {
  return haystack.split(needle).join(replacement);
}

let html = readFileSync(join(DIST, 'index.html'), 'utf8');
html = safeReplaceAll(html, '<title>GOMAX_APP</title>', '<title>GoMax App Preview</title>');
const scriptMatch = html.match(/<script src="([^"]+)" defer><\/script>/);
if (!scriptMatch) throw new Error('Could not find main bundle <script> tag in dist/index.html');
const bundlePath = scriptMatch[1].replace(/^\//, '');
let bundleJs = readFileSync(join(DIST, bundlePath), 'utf8');

let replacedCount = 0;
for (const prefix of ASSET_FILENAME_PREFIXES) {
  const match = allFiles.find((f) => f.split('/').pop().startsWith(prefix));
  if (!match) throw new Error(`No file found for asset prefix: ${prefix}`);
  const relPath = '/' + match.slice(DIST.length + 1);
  if (!bundleJs.includes(relPath)) {
    console.warn(`Warning: asset path not found as a literal in the bundle: ${relPath}`);
    continue;
  }
  bundleJs = safeReplaceAll(bundleJs, relPath, toDataUri(match));
  replacedCount++;
}
console.log(`Inlined ${replacedCount}/${ASSET_FILENAME_PREFIXES.length} assets as data URIs.`);

// Escape any literal "</script" left in the bundle (e.g. inside an unrelated
// string) — otherwise the HTML tokenizer closes our <script> tag early.
bundleJs = safeReplaceAll(bundleJs, '</script', '<\\/script');

// Plain string splicing (NOT String.replace with a dynamic replacement) —
// bundleJs is 1.7MB of code and almost certainly contains "$&", "$$", "$1",
// etc. as substrings, which String.replace's replacement-string argument
// would interpret as special patterns and use to corrupt the output.
const htmlNoFavicon = safeReplaceAll(html, html.match(/<link rel="icon" href="[^"]*"\/>/)[0], '');
const scriptTagRe = /<script src="[^"]+" defer><\/script>/;
const [before, after] = htmlNoFavicon.split(scriptTagRe);
const finalHtml = before + '<script>' + bundleJs + '</script>' + after;

writeFileSync(OUT, finalHtml, 'utf8');
console.log(`Wrote ${OUT} (${(finalHtml.length / 1024 / 1024).toFixed(2)} MB)`);

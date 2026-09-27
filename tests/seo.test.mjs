import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('siteConfig contains production domain and Romania/Moldova locations', () => {
  const content = fs.readFileSync(path.join(rootDir, 'config', 'site.ts'), 'utf8');
  assert.match(content, /url:\s*'https:\/\/www\.vorticore\.site'/);
  assert.match(content, /București/);
  assert.match(content, /Chișinău/);
  assert.match(content, /defaultLocale:\s*'ro'/);
});

test('robots.ts authorizes AI search engines and points to sitemap', () => {
  const content = fs.readFileSync(path.join(rootDir, 'app', 'robots.ts'), 'utf8');
  assert.match(content, /GPTBot/);
  assert.match(content, /ChatGPT-User/);
  assert.match(content, /PerplexityBot/);
  assert.match(content, /ClaudeBot/);
  assert.match(content, /sitemap\.xml/);
});

test('sitemap.ts covers all locales with priority', () => {
  const content = fs.readFileSync(path.join(rootDir, 'app', 'sitemap.ts'), 'utf8');
  assert.match(content, /\/ro/);
  assert.match(content, /\/ru/);
  assert.match(content, /\/en/);
  assert.match(content, /priority:\s*1\.0/);
});

test('layout includes JSON-LD Schema.org for ProfessionalService and Organization', () => {
  const content = fs.readFileSync(path.join(rootDir, 'app', '[locale]', 'layout.tsx'), 'utf8');
  assert.match(content, /schema\.org/);
  assert.match(content, /ProfessionalService/);
  assert.match(content, /Organization/);
  assert.match(content, /Romania/);
  assert.match(content, /Moldova/);
  assert.match(content, /București/);
  assert.match(content, /Chișinău/);
  assert.match(content, /application\/ld\+json/);
});

test('locations data includes Romania and Moldova hubs', () => {
  const content = fs.readFileSync(path.join(rootDir, 'data', 'locations.ts'), 'utf8');
  assert.match(content, /București/);
  assert.match(content, /Chișinău/);
});

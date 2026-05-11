#!/usr/bin/env node
// Append a community entry to docs/communities.json based on parsed issue form data.
// Inputs (env):
//   PARSED  — JSON string from stefanbuck/github-issue-parser (keyed by field id)
// Outputs (to $GITHUB_OUTPUT):
//   name    — community name used for PR title/commit message
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const COMMUNITIES_PATH = resolve('docs/communities.json');
const NO_RESPONSE = /^_no response_$/i;

const clean = (v) => {
  if (typeof v !== 'string') return '';
  const t = v.trim();
  return NO_RESPONSE.test(t) ? '' : t;
};

const setOutput = async (key, value) => {
  const file = process.env.GITHUB_OUTPUT;
  if (!file) return;
  await appendFile(file, `${key}=${value}\n`);
};

const fail = (msg) => {
  console.error(`::error::${msg}`);
  process.exit(1);
};

const parsed = JSON.parse(process.env.PARSED || '{}');
const nameKo = clean(parsed.name_ko);
const nameEn = clean(parsed.name_en);
const urlKo = clean(parsed.url_ko);
const urlEn = clean(parsed.url_en);

if (!nameKo) fail('name_ko (커뮤니티 이름 / 한국어) is required.');
if (!urlKo) fail('url_ko (커뮤니티 URL / 한국어) is required.');

const isHttpUrl = (s) => /^https?:\/\/\S+$/i.test(s);
if (!isHttpUrl(urlKo)) fail(`url_ko must be a valid http(s) URL: ${urlKo}`);
if (urlEn && !isHttpUrl(urlEn)) fail(`url_en must be a valid http(s) URL: ${urlEn}`);

const localized = (ko, en) => {
  if (en && en !== ko) return { ko, en };
  return ko;
};

const entry = {
  name: localized(nameKo, nameEn),
  url: localized(urlKo, urlEn)
};

const raw = await readFile(COMMUNITIES_PATH, 'utf8');
const list = JSON.parse(raw);
if (!Array.isArray(list)) fail('docs/communities.json must be a JSON array.');

const displayName = typeof entry.name === 'string' ? entry.name : entry.name.ko;
const duplicate = list.some((c) => {
  const existing = typeof c.name === 'string' ? c.name : (c.name?.ko || c.name?.en || '');
  return existing.trim().toLowerCase() === displayName.trim().toLowerCase();
});
if (duplicate) fail(`Community "${displayName}" already exists in docs/communities.json.`);

list.push(entry);
await writeFile(COMMUNITIES_PATH, JSON.stringify(list, null, 2) + '\n', 'utf8');

await setOutput('name', displayName);
console.log(`Appended community: ${displayName}`);

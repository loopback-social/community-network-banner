#!/usr/bin/env node
// Append a news entry to docs/news.json based on parsed issue form data.
// Inputs (env):
//   PARSED  — JSON string from stefanbuck/github-issue-parser (keyed by field id)
// Outputs (to $GITHUB_OUTPUT):
//   summary — short title used for PR title/commit message
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const NEWS_PATH = resolve('docs/news.json');
const NO_RESPONSE = /^_no response_$/i;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
const OFFSET_RE = /^([Zz]|[+-]\d{2}:\d{2})$/;
const IANA_RE = /^[A-Za-z]+(?:[\/_+\-][A-Za-z0-9]+)*$/;

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
const start = clean(parsed.start);
const end = clean(parsed.end);
const timezone = clean(parsed.timezone);
const messageKo = clean(parsed.message_ko);
const messageEn = clean(parsed.message_en);
const linkKo = clean(parsed.link_ko);
const linkEn = clean(parsed.link_en);
const displayRaw = clean(parsed.display) || 'true';

if (!DATETIME_RE.test(start)) fail(`start must match YYYY-MM-DD HH:MM:SS: "${start}"`);
if (!DATETIME_RE.test(end)) fail(`end must match YYYY-MM-DD HH:MM:SS: "${end}"`);
if (new Date(start.replace(' ', 'T') + 'Z') >= new Date(end.replace(' ', 'T') + 'Z')) {
  fail(`start (${start}) must be earlier than end (${end}).`);
}
if (timezone && !OFFSET_RE.test(timezone) && !IANA_RE.test(timezone)) {
  fail(`timezone must be a UTC offset (e.g. +09:00) or IANA name (e.g. Asia/Seoul): "${timezone}"`);
}
if (!messageKo) fail('message_ko (뉴스 메시지 / 한국어) is required.');

const isHttpUrl = (s) => /^https?:\/\/\S+$/i.test(s);
if (linkKo && !isHttpUrl(linkKo)) fail(`link_ko must be a valid http(s) URL: ${linkKo}`);
if (linkEn && !isHttpUrl(linkEn)) fail(`link_en must be a valid http(s) URL: ${linkEn}`);

const displayLower = displayRaw.toLowerCase();
if (!['true', 'false', 'yes', 'no', '1', '0'].includes(displayLower)) {
  fail(`display must be one of true/false/yes/no/1/0: "${displayRaw}"`);
}
const display = ['true', 'yes', '1'].includes(displayLower);

const localized = (ko, en) => {
  if (en && en !== ko) return { ko, en };
  return ko;
};

const entry = {
  start,
  end,
  ...(timezone ? { timezone } : {}),
  message: localized(messageKo, messageEn),
  ...(linkKo ? { link: localized(linkKo, linkEn) } : {}),
  display
};

const raw = await readFile(NEWS_PATH, 'utf8');
const list = JSON.parse(raw);
if (!Array.isArray(list)) fail('docs/news.json must be a JSON array.');

list.push(entry);
await writeFile(NEWS_PATH, JSON.stringify(list, null, 2) + '\n', 'utf8');

const summary = messageKo.length > 60 ? messageKo.slice(0, 57) + '...' : messageKo;
await setOutput('summary', summary);
console.log(`Appended news: ${summary}`);

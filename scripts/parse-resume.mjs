/**
 * parse-resume.mjs
 * Runs in Node.js at dev/build time (via predev / prebuild hooks).
 * Reads the first *.pdf found in public/, extracts the WORK EXPERIENCE
 * section using PDF.js (legacy Node-compatible build), and writes the
 * result to src/data/resumeExperiences.ts so the React app can import
 * it directly — no browser-side PDF.js or workers needed.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { pathToFileURL, fileURLToPath } from 'url';
import { join, resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir   = resolve(__dirname, '..');
const publicDir = join(rootDir, 'public');
const outFile   = join(rootDir, 'src', 'data', 'resumeExperiences.ts');

// ── Find resume PDF ───────────────────────────────────────────────────

const pdfs = existsSync(publicDir)
  ? readdirSync(publicDir).filter(f => f.toLowerCase().endsWith('.pdf'))
  : [];

// Prefer "resume.pdf", otherwise use the first PDF found
const pdfName = pdfs.includes('resume.pdf') ? 'resume.pdf' : pdfs[0];
const pdfPath = pdfName ? join(publicDir, pdfName) : null;

if (!pdfPath || !existsSync(pdfPath)) {
  console.log('[parse-resume] No PDF found in public/ — experience data unchanged.');
  process.exit(0);
}

console.log(`[parse-resume] Parsing ${pdfName}…`);

// ── Load PDF.js (legacy Node-compatible build) ─────────────────────────

const pdfModuleUrl = pathToFileURL(join(rootDir, 'node_modules/pdfjs-dist/legacy/build/pdf.mjs')).href;
const workerUrl    = pathToFileURL(join(rootDir, 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')).href;

const pdfjsLib = await import(pdfModuleUrl);
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

// ── Extract text lines ────────────────────────────────────────────────

const data = new Uint8Array(readFileSync(pdfPath));
const pdf  = await pdfjsLib.getDocument({ data }).promise;

const allLines = [];
const allUrls  = []; // collected from PDF link annotations

for (let p = 1; p <= pdf.numPages; p++) {
  const page    = await pdf.getPage(p);
  const content = await page.getTextContent();

  // Collect hyperlink annotations
  const annotations = await page.getAnnotations();
  for (const ann of annotations) {
    if (ann.subtype === 'Link' && ann.url) allUrls.push(ann.url);
  }

  // Group text items by y-coordinate to reconstruct visual lines.
  // PDF y=0 is page bottom, so sort descending → top-to-bottom order.
  const byY = new Map();
  for (const item of content.items) {
    if (!('str' in item) || !item.str?.trim()) continue;
    const y = Math.round(item.transform[5] / 2) * 2;
    if (!byY.has(y)) byY.set(y, []);
    byY.get(y).push(item.str);
  }
  [...byY.keys()].sort((a, b) => b - a).forEach(y => {
    const line = byY.get(y).join(' ').trim();
    if (line) allLines.push(line);
  });
}

// ── Company URL lookup ────────────────────────────────────────────────
// Maps a lowercase keyword (matched against the company name) → website URL.
// Add new entries here whenever a new role is added to the resume.
const COMPANY_URL_MAP = [
  { match: 'ubc solar',  url: 'https://ubcsolar.com'           },
  { match: 'verdi',      url: 'https://www.verdi.ag'           },
];

// Return the URL whose keyword appears in the company name (case-insensitive).
// Falls back to PDF annotation URLs if keyword matching finds nothing.
const STOP_WORDS = new Set(['the','and','for','inc','ltd','llc','corp','student','design','team','racing','university','of']);
function findCompanyUrl(company) {
  const lower = company.toLowerCase();

  // 1. Static lookup table (most reliable)
  for (const entry of COMPANY_URL_MAP) {
    if (lower.includes(entry.match)) return entry.url;
  }

  // 2. PDF annotation URLs — match by domain keyword
  const words = lower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
  for (const url of allUrls) {
    try {
      const domain = new URL(url).hostname.replace(/^www\./, '');
      if (words.some(w => domain.includes(w))) return url;
    } catch { /* skip invalid */ }
  }

  return undefined;
}

// ── Parse experience section ──────────────────────────────────────────
// Your resume format:
//   "Company Name   City, Province"      ← company line
//   "Role Title    Sep 2024 – Present"   ← role + date line
//   "● bullet…"                          ← achievements

const DATE_RE = /(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?\d{4}\s*[—\-–]\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?(?:\d{4}|Present|Current|Ongoing)/i;

const SECTION_START_RE = /\b(WORK\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT|WORK\s+HISTORY|INTERNSHIP)/i;
const SECTION_STOP_RE  = /^(EDUCATION|PROJECTS?|SKILLS?|TECHNICAL\s+SKILLS?|PUBLICATIONS?|AWARDS?|CERTIFICATIONS?|VOLUNTEER|LEADERSHIP|ACTIVITIES|REFERENCES?|LANGUAGES?|INTERESTS?|HOBBIES|SUMMARY|OBJECTIVE|PROFILE|RESEARCH|EXTRACURRICULAR|INVOLVEMENT)S?$/i;
const BULLET_RE        = /^[•●\-*–▪►]\s*/;

let start = -1;
let end   = allLines.length;

for (let i = 0; i < allLines.length; i++) {
  const t = allLines[i].trim();
  if (start === -1 && t.length <= 50 && SECTION_START_RE.test(t)) {
    start = i + 1;
  } else if (start !== -1 && SECTION_STOP_RE.test(t)) {
    end = i;
    break;
  }
}

if (start === -1) {
  console.warn('[parse-resume] No EXPERIENCE section found — experience data unchanged.');
  process.exit(0);
}

const section = allLines.slice(start, end);
const results = [];
let i = 0;

while (i < section.length) {
  const line = section[i].trim();

  // Skip standalone bullet lines when scanning for entry headers
  if (BULLET_RE.test(line)) { i++; continue; }

  const nextLine      = i + 1 < section.length ? section[i + 1].trim() : '';
  const nextDateMatch = nextLine.match(DATE_RE);

  if (nextDateMatch) {
    // ── Format A: Company line (i), then Role + Date line (i+1) ──────
    const period   = nextDateMatch[0];
    const dateIdx  = nextLine.lastIndexOf(period);
    const role     = nextLine.slice(0, dateIdx).trim();

    // Split "Company   City, Province" on 3+ spaces or " City, XX" pattern at end
    // Avoids splitting on commas inside the company name itself.
    const locMatch = line.match(/^(.+?)\s{2,}(.+)$/) || line.match(/^(.+?)\s+((?:[A-Za-z ]+,\s*[A-Z]{2}))$/);
    const company  = (locMatch ? locMatch[1] : line).trim();
    const location = (locMatch ? locMatch[2] : '').trim();

    i += 2;

    const achievements = [];
    while (i < section.length) {
      const bl         = section[i].trim();
      const followDate = i + 1 < section.length ? section[i + 1].trim().match(DATE_RE) : null;

      if (SECTION_STOP_RE.test(bl)) break;
      // Non-bullet line whose NEXT line has a date → we've hit the next entry header
      if (!BULLET_RE.test(bl) && followDate) break;

      if (BULLET_RE.test(bl)) {
        achievements.push(bl.replace(BULLET_RE, '').trim());
      } else if (achievements.length > 0 && bl) {
        // Wrapped continuation of the previous bullet
        achievements[achievements.length - 1] += ' ' + bl;
      }
      i++;
    }

    const companyUrl = findCompanyUrl(company || '');
    results.push({
      id: results.length + 1,
      role:     role     || 'Role',
      company:  company  || 'Company',
      ...(companyUrl ? { companyUrl } : {}),
      location,
      period,
      achievements,
      tags: [],
    });
    continue;
  }

  // ── Format B: Role + Date on the same line (fallback) ────────────
  const sameDateMatch = line.match(DATE_RE);
  if (sameDateMatch) {
    const period  = sameDateMatch[0];
    const role    = line.slice(0, line.indexOf(period)).trim();
    i++;
    const achievements = [];
    while (i < section.length) {
      const bl = section[i].trim();
      if (SECTION_STOP_RE.test(bl)) break;
      if (BULLET_RE.test(bl)) {
        achievements.push(bl.replace(BULLET_RE, '').trim());
      } else if (achievements.length > 0 && bl) {
        achievements[achievements.length - 1] += ' ' + bl;
      } else { break; }
      i++;
    }
    if (role) {
      results.push({ id: results.length + 1, role, company: '', location: '', period, achievements, tags: [] });
    }
    continue;
  }

  i++;
}

// ── Parse education section ─────────────────────────────────────────
// Format: Institution   City, Province (line i)
//         Degree Title    Sep 2022 – May 2026 (line i+1)
//         ● bullet...    (optional details)
const EDU_START_RE = /^(EDUCATION|ACADEMIC\s+BACKGROUND|ACADEMIC\s+QUALIFICATIONS?)$/i;
const EDU_STOP_RE  = /^(EXPERIENCE|WORK\s+EXPERIENCE|EMPLOYMENT|WORK\s+HISTORY|INTERNSHIP|SKILLS?|TECHNICAL\s+SKILLS?|PROJECTS?|PUBLICATIONS?|AWARDS?|CERTIFICATIONS?|VOLUNTEER|LEADERSHIP|ACTIVITIES|REFERENCES?|LANGUAGES?|INTERESTS?|HOBBIES|RESEARCH|EXTRACURRICULAR|INVOLVEMENT|SUMMARY|OBJECTIVE|PROFILE)S?$/i;

let eStart = -1;
let eEnd   = allLines.length;
for (let k = 0; k < allLines.length; k++) {
  const t = allLines[k].trim();
  if (eStart === -1 && t.length <= 60 && EDU_START_RE.test(t)) {
    eStart = k + 1;
  } else if (eStart !== -1 && EDU_STOP_RE.test(t)) {
    eEnd = k;
    break;
  }
}

const education = [];
if (eStart !== -1) {
  const eduSection = allLines.slice(eStart, eEnd);
  let j = 0;
  while (j < eduSection.length) {
    const line = eduSection[j].trim();
    if (BULLET_RE.test(line)) { j++; continue; }

    const nextLine      = j + 1 < eduSection.length ? eduSection[j + 1].trim() : '';
    const nextDateMatch = nextLine.match(DATE_RE);

    if (nextDateMatch) {
      // Institution line (j), then Degree + Date line (j+1)
      const period   = nextDateMatch[0];
      const dateIdx  = nextLine.lastIndexOf(period);
      const degree   = nextLine.slice(0, dateIdx).trim();

      const locMatch    = line.match(/^(.+?)\s{2,}(.+)$/) || line.match(/^(.+?)\s+((?:[A-Za-z ]+,\s*[A-Z]{2}))$/);
      const institution = (locMatch ? locMatch[1] : line).trim();
      const location    = (locMatch ? locMatch[2] : '').trim();

      j += 2;
      const details = [];
      while (j < eduSection.length) {
        const bl        = eduSection[j].trim();
        const followDate = j + 1 < eduSection.length ? eduSection[j + 1].trim().match(DATE_RE) : null;
        if (EDU_STOP_RE.test(bl)) break;
        if (!BULLET_RE.test(bl) && followDate) break;
        if (BULLET_RE.test(bl)) {
          details.push(bl.replace(BULLET_RE, '').trim());
        } else if (details.length > 0 && bl) {
          details[details.length - 1] += ' ' + bl;
        }
        j++;
      }

      education.push({ id: education.length + 1, degree, institution, location, period, details });
      continue;
    }

    // Same-line date (degree + date on same line, no separate institution line)
    const sameDateMatch = line.match(DATE_RE);
    if (sameDateMatch) {
      const period = sameDateMatch[0];
      const degree = line.slice(0, line.indexOf(period)).trim();
      j++;
      const details = [];
      while (j < eduSection.length) {
        const bl = eduSection[j].trim();
        if (BULLET_RE.test(bl)) {
          details.push(bl.replace(BULLET_RE, '').trim());
        } else { break; }
        j++;
      }
      if (degree) education.push({ id: education.length + 1, degree, institution: '', location: '', period, details });
      continue;
    }

    j++;
  }
}

// ── Parse skills section ─────────────────────────────────────────────
// Format: "Category: skill1, skill2, skill3"
const SKILLS_START_RE = /\b(TECHNICAL\s+SKILLS?|SKILLS?|CORE\s+SKILLS?|COMPETENCIES)\b/i;

let sStart = -1;
let sEnd   = allLines.length;
for (let k = 0; k < allLines.length; k++) {
  const t = allLines[k].trim();
  if (sStart === -1 && t.length <= 40 && SKILLS_START_RE.test(t)) {
    sStart = k + 1;
  } else if (sStart !== -1 && (SECTION_STOP_RE.test(t) || SECTION_START_RE.test(t) && k !== sStart - 1)) {
    sEnd = k;
    break;
  }
}

const skills = [];
if (sStart !== -1) {
  for (let k = sStart; k < sEnd; k++) {
    const line = allLines[k].trim();
    // Each line is "Category: skill1, skill2" — extract everything after the colon
    const colonIdx = line.indexOf(':');
    const raw = colonIdx !== -1 ? line.slice(colonIdx + 1) : line;
    raw.split(',').map(s => s.trim()).filter(Boolean).forEach(s => skills.push(s));
  }
}

// ── Write TypeScript output ───────────────────────────────────────────

const ts = `\
// AUTO-GENERATED by scripts/parse-resume.mjs
// Re-runs automatically on \`npm run dev\` and \`npm run build\`.
// Do not edit this file manually.
import type { Experience } from "./experiences";
import type { Education } from "./education";

const resumeExperiences: Experience[] = ${JSON.stringify(results, null, 2)};

export const resumeEducation: Education[] = ${JSON.stringify(education, null, 2)};

export const resumeSkills: string[] = ${JSON.stringify(skills, null, 2)};

export default resumeExperiences;
`;

writeFileSync(outFile, ts, 'utf8');
console.log(`[parse-resume] ✓ Wrote ${results.length} experience entries, ${skills.length} skills → src/data/resumeExperiences.ts`);

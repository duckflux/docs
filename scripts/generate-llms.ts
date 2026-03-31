/**
 * Generates two complementary LLM discovery files:
 *   public/LLMs.txt      — curated index (llmstxt.org standard)
 *   public/LLMs-full.txt — consolidated reference documentation
 *
 * Run via: bun scripts/generate-llms.ts
 * Called automatically by the "build" script before astro build.
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DOCS_ROOT = resolve(import.meta.dir, '../src/content/docs');
const SITE_URL = 'https://docs.duckflux.openvibes.tech';

// ---------------------------------------------------------------------------
// Core reference slugs — included in LLMs-full.txt (ordered)
// Excludes: navigation indexes, tutorials, about/*, changelog, roadmap, overviews
// ---------------------------------------------------------------------------
const CORE_SLUGS: string[] = [
  // One real-world example to anchor syntax in context
  'getting-started/a-real-world-example',
  // Workflow DSL reference (the meat of the docs)
  'workflows',
  'workflows/participants',
  'workflows/participant-types',
  'workflows/inputs-outputs',
  'workflows/variables-and-expressions',
  'workflows/set',
  'workflows/loops',
  'workflows/conditionals',
  'workflows/parallel',
  'workflows/events',
  'workflows/error-handling',
  'workflows/nested-workflows',
  'workflows/runtimes',
  // Runner CLI reference
  'runner-cli/introduction',
  'runner-cli/installation',
  'runner-cli/running-workflows',
  'runner-cli/linting-validation',
  'runner-cli/event-hubs-channels',
  // JavaScript runtime reference
  'runtime/cli',
  'runtime/event-hub-providers',
  'runtime/library',
];

// Slugs explicitly excluded from the auto-discovered extras (noise for LLMs)
const EXCLUDED_SLUGS = new Set([
  '',              // root index.mdx — navigation only
  'about',
  'about/roadmap',
  'about/changelog',
  'about/history',
  'getting-started/your-first-workflow',
  'getting-started/exploring-participants',
  'runtime/overview',
  'runner-cli',    // index page with no content beyond navigation
  'tooling',
]);

// ---------------------------------------------------------------------------
// Section structure for LLMs.txt index — labels and slug order only.
// Descriptions are read dynamically from each page's frontmatter.
// ---------------------------------------------------------------------------
const INDEX_SECTIONS: { label: string; slugs: string[] }[] = [
  {
    label: 'Workflow DSL reference',
    slugs: [
      'workflows',
      'workflows/participants',
      'workflows/participant-types',
      'workflows/inputs-outputs',
      'workflows/variables-and-expressions',
      'workflows/set',
      'workflows/loops',
      'workflows/conditionals',
      'workflows/parallel',
      'workflows/events',
      'workflows/error-handling',
      'workflows/nested-workflows',
      'workflows/runtimes',
    ],
  },
  {
    label: 'Runner CLI (Go)',
    slugs: [
      'runner-cli/introduction',
      'runner-cli/installation',
      'runner-cli/running-workflows',
      'runner-cli/linting-validation',
      'runner-cli/event-hubs-channels',
    ],
  },
  {
    label: 'JavaScript runtime',
    slugs: [
      'runtime/cli',
      'runtime/event-hub-providers',
      'runtime/library',
    ],
  },
  {
    label: 'Example',
    slugs: ['getting-started/a-real-world-example'],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugToFilePath(slug: string): string {
  const parts = slug.split('/');
  const direct = join(DOCS_ROOT, ...parts) + '.mdx';
  const index = join(DOCS_ROOT, ...parts, 'index.mdx');
  if (existsSync(direct)) return direct;
  if (existsSync(index)) return index;
  throw new Error(`No MDX file found for slug: ${slug}`);
}

function parseFrontmatter(source: string): { title: string; description: string; body: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { title: '', description: '', body: source };
  const yaml = match[1];
  const body = source.slice(match[0].length);
  const titleMatch = yaml.match(/^title:\s*(.+)$/m);
  const descMatch = yaml.match(/^description:\s*(.+)$/m);
  return {
    title: titleMatch ? titleMatch[1].trim() : '',
    description: descMatch ? descMatch[1].trim() : '',
    body,
  };
}

function stripMdxImports(body: string): string {
  return body.replace(/^import\s+.*?from\s+['"][^'"]+['"]\s*;?\s*$/gm, '').trimStart();
}

function renderPage(slug: string): string {
  const filePath = slugToFilePath(slug);
  const source = readFileSync(filePath, 'utf-8');
  const { title, description, body } = parseFrontmatter(source);
  const content = stripMdxImports(body).trim();
  const header = title ? `# ${title}` : `# ${slug}`;
  const desc = description ? `\n> ${description}\n` : '';
  return `${header}${desc}\n\n${content}`;
}

// Discover MDX files not in CORE_SLUGS and not excluded (e.g. tooling/*)
function discoverExtraSlugs(): string[] {
  const extra: string[] = [];
  const knownPaths = new Set(
    CORE_SLUGS.filter(s => {
      try { slugToFilePath(s); return true; } catch { return false; }
    }).map(s => slugToFilePath(s))
  );

  function walk(dir: string, prefix: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(join(dir, entry.name), prefix ? `${prefix}/${entry.name}` : entry.name);
      } else if (entry.name.endsWith('.mdx')) {
        const slug = entry.name === 'index.mdx'
          ? prefix
          : `${prefix}/${entry.name.replace(/\.mdx$/, '')}`;
        const filePath = join(dir, entry.name);
        if (!knownPaths.has(filePath) && !EXCLUDED_SLUGS.has(slug)) {
          extra.push(slug);
        }
      }
    }
  }

  walk(DOCS_ROOT, '');
  return extra;
}

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

function generateFullTxt(): void {
  const extraSlugs = discoverExtraSlugs();
  const allSlugs = [...CORE_SLUGS, ...extraSlugs];
  const sections: string[] = [];

  for (const slug of allSlugs) {
    try {
      sections.push(renderPage(slug));
    } catch {
      console.warn(`  LLMs-full.txt: skipping slug (no file): ${slug}`);
    }
  }

  const output = [
    '# duckflux — full reference documentation',
    '',
    '',
    '---',
    '',
    sections.join('\n\n---\n\n'),
    '',
  ].join('\n');

  const outPath = resolve(import.meta.dir, '../public/LLMs-full.txt');
  writeFileSync(outPath, output, 'utf-8');
  console.log(`LLMs-full.txt written (${(output.length / 1024).toFixed(1)} KB, ${allSlugs.length} pages)`);
}

function generateIndexTxt(): void {
  const lines: string[] = [
    '# duckflux',
    '',
    '> duckflux is a declarative, YAML-based workflow DSL and runner system.',
    '> Describe **what** should happen and in what order — the runtime handles execution.',
    '> No SDK, no boilerplate, no vendor lock-in.',
    '',
    `> Full consolidated reference: [LLMs-full.txt](${SITE_URL}/LLMs-full.txt)`,
    '',
  ];

  for (const section of INDEX_SECTIONS) {
    lines.push(`## ${section.label}`, '');
    for (const slug of section.slugs) {
      let description = '';
      try {
        const source = readFileSync(slugToFilePath(slug), 'utf-8');
        description = parseFrontmatter(source).description;
      } catch { /* skip if file missing */ }
      const url = `${SITE_URL}/${slug}/`;
      const suffix = description ? `: ${description}` : '';
      lines.push(`- [${slug}](${url})${suffix}`);
    }
    lines.push('');
  }

  const output = lines.join('\n');
  const outPath = resolve(import.meta.dir, '../public/LLMs.txt');
  writeFileSync(outPath, output, 'utf-8');
  console.log(`LLMs.txt written (${(output.length / 1024).toFixed(1)} KB, curated index)`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

generateIndexTxt();
generateFullTxt();

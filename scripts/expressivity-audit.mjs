#!/usr/bin/env node
/**
 * expressivity-audit.mjs
 * -----------------------------------------------------------------------------
 * Measures how often a consumer must LEAVE the design system to achieve a look.
 * Every such moment is an "expressivity blocker" — the gap between what a theme
 * intended and what the DS's tokens/parts allowed. Drive the count to zero and
 * you have mechanically proven that wild, divergent skins are reachable through
 * sanctioned channels alone (no forks, no !important, no internal-reaching).
 *
 * Repo calibration lives in `.expressivityrc.json` (paths, scope, part attrs).
 * The script logic stays generic so it can be lifted into other repos unforked.
 *
 *   Sanctioned channels (NOT blockers):
 *     - Assigning token values:        [data-theme="lcars"] { --color-background: #f90 }
 *     - Setting tokens inline:         <Button style={{ '--radius-md': '0' }} />
 *     - Targeting a PUBLISHED part:    [data-slot="card"] { box-shadow: var(--shadow-lg) }
 *     - Composing public variants:     <Card density="compact" />
 *     - Consumer's OWN page chrome:    .page-grid { gap: 24px }   (not a DS node)
 *
 *   Blockers (each +1):
 *     - LITERAL  raw visual value applied to a DS node (no token channel existed)
 *     - IMPORTANT  !important on a DS-targeting rule (had to fight specificity)
 *     - REACH  selector/JSX targets an unnamed internal node (no public part)
 *     - FORK  deep/internal import or local re-implementation of a DS component
 *     - HATCH  arbitrary-value className, inline literal style, `as any`, etc.
 *
 * Usage:
 *   node scripts/expressivity-audit.mjs                 # human report + greppable total
 *   node scripts/expressivity-audit.mjs --json          # machine-readable to stdout
 *   node scripts/expressivity-audit.mjs --emit          # also write the durable artifacts:
 *                                                       #   fixtures/parts.manifest.json
 *                                                       #   fixtures/expressivity-report.json
 *   node scripts/expressivity-audit.mjs --fail-on-blockers   # exit 1 if any (CI gate)
 *
 * Verify line for autoresearch:
 *   node scripts/expressivity-audit.mjs | grep "EXPRESSIVITY BLOCKERS"
 *
 * Deps (workspace-root devDeps):
 *   pnpm add -Dw fast-glob postcss postcss-selector-parser @babel/parser @babel/traverse
 * -----------------------------------------------------------------------------
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

// ---- optional-dep loader with a friendly message ---------------------------
async function load(name) {
  try { return await import(name); }
  catch {
    console.error(`\n  Missing dependency: ${name}\n  Install: pnpm add -Dw fast-glob postcss postcss-selector-parser @babel/parser @babel/traverse\n`);
    process.exit(2);
  }
}
const fg = (await load('fast-glob')).default;
const postcss = (await load('postcss')).default;
const selectorParser = (await load('postcss-selector-parser')).default;
const babelParser = await load('@babel/parser');
const traverseMod = await load('@babel/traverse');
const traverse = traverseMod.default ?? traverseMod;

// ---- config (override via .expressivityrc.json at repo root) ----------------
const DEFAULTS = {
  // where the DS source lives (scanned to build the parts manifest)
  srcGlobs: ['src/**/*.{ts,tsx}'],
  // where the theme fixtures live (the read-only "honest attempts" at a look)
  fixtureGlobs: ['fixtures/themes/**/*.{css,tsx}'],
  // how a DS node is recognized in CSS/JSX
  dsClassPrefix: 'ub-',                 // e.g. .ub-button (unused here; this DS has no DS classes)
  partAttrs: ['data-slot', 'data-part'],
  // import sources that count as "from the DS"
  dsImportPattern: '^(@unbranded|@/components|\\.\\./.*components)',
  // import sources that count as reaching past the public surface -> FORK
  dsDeepImportPattern: '(/internal|/internals|/dist/|/components/[^/]+/(?!index)[^/]+$)',
  // CSS values that are allowed as literals even on a DS node
  allowedLiterals: new Set([
    '0', 'auto', 'none', 'inherit', 'initial', 'unset', 'revert',
    'transparent', 'currentColor', 'currentcolor', '100%', '0%', '1', '1fr',
  ]),
  // structural border hairlines etc. — set true to stop counting `1px` borders
  allowHairlineBorders: false,
  // extra/declared parts to merge into the generated manifest
  partsFile: 'fixtures/parts.json',
};

function loadConfig() {
  const cfgPath = path.resolve('.expressivityrc.json');
  if (!fs.existsSync(cfgPath)) return { ...DEFAULTS };
  const user = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  return {
    ...DEFAULTS, ...user,
    allowedLiterals: new Set([...DEFAULTS.allowedLiterals, ...(user.allowedLiterals ?? [])]),
  };
}
const cfg = loadConfig();

// ---- build the parts manifest (the source of truth for "published" nodes) ---
// Scans src for data-slot="x" / data-part="x" literals. Anything a fixture
// targets that ISN'T in here is reaching into an unnamed internal.
function buildPartsManifest() {
  const parts = new Set();
  const files = fg.sync(cfg.srcGlobs, { dot: false });
  const re = new RegExp(`(?:${cfg.partAttrs.join('|')})\\s*=\\s*["'\`]([^"'\`]+)["'\`]`, 'g');
  for (const f of files) {
    const txt = fs.readFileSync(f, 'utf8');
    let m; while ((m = re.exec(txt))) parts.add(m[1].trim());
  }
  // merge declared extras
  const pf = path.resolve(cfg.partsFile);
  if (fs.existsSync(pf)) {
    const declared = JSON.parse(fs.readFileSync(pf, 'utf8'));
    for (const p of (Array.isArray(declared) ? declared : Object.values(declared).flat())) parts.add(p);
  }
  return parts;
}
const MANIFEST = buildPartsManifest();

// ---- shared literal detection ----------------------------------------------
const VAR_CALL = /var\((?:[^()]|\([^()]*\))*\)/g;
const HEX = /#[0-9a-fA-F]{3,8}\b/;
const COLOR_FN = /\b(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color)\(/i;
const LENGTH = /(?<![\w-])\d*\.?\d+(px|rem|em|vh|vw|vmin|vmax|pt|cm|mm|ex|ch)\b/i;
const RAW_NUM = /(?<![\w#-])\d*\.?\d+(deg|s|ms)?\b/; // angles/times/unitless multipliers

function hasRawVisualLiteral(value) {
  // strip token references first; what's left, if it has literals, is unsanctioned
  let v = value.replace(VAR_CALL, ' ').trim();
  if (!v) return false;
  // tokenize on whitespace/commas and test each chunk against the allowlist
  const chunks = v.split(/[\s,/()]+/).filter(Boolean);
  for (const c of chunks) {
    if (cfg.allowedLiterals.has(c)) continue;
    if (cfg.allowHairlineBorders && c === '1px') continue;
    if (HEX.test(c) || LENGTH.test(c) || RAW_NUM.test(c)) return true;
  }
  // a color function whose args survived var-stripping carries literal channels
  if (COLOR_FN.test(v) && /\d/.test(v)) return true;
  return false;
}

// ---- finding classification (agent-first: each blocker self-describes) ------
// Maps a CSS property (or escape-hatch shape) to the token AXIS it implicates and
// a concrete remedy, so the emitted report doubles as a ranked DS backlog rather
// than a bare list of line numbers.
const AXIS_BY_PROP = {
  'border-radius': 'shape', 'border-top-left-radius': 'shape', 'border-top-right-radius': 'shape',
  'border-bottom-left-radius': 'shape', 'border-bottom-right-radius': 'shape', 'clip-path': 'shape',
  'box-shadow': 'elevation', 'text-shadow': 'elevation',
  'letter-spacing': 'type', 'text-transform': 'type', 'font-family': 'type', 'font-size': 'type',
  'font-weight': 'type', 'line-height': 'type', 'font-feature-settings': 'type', 'font-variant-numeric': 'type',
  'filter': 'texture', 'backdrop-filter': 'texture', 'background-image': 'texture',
  'mix-blend-mode': 'texture', 'background-blend-mode': 'texture', 'mask-image': 'texture',
  'color': 'color', 'background': 'color', 'background-color': 'color', 'border': 'color',
  'border-color': 'color', 'fill': 'color', 'stroke': 'color', 'outline': 'color', 'outline-color': 'color',
  'opacity': 'color',
  'transition': 'motion', 'transition-duration': 'motion', 'animation': 'motion', 'animation-duration': 'motion',
  'padding': 'space', 'margin': 'space', 'gap': 'space', 'width': 'space', 'height': 'space',
  'min-height': 'space', 'min-width': 'space', 'inset': 'space',
};

function classify(f) {
  const prop = f.prop ?? null;
  let axis = prop ? (AXIS_BY_PROP[prop] ?? 'other') : null;
  let remedy;
  switch (f.type) {
    case 'LITERAL':
      axis ??= 'other';
      remedy = `Add a "${axis}" token for "${prop ?? 'this property'}" so themes route through var() instead of a raw value.`;
      break;
    case 'IMPORTANT':
      axis ??= 'specificity';
      remedy = `Expose a token or variant so the theme need not fight the DS with !important.`;
      break;
    case 'REACH':
      axis = 'structure';
      remedy = `Publish a data-slot for the targeted node so themes can reach it through the part surface.`;
      break;
    case 'FORK':
      axis = 'structure';
      remedy = `Export the needed node as a public part; a deep import means the surface is missing something.`;
      break;
    case 'HATCH':
      axis = 'escape-hatch';
      remedy = `Provide a token or variant that covers what this hatch reached for.`;
      break;
    default:
      axis ??= 'other';
      remedy = 'Review.';
  }
  return { ...f, axis, remedy };
}

// ---- CSS auditing -----------------------------------------------------------
function selectorTargetsDS(selector) {
  if (cfg.partAttrs.some((a) => selector.includes(`[${a}`))) return true;
  if (selector.includes(`.${cfg.dsClassPrefix}`)) return true;
  return false;
}

// Heuristic reach check: a DS-targeting selector is sanctioned iff every part it
// names is published AND it does not descend past a part/component into an
// unnamed node (tag, nth-child, non-DS class) via a combinator.
function selectorReaches(selector) {
  let reach = false;
  selectorParser((root) => {
    root.each((sel) => {
      const nodes = sel.nodes;
      let anchorIdx = -1;
      nodes.forEach((n, i) => {
        if (n.type === 'attribute' && cfg.partAttrs.includes(n.attribute)) {
          const val = (n.value || '').replace(/['"]/g, '');
          if (val && !MANIFEST.has(val)) reach = true;        // unknown part
          anchorIdx = i;
        } else if (n.type === 'class' && n.value?.startsWith(cfg.dsClassPrefix)) {
          anchorIdx = i;
        }
      });
      if (anchorIdx === -1) return; // not actually a DS anchor in this group
      // anything to the RIGHT of the anchor that descends into an unnamed node
      for (let i = anchorIdx + 1; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.type === 'combinator') {
          // look at what follows the combinator
          const next = nodes[i + 1];
          if (!next) break;
          const ok =
            (next.type === 'attribute' && cfg.partAttrs.includes(next.attribute) &&
              MANIFEST.has((next.value || '').replace(/['"]/g, ''))) ||
            (next.type === 'class' && next.value?.startsWith(cfg.dsClassPrefix)) ||
            next.type === 'pseudo'; // ::part-ish pseudo on a part is fine
          if (!ok) reach = true; // descended into tag / nth / foreign class
        }
      }
    });
  }).processSync(selector);
  return reach;
}

function auditCss(file, findings) {
  const css = fs.readFileSync(file, 'utf8');
  let root;
  try { root = postcss.parse(css, { from: file }); }
  catch (e) { findings.push({ file, type: 'PARSE', msg: String(e.message) }); return; }

  root.walkRules((rule) => {
    // skip @keyframes etc. inner rules that aren't selectors
    if (rule.parent?.type === 'atrule' && /keyframes/.test(rule.parent.name)) return;
    const targetsDS = selectorTargetsDS(rule.selector);
    if (!targetsDS) return; // consumer's own chrome — not a DS expressivity failure

    if (selectorReaches(rule.selector)) {
      findings.push({ file, type: 'REACH', line: rule.source?.start?.line, msg: rule.selector.trim() });
    }
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) return; // assigning a token is the channel
      if (decl.important) {
        findings.push({ file, type: 'IMPORTANT', line: decl.source?.start?.line, prop: decl.prop, msg: `${decl.prop}: ${decl.value} !important` });
      }
      if (hasRawVisualLiteral(decl.value)) {
        findings.push({ file, type: 'LITERAL', line: decl.source?.start?.line, prop: decl.prop, msg: `${decl.prop}: ${decl.value}` });
      }
    });
  });
}

// ---- TSX auditing -----------------------------------------------------------
const VISUAL_PROPS = new Set([
  'color', 'background', 'backgroundColor', 'border', 'borderColor', 'borderRadius',
  'boxShadow', 'fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight',
  'fill', 'stroke', 'filter', 'backdropFilter', 'opacity', 'textShadow', 'outline',
]);
const ARBITRARY_TW = /(?:^|\s)!?[\w:-]+-\[[^\]]+\]/;     // bg-[#fff], h-[83px], shadow-[...]
const BANG_TW = /(?:^|\s)!`?[\w-]/;                       // !bg-red (important utility)

function isCssVarKey(key) {
  return typeof key === 'string' && key.startsWith('--');
}

function literalStyleValue(node) {
  // returns true if this value is a hardcoded literal (not a var() string / token)
  if (node.type === 'StringLiteral') return !/^var\(/.test(node.value) && hasRawVisualLiteral(node.value);
  if (node.type === 'NumericLiteral') return true;
  if (node.type === 'TemplateLiteral') {
    const raw = node.quasis.map((q) => q.value.cooked).join(' ');
    return !/var\(/.test(raw) && hasRawVisualLiteral(raw);
  }
  return false;
}

function classNameString(attrValue) {
  if (!attrValue) return '';
  if (attrValue.type === 'StringLiteral') return attrValue.value;
  if (attrValue.type === 'JSXExpressionContainer') {
    const e = attrValue.expression;
    if (e.type === 'StringLiteral') return e.value;
    if (e.type === 'TemplateLiteral') return e.quasis.map((q) => q.value.cooked).join(' ');
  }
  return '';
}

function auditTsx(file, findings) {
  const code = fs.readFileSync(file, 'utf8');
  let ast;
  try {
    ast = babelParser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
  } catch (e) { findings.push({ file, type: 'PARSE', msg: String(e.message) }); return; }

  const dsLocals = new Set();

  traverse(ast, {
    ImportDeclaration(p) {
      const src = p.node.source.value;
      const fromDS = new RegExp(cfg.dsImportPattern).test(src);
      if (!fromDS) return;
      if (new RegExp(cfg.dsDeepImportPattern).test(src)) {
        findings.push({ file, type: 'FORK', line: p.node.loc?.start.line, msg: `deep import: ${src}` });
      }
      for (const s of p.node.specifiers) dsLocals.add(s.local.name);
    },

    JSXOpeningElement(p) {
      const nameNode = p.node.name;
      const tag = nameNode.type === 'JSXIdentifier' ? nameNode.name
        : nameNode.type === 'JSXMemberExpression' ? nameNode.object?.name : null;
      if (!tag || !dsLocals.has(tag)) return; // only DS components count

      for (const attr of p.node.attributes) {
        if (attr.type !== 'JSXAttribute') continue;
        const an = attr.name.name;

        if (an === 'style' && attr.value?.type === 'JSXExpressionContainer'
          && attr.value.expression.type === 'ObjectExpression') {
          for (const prop of attr.value.expression.properties) {
            if (prop.type !== 'ObjectProperty') continue;
            const key = prop.key.type === 'StringLiteral' ? prop.key.value : prop.key.name;
            if (isCssVarKey(key)) continue;            // setting a token inline = allowed
            if (VISUAL_PROPS.has(key) && literalStyleValue(prop.value)) {
              findings.push({ file, type: 'HATCH', line: prop.loc?.start.line, msg: `style.${key} literal` });
            }
          }
        }

        if (an === 'className') {
          const cls = classNameString(attr.value);
          if (ARBITRARY_TW.test(cls)) findings.push({ file, type: 'HATCH', line: attr.loc?.start.line, msg: `arbitrary class on <${tag}>` });
          if (BANG_TW.test(cls)) findings.push({ file, type: 'IMPORTANT', line: attr.loc?.start.line, msg: `!important utility on <${tag}>` });
        }

        if (an === 'dangerouslySetInnerHTML') {
          findings.push({ file, type: 'REACH', line: attr.loc?.start.line, msg: `dangerouslySetInnerHTML on <${tag}>` });
        }
      }
    },

    TSAsExpression(p) {
      if (p.node.typeAnnotation?.type === 'TSAnyKeyword') {
        findings.push({ file, type: 'HATCH', line: p.node.loc?.start.line, msg: '`as any` cast' });
      }
    },
  });
}

// ---- run --------------------------------------------------------------------
function run() {
  const args = new Set(process.argv.slice(2));
  const files = fg.sync(cfg.fixtureGlobs, { dot: false });
  const findings = [];

  for (const f of files) {
    if (f.endsWith('.css')) auditCss(f, findings);
    else if (f.endsWith('.tsx') || f.endsWith('.ts')) auditTsx(f, findings);
  }

  const real = findings.filter((x) => x.type !== 'PARSE').map(classify);
  const total = real.length;

  // ---- per-fixture / per-category / per-axis rollups ----
  const byFixture = {};
  const byType = {};
  const byAxis = {};
  for (const x of real) {
    const fixture = x.file.split(path.sep).slice(0, -1).join(path.sep);
    byFixture[fixture] = (byFixture[fixture] || 0) + 1;
    byType[x.type] = (byType[x.type] || 0) + 1;
    byAxis[x.axis] = (byAxis[x.axis] || 0) + 1;
  }

  // ---- durable, machine-discoverable artifacts (agent-first) ----
  if (args.has('--emit')) {
    fs.mkdirSync('fixtures', { recursive: true });
    fs.writeFileSync('fixtures/parts.manifest.json', `${JSON.stringify({
      $generated: 'scripts/expressivity-audit.mjs',
      $note: 'Published DS parts (data-slot/data-part) a theme may target. A fixture selector hitting anything not here is a REACH blocker.',
      count: MANIFEST.size,
      parts: [...MANIFEST].sort(),
    }, null, 2)}\n`);
    fs.writeFileSync('fixtures/expressivity-report.json', `${JSON.stringify({
      $generated: 'scripts/expressivity-audit.mjs',
      total, byType, byAxis, byFixture, findings: real,
    }, null, 2)}\n`);
    console.log('  Emitted fixtures/parts.manifest.json + fixtures/expressivity-report.json');
  }

  if (args.has('--json')) {
    console.log(JSON.stringify({ total, byType, byAxis, byFixture, findings: real }, null, 2));
  } else {
    console.log('\n  Expressivity Audit');
    console.log('  ' + '─'.repeat(52));
    console.log(`  Published parts in manifest: ${MANIFEST.size}`);
    console.log(`  Theme fixtures scanned:      ${new Set(real.map(x=>x.file)).size || files.length}\n`);

    const order = ['LITERAL', 'IMPORTANT', 'REACH', 'FORK', 'HATCH'];
    const label = {
      LITERAL: 'LITERAL   no token channel existed',
      IMPORTANT: 'IMPORTANT fought specificity',
      REACH: 'REACH     targeted an unnamed internal',
      FORK: 'FORK      deep/internal import',
      HATCH: 'HATCH     escape hatch (inline/arbitrary/any)',
    };
    console.log('  By category');
    for (const t of order) console.log(`    ${String(byType[t] || 0).padStart(4)}  ${label[t]}`);

    if (Object.keys(byAxis).length) {
      console.log('\n  By axis (the token-taxonomy gap)');
      for (const [ax, n] of Object.entries(byAxis).sort((a,b)=>b[1]-a[1])) {
        console.log(`    ${String(n).padStart(4)}  ${ax}`);
      }
    }

    if (Object.keys(byFixture).length) {
      console.log('\n  By fixture');
      for (const [fx, n] of Object.entries(byFixture).sort((a,b)=>b[1]-a[1])) {
        console.log(`    ${String(n).padStart(4)}  ${fx}`);
      }
    }

    const parseErrs = findings.filter((x) => x.type === 'PARSE');
    if (parseErrs.length) {
      console.log('\n  Parse errors (not counted, fix these):');
      for (const e of parseErrs) console.log(`    ${e.file}: ${e.msg}`);
    }

    if (total) {
      console.log('\n  Top findings');
      for (const x of real.slice(0, 25)) {
        console.log(`    ${x.type.padEnd(9)} ${x.file}:${x.line ?? '?'}  ${x.msg}`);
      }
      if (total > 25) console.log(`    … and ${total - 25} more (use --json for all)`);
    }
    console.log('');
  }

  // greppable metric line for the autoresearch Verify command
  console.log(`EXPRESSIVITY BLOCKERS: ${total}`);

  if (args.has('--fail-on-blockers') && total > 0) process.exit(1);
}

run();

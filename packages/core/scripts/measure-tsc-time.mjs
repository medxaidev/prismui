/**
 * Stage-16 Phase 1 PoC · `tsc --noEmit` baseline measurement script
 *
 * Usage:
 *   node ./scripts/measure-tsc-time.mjs                    # default 5 runs
 *   node ./scripts/measure-tsc-time.mjs --runs 10          # 10 runs
 *   node ./scripts/measure-tsc-time.mjs --runs 5 --csv     # csv output
 *
 * Purpose (per ADR-008 v0.1.2 decision 13 门槛-A):
 *   Capture the wall-clock cost of `tsc --noEmit` over N runs, taking
 *   the median to smooth process-startup noise. This is the SINGLE
 *   data point that decides whether the responsive × polymorphic
 *   composite generic (RES-HYP-1) is acceptable as-is, demoted to
 *   hypothesis-only / scope-narrowed, or red-lined.
 *
 * Thresholds (decision 13):
 *   - delta ≤ 5 s             → 门槛-A green · Inline / Box may拼接
 *   - 5 s < delta ≤ 15 s      → 门槛-A yellow · RES-HYP-1 elevated · scope保持 Stack/Grid
 *   - delta > 15 s            → 门槛-A red · RES-HYP-1 elevated + (c) tightened
 *
 * Protocol (run BOTH and subtract):
 *   1. Baseline (no PoC imports anywhere)         → record median
 *   2. PoC enabled (import StackResponsivePoc +
 *      GridResponsiveColumnsPoc somewhere reachable
 *      by the tsconfig include glob)              → record median
 *   3. delta = step2.median - step1.median
 *
 * NOTE: This script does NOT toggle PoC imports for you. Toggle by
 * commenting / uncommenting the re-exports in `core/index.ts` (or by
 * adding a `poc-index.ts` that imports the PoC files and including
 * that path in tsconfig.json). Keep both measurements at the SAME
 * tsconfig + node + tsc version. Reboot between runs to clear OS
 * file-cache effects ONLY if you see > 30% run-to-run variance.
 */
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, '..');

const args = process.argv.slice(2);
const runsIdx = args.indexOf('--runs');
const runs = runsIdx >= 0 ? Math.max(1, parseInt(args[runsIdx + 1], 10) || 5) : 5;
const csv = args.includes('--csv');

function fmt(ms) {
  return (ms / 1000).toFixed(2) + ' s';
}

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr) {
  const m = mean(arr);
  return Math.sqrt(mean(arr.map((v) => (v - m) ** 2)));
}

function runOnce() {
  const start = performance.now();
  const result = spawnSync('npx', ['tsc', '--noEmit', '--incremental', 'false'], {
    cwd: packageRoot,
    shell: true,
    stdio: 'pipe',
  });
  const elapsed = performance.now() - start;
  if (result.status !== 0) {
    process.stderr.write(result.stderr?.toString() ?? '');
    process.stdout.write(result.stdout?.toString() ?? '');
    throw new Error(`tsc exited with status ${result.status}`);
  }
  return elapsed;
}

console.log(`[measure-tsc-time] cwd: ${packageRoot}`);
console.log(`[measure-tsc-time] running tsc --noEmit ${runs} time(s)…`);

const samples = [];
for (let i = 0; i < runs; i++) {
  const t = runOnce();
  samples.push(t);
  console.log(`  run ${i + 1}/${runs}: ${fmt(t)}`);
}

const med = median(samples);
const avg = mean(samples);
const sd = stddev(samples);

console.log('');
console.log('Summary (lower is better):');
console.log(`  median: ${fmt(med)}`);
console.log(`  mean  : ${fmt(avg)}`);
console.log(`  stddev: ${fmt(sd)}`);
console.log(`  min   : ${fmt(Math.min(...samples))}`);
console.log(`  max   : ${fmt(Math.max(...samples))}`);

if (csv) {
  console.log('');
  console.log('CSV:');
  console.log('run,elapsed_ms');
  samples.forEach((t, i) => console.log(`${i + 1},${t.toFixed(2)}`));
}

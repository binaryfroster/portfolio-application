// Sequential Git Synchronization across all 8 branches in portfolio-application
// Strictly zero emojis.

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const SOURCE_BASE = 'c:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\portfolio apps';
const REPO_DIR = 'c:\\Users\\HP\\Downloads\\portfolio-application';

const BRANCH_MAP = [
  { branch: 'voice-call-automation', sourceDir: 'voice-call-automation' },
  { branch: 'real-estate-predictor', sourceDir: 'real-estate-predictor' },
  { branch: 'lms-portal', sourceDir: 'learnbridge-lms' },
  { branch: 'medicare-hub', sourceDir: 'medicare-hub' },
  { branch: 'flowops-erp', sourceDir: 'flowops-erp' },
  { branch: 'edutrack-sis', sourceDir: 'edutrack-sis' },
  { branch: 'nexus-llm-portal', sourceDir: 'nexus-llm-portal' }
];

function runCmd(cmd, cwd = REPO_DIR) {
  console.log(`[EXEC] ${cmd} (in ${cwd})`);
  try {
    const out = execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return out.trim();
  } catch (err) {
    console.error(`[ERROR] Command failed: ${cmd}\n${err.stderr || err.message}`);
    throw err;
  }
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.vercel') continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('=== STARTING SEQUENTIAL BRANCH SYNCHRONIZATION ===');

for (const item of BRANCH_MAP) {
  console.log(`\n--- Synchronizing branch: ${item.branch} ---`);
  runCmd(`git checkout ${item.branch}`);
  runCmd(`git pull origin ${item.branch} || true`);

  const srcFolder = path.join(SOURCE_BASE, item.sourceDir);
  copyRecursive(srcFolder, REPO_DIR);

  const status = runCmd('git status --porcelain');
  if (status) {
    console.log(`Modifications detected on ${item.branch}:\n${status}`);
    runCmd('git add -A');
    runCmd(`git commit -m "feat: enterprise domain entities, benchmarks, plan estimators, and printable SOW quotation modals [strictly zero emojis]"`);
    runCmd(`git push origin ${item.branch}`);
    console.log(`Pushed branch ${item.branch} to origin successfully.`);
  } else {
    console.log(`No changes to commit on ${item.branch}.`);
  }
}

// Synchronize main branch
console.log('\n--- Synchronizing main branch ---');
runCmd('git checkout main');
runCmd('git pull origin main || true');

for (const item of BRANCH_MAP) {
  const srcFolder = path.join(SOURCE_BASE, item.sourceDir);
  const destFolder = path.join(REPO_DIR, item.sourceDir);
  copyRecursive(srcFolder, destFolder);
}

// Also copy tests
const testsSrc = path.join(SOURCE_BASE, 'tests');
if (fs.existsSync(testsSrc)) {
  copyRecursive(testsSrc, path.join(REPO_DIR, 'tests'));
}

// Also copy supabase migrations
const supabaseSrc = 'c:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\supabase';
if (fs.existsSync(supabaseSrc)) {
  copyRecursive(supabaseSrc, path.join(REPO_DIR, 'supabase'));
}

const mainStatus = runCmd('git status --porcelain');
if (mainStatus) {
  console.log(`Modifications detected on main:\n${mainStatus}`);
  runCmd('git add -A');
  runCmd('git commit -m "feat: synchronized ecosystem suite bar, database migrations, and regression tests across monorepo"');
  runCmd('git push origin main');
  console.log('Pushed main branch to origin successfully.');
} else {
  console.log('No changes to commit on main.');
}

console.log('\n=== ALL 8 BRANCHES SYNCHRONIZED AND PUSHED CLEANLY ===');

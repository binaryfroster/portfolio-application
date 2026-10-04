// Deploy all 7 portfolio applications to Vercel production
// Strictly zero emojis.

import { execSync } from 'node:child_process';
import path from 'node:path';

const BASE_DIR = 'c:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\portfolio apps';

const APPS = [
  'voice-call-automation',
  'real-estate-predictor',
  'learnbridge-lms',
  'medicare-hub',
  'flowops-erp',
  'edutrack-sis',
  'nexus-llm-portal'
];

console.log('=== STARTING PRODUCTION DEPLOYMENT OF REMAINING 6 PORTFOLIO APPS ===\n');

for (const app of APPS) {
  const cwd = path.join(BASE_DIR, app);
  console.log(`--- Deploying ${app} to Vercel production ---`);
  try {
    const out = execSync('npx vercel --prod --yes', { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    console.log(out.trim());
    console.log(`[SUCCESS] Deployed ${app} cleanly.\n`);
  } catch (err) {
    console.error(`[ERROR] Failed to deploy ${app}:\n${err.stderr || err.message}`);
    throw err;
  }
}

console.log('=== ALL PORTFOLIO APPLICATIONS DEPLOYED TO VERCEL PRODUCTION ===');

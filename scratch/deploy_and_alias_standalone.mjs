// Deploy standalone portfolio applications outside git tree and set production aliases
// Strictly zero emojis.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';

const APPS = [
  { dir: 'real-estate-predictor', alias: 'real-estate-predictor-zeta.vercel.app', flag: 'propQuotationModal' },
  { dir: 'learnbridge-lms', alias: 'learnbridge-lms.vercel.app', flag: 'learnbridgeQuotationModal' },
  { dir: 'medicare-hub', alias: 'medicare-hub-sooty.vercel.app', flag: 'medicareQuotationModal' },
  { dir: 'flowops-erp', alias: 'flowops-erp-three.vercel.app', flag: 'flowopsQuotationModal' },
  { dir: 'edutrack-sis', alias: 'edutrack-sis.vercel.app', flag: 'edutrackQuotationModal' }
];

const SOURCE_BASE = 'c:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\portfolio apps';

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

async function run() {
  for (const app of APPS) {
    console.log(`\n=== Deploying ${app.dir} -> ${app.alias} ===`);
    const tempDir = path.join(os.tmpdir(), `deploy-${app.dir}-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    const srcDir = path.join(SOURCE_BASE, app.dir);
    copyRecursive(srcDir, tempDir);

    console.log(`Running vercel deploy --prod in ${tempDir}...`);
    let deployOut = '';
    try {
      deployOut = execSync('npx vercel --prod --yes --no-wait', { cwd: tempDir, encoding: 'utf8' });
      console.log(deployOut);
    } catch (e) {
      console.error(`Deploy error for ${app.dir}:`, e.message);
      continue;
    }

    const match = deployOut.match(/"id":\s*"(dpl_[^"]+)"/);
    if (!match) {
      console.error(`Could not find deployment id for ${app.dir}`);
      continue;
    }
    const deploymentId = match[1];
    console.log(`Deployment ID: ${deploymentId}`);

    let isReady = false;
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 3000));
      try {
        const inspectOut = execSync(`npx vercel inspect ${deploymentId} --json`, { cwd: tempDir, encoding: 'utf8' });
        const jsonStr = inspectOut.slice(inspectOut.indexOf('{'));
        const inspectData = JSON.parse(jsonStr);
        console.log(`Polling ${app.dir} status: ${inspectData.readyState}`);
        if (inspectData.readyState === 'READY') {
          isReady = true;
          break;
        }
      } catch (err) {
        console.log(`Inspect poll attempt ${i + 1} waiting...`);
      }
    }

    if (isReady) {
      console.log(`Assigning alias ${app.alias} to ${deploymentId}...`);
      try {
        const aliasOut = execSync(`npx vercel alias set ${deploymentId} ${app.alias}`, { cwd: tempDir, encoding: 'utf8' });
        console.log(aliasOut);
      } catch (err) {
        console.error(`Failed to assign alias ${app.alias}:`, err.message);
      }
    } else {
      console.error(`Deployment ${deploymentId} was not ready in time.`);
    }

    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (_) {}
  }

  console.log('\n=== ALL TARGET APPS DEPLOYED AND ALIASED ===');
}

run();

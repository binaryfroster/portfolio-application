// Distribute bf-suite-bar.js to all 7 portfolio applications and update index.html
import fs from 'node:fs';
import path from 'node:path';

const BASE_DIR = 'c:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\portfolio apps';
const SUITE_BAR_SRC = path.join(BASE_DIR, 'bf-suite-bar.js');

const APPS = [
  { dir: 'voice-call-automation', id: 'voice-call-automation' },
  { dir: 'real-estate-predictor', id: 'real-estate-predictor' },
  { dir: 'learnbridge-lms', id: 'learnbridge-lms' },
  { dir: 'medicare-hub', id: 'medicare-hub' },
  { dir: 'flowops-erp', id: 'flowops-erp' },
  { dir: 'edutrack-sis', id: 'edutrack-sis' },
  { dir: 'nexus-llm-portal', id: 'nexus-llm-portal' }
];

const suiteBarCode = fs.readFileSync(SUITE_BAR_SRC, 'utf8');

for (const app of APPS) {
  const appDir = path.join(BASE_DIR, app.dir);
  const targetSuiteBar = path.join(appDir, 'bf-suite-bar.js');
  fs.writeFileSync(targetSuiteBar, suiteBarCode, 'utf8');
  console.log(`Copied bf-suite-bar.js to ${app.dir}`);

  const indexPath = path.join(appDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    
    // Add meta tag if missing
    if (!html.includes('meta name="bf-app-id"')) {
      html = html.replace('<head>', `<head>\n  <meta name="bf-app-id" content="${app.id}">`);
    }

    // Add script tag if missing
    if (!html.includes('src="bf-suite-bar.js"')) {
      if (html.includes('</body>')) {
        html = html.replace('</body>', `  <!-- Cross-App Ecosystem Navigation Suite Bar -->\n  <script src="bf-suite-bar.js" defer></script>\n</body>`);
      } else {
        html += `\n<script src="bf-suite-bar.js" defer></script>`;
      }
      fs.writeFileSync(indexPath, html, 'utf8');
      console.log(`Injected bf-suite-bar.js script into ${app.dir}/index.html`);
    } else {
      console.log(`bf-suite-bar.js script already present in ${app.dir}/index.html`);
    }
  }
}

console.log('All 7 portfolio applications updated with bf-suite-bar.js successfully.');

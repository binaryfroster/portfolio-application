import fs from 'fs';
import path from 'path';

const apps = [
  'voice-call-automation',
  'real-estate-predictor',
  'learnbridge-lms',
  'medicare-hub',
  'flowops-erp',
  'edutrack-sis',
  'nexus-llm-portal'
];

for (const app of apps) {
  const file = path.join(app, 'index.html');
  if (fs.existsSync(file)) {
    const html = fs.readFileSync(file, 'utf8');
    const ids = Array.from(html.matchAll(/id="([^"]+)"/g)).map(m => m[1]);
    const relevantIds = ids.filter(id => /modal|quot|estimat|calc|plan|tier|spec|bench|dag|bom|node/i.test(id));
    console.log(`=== ${app} ===`);
    console.log(relevantIds.join(', '));
  }
}

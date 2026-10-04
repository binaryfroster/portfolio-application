import fs from 'fs';
import path from 'path';

const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/u;

const roots = [
  'C:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\src\\components\\operations\\sprint-estimator.tsx',
  'C:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\src\\app\\capabilities\\page.tsx',
  'C:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\src\\app\\operations\\page.tsx',
  'C:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\portfolio apps\\voice-call-automation\\index.html',
  'C:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\portfolio apps\\voice-call-automation\\app.js',
  'C:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\portfolio apps\\real-estate-predictor\\index.html',
  'C:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\portfolio apps\\real-estate-predictor\\app.js',
  'C:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\portfolio apps\\learnbridge-lms\\index.html',
  'C:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\portfolio apps\\learnbridge-lms\\app.js',
  'C:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\portfolio apps\\medicare-hub\\index.html',
  'C:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\portfolio apps\\medicare-hub\\app.js',
  'C:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\portfolio apps\\flowops-erp\\index.html',
  'C:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\portfolio apps\\flowops-erp\\app.js',
  'C:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\portfolio apps\\edutrack-sis\\index.html',
  'C:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\portfolio apps\\edutrack-sis\\app.js',
  'C:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\portfolio apps\\nexus-llm-portal\\index.html',
  'C:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal\\portfolio apps\\nexus-llm-portal\\app.js'
];

let foundEmoji = false;
for (const file of roots) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const match = content.match(EMOJI_REGEX);
    if (match) {
      console.error(`EMOJI FOUND in ${file}: ${match[0]}`);
      foundEmoji = true;
    } else {
      console.log(`ZERO EMOJIS CONFIRMED: ${path.basename(file)}`);
    }
  }
}

if (!foundEmoji) {
  console.log('\n=== STRICT ZERO-EMOJI ENFORCEMENT VERIFIED: 100% CLEAN ===');
} else {
  process.exit(1);
}

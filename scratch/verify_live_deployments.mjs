// Verify live production deployments on Vercel
// Strictly zero emojis.

const APPS = [
  { name: 'Voice Call Automation', url: 'https://voice-call-automation-delta.vercel.app', apiUrl: 'https://voice-call-automation-delta.vercel.app/api/call' },
  { name: 'Real Estate Predictor', url: 'https://real-estate-predictor-zeta.vercel.app', apiUrl: 'https://real-estate-predictor-zeta.vercel.app/api/predict' },
  { name: 'LearnBridge LMS', url: 'https://learnbridge-lms.vercel.app', apiUrl: 'https://learnbridge-lms.vercel.app/api/progress?studentId=student-demo' },
  { name: 'MediCare Hub', url: 'https://medicare-hub-sooty.vercel.app', apiUrl: 'https://medicare-hub-sooty.vercel.app/api/patients' },
  { name: 'FlowOps ERP', url: 'https://flowops-erp-three.vercel.app', apiUrl: 'https://flowops-erp-three.vercel.app/api/inventory' },
  { name: 'EduTrack SIS', url: 'https://edutrack-sis.vercel.app', apiUrl: 'https://edutrack-sis.vercel.app/api/students' },
  { name: 'Nexus LLM Portal', url: 'https://nexus-llm-portal.vercel.app', apiUrl: 'https://nexus-llm-portal.vercel.app/api/chat?sessionId=default' }
];

console.log('=== VERIFYING LIVE PRODUCTION DEPLOYMENTS ===\n');

async function testAll() {
  let allPassed = true;

  for (const app of APPS) {
    console.log(`[TESTING] ${app.name}`);
    try {
      // 1. Check HTML
      const htmlRes = await fetch(app.url);
      const html = await htmlRes.text();
      const hasSuiteBar = html.includes('bf-suite-bar.js');
      console.log(`  HTML status: ${htmlRes.status} | Has Suite Bar: ${hasSuiteBar}`);

      // 2. Check API
      const apiRes = await fetch(app.apiUrl);
      const apiJson = await apiRes.json();
      console.log(`  API status: ${apiRes.status} | API Success: ${apiJson.success}`);

      if (htmlRes.status !== 200 || apiRes.status !== 200 || !hasSuiteBar || !apiJson.success) {
        allPassed = false;
      }
    } catch (err) {
      console.error(`  [ERROR] Failed to verify ${app.name}:`, err.message);
      allPassed = false;
    }
    console.log('');
  }

  if (allPassed) {
    console.log('=== ALL 7 PRODUCTION DEPLOYMENTS VERIFIED SUCCESSFULLY ===');
  } else {
    console.log('=== SOME DEPLOYMENTS ARE STILL BUILDING ON VERCEL OR NEED MANUAL TRIGGER ===');
  }
}

testAll();

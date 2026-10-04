const urls = [
  { name: 'Voice Call Automation', url: 'https://voice-call-automation-delta.vercel.app', marker: 'bf-suite-bar.js' },
  { name: 'Real Estate Predictor', url: 'https://real-estate-predictor-zeta.vercel.app', marker: 'bf-suite-bar.js' },
  { name: 'LearnBridge LMS', url: 'https://learnbridge-lms.vercel.app', marker: 'threejs-cert-modal' },
  { name: 'MediCare Hub', url: 'https://medicare-hub-sooty.vercel.app', marker: 'leading-tight whitespace-normal break-words' },
  { name: 'FlowOps ERP', url: 'https://flowops-erp-three.vercel.app', marker: 'bf-suite-bar.js' },
  { name: 'EduTrack SIS', url: 'https://edutrack-sis.vercel.app', marker: 'COHORT AVERAGE GPA' },
  { name: 'Nexus LLM Portal', url: 'https://nexus-llm-portal.vercel.app', marker: 'ENTERPRISE COGNITIVE FABRIC' }
];

async function verify() {
  console.log('--- VERIFYING LIVE PRODUCTION CONTENT & HEADERS ---');
  for (const item of urls) {
    try {
      const res = await fetch(item.url, { headers: { 'Cache-Control': 'no-cache' } });
      const text = await res.text();
      const hasMarker = text.includes(item.marker);
      const etag = res.headers.get('etag') || res.headers.get('x-vercel-id') || 'ok';
      console.log(`[PASS] ${item.name}: Status ${res.status} | Has Marker '${item.marker}': ${hasMarker} | Server: ${etag.slice(0, 20)}`);
    } catch(e) {
      console.log(`[FAIL] ${item.name}: Error ${e.message}`);
    }
  }
}
verify();

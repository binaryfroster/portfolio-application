// Exhaustive deep verification script for all 7 live production deployments
// Strictly zero emojis.

const APPS = [
  {
    name: 'Voice Call Automation',
    url: 'https://voice-call-automation-delta.vercel.app',
    apiUrl: 'https://voice-call-automation-delta.vercel.app/api/call',
    checks: [
      'enterprise-plan-estimator',
      'quotationModal',
      'openQuotationModalBtn',
      'ivrNodeInspector',
      'printQuotationBtn'
    ]
  },
  {
    name: 'Real Estate Price Predictor',
    url: 'https://real-estate-predictor-zeta.vercel.app',
    apiUrl: 'https://real-estate-predictor-zeta.vercel.app/api/predict',
    checks: [
      'proptech-plan-estimator',
      'propQuotationModal',
      'openPropQuotationBtn',
      'modalPropPlanCost',
      'printPropQuoteBtn'
    ]
  },
  {
    name: 'LearnBridge LMS',
    url: 'https://learnbridge-lms.vercel.app',
    apiUrl: 'https://learnbridge-lms.vercel.app/api/progress?studentId=student-demo',
    checks: [
      'lms-plan-estimator',
      'learnbridgeQuotationModal',
      'openLmsQuotationBtn',
      'quoteLmsContractHash',
      'threejs-cert-modal'
    ]
  },
  {
    name: 'MediCare Hub',
    url: 'https://medicare-hub-sooty.vercel.app',
    apiUrl: 'https://medicare-hub-sooty.vercel.app/api/patients',
    checks: [
      'hospital-plan-estimator',
      'medicareQuotationModal',
      'openMedicareQuotationBtn',
      'modalMedicarePlanCost',
      'printMedicareQuoteBtn'
    ]
  },
  {
    name: 'FlowOps ERP',
    url: 'https://flowops-erp-three.vercel.app',
    apiUrl: 'https://flowops-erp-three.vercel.app/api/inventory',
    checks: [
      'mes-plan-estimator',
      'flowopsQuotationModal',
      'openFlowOpsQuotationBtn',
      'bomTableBody',
      'palletSlotInspectorHud'
    ]
  },
  {
    name: 'EduTrack SIS',
    url: 'https://edutrack-sis.vercel.app',
    apiUrl: 'https://edutrack-sis.vercel.app/api/students',
    checks: [
      'sis-plan-estimator',
      'edutrackQuotationModal',
      'openSisQuotationBtn',
      'dagProgressBadge',
      'quoteSisContractHash'
    ]
  },
  {
    name: 'Nexus LLM Portal',
    url: 'https://nexus-llm-portal.vercel.app',
    apiUrl: 'https://nexus-llm-portal.vercel.app/api/chat?sessionId=default',
    checks: [
      'nexusEstimatorModal',
      'nexusQuotationModal',
      'benchmarkMatrixModal',
      'openBenchmarkBtn',
      'quoteNexusContractHash'
    ]
  }
];

async function runAudit() {
  console.log('=== EXHAUSTIVE DEEP AUDIT OF ALL 7 PRODUCTION DEPLOYMENTS ===\n');
  let overallPass = true;
  const summaryResults = [];

  for (const app of APPS) {
    console.log(`[TESTING] ${app.name}`);
    console.log(`  URL: ${app.url}`);

    try {
      // 1. HTML fetch & DOM check
      const htmlRes = await fetch(app.url, { headers: { 'Cache-Control': 'no-cache' } });
      const htmlText = await htmlRes.text();
      console.log(`  HTML Status: ${htmlRes.status} (Length: ${htmlText.length} bytes)`);

      const missingChecks = app.checks.filter(c => !htmlText.includes(c));
      const checksPass = missingChecks.length === 0;

      if (checksPass) {
        console.log(`  Domain & Estimator Checks: PASS (all ${app.checks.length} verified)`);
      } else {
        console.log(`  Domain & Estimator Checks: FAIL (missing: ${missingChecks.join(', ')})`);
        overallPass = false;
      }

      // 2. API fetch
      const apiRes = await fetch(app.apiUrl, { headers: { 'Cache-Control': 'no-cache' } });
      const apiJson = await apiRes.json();
      const apiPass = apiRes.status === 200 && apiJson.success === true;
      console.log(`  API Status: ${apiRes.status} | Success: ${apiJson.success}`);

      const appPassed = htmlRes.status === 200 && checksPass && apiPass;
      summaryResults.push({
        name: app.name,
        url: app.url,
        htmlStatus: htmlRes.status,
        checksVerified: `${app.checks.length - missingChecks.length}/${app.checks.length}`,
        apiStatus: apiRes.status,
        apiSuccess: apiJson.success,
        verdict: appPassed ? 'PASS' : 'FAIL'
      });

      if (!appPassed) {
        overallPass = false;
      }
    } catch (e) {
      console.error(`  ERROR testing ${app.name}:`, e.message);
      summaryResults.push({
        name: app.name,
        url: app.url,
        verdict: 'FAIL: ' + e.message
      });
      overallPass = false;
    }
    console.log('');
  }

  console.log('=== AUDIT SUMMARY MATRIX ===');
  console.table(summaryResults);

  if (overallPass) {
    console.log('\n=== 100% PRODUCTION VERIFICATION CONFIRMED ACROSS ALL 7 APPLICATIONS ===');
    process.exit(0);
  } else {
    console.error('\n=== ONE OR MORE TESTS FAILED ===');
    process.exit(1);
  }
}

runAudit();

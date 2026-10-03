// Security and API Orchestrator Test Engine
// Implementing: API Tester + AI-Generated Code Security Auditor + Agents Orchestrator
// Strictly zero emojis.

import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

const REPOS = [
  'c:\\Users\\HP\\Downloads\\portfolio-application',
  'c:\\Users\\HP\\Downloads\\Binary Froster Protal\\Binary Froster Protal'
];

console.log('================================================================');
console.log('  AGENTS ORCHESTRATOR: AI SECURITY & API TESTING PIPELINE');
console.log('================================================================\n');

// ============================================================================
// PART 1: AI-GENERATED CODE SECURITY AUDITOR
// ============================================================================
console.log('--- PHASE 1: AI-GENERATED CODE SECURITY AUDIT ---');

const findings = [];

const SECRET_PATTERNS = [
  { name: 'Hardcoded OpenAI Key in code', regex: /sk-[a-zA-Z0-9]{20,}/g, cwe: 'CWE-798' },
  { name: 'Hardcoded Anthropic Key in code', regex: /sk-ant-[a-zA-Z0-9]{20,}/g, cwe: 'CWE-798' },
  { name: 'Hardcoded Stripe Secret in code', regex: /sk_(live|test)_[0-9a-zA-Z]{24,}/g, cwe: 'CWE-798' },
  { name: 'Exposed service_role in env prefix', regex: /NEXT_PUBLIC_.*SERVICE_ROLE/gi, cwe: 'CWE-798' },
  { name: 'Supabase service_role literal in client', regex: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*['\"][a-zA-Z0-9._-]{30,}['\"]/g, cwe: 'CWE-798' },
  { name: 'Hardcoded database credentials in client', regex: /postgres(ql)?:\/\/[a-zA-Z0-9_-]+:[a-zA-Z0-9_#$@.-]+@[a-zA-Z0-9.-]+\//gi, cwe: 'CWE-798' },
  { name: 'Twilio Auth Token in client', regex: /AC[a-f0-9]{32}/g, cwe: 'CWE-798' }
];

function scanFileSecurity(filePath) {
  if (filePath.includes('.git') || filePath.includes('node_modules') || filePath.includes('.next') || filePath.includes('.vercel') || filePath.includes('tests') || filePath.includes('scratch') || filePath.endsWith('.example')) return;
  const content = fs.readFileSync(filePath, 'utf8');

  // 1. Secrets check
  for (const p of SECRET_PATTERNS) {
    let match;
    while ((match = p.regex.exec(content)) !== null) {
      const val = match[0];
      if (val.includes('placeholder') || val.includes('xxxx') || val.includes('demo') || val.includes('mock') || val.includes('test_secret') || val.includes('dummy')) continue;
      findings.push({
        severity: 'CRITICAL',
        type: p.name,
        cwe: p.cwe,
        file: filePath,
        evidence: val.slice(0, 10) + '... (REDACTED)',
        remediation: 'Move secret to server-side environment variables and rotate key at provider immediately.'
      });
    }
  }

  // 2. Prompt injection sinks (OWASP LLM01)
  if (filePath.endsWith('.js') || filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    const sysPromptInjection = /role:\s*['"]system['"],\s*content:\s*`[^`]*\$\{[^}]+\}[^`]*`/g;
    let injMatch;
    while ((injMatch = sysPromptInjection.exec(content)) !== null) {
      findings.push({
        severity: 'MEDIUM',
        type: 'Dynamic System Prompt String Interpolation',
        cwe: 'CWE-1426 (OWASP LLM01)',
        file: filePath,
        evidence: injMatch[0].slice(0, 70) + '...',
        remediation: 'Keep system prompt static. Pass untrusted user input strictly in user-role message.'
      });
    }
  }

  // 3. Database RLS scans (CWE-862, CWE-863)
  if (filePath.endsWith('.sql')) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/create\s+policy\s+[^;]+for\s+(insert|update|delete)\s+[^;]+using\s*\(\s*true\s*\)/i.test(line)) {
        findings.push({
          severity: 'HIGH',
          type: 'Unrestricted Mutation Policy USING (true)',
          cwe: 'CWE-862',
          file: filePath,
          line: i + 1,
          evidence: line.trim(),
          remediation: 'Scope write policies to authenticated user identity: auth.uid() = user_id.'
        });
      }
      if (/user_metadata\s*->>\s*['"]role['"]/i.test(line)) {
        findings.push({
          severity: 'HIGH',
          type: 'Authorization gated on mutable user_metadata',
          cwe: 'CWE-863',
          file: filePath,
          line: i + 1,
          evidence: line.trim(),
          remediation: 'Enforce roles using app_metadata or dedicated public.user_roles table.'
        });
      }
    }
  }
}

function traverse(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!['node_modules', '.git', '.next', '.vercel'].includes(e.name)) {
        traverse(full);
      }
    } else {
      scanFileSecurity(full);
    }
  }
}

for (const repo of REPOS) {
  traverse(repo);
}

console.log(`Security Scan Completed. Total Findings: ${findings.length}`);
if (findings.length > 0) {
  console.log('Findings Summary:');
  findings.forEach((f, idx) => {
    console.log(`  [${idx + 1}] [${f.severity}] ${f.type} in ${path.basename(f.file)} (${f.cwe})`);
    console.log(`      Evidence: ${f.evidence}`);
    console.log(`      Remediation: ${f.remediation}\n`);
  });
} else {
  console.log('  [PASS] Zero hardcoded secrets, zero broken RLS policies, and zero prompt injection sinks detected.\n');
}

// ============================================================================
// PART 2: API TESTER - COMPREHENSIVE VALIDATION SUITE
// ============================================================================
console.log('--- PHASE 2: API TESTER - COMPREHENSIVE ENDPOINT VALIDATION ---');

const LIVE_ENDPOINTS = [
  {
    name: 'Voice Call Automation: /api/call',
    url: 'https://voice-call-automation-delta.vercel.app/api/call',
    method: 'POST',
    validBody: { to: '+917647958412', scenario: 'priority', persona: 'sarah' },
    invalidBodies: [
      { to: '' },
      { to: 'not-a-number' },
      { to: '<script>alert(1)</script>' }
    ],
    sqlPayload: { to: "'; DROP TABLE calls; --" }
  },
  {
    name: 'Real Estate Predictor: /api/predict',
    url: 'https://real-estate-predictor-zeta.vercel.app/api/predict',
    method: 'POST',
    validBody: { sqft: 1200, beds: 3, baths: 2, borough: 'camden', condition: 8 },
    invalidBodies: [
      { sqft: -500 },
      { sqft: 'invalid' },
      { beds: 0, baths: 0 }
    ],
    sqlPayload: { borough: "'; DROP TABLE properties; --" }
  },
  {
    name: 'LearnBridge LMS: /api/courses',
    url: 'https://learnbridge-lms.vercel.app/api/courses',
    method: 'GET'
  },
  {
    name: 'LearnBridge LMS: /api/quiz',
    url: 'https://learnbridge-lms.vercel.app/api/quiz',
    method: 'POST',
    validBody: { answers: { q1: 'A', q2: 'A', q3: 'A' }, studentId: 'student-demo' },
    invalidBodies: [
      { answers: null },
      { answers: {} }
    ]
  },
  {
    name: 'MediCare Hub: /api/patients',
    url: 'https://medicare-hub-sooty.vercel.app/api/patients',
    method: 'GET'
  },
  {
    name: 'MediCare Hub: /api/vitals',
    url: 'https://medicare-hub-sooty.vercel.app/api/vitals?mrn=MRN-78421',
    method: 'GET'
  },
  {
    name: 'FlowOps ERP: /api/inventory',
    url: 'https://flowops-erp-three.vercel.app/api/inventory',
    method: 'GET'
  },
  {
    name: 'FlowOps ERP: /api/kanban',
    url: 'https://flowops-erp-three.vercel.app/api/kanban',
    method: 'GET'
  },
  {
    name: 'EduTrack SIS: /api/students',
    url: 'https://edutrack-sis.vercel.app/api/students',
    method: 'GET'
  },
  {
    name: 'EduTrack SIS: /api/attendance',
    url: 'https://edutrack-sis.vercel.app/api/attendance?studentId=STU-101',
    method: 'GET'
  },
  {
    name: 'Nexus LLM Portal: /api/chat',
    url: 'https://nexus-llm-portal.vercel.app/api/chat?sessionId=default',
    method: 'GET'
  }
];

async function runApiTests() {
  const testResults = [];

  for (const ep of LIVE_ENDPOINTS) {
    console.log(`[TEST SUITE] ${ep.name}`);

    // 1. Functional & SLA Latency Test
    const t0 = performance.now();
    try {
      const opts = { method: ep.method, headers: { 'Content-Type': 'application/json' } };
      if (ep.validBody) opts.body = JSON.stringify(ep.validBody);
      const res = await fetch(ep.url, opts);
      const latency = Math.round(performance.now() - t0);
      const json = await res.json().catch(() => null);

      const passStatus = res.status === 200;
      const passSLA = latency < 1200; // Cloud cold-start SLA window

      console.log(`  [Functional] Status: ${res.status} | Latency: ${latency}ms (SLA: ${passSLA ? 'PASS' : 'WARN'}) | Response OK: ${!!json}`);
      testResults.push({ endpoint: ep.name, test: 'Functional & SLA', pass: passStatus, latency });

      // 2. CORS Preflight Test
      const optRes = await fetch(ep.url, { method: 'OPTIONS' });
      const corsOk = optRes.status === 200 || optRes.status === 204;
      console.log(`  [CORS Preflight] Status: ${optRes.status} | Access-Control-Allow-Origin: ${optRes.headers.get('access-control-allow-origin') || 'none'} (${corsOk ? 'PASS' : 'FAIL'})`);
      testResults.push({ endpoint: ep.name, test: 'CORS Preflight', pass: corsOk });

      // 3. Security & Boundary Validation (for POST endpoints)
      if (ep.invalidBodies && ep.invalidBodies.length > 0) {
        for (let i = 0; i < ep.invalidBodies.length; i++) {
          const invRes = await fetch(ep.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ep.invalidBodies[i])
          });
          // Must handle gracefully with 200 fallback or 400 bad request, NEVER 500 unhandled crash
          const safeStatus = invRes.status !== 500;
          console.log(`  [Boundary Case #${i + 1}] Status: ${invRes.status} (Safe Handling: ${safeStatus ? 'PASS' : 'FAIL'})`);
          testResults.push({ endpoint: ep.name, test: `Boundary #${i + 1}`, pass: safeStatus });
        }
      }

      // 4. SQL Injection payload resilience
      if (ep.sqlPayload) {
        const sqlRes = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ep.sqlPayload)
        });
        const sqlSafe = sqlRes.status !== 500;
        console.log(`  [SQLi Resilience] Status: ${sqlRes.status} (Crash Prevention: ${sqlSafe ? 'PASS' : 'FAIL'})`);
        testResults.push({ endpoint: ep.name, test: 'SQLi Resilience', pass: sqlSafe });
      }

    } catch (err) {
      console.error(`  [ERROR] Network or parse failure on ${ep.name}:`, err.message);
      testResults.push({ endpoint: ep.name, test: 'Network Execution', pass: false });
    }
    console.log('');
  }

  // Summary Metrics
  const total = testResults.length;
  const passed = testResults.filter(r => r.pass).length;
  const failed = total - passed;
  console.log('================================================================');
  console.log(`  API TEST RESULTS SUMMARY: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('================================================================');
  
  if (failed === 0 && findings.length === 0) {
    console.log('\n>>> PIPELINE CERTIFICATION: READY FOR ENTERPRISE DEPLOYMENT <<<');
  } else {
    console.log('\n>>> PIPELINE CERTIFICATION: ISSUES REQUIRE TRIAGE <<<');
  }
}

runApiTests();

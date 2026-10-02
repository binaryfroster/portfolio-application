// PORTFOLIO MASTER REGRESSION SUITE
// Automated verification across all 7 Binary Froster portfolio applications.
// Verifies:
// 1. Strictly Zero Emojis across all source files (.html, .js, .css, .json, .sql)
// 2. Secret and Token Protection (No committed credentials or keys)
// 3. Database Client (api/lib/db.js) presence & fallback execution
// 4. Suite Navigation Bar (bf-suite-bar.js) presence & script linkage
// 5. Serverless API contract testing (GET and POST handling without crash)
// Strictly zero emojis.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const BASE_DIR = path.resolve('.');

const APPS = [
  { id: 'voice-call-automation', dir: 'voice-call-automation', title: 'VocalFlow' },
  { id: 'real-estate-predictor', dir: 'real-estate-predictor', title: 'MetroVal' },
  { id: 'learnbridge-lms', dir: 'learnbridge-lms', title: 'LearnBridge' },
  { id: 'medicare-hub', dir: 'medicare-hub', title: 'MediCare Hub' },
  { id: 'flowops-erp', dir: 'flowops-erp', title: 'FlowOps ERP' },
  { id: 'edutrack-sis', dir: 'edutrack-sis', title: 'EduTrack SIS' },
  { id: 'nexus-llm-portal', dir: 'nexus-llm-portal', title: 'Nexus LLM' }
];

function createMockReqRes({ method = 'GET', body = {}, query = {}, headers = {} } = {}) {
  const req = {
    method,
    body,
    query,
    headers
  };
  const res = {
    statusCode: 200,
    headers: {},
    ended: false,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, val) {
      this.headers[key] = val;
      return this;
    },
    json(data) {
      this.body = data;
      this.ended = true;
      return this;
    },
    send(data) {
      this.body = data;
      this.ended = true;
      return this;
    },
    write() {
      return this;
    },
    end() {
      this.ended = true;
      return this;
    }
  };
  return { req, res };
}

test('1. Zero Emoji Compliance across all 7 portfolio applications', () => {
  const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/u;
  const violations = [];

  for (const app of APPS) {
    const appDir = path.join(BASE_DIR, app.dir);
    if (!fs.existsSync(appDir)) continue;

    function scanDir(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.vercel') continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (/\.(html|js|mjs|css|json|sql)$/i.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (emojiRegex.test(line)) {
              violations.push(`${path.relative(BASE_DIR, fullPath)}:${idx + 1}`);
            }
          });
        }
      }
    }

    scanDir(appDir);
  }

  assert.strictEqual(violations.length, 0, `Emoji violations found in files: ${violations.join(', ')}`);
});

test('2. Secret & Token Protection scan across all portfolio apps', () => {
  const secretPatterns = [
    /SK[0-9a-fA-F]{32}/, // Twilio API Key
    /AC[0-9a-fA-F]{32}/, // Twilio Account SID live
    /ghp_[a-zA-Z0-9]{36}/, // GitHub Token
    /stripe_live_[a-zA-Z0-9]{24}/, // Stripe Secret
    /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]{50,}/ // Raw Supabase JWT
  ];

  const leaks = [];

  for (const app of APPS) {
    const appDir = path.join(BASE_DIR, app.dir);
    if (!fs.existsSync(appDir)) continue;

    function scanDir(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.vercel') continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (/\.(html|js|mjs|json)$/i.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          for (const pattern of secretPatterns) {
            if (pattern.test(content)) {
              leaks.push(`${path.relative(BASE_DIR, fullPath)} matches pattern ${pattern}`);
            }
          }
        }
      }
    }

    scanDir(appDir);
  }

  assert.strictEqual(leaks.length, 0, `Secrets leaked in source files: ${leaks.join(', ')}`);
});

test('3. Database client (api/lib/db.js) exists and functions in all 7 applications', async () => {
  for (const app of APPS) {
    const dbPath = path.join(BASE_DIR, app.dir, 'api', 'lib', 'db.js');
    assert.ok(fs.existsSync(dbPath), `Missing db.js in ${app.dir}/api/lib/db.js`);

    // Verify DB client loads and fallback mechanism works cleanly
    const db = await import(`file://${dbPath.replace(/\\/g, '/')}`);
    const client = db.default || db;

    assert.ok(typeof client.select === 'function', `client.select is not a function in ${app.dir}`);
    assert.ok(typeof client.insert === 'function', `client.insert is not a function in ${app.dir}`);

    // In local test environment without Supabase keys, fallback should activate without error
    const testSelect = await client.select('test_table', 'limit=1');
    assert.ok(testSelect.fallback === true || Array.isArray(testSelect.data), `db.select failed in ${app.dir}`);
  }
});

test('4. Cross-App Ecosystem Bar (bf-suite-bar.js) installed and linked in all 7 applications', () => {
  for (const app of APPS) {
    const suiteBarPath = path.join(BASE_DIR, app.dir, 'bf-suite-bar.js');
    assert.ok(fs.existsSync(suiteBarPath), `Missing bf-suite-bar.js in ${app.dir}`);

    const indexPath = path.join(BASE_DIR, app.dir, 'index.html');
    assert.ok(fs.existsSync(indexPath), `Missing index.html in ${app.dir}`);

    const html = fs.readFileSync(indexPath, 'utf8');
    assert.ok(html.includes('bf-suite-bar.js'), `index.html in ${app.dir} does not link to bf-suite-bar.js`);
    assert.ok(html.includes(`name="bf-app-id" content="${app.id}"`), `index.html in ${app.dir} missing bf-app-id meta tag`);
  }
});

test('5. Serverless API contract testing across all 7 applications', async () => {
  // Test 5.1: Voice Call Automation API
  {
    const callApi = await import(`file://${path.join(BASE_DIR, 'voice-call-automation', 'api', 'call.js').replace(/\\/g, '/')}`);
    const handler = callApi.default || callApi;
    const { req: getReq, res: getRes } = createMockReqRes({ method: 'GET' });
    await handler(getReq, getRes);
    assert.strictEqual(getRes.statusCode, 200);
    assert.ok(getRes.body && getRes.body.success === true, 'Voice call GET failed');

    const { req: postReq, res: postRes } = createMockReqRes({
      method: 'POST',
      body: { to: '+15551234567', scenario: 'priority-dispatch' }
    });
    await handler(postReq, postRes);
    assert.strictEqual(postRes.statusCode, 200);
    assert.ok(postRes.body && postRes.body.success === true, 'Voice call POST failed');
  }

  // Test 5.2: Real Estate Predictor API
  {
    const predictApi = await import(`file://${path.join(BASE_DIR, 'real-estate-predictor', 'api', 'predict.js').replace(/\\/g, '/')}`);
    const handler = predictApi.default || predictApi;
    const { req: getReq, res: getRes } = createMockReqRes({ method: 'GET' });
    await handler(getReq, getRes);
    assert.strictEqual(getRes.statusCode, 200);
    assert.ok(getRes.body && getRes.body.success === true, 'Predict GET failed');

    const { req: postReq, res: postRes } = createMockReqRes({
      method: 'POST',
      body: { sqft: 2200, beds: 3, baths: 2, zipCode: '78701', propertyType: 'single-family' }
    });
    await handler(postReq, postRes);
    assert.strictEqual(postRes.statusCode, 200);
    assert.ok(postRes.body && postRes.body.success === true && typeof (postRes.body.estimatedPrice || postRes.body.price) === 'number', 'Predict POST failed');
  }

  // Test 5.3: LearnBridge LMS API
  {
    const progressApi = await import(`file://${path.join(BASE_DIR, 'learnbridge-lms', 'api', 'progress.js').replace(/\\/g, '/')}`);
    const handler = progressApi.default || progressApi;
    const { req: getReq, res: getRes } = createMockReqRes({ method: 'GET', query: { studentId: 'student-demo' } });
    await handler(getReq, getRes);
    assert.strictEqual(getRes.statusCode, 200);
    assert.ok(getRes.body && getRes.body.success === true, 'LearnBridge progress GET failed');
  }

  // Test 5.4: MediCare Hub API
  {
    const patientsApi = await import(`file://${path.join(BASE_DIR, 'medicare-hub', 'api', 'patients.js').replace(/\\/g, '/')}`);
    const handler = patientsApi.default || patientsApi;
    const { req: getReq, res: getRes } = createMockReqRes({ method: 'GET' });
    await handler(getReq, getRes);
    assert.strictEqual(getRes.statusCode, 200);
    assert.ok(getRes.body && getRes.body.success === true && Array.isArray(getRes.body.patients), 'MediCare patients GET failed');
  }

  // Test 5.5: FlowOps ERP API
  {
    const inventoryApi = await import(`file://${path.join(BASE_DIR, 'flowops-erp', 'api', 'inventory.js').replace(/\\/g, '/')}`);
    const handler = inventoryApi.default || inventoryApi;
    const { req: getReq, res: getRes } = createMockReqRes({ method: 'GET' });
    await handler(getReq, getRes);
    assert.strictEqual(getRes.statusCode, 200);
    assert.ok(getRes.body && getRes.body.success === true && Array.isArray(getRes.body.items || getRes.body.inventory), 'FlowOps inventory GET failed');
  }

  // Test 5.6: EduTrack SIS API
  {
    const studentsApi = await import(`file://${path.join(BASE_DIR, 'edutrack-sis', 'api', 'students.js').replace(/\\/g, '/')}`);
    const handler = studentsApi.default || studentsApi;
    const { req: getReq, res: getRes } = createMockReqRes({ method: 'GET' });
    await handler(getReq, getRes);
    assert.strictEqual(getRes.statusCode, 200);
    assert.ok(getRes.body && getRes.body.success === true && Array.isArray(getRes.body.students), 'EduTrack students GET failed');
  }

  // Test 5.7: Nexus LLM Portal API
  {
    const chatApi = await import(`file://${path.join(BASE_DIR, 'nexus-llm-portal', 'api', 'chat.js').replace(/\\/g, '/')}`);
    const handler = chatApi.default || chatApi;
    const { req: getReq, res: getRes } = createMockReqRes({ method: 'GET', query: { sessionId: 'test-session' } });
    await handler(getReq, getRes);
    assert.strictEqual(getRes.statusCode, 200);
    assert.ok(getRes.body && getRes.body.success === true, 'Nexus chat GET failed');

    const { req: postReq, res: postRes } = createMockReqRes({
      method: 'POST',
      body: { prompt: 'What is the enterprise SLA guarantee?', model: 'claude-3-5-sonnet' }
    });
    await handler(postReq, postRes);
    assert.strictEqual(postRes.statusCode, 200);
    assert.ok(postRes.body && postRes.body.success === true && typeof postRes.body.completion === 'string', 'Nexus chat POST failed');
  }
});

test('6. Secondary and telemetry API endpoint verification', async () => {
  // 6.1 Telemetry API
  {
    const telemApi = await import(`file://${path.join(BASE_DIR, 'voice-call-automation', 'api', 'telemetry.js').replace(/\\/g, '/')}`);
    const handler = telemApi.default || telemApi;
    const { req, res } = createMockReqRes({ method: 'GET' });
    await handler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body && (res.body.success === true || res.body.status === 'ONLINE'));
  }

  // 6.2 Real Estate Comps & Analytics
  {
    const compsApi = await import(`file://${path.join(BASE_DIR, 'real-estate-predictor', 'api', 'comps.js').replace(/\\/g, '/')}`);
    const handler = compsApi.default || compsApi;
    const { req, res } = createMockReqRes({ method: 'GET', query: { borough: 'westminster' } });
    await handler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body && res.body.success === true && Array.isArray(res.body.comps));
  }

  // 6.3 LearnBridge Courses Catalog
  {
    const coursesApi = await import(`file://${path.join(BASE_DIR, 'learnbridge-lms', 'api', 'courses.js').replace(/\\/g, '/')}`);
    const handler = coursesApi.default || coursesApi;
    const { req, res } = createMockReqRes({ method: 'GET' });
    await handler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body && res.body.success === true && Array.isArray(res.body.courses));
  }

  // 6.4 MediCare Vitals Telemetry
  {
    const vitalsApi = await import(`file://${path.join(BASE_DIR, 'medicare-hub', 'api', 'vitals.js').replace(/\\/g, '/')}`);
    const handler = vitalsApi.default || vitalsApi;
    const { req, res } = createMockReqRes({ method: 'GET', query: { mrn: 'MRN-78421' } });
    await handler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body && res.body.success === true);
  }

  // 6.5 FlowOps Kanban Stages
  {
    const kanbanApi = await import(`file://${path.join(BASE_DIR, 'flowops-erp', 'api', 'kanban.js').replace(/\\/g, '/')}`);
    const handler = kanbanApi.default || kanbanApi;
    const { req, res } = createMockReqRes({ method: 'GET' });
    await handler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body && res.body.success === true && Array.isArray(res.body.orders || res.body.columns));
  }

  // 6.6 EduTrack Attendance Ledger
  {
    const attApi = await import(`file://${path.join(BASE_DIR, 'edutrack-sis', 'api', 'attendance.js').replace(/\\/g, '/')}`);
    const handler = attApi.default || attApi;
    const { req, res } = createMockReqRes({ method: 'GET' });
    await handler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body && res.body.success === true);
  }

  // 6.7 Nexus Knowledge Base Documents
  {
    const ragApi = await import(`file://${path.join(BASE_DIR, 'nexus-llm-portal', 'api', 'rag.js').replace(/\\/g, '/')}`);
    const handler = ragApi.default || ragApi;
    const { req, res } = createMockReqRes({ method: 'GET' });
    await handler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body && res.body.success === true && Array.isArray(res.body.documents));
  }
});

test('7. Boundary validation & error handling across serverless endpoints', async () => {
  // Empty prompt on Nexus chat should return 400
  {
    const chatApi = await import(`file://${path.join(BASE_DIR, 'nexus-llm-portal', 'api', 'chat.js').replace(/\\/g, '/')}`);
    const handler = chatApi.default || chatApi;
    const { req, res } = createMockReqRes({ method: 'POST', body: { prompt: '' } });
    await handler(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
  }

  // Extreme or negative values on Real Estate Predictor should clamp gracefully
  {
    const predictApi = await import(`file://${path.join(BASE_DIR, 'real-estate-predictor', 'api', 'predict.js').replace(/\\/g, '/')}`);
    const handler = predictApi.default || predictApi;
    const { req, res } = createMockReqRes({
      method: 'POST',
      body: { sqft: -9999, bedrooms: -5, bathrooms: -2, conditionGrade: 999 }
    });
    await handler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.success === true);
    assert.ok(typeof (res.body.estimatedPrice || res.body.price) === 'number');
    assert.ok(!isNaN(res.body.estimatedPrice || res.body.price));
  }

  // FlowOps stock update action
  {
    const invApi = await import(`file://${path.join(BASE_DIR, 'flowops-erp', 'api', 'inventory.js').replace(/\\/g, '/')}`);
    const handler = invApi.default || invApi;
    const { req, res } = createMockReqRes({
      method: 'POST',
      body: { action: 'update_stock', sku: 'SKU-8841', stock: 25 }
    });
    await handler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.stock, 25);
  }
});

test('8. CORS & Preflight OPTIONS handling across all applications', async () => {
  const apis = [
    path.join(BASE_DIR, 'voice-call-automation', 'api', 'call.js'),
    path.join(BASE_DIR, 'real-estate-predictor', 'api', 'predict.js'),
    path.join(BASE_DIR, 'learnbridge-lms', 'api', 'progress.js'),
    path.join(BASE_DIR, 'medicare-hub', 'api', 'patients.js'),
    path.join(BASE_DIR, 'flowops-erp', 'api', 'inventory.js'),
    path.join(BASE_DIR, 'edutrack-sis', 'api', 'students.js'),
    path.join(BASE_DIR, 'nexus-llm-portal', 'api', 'chat.js')
  ];

  for (const apiPath of apis) {
    const mod = await import(`file://${apiPath.replace(/\\/g, '/')}`);
    const handler = mod.default || mod;
    const { req, res } = createMockReqRes({ method: 'OPTIONS' });
    await handler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['Access-Control-Allow-Origin'], '*');
  }
});

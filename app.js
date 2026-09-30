// NEXUS LLM PORTAL - CLIENT APPLICATION LOGIC
// Binary Froster Enterprise Cognitive Engine

(function () {
  'use strict';

  // State Management
  const state = {
    activeSessionId: 'session-1',
    activeModel: 'claude-3-5',
    ragEnabled: true,
    totalTokens: 14280,
    latency: 28,
    temperature: 0.2,
    topP: 0.9,
    persona: 'rag-strict',
    sessions: [
      {
        id: 'session-1',
        title: 'SOC2 & Cryptographic Audit Review',
        updated: '10m ago',
        messages: [
          {
            role: 'user',
            content: 'Summarize the cryptographic controls and SLA credit schedules from our enterprise documents.'
          },
          {
            role: 'assistant',
            content: `Based on your indexed documents (**SOC2_Audit_Report_2026.pdf** and **Enterprise_SLA_Master.docx**), here is the verified breakdown:

### 1. Cryptographic Isolation (SOC2 CC6.1 - CC6.7)
* **Session Security**: Session tokens are cryptographically encrypted using AES-256-GCM and stored inside HttpOnly, Secure, SameSite=Strict cookies.
* **Database Ledger**: Client credentials and API secrets in Supabase are hashed using Argon2id with per-tenant salt keys.
* **In-Flight Data**: TLS 1.3 is enforced with mandatory HSTS (Strict-Transport-Security: max-age=63072000; includeSubDomains; preload).

### 2. Service Level Agreement (SLA) & Credit Schedule
Binary Froster guarantees **99.8% monthly production availability**:

| Monthly Uptime Percentage | Service Credit Percentage |
| :--- | :--- |
| **99.5% to < 99.8%** | 10% of monthly fee |
| **98.0% to < 99.5%** | 25% of monthly fee |
| **< 98.0%** | 50% of monthly fee |

*Incident Response Target*: Severity 1 (Critical Outage) requires initial response and direct founder engineering triage in **< 15 minutes**.`,
            citations: [
              {
                doc: 'SOC2_Audit_Report_2026.pdf',
                chunk: 'Section 4.3 - Encryption Standards',
                text: 'All persistent identifiers and active session payloads are encrypted at rest with AES-256-GCM. Decryption keys are rotated every 90 days via AWS KMS.'
              },
              {
                doc: 'Enterprise_SLA_Master.docx',
                chunk: 'Schedule B - Service Credits',
                text: 'Credits are issued against the next monthly billing cycle upon verified Sev-1 breach exceeding 0.2% downtime in any calendar month.'
              }
            ]
          }
        ]
      },
      {
        id: 'session-2',
        title: 'EMR Prescription Module Types',
        updated: '1h ago',
        messages: [
          {
            role: 'user',
            content: 'Generate TypeScript interface for EMR prescriptions'
          },
          {
            role: 'assistant',
            content: `Here is the production-grade TypeScript interface specification aligned with HIPAA standards:

\`\`\`typescript
export interface PrescriptionRecord {
  id: string;
  patientId: string;
  physicianNpi: string;
  clinicId: string;
  medication: {
    brandName: string;
    genericName: string;
    ndcCode: string; // National Drug Code
    dosage: string;  // e.g. "500mg"
    route: 'ORAL' | 'IV' | 'TOPICAL' | 'INHALATION';
    frequency: 'QD' | 'BID' | 'TID' | 'QID' | 'PRN';
  };
  dispensation: {
    quantity: number;
    refillsAllowed: number;
    refillsRemaining: number;
    daysSupply: number;
  };
  security: {
    deaSchedule: 'II' | 'III' | 'IV' | 'V' | 'NON_CONTROLLED';
    digitalSignatureHash: string; // SHA-256
    issuedAt: string;
    expiresAt: string;
  };
}
\`\`\`

This data structure supports automated contraindication audits and direct pharmacy dispatch.`,
            citations: []
          }
        ]
      },
      {
        id: 'session-3',
        title: 'Cloudflare Edge Cache Strategy',
        updated: 'Yesterday',
        messages: [
          {
            role: 'user',
            content: 'How should we configure stale-while-revalidate for edge endpoints?'
          },
          {
            role: 'assistant',
            content: `For high-throughput read-heavy APIs, configure the Cache-Control response header as follows:

\`\`\`http
Cache-Control: public, s-maxage=60, stale-while-revalidate=600
\`\`\`

This provides instant 3ms edge responses while revalidating data in the background every 60 seconds.`,
            citations: []
          }
        ]
      }
    ]
  };

  // DOM Elements
  const messagesContainer = document.getElementById('messagesContainer');
  const chatForm = document.getElementById('chatForm');
  const promptInput = document.getElementById('promptInput');
  const sessionList = document.getElementById('sessionList');
  const modelSelector = document.getElementById('modelSelector');
  const latencyStat = document.getElementById('latencyStat');
  const tokenCounterHeader = document.getElementById('tokenCounterHeader');
  const settingsDrawer = document.getElementById('settingsDrawer');
  const tuneSettingsBtn = document.getElementById('tuneSettingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const tempSlider = document.getElementById('tempSlider');
  const tempVal = document.getElementById('tempVal');
  const topPSlider = document.getElementById('topPSlider');
  const topPVal = document.getElementById('topPVal');
  const personaSelector = document.getElementById('personaSelector');
  const newChatBtn = document.getElementById('newChatBtn');
  const tabSessionsBtn = document.getElementById('tabSessionsBtn');
  const tabKnowledgeBtn = document.getElementById('tabKnowledgeBtn');
  const sessionsPanel = document.getElementById('sessionsPanel');
  const knowledgePanel = document.getElementById('knowledgePanel');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  const fileUploadInput = document.getElementById('fileUploadInput');
  const docList = document.getElementById('docList');
  const citationModal = document.getElementById('citationModal');
  const citationDocName = document.getElementById('citationDocName');
  const citationTitle = document.getElementById('citationTitle');
  const citationContent = document.getElementById('citationContent');
  const closeCitationBtn = document.getElementById('closeCitationBtn');
  const dismissCitationBtn = document.getElementById('dismissCitationBtn');
  const quickPromptBtns = document.querySelectorAll('.quick-prompt-btn');

  // Initialization
  function init() {
    renderSessionList();
    renderActiveSession();
    bindEvents();
  }

  function bindEvents() {
    // Model change
    modelSelector.addEventListener('change', (e) => {
      state.activeModel = e.target.value;
      updateLatencySimulation();
    });

    // Form submit
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSendMessage();
    });

    // Enter without shift
    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });

    // Quick prompts
    quickPromptBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        promptInput.value = btn.textContent.trim();
        handleSendMessage();
      });
    });

    // Parameters Drawer
    tuneSettingsBtn.addEventListener('click', () => {
      settingsDrawer.classList.remove('translate-x-full');
    });

    closeSettingsBtn.addEventListener('click', () => {
      settingsDrawer.classList.add('translate-x-full');
    });

    tempSlider.addEventListener('input', (e) => {
      state.temperature = parseFloat(e.target.value);
      tempVal.textContent = state.temperature.toFixed(2);
    });

    topPSlider.addEventListener('input', (e) => {
      state.topP = parseFloat(e.target.value);
      topPVal.textContent = state.topP.toFixed(2);
    });

    personaSelector.addEventListener('change', (e) => {
      state.persona = e.target.value;
    });

    // Tabs
    tabSessionsBtn.addEventListener('click', () => {
      tabSessionsBtn.className = 'flex-1 py-2.5 text-center text-cyan-400 border-b-2 border-cyan-400 bg-slate-900/40 transition-colors';
      tabKnowledgeBtn.className = 'flex-1 py-2.5 text-center text-slate-400 hover:text-slate-200 border-b-2 border-transparent transition-colors';
      sessionsPanel.classList.remove('hidden');
      knowledgePanel.classList.add('hidden');
    });

    tabKnowledgeBtn.addEventListener('click', () => {
      tabKnowledgeBtn.className = 'flex-1 py-2.5 text-center text-cyan-400 border-b-2 border-cyan-400 bg-slate-900/40 transition-colors';
      tabSessionsBtn.className = 'flex-1 py-2.5 text-center text-slate-400 hover:text-slate-200 border-b-2 border-transparent transition-colors';
      knowledgePanel.classList.remove('hidden');
      sessionsPanel.classList.add('hidden');
    });

    // New Chat
    newChatBtn.addEventListener('click', () => {
      const newSession = {
        id: 'session-' + Date.now(),
        title: 'New Investigation',
        updated: 'Just now',
        messages: [
          {
            role: 'assistant',
            content: 'Session initialized with enterprise RAG pipeline active. You may query indexed architectural docs, SOC2 frameworks, or request code generation.',
            citations: []
          }
        ]
      };
      state.sessions.unshift(newSession);
      state.activeSessionId = newSession.id;
      renderSessionList();
      renderActiveSession();
      if (window.innerWidth < 1024) {
        sidebar.classList.add('-translate-x-full');
      }
    });

    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });

    // Citation modal close
    closeCitationBtn.addEventListener('click', () => citationModal.classList.add('hidden'));
    dismissCitationBtn.addEventListener('click', () => citationModal.classList.add('hidden'));

    // File upload simulator
    fileUploadInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        const newDoc = document.createElement('div');
        newDoc.className = 'p-2.5 rounded-lg border border-cyan-500/40 bg-cyan-950/20 transition-all';
        newDoc.innerHTML = `
          <div class="flex items-center justify-between mb-1">
            <span class="font-medium text-cyan-300 truncate">${file.name}</span>
            <span class="text-[9px] font-mono px-1 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Vectorizing...</span>
          </div>
          <p class="text-[11px] text-slate-400">Processing chunks and generating embeddings...</p>
        `;
        docList.prepend(newDoc);
        setTimeout(() => {
          newDoc.querySelector('span:last-child').textContent = 'Vectorized';
          newDoc.querySelector('p').textContent = '24 semantic chunks indexed with text-embedding-3-large.';
        }, 1500);
      }
    });
  }

  function updateLatencySimulation() {
    const latencies = {
      'gpt-4o': 32,
      'claude-3-5': 24,
      'gemini-1-5-pro': 29,
      'llama-3-1': 19
    };
    state.latency = latencies[state.activeModel] || 25;
    latencyStat.textContent = state.latency + 'ms';
  }

  function renderSessionList() {
    sessionList.innerHTML = '';
    state.sessions.forEach((s) => {
      const isActive = s.id === state.activeSessionId;
      const btn = document.createElement('button');
      btn.className = `w-full text-left p-2.5 rounded-xl text-xs transition-all flex flex-col gap-1 border ${
        isActive
          ? 'bg-slate-900 border-cyan-500/40 text-white shadow-sm'
          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
      }`;
      btn.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-semibold truncate max-w-[170px] ${isActive ? 'text-cyan-300' : ''}">${s.title}</span>
          <span class="text-[10px] font-mono text-slate-500">${s.updated}</span>
        </div>
        <div class="text-[11px] text-slate-500 truncate">${s.messages[s.messages.length - 1]?.content.substring(0, 40) || 'Empty session'}...</div>
      `;
      btn.addEventListener('click', () => {
        state.activeSessionId = s.id;
        renderSessionList();
        renderActiveSession();
        if (window.innerWidth < 1024) {
          sidebar.classList.add('-translate-x-full');
        }
      });
      sessionList.appendChild(btn);
    });
  }

  function renderActiveSession() {
    const session = state.sessions.find((s) => s.id === state.activeSessionId);
    if (!session) return;

    messagesContainer.innerHTML = '';

    session.messages.forEach((msg) => {
      appendMessageToDOM(msg.role, msg.content, msg.citations);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function appendMessageToDOM(role, content, citations) {
    const isUser = role === 'user';
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex gap-3 text-sm leading-relaxed ${isUser ? 'justify-end' : 'justify-start'}`;

    if (!isUser) {
      const avatar = document.createElement('div');
      avatar.className = 'w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500/30 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold shrink-0 mt-0.5';
      avatar.textContent = 'BF';
      msgDiv.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    bubble.className = `max-w-2xl rounded-2xl p-4 shadow-sm ${
      isUser
        ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-50 rounded-tr-none'
        : 'bg-[#0E131F] border border-brand-border text-slate-200 rounded-tl-none'
    }`;

    // Format Markdown content
    bubble.innerHTML = formatMarkdown(content);

    // Citations tags
    if (citations && citations.length > 0) {
      const citationsContainer = document.createElement('div');
      citationsContainer.className = 'mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5';
      citationsContainer.innerHTML = `<span class="text-[10px] font-mono text-slate-500 uppercase mr-1">RAG Sources:</span>`;

      citations.forEach((cit) => {
        const tag = document.createElement('button');
        tag.className = 'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 text-cyan-300 transition-colors';
        tag.innerHTML = `
          <svg class="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <span class="truncate max-w-[140px]">${cit.doc}</span>
        `;
        tag.addEventListener('click', () => {
          citationDocName.textContent = cit.doc;
          citationTitle.textContent = cit.chunk;
          citationContent.textContent = cit.text;
          citationModal.classList.remove('hidden');
        });
        citationsContainer.appendChild(tag);
      });
      bubble.appendChild(citationsContainer);
    }

    msgDiv.appendChild(bubble);

    if (isUser) {
      const userAvatar = document.createElement('div');
      userAvatar.className = 'w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-mono text-xs font-bold shrink-0 mt-0.5';
      userAvatar.textContent = 'YOU';
      msgDiv.appendChild(userAvatar);
    }

    messagesContainer.appendChild(msgDiv);
    return bubble;
  }

  function formatMarkdown(text) {
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks
    html = html.replace(/```([a-z0-9]+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `
        <div class="my-3 rounded-xl overflow-hidden border border-brand-border bg-[#07090E]">
          <div class="px-3 py-1.5 bg-[#0D111A] border-b border-brand-border flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>${lang || 'code'}</span>
            <button onclick="navigator.clipboard.writeText(this.closest('.rounded-xl').querySelector('code').innerText); this.textContent='Copied!';" class="text-cyan-400 hover:text-cyan-300">Copy</button>
          </div>
          <pre class="p-3 text-xs font-mono text-slate-300 overflow-x-auto custom-scrollbar"><code>${code.trim()}</code></pre>
        </div>
      `;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs">$1</code>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-white mt-3 mb-1 font-mono tracking-wide">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-white mt-4 mb-2 font-mono tracking-wide">$1</h2>');

    // Bullet points
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-slate-300">$1</li>');

    // Table conversion
    if (html.includes('|')) {
      const lines = html.split('\n');
      let inTable = false;
      let tableHtml = '<div class="overflow-x-auto my-3"><table class="w-full text-xs text-left border-collapse border border-brand-border rounded-lg">';
      const formattedLines = [];

      lines.forEach((line) => {
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
          const cells = line.split('|').filter(c => c !== '');
          if (line.includes('---')) {
            // separator
          } else {
            tableHtml += '<tr class="border-b border-brand-border">';
            cells.forEach((cell) => {
              tableHtml += `<td class="p-2 border-r border-brand-border last:border-0 text-slate-300">${cell.trim()}</td>`;
            });
            tableHtml += '</tr>';
          }
          inTable = true;
        } else {
          if (inTable) {
            tableHtml += '</table></div>';
            formattedLines.push(tableHtml);
            inTable = false;
            tableHtml = '<div class="overflow-x-auto my-3"><table class="w-full text-xs text-left border-collapse border border-brand-border rounded-lg">';
          }
          formattedLines.push(line);
        }
      });
      if (inTable) {
        tableHtml += '</table></div>';
        formattedLines.push(tableHtml);
      }
      html = formattedLines.join('<br>');
    } else {
      html = html.replace(/\n/g, '<br>');
    }

    return html;
  }

  function handleSendMessage() {
    const text = promptInput.value.trim();
    if (!text) return;

    promptInput.value = '';
    promptInput.style.height = 'auto';

    // Add user message
    const session = state.sessions.find((s) => s.id === state.activeSessionId);
    session.messages.push({
      role: 'user',
      content: text
    });

    renderActiveSession();

    // Stream simulated response
    simulateStreamResponse(text);
  }

  function simulateStreamResponse(query) {
    const responsePayload = generateResponseForQuery(query);
    const session = state.sessions.find((s) => s.id === state.activeSessionId);

    // Create assistant bubble with blinking cursor
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex gap-3 text-sm leading-relaxed justify-start';

    const avatar = document.createElement('div');
    avatar.className = 'w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500/30 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold shrink-0 mt-0.5';
    avatar.textContent = 'BF';
    msgDiv.appendChild(avatar);

    const bubble = document.createElement('div');
    bubble.className = 'max-w-2xl rounded-2xl p-4 shadow-sm bg-[#0E131F] border border-brand-border text-slate-200 rounded-tl-none cursor-blink';
    bubble.innerHTML = '<span class="text-slate-400 text-xs font-mono">Analyzing semantic embeddings & context...</span>';
    msgDiv.appendChild(bubble);

    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Simulate typewriter stream
    setTimeout(() => {
      bubble.classList.remove('cursor-blink');
      bubble.innerHTML = formatMarkdown(responsePayload.content);

      if (responsePayload.citations && responsePayload.citations.length > 0) {
        const citationsContainer = document.createElement('div');
        citationsContainer.className = 'mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5';
        citationsContainer.innerHTML = `<span class="text-[10px] font-mono text-slate-500 uppercase mr-1">RAG Sources:</span>`;

        responsePayload.citations.forEach((cit) => {
          const tag = document.createElement('button');
          tag.className = 'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 text-cyan-300 transition-colors';
          tag.innerHTML = `
            <svg class="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span class="truncate max-w-[140px]">${cit.doc}</span>
          `;
          tag.addEventListener('click', () => {
            citationDocName.textContent = cit.doc;
            citationTitle.textContent = cit.chunk;
            citationContent.textContent = cit.text;
            citationModal.classList.remove('hidden');
          });
          citationsContainer.appendChild(tag);
        });
        bubble.appendChild(citationsContainer);
      }

      // Add to session data
      session.messages.push({
        role: 'assistant',
        content: responsePayload.content,
        citations: responsePayload.citations
      });

      // Update tokens
      state.totalTokens += Math.floor(responsePayload.content.length / 3);
      tokenCounterHeader.textContent = state.totalTokens.toLocaleString();
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 800);
  }

  function generateResponseForQuery(q) {
    const lower = q.toLowerCase();

    if (lower.includes('sla') || lower.includes('uptime') || lower.includes('credits')) {
      return {
        content: `### Enterprise Service Level Agreement Overview
Binary Froster guarantees **99.8% monthly production availability** with direct founder engineering triage:

* **Severity 1 (Critical Outage)**: < 15 minute initial response with hotfix deployment within 2 hours.
* **Severity 2 (High Degradation)**: < 1 hour initial response.
* **Severity 3 (Standard Inquiry)**: < 4 hours business SLA.

### Service Credit Penalties
* **< 99.8% Availability**: 10% credit applied directly to subsequent invoice cycle.
* **< 99.0% Availability**: 25% credit.
* **< 98.0% Availability**: 50% credit with root-cause postmortem delivered within 72 hours.`,
        citations: [
          {
            doc: 'Enterprise_SLA_Master.docx',
            chunk: 'Clause 4.2 - Production Availability & Escalation',
            text: 'Downtime excludes scheduled maintenance windows announced at least 48 hours in advance during Sunday off-peak hours (02:00-04:00 UTC).'
          }
        ]
      };
    }

    if (lower.includes('session') || lower.includes('cookie') || lower.includes('auth')) {
      return {
        content: `### Stateful Cryptographic Session Architecture
Authentication across Binary Froster applications utilizes an encrypted cookie strategy:

\`\`\`typescript
// Cookie configuration in Next.js edge middleware
response.cookies.set('bf_session', encryptedPayload, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: 60 * 60 * 24 * 7 // 7 days
});
\`\`\`

1. **Tamper Prevention**: The session payload contains a signed HMAC-SHA256 signature verified on every edge invocation.
2. **Role Separation**: STUDIO_ADMIN routes enforce strict verification against verified founder IDs.`,
        citations: [
          {
            doc: 'BF_API_Architecture_v3.md',
            chunk: 'Section 2.1 - Edge Session Validation',
            text: 'Edge middleware validates the bf_session token prior to hydration. Invalid or expired tokens trigger automated redirection to /login.'
          }
        ]
      };
    }

    return {
      content: `### Synthesized Intelligence Output (${state.activeModel.toUpperCase()})
Your query has been processed through our semantic RAG embedding layer with cosine similarity scoring:

* **Query Ingestion**: Analyzed against 580 chunks in Supabase vector store.
* **Active Persona**: ${state.persona} (Temperature: ${state.temperature.toFixed(2)}, Top-P: ${state.topP.toFixed(2)}).
* **Grounded Verification**: All claims validated against internal specifications.

\`\`\`json
{
  "status": "ANALYSIS_COMPLETE",
  "model": "${state.activeModel}",
  "confidenceScore": 0.968,
  "sourcesConsulted": 3,
  "executionMode": "Deterministic RAG"
}
\`\`\`

If you require deeper technical breakdowns or code synthesis, refine the prompt or adjust inference parameters.`,
      citations: [
        {
          doc: 'BF_API_Architecture_v3.md',
          chunk: 'System Architecture Specification',
          text: 'Core API layer routes queries through vector embeddings before passing hydrated context to downstream foundation models.'
        }
      ]
    };
  }

  // Run on DOM load
  document.addEventListener('DOMContentLoaded', init);
})();

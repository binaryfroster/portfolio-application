// BINARY FROSTER SUITE NAVIGATION BAR
// Unified cross-application ecosystem switcher for all Binary Froster production apps.
// Strictly zero emojis. Standard clean SVG and typographic UI.

(function() {
  'use strict';

  if (window.__BF_SUITE_BAR_INITIALIZED__) return;
  window.__BF_SUITE_BAR_INITIALIZED__ = true;

  const APPS = [
    {
      id: 'voice-call-automation',
      title: 'VocalFlow Voice Agent',
      shortTitle: 'VocalFlow',
      domain: 'Autonomous Telephony & SIP',
      url: 'https://voice-call-automation-delta.vercel.app',
      acronym: 'VF',
      accentColor: '#A855F7',
      pathMatches: ['voice-call', 'vocalflow']
    },
    {
      id: 'real-estate-predictor',
      title: 'MetroVal Valuation Engine',
      shortTitle: 'MetroVal',
      domain: 'Real Estate ML & Valuation',
      url: 'https://real-estate-predictor-zeta.vercel.app',
      acronym: 'MV',
      accentColor: '#10B981',
      pathMatches: ['real-estate', 'metroval']
    },
    {
      id: 'learnbridge-lms',
      title: 'LearnBridge LMS Platform',
      shortTitle: 'LearnBridge',
      domain: 'Adaptive Learning & Credentials',
      url: 'https://learnbridge-lms.vercel.app',
      acronym: 'LB',
      accentColor: '#6366F1',
      pathMatches: ['learnbridge', 'lms']
    },
    {
      id: 'medicare-hub',
      title: 'MediCare Hub Clinical EHR',
      shortTitle: 'MediCare Hub',
      domain: 'HIPAA Clinical Station & Vitals',
      url: 'https://medicare-hub-sooty.vercel.app',
      acronym: 'MC',
      accentColor: '#00F2FE',
      pathMatches: ['medicare', 'ehr']
    },
    {
      id: 'flowops-erp',
      title: 'FlowOps Operations & ERP',
      shortTitle: 'FlowOps ERP',
      domain: 'Supply Chain & 3D Factory Floor',
      url: 'https://flowops-erp-three.vercel.app',
      acronym: 'FO',
      accentColor: '#F59E0B',
      pathMatches: ['flowops', 'erp']
    },
    {
      id: 'edutrack-sis',
      title: 'EduTrack Student Information',
      shortTitle: 'EduTrack SIS',
      domain: 'K-12 & Higher Ed SIS Ledger',
      url: 'https://edutrack-sis.vercel.app',
      acronym: 'ET',
      accentColor: '#38BDF8',
      pathMatches: ['edutrack', 'sis']
    },
    {
      id: 'nexus-llm-portal',
      title: 'Nexus Cognitive Fabric',
      shortTitle: 'Nexus LLM',
      domain: 'Multi-Model Router & RAG',
      url: 'https://nexus-llm-portal.vercel.app',
      acronym: 'NX',
      accentColor: '#8B5CF6',
      pathMatches: ['nexus', 'llm']
    }
  ];

  // Identify current active app
  function detectCurrentApp() {
    const host = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const metaApp = document.querySelector('meta[name="bf-app-id"]')?.getAttribute('content');

    if (metaApp) {
      const match = APPS.find(a => a.id === metaApp);
      if (match) return match;
    }

    for (const app of APPS) {
      if (host.includes(app.id) || host.includes(app.shortTitle.toLowerCase())) {
        return app;
      }
      for (const m of app.pathMatches) {
        if (pathname.includes(m) || host.includes(m)) {
          return app;
        }
      }
    }

    // Check title tag as fallback
    const docTitle = document.title.toLowerCase();
    for (const app of APPS) {
      if (docTitle.includes(app.shortTitle.toLowerCase()) || docTitle.includes(app.acronym.toLowerCase())) {
        return app;
      }
    }

    return APPS[0];
  }

  const currentApp = detectCurrentApp();

  // Inject Isolated CSS
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #bf-suite-root {
      position: relative;
      z-index: 99999;
      font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      line-height: 1;
      -webkit-font-smoothing: antialiased;
      box-sizing: border-box;
    }
    #bf-suite-root * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    .bf-suite-bar {
      width: 100%;
      height: 38px;
      background: rgba(6, 9, 14, 0.94);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      color: #94A3B8;
      transition: all 0.2s ease;
    }
    .bf-suite-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .bf-suite-logo-link {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: #F8FAFC;
      font-weight: 700;
      letter-spacing: 0.04em;
      transition: color 0.15s ease;
    }
    .bf-suite-logo-link:hover {
      color: #00F2FE;
    }
    .bf-suite-logo-icon {
      width: 20px;
      height: 20px;
      border-radius: 5px;
      background: linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(99, 102, 241, 0.25));
      border: 1px solid rgba(0, 242, 254, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "JetBrains Mono", monospace;
      font-size: 9px;
      font-weight: 800;
      color: #00F2FE;
    }
    .bf-suite-title {
      font-family: "JetBrains Mono", monospace;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .bf-suite-divider {
      width: 1px;
      height: 14px;
      background: rgba(255, 255, 255, 0.12);
    }
    .bf-suite-dropdown-wrap {
      position: relative;
    }
    .bf-suite-trigger {
      display: flex;
      align-items: center;
      gap: 7px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 4px 10px;
      color: #F1F5F9;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .bf-suite-trigger:hover, .bf-suite-trigger.is-open {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(0, 242, 254, 0.4);
    }
    .bf-suite-active-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${currentApp.accentColor};
      box-shadow: 0 0 8px ${currentApp.accentColor};
    }
    .bf-suite-chevron {
      width: 10px;
      height: 10px;
      transition: transform 0.2s ease;
      stroke: #94A3B8;
    }
    .bf-suite-trigger.is-open .bf-suite-chevron {
      transform: rotate(180deg);
    }
    .bf-suite-menu {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      width: 320px;
      background: #090D16;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05);
      padding: 6px;
      display: none;
      flex-direction: column;
      gap: 3px;
      z-index: 100000;
    }
    .bf-suite-menu.is-open {
      display: flex;
    }
    .bf-suite-menu-header {
      padding: 6px 10px 4px;
      font-family: "JetBrains Mono", monospace;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #64748B;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      margin-bottom: 2px;
    }
    .bf-suite-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 10px;
      border-radius: 6px;
      text-decoration: none;
      color: #CBD5E1;
      transition: all 0.12s ease;
    }
    .bf-suite-item:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #FFFFFF;
    }
    .bf-suite-item.is-active {
      background: rgba(0, 242, 254, 0.08);
      border: 1px solid rgba(0, 242, 254, 0.2);
      color: #FFFFFF;
    }
    .bf-suite-item-icon {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "JetBrains Mono", monospace;
      font-size: 10px;
      font-weight: 800;
      flex-shrink: 0;
    }
    .bf-suite-item-content {
      flex: 1;
      min-width: 0;
    }
    .bf-suite-item-title {
      font-size: 11.5px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .bf-suite-item-desc {
      font-size: 9.5px;
      color: #64748B;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 1px;
    }
    .bf-suite-item-badge {
      font-family: "JetBrains Mono", monospace;
      font-size: 8.5px;
      font-weight: 700;
      padding: 2px 5px;
      border-radius: 4px;
      background: rgba(0, 242, 254, 0.12);
      color: #00F2FE;
      border: 1px solid rgba(0, 242, 254, 0.3);
      flex-shrink: 0;
    }
    .bf-suite-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .bf-suite-status-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: "JetBrains Mono", monospace;
      font-size: 9.5px;
      color: #10B981;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 9999px;
      padding: 3px 8px;
    }
    .bf-suite-status-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 6px #10B981;
    }
    .bf-suite-link {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #94A3B8;
      text-decoration: none;
      font-weight: 600;
      font-size: 10.5px;
      transition: color 0.15s ease;
    }
    .bf-suite-link:hover {
      color: #F8FAFC;
    }
    .bf-suite-link-arrow {
      width: 9px;
      height: 9px;
      stroke: currentColor;
    }
    @media (max-width: 768px) {
      .bf-suite-hide-mobile {
        display: none !important;
      }
      .bf-suite-menu {
        width: 280px;
        left: auto;
        right: 0;
      }
    }
  `;
  document.head.appendChild(styleEl);

  // Construct DOM
  const root = document.createElement('div');
  root.id = 'bf-suite-root';

  const menuItemsHtml = APPS.map(app => {
    const isActive = app.id === currentApp.id;
    return `
      <a href="${app.url}" class="bf-suite-item ${isActive ? 'is-active' : ''}">
        <div class="bf-suite-item-icon" style="background: ${app.accentColor}20; border: 1px solid ${app.accentColor}50; color: ${app.accentColor}">
          ${app.acronym}
        </div>
        <div class="bf-suite-item-content">
          <div class="bf-suite-item-title">${app.shortTitle}</div>
          <div class="bf-suite-item-desc">${app.domain}</div>
        </div>
        ${isActive ? '<span class="bf-suite-item-badge">ACTIVE</span>' : ''}
      </a>
    `;
  }).join('');

  root.innerHTML = `
    <nav class="bf-suite-bar" aria-label="Binary Froster Suite Ecosystem">
      <div class="bf-suite-left">
        <a href="https://binaryfroster.com" target="_blank" rel="noopener noreferrer" class="bf-suite-logo-link" title="Binary Froster Systems">
          <div class="bf-suite-logo-icon">BF</div>
          <span class="bf-suite-title">BINARY FROSTER</span>
        </a>
        <div class="bf-suite-divider bf-suite-hide-mobile"></div>
        <div class="bf-suite-dropdown-wrap">
          <button id="bfSuiteDropdownBtn" class="bf-suite-trigger" aria-haspopup="true" aria-expanded="false">
            <span class="bf-suite-active-dot"></span>
            <span>${currentApp.shortTitle}</span>
            <svg class="bf-suite-chevron" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div id="bfSuiteMenu" class="bf-suite-menu" role="menu">
            <div class="bf-suite-menu-header">ECOSYSTEM APPLICATIONS (7)</div>
            ${menuItemsHtml}
            <div style="border-top: 1px solid rgba(255,255,255,0.06); margin-top: 4px; padding-top: 4px;">
              <a href="https://binaryfroster.com/portfolio" target="_blank" rel="noopener noreferrer" class="bf-suite-item">
                <div class="bf-suite-item-icon" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); color: #94A3B8;">
                  PR
                </div>
                <div class="bf-suite-item-content">
                  <div class="bf-suite-item-title">Portfolio Directory</div>
                  <div class="bf-suite-item-desc">Browse All 16 Studio Case Studies</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="bf-suite-right">
        <div class="bf-suite-status-pill bf-suite-hide-mobile">
          <span class="bf-suite-status-dot"></span>
          <span>POSTGRESQL REPLICA CONNECTED</span>
        </div>
        <a href="https://binaryfroster.com/portfolio" target="_blank" rel="noopener noreferrer" class="bf-suite-link bf-suite-hide-mobile">
          <span>Portfolio</span>
          <svg class="bf-suite-link-arrow" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </a>
        <a href="https://client.binaryfroster.com" target="_blank" rel="noopener noreferrer" class="bf-suite-link">
          <span>Client Portal</span>
          <svg class="bf-suite-link-arrow" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </a>
      </div>
    </nav>
  `;

  // Prepend to body
  if (document.body) {
    document.body.prepend(root);
  } else {
    document.addEventListener('DOMContentLoaded', () => document.body.prepend(root));
  }

  // Interactive menu logic
  const trigger = root.querySelector('#bfSuiteDropdownBtn');
  const menu = root.querySelector('#bfSuiteMenu');

  if (trigger && menu) {
    function toggleMenu(open) {
      const willOpen = typeof open === 'boolean' ? open : !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', willOpen);
      trigger.classList.toggle('is-open', willOpen);
      trigger.setAttribute('aria-expanded', String(willOpen));
    }

    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleMenu();
    });

    document.addEventListener('click', function(e) {
      if (!root.contains(e.target)) {
        toggleMenu(false);
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        toggleMenu(false);
      }
    });
  }
})();

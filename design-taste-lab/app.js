// Design Taste Lab - Core Interactive Engine
// Strictly Zero Emojis

const TABS = ['hero', 'minimalist', 'brutalist', 'redesign', 'brandkit'];

function switchLabTab(tabKey) {
  if (!TABS.includes(tabKey)) return;

  // 1. Update Navigation Buttons
  TABS.forEach(t => {
    const desktopBtn = document.getElementById(`tab-taste-${t}`);
    if (desktopBtn) {
      if (t === tabKey) {
        desktopBtn.classList.add('active');
      } else {
        desktopBtn.classList.remove('active');
      }
    }
  });

  // 2. Update Views
  TABS.forEach(t => {
    const viewEl = document.getElementById(`view-${t}`);
    if (viewEl) {
      if (t === tabKey) {
        viewEl.classList.remove('hidden');
        viewEl.classList.add('active');
      } else {
        viewEl.classList.add('hidden');
        viewEl.classList.remove('active');
      }
    }
  });

  // Scroll to top of view
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function copySnippet(text) {
  navigator.clipboard.writeText(text).then(() => {
    const badge = document.getElementById('copySnippetBadge');
    if (badge) {
      badge.textContent = 'COPIED';
      badge.classList.add('text-cyan-400');
      setTimeout(() => {
        badge.textContent = 'COPY';
        badge.classList.remove('text-cyan-400');
      }, 2000);
    }
  }).catch(() => {
    console.log('Clipboard copy fallback');
  });
}

function runInferenceSim() {
  const box = document.getElementById('simOutputBox');
  const btn = document.getElementById('runSimBtn');
  if (!box || !btn) return;

  btn.textContent = 'Executing...';
  btn.disabled = true;

  setTimeout(() => {
    box.classList.remove('hidden');
    btn.textContent = 'Simulate Kernel';
    btn.disabled = false;
  }, 400);
}

function toggleRedesignState(state) {
  const beforeCard = document.getElementById('redesignBeforeCard');
  const afterCard = document.getElementById('redesignAfterCard');
  const beforeBtn = document.getElementById('toggleBeforeBtn');
  const afterBtn = document.getElementById('toggleAfterBtn');

  if (state === 'before') {
    beforeCard.classList.remove('hidden');
    afterCard.classList.add('hidden');

    beforeBtn.className = 'px-4 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30 transition-all';
    afterBtn.className = 'px-4 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all';
  } else {
    beforeCard.classList.add('hidden');
    afterCard.classList.remove('hidden');

    afterBtn.className = 'px-4 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30 transition-all';
    beforeBtn.className = 'px-4 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all';
  }
}

function openCodeModal() {
  const modal = document.getElementById('codeModal');
  if (modal) modal.classList.remove('hidden');
}

function closeCodeModal() {
  const modal = document.getElementById('codeModal');
  if (modal) modal.classList.add('hidden');
}

function toggleDialDrawer() {
  openCodeModal();
}

function openProjectDetails(projectName) {
  alert(`Examining architectural blueprints for: ${projectName}. High-resolution drawings available in client vault.`);
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  // ESC key handler for modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCodeModal();
    }
  });
});

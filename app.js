// FLOWOPS ERP - PRODUCTION FLOOR & SUPPLY CHAIN CONTROLLER
// Binary Froster Enterprise Manufacturing System

(function () {
  'use strict';

  // Navigation Tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  navTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');

      // Update active tab styles
      navTabs.forEach((t) => {
        t.className = 'nav-tab flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap';
      });
      tab.className = 'nav-tab active-tab flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 border-emerald-400 text-emerald-400 transition-colors whitespace-nowrap';

      // Switch panels
      tabContents.forEach((content) => {
        content.classList.add('hidden');
      });
      const activeContent = document.getElementById('tab-' + targetTab);
      if (activeContent) {
        activeContent.classList.remove('hidden');
      }
    });
  });

  // Kanban Stage Advancement Logic
  const lanes = ['queued', 'assembly', 'qa', 'dispatched'];

  function bindKanbanAdvanceButtons() {
    document.querySelectorAll('.advance-btn').forEach((btn) => {
      btn.onclick = function (e) {
        e.stopPropagation();
        const card = btn.closest('.kanban-card');
        const currentLane = card.parentElement.id.replace('lane-', '');
        const currentIndex = lanes.indexOf(currentLane);

        if (currentIndex < lanes.length - 1) {
          const nextLaneName = lanes[currentIndex + 1];
          const nextLane = document.getElementById('lane-' + nextLaneName);

          // Update card styling based on stage
          if (nextLaneName === 'assembly') {
            card.className = 'kanban-card p-3 rounded-xl bg-brand-card border border-cyan-500/30 space-y-2 cursor-pointer';
            btn.textContent = 'Send to QA →';
          } else if (nextLaneName === 'qa') {
            card.className = 'kanban-card p-3 rounded-xl bg-brand-card border border-amber-500/30 space-y-2 cursor-pointer';
            btn.textContent = 'Approve & Ship →';
          } else if (nextLaneName === 'dispatched') {
            card.className = 'kanban-card p-3 rounded-xl bg-brand-card border border-emerald-500/30 space-y-2';
            btn.remove();
          }

          nextLane.appendChild(card);
          updateLaneCounts();
        }
      };
    });
  }

  function updateLaneCounts() {
    lanes.forEach((lane) => {
      const laneEl = document.getElementById('lane-' + lane);
      const countEl = document.getElementById('count-' + lane);
      if (laneEl && countEl) {
        countEl.textContent = laneEl.querySelectorAll('.kanban-card').length;
      }
    });
  }

  // Work Order Modal
  const quickOrderBtn = document.getElementById('quickOrderBtn');
  const newOrderModal = document.getElementById('newOrderModal');
  const closeOrderModalBtn = document.getElementById('closeOrderModalBtn');
  const cancelOrderBtn = document.getElementById('cancelOrderBtn');
  const newOrderForm = document.getElementById('newOrderForm');

  if (quickOrderBtn) {
    quickOrderBtn.addEventListener('click', () => {
      newOrderModal.classList.remove('hidden');
    });
  }

  if (closeOrderModalBtn) {
    closeOrderModalBtn.addEventListener('click', () => {
      newOrderModal.classList.add('hidden');
    });
  }

  if (cancelOrderBtn) {
    cancelOrderBtn.addEventListener('click', () => {
      newOrderModal.classList.add('hidden');
    });
  }

  if (newOrderForm) {
    newOrderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('orderTitle').value;
      const client = document.getElementById('orderClient').value;
      const priority = document.getElementById('orderPriority').value;
      const id = 'WO-' + Math.floor(9300 + Math.random() * 500);

      const card = document.createElement('div');
      card.className = 'kanban-card p-3 rounded-xl bg-brand-card border border-brand-border hover:border-slate-600 transition-all space-y-2 cursor-pointer';
      card.setAttribute('data-id', id);

      const priorityBadge = priority === 'URGENT'
        ? '<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">URGENT RUSH</span>'
        : priority === 'HIGH'
        ? '<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">HIGH PRIORITY</span>'
        : '<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">STANDARD</span>';

      card.innerHTML = `
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-mono text-cyan-400 font-bold">#${id}</span>
          ${priorityBadge}
        </div>
        <h4 class="text-xs font-semibold text-white">${title}</h4>
        <p class="text-[11px] text-slate-400">Client: ${client} • Material Allocated</p>
        <div class="flex justify-between items-center pt-2 border-t border-brand-border text-[10px] text-slate-500 font-mono">
          <span>Just Dispatched</span>
          <button class="advance-btn text-emerald-400 hover:text-emerald-300 font-bold">Start Machining →</button>
        </div>
      `;

      document.getElementById('lane-queued').prepend(card);
      updateLaneCounts();
      bindKanbanAdvanceButtons();

      newOrderForm.reset();
      newOrderModal.classList.add('hidden');

      // Switch to Kanban tab to show user
      const kanbanTabBtn = document.querySelector('[data-tab="workorders"]');
      if (kanbanTabBtn) kanbanTabBtn.click();
    });
  }

  // Kanban Search Filter
  const kanbanSearch = document.getElementById('kanbanSearch');
  if (kanbanSearch) {
    kanbanSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.kanban-card').forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? 'block' : 'none';
      });
    });
  }

  // Initial binding
  bindKanbanAdvanceButtons();
  updateLaneCounts();
})();

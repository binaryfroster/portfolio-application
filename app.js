// EDUTRACK SIS - STUDENT INFORMATION SYSTEM
// Binary Froster Enterprise Academic Platform

(function () {
  'use strict';

  // Navigation Tabs
  const sisTabs = document.querySelectorAll('.sis-tab');
  const sisContents = document.querySelectorAll('.sis-tab-content');

  sisTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');

      sisTabs.forEach((t) => {
        t.className = 'sis-tab flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap';
      });
      tab.className = 'sis-tab active-tab flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 border-sky-400 text-sky-400 transition-colors whitespace-nowrap';

      sisContents.forEach((c) => c.classList.add('hidden'));
      const activeContent = document.getElementById('tab-' + targetTab);
      if (activeContent) activeContent.classList.remove('hidden');
    });
  });

  // Attendance Toggle Logic
  function bindAttendanceButtons() {
    document.querySelectorAll('.attendance-group').forEach((group) => {
      const buttons = group.querySelectorAll('.att-btn');
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const status = btn.getAttribute('data-status');

          buttons.forEach((b) => {
            b.className = 'att-btn px-3 py-1 rounded text-xs font-mono text-slate-400 border border-sis-border hover:bg-slate-800';
          });

          if (status === 'present') {
            btn.className = 'att-btn px-3 py-1 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
          } else if (status === 'late') {
            btn.className = 'att-btn px-3 py-1 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40';
          } else if (status === 'absent') {
            btn.className = 'att-btn px-3 py-1 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40';
          }

          recalculateAttendancePercentage();
        });
      });
    });
  }

  function recalculateAttendancePercentage() {
    const groups = document.querySelectorAll('.attendance-group');
    let presentCount = 0;
    groups.forEach((g) => {
      const activeBtn = g.querySelector('.bg-emerald-500\\/20');
      if (activeBtn) presentCount++;
    });
    const pct = ((presentCount / groups.length) * 100).toFixed(1);
    const headerEl = document.getElementById('headerAttendance');
    if (headerEl) headerEl.textContent = `${pct}%`;
  }

  // Mark All Present Action
  const markAllPresentBtn = document.getElementById('markAllPresentBtn');
  if (markAllPresentBtn) {
    markAllPresentBtn.addEventListener('click', () => {
      document.querySelectorAll('.attendance-group').forEach((group) => {
        const buttons = group.querySelectorAll('.att-btn');
        buttons.forEach((b) => {
          b.className = 'att-btn px-3 py-1 rounded text-xs font-mono text-slate-400 border border-sis-border hover:bg-slate-800';
        });
        const presentBtn = group.querySelector('[data-status="present"]');
        if (presentBtn) {
          presentBtn.className = 'att-btn px-3 py-1 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
        }
      });
      recalculateAttendancePercentage();
    });
  }

  // Search Filter
  const rosterSearchInput = document.getElementById('rosterSearchInput');
  if (rosterSearchInput) {
    rosterSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#rosterTbody tr');
      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  bindAttendanceButtons();
})();

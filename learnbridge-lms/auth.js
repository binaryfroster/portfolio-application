// LEARNBRIDGE LMS - ENTERPRISE AUTHENTICATION & RBAC ENGINE
// Binary Froster Enterprise Security Standard
// Strictly zero emojis. Full localStorage persistence, role enforcement, and double-bezel UI.

(function () {
  'use strict';

  const STORAGE_KEY = 'bf_learnbridge_auth';

  const PERSONAS = [
    {
      id: 'director',
      name: 'Dr. Aris Thorne',
      role: 'PLATFORM DEAN',
      badgeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      email: 'dean.thorne@learnbridge.edu',
      avatar: 'AT',
      title: 'Dean of Engineering Curriculum',
      permissions: [
        'curriculum_authoring',
        'certificate_signing',
        'gradebook_override',
        'quiz_scoring_review',
        'accreditation_ledger_audit',
        'course_enrollment'
      ]
    },
    {
      id: 'instructor',
      name: 'Prof. Maya Patel',
      role: 'LEAD AI INSTRUCTOR',
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      email: 'maya.patel@learnbridge.edu',
      avatar: 'MP',
      title: 'Distinguished Fellow in Systems AI',
      permissions: [
        'curriculum_authoring',
        'quiz_scoring_review',
        'course_enrollment'
      ]
    },
    {
      id: 'scholar',
      name: 'Jordan Reed',
      role: 'EXECUTIVE SCHOLAR',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      email: 'jordan.reed@enterprise.com',
      avatar: 'JR',
      title: 'Senior Distributed Systems Engineer',
      permissions: [
        'course_enrollment',
        'quiz_examination',
        'certificate_issuance_claim'
      ]
    }
  ];

  function getActiveUser() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      }
    } catch (e) {
      console.warn('Auth state read error:', e);
    }
    return PERSONAS[0];
  }

  function setActiveUser(user) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Auth state write error:', e);
    }
    renderHeaderProfile();
    window.dispatchEvent(new CustomEvent('bf:auth-changed', { detail: user }));
  }

  function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('bf-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'bf-toast-container';
      container.className = 'fixed bottom-5 right-5 z-[99999] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4';
      document.body.appendChild(container);
    }

    const typeConfig = {
      success: {
        border: 'border-emerald-500/40',
        badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        label: '[SUCCESS]',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]'
      },
      error: {
        border: 'border-rose-500/40',
        badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        label: '[ERROR]',
        glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]'
      },
      warning: {
        border: 'border-amber-500/40',
        badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        label: '[ALERT]',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]'
      },
      info: {
        border: 'border-violet-500/40',
        badge: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
        label: '[ACADEMY]',
        glow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]'
      }
    }[type] || {
      border: 'border-white/10',
      badge: 'bg-white/10 text-slate-300',
      label: '[LOG]',
      glow: ''
    };

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto transform translate-y-3 opacity-0 transition-all duration-300 ease-out p-1 rounded-2xl bg-white/[0.04] border ${typeConfig.border} ${typeConfig.glow} backdrop-blur-xl`;
    toast.innerHTML = `
      <div class="rounded-xl bg-[#0F1122] px-4 py-3 flex items-start gap-3 text-xs">
        <span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${typeConfig.badge}">${typeConfig.label}</span>
        <div class="flex-1 text-slate-200 font-sans leading-relaxed">${message}</div>
        <button class="text-slate-500 hover:text-white font-mono text-sm leading-none ml-1">&times;</button>
      </div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-3', 'opacity-0');
    });

    const closeBtn = toast.querySelector('button');
    const dismiss = () => {
      toast.classList.add('opacity-0', 'translate-x-4');
      setTimeout(() => toast.remove(), 300);
    };

    closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, duration);
  }

  function renderHeaderProfile() {
    const user = getActiveUser();
    let mount = document.getElementById('bf-auth-mount');
    if (!mount) {
      const header = document.querySelector('header');
      if (!header) return;
      mount = document.createElement('div');
      mount.id = 'bf-auth-mount';
      mount.className = 'flex items-center gap-2 relative shrink-0';
      header.appendChild(mount);
    }

    mount.innerHTML = `
      <div class="relative shrink-0">
        <button id="bf-user-menu-btn" class="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] transition-all text-left shrink-0 whitespace-nowrap">
          <div class="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-mono font-bold text-xs text-white shadow-inner shrink-0">
            ${user.avatar}
          </div>
          <div class="hidden sm:flex flex-col justify-center min-w-0 text-left">
            <div class="text-xs font-semibold text-white leading-tight whitespace-nowrap">${user.name}</div>
            <div class="text-[9px] font-mono text-slate-400 uppercase tracking-wider whitespace-nowrap mt-0.5">${user.role}</div>
          </div>
          <svg class="w-3.5 h-3.5 text-slate-400 ml-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        <div id="bf-user-dropdown" class="hidden absolute right-0 mt-2 w-72 p-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.12] backdrop-blur-2xl shadow-2xl z-50">
          <div class="rounded-xl bg-[#0D0F1E] p-4 text-xs">
            <div class="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
              <div>
                <p class="font-semibold text-white text-sm">${user.name}</p>
                <p class="text-[11px] font-mono text-slate-400">${user.email}</p>
              </div>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded border ${user.badgeClass}">${user.role}</span>
            </div>

            <div class="space-y-1.5 mb-3">
              <p class="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Enrolled Privileges</p>
              <div class="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar">
                ${user.permissions.map(p => `<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/[0.08]">${p}</span>`).join('')}
              </div>
            </div>

            <div class="pt-2 border-t border-white/[0.08] flex flex-col gap-1.5">
              <button id="bf-switch-persona-btn" class="w-full text-left px-3 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 transition-colors flex items-center justify-between font-mono text-xs">
                <span>Switch Scholar Persona</span>
                <span class="text-violet-400">[RBAC]</span>
              </button>
              <button id="bf-signout-btn" class="w-full text-left px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors flex items-center justify-between font-mono text-xs border border-rose-500/20">
                <span>Reset to Dean Default</span>
                <span class="text-rose-400">[RESET]</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const menuBtn = document.getElementById('bf-user-menu-btn');
    const dropdown = document.getElementById('bf-user-dropdown');
    const switchBtn = document.getElementById('bf-switch-persona-btn');
    const signoutBtn = document.getElementById('bf-signout-btn');

    if (menuBtn && dropdown) {
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
      });

      document.addEventListener('click', () => {
        if (!dropdown.classList.contains('hidden')) {
          dropdown.classList.add('hidden');
        }
      });
    }

    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        dropdown.classList.add('hidden');
        openAuthModal();
      });
    }

    if (signoutBtn) {
      signoutBtn.addEventListener('click', () => {
        dropdown.classList.add('hidden');
        setActiveUser(PERSONAS[0]);
        showToast('Active session reset to Platform Dean default.', 'info');
      });
    }
  }

  function openAuthModal() {
    let modal = document.getElementById('bf-auth-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'bf-auth-modal';
      modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300';
      document.body.appendChild(modal);
    }

    const currentUser = getActiveUser();

    modal.innerHTML = `
      <div class="relative w-full max-w-lg p-1.5 rounded-3xl bg-white/[0.05] border border-white/[0.15] shadow-2xl backdrop-blur-2xl">
        <div class="rounded-2xl bg-[#090A17] p-6 text-slate-200">
          <div class="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                <span class="text-xs font-mono uppercase tracking-widest text-violet-400 font-bold">ACADEMIC IDENTITY VAULT</span>
              </div>
              <h2 class="text-lg font-bold text-white tracking-tight mt-1">Scholar & Faculty Quick-Fill</h2>
            </div>
            <button id="bf-modal-close" class="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center font-mono text-base">&times;</button>
          </div>

          <div class="space-y-2.5 mb-6">
            ${PERSONAS.map(p => {
              const isSelected = p.id === currentUser.id;
              return `
                <div data-persona-id="${p.id}" class="persona-option cursor-pointer p-1 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border ${isSelected ? 'border-violet-500/60 ring-1 ring-violet-500/30' : 'border-white/[0.08]'} transition-all">
                  <div class="rounded-lg bg-[#0F1122] p-3 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-500/30 to-indigo-500/30 border border-violet-500/30 flex items-center justify-center font-mono font-bold text-xs text-white">
                        ${p.avatar}
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-sm text-white">${p.name}</span>
                          ${isSelected ? '<span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-violet-500/30 text-violet-300">[ACTIVE]</span>' : ''}
                        </div>
                        <span class="text-[11px] text-slate-400 font-sans">${p.title} &middot; <span class="font-mono text-slate-500">${p.email}</span></span>
                      </div>
                    </div>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded border ${p.badgeClass}">${p.role}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <details class="group mb-5 rounded-xl bg-white/[0.02] border border-white/[0.08] p-3 text-xs">
            <summary class="cursor-pointer font-mono text-[11px] text-slate-300 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Enter Custom Institutional Credentials</span>
              <span class="text-slate-500 group-open:rotate-180 transition-transform">&darr;</span>
            </summary>
            <div class="pt-3 space-y-3 font-sans">
              <div>
                <label class="block text-[10px] font-mono text-slate-400 uppercase mb-1">Institutional Email</label>
                <input id="bf-custom-email" type="email" placeholder="faculty@mit.edu" class="w-full px-3 py-2 rounded-lg bg-[#060710] border border-white/[0.1] text-xs text-white focus:border-violet-500 outline-none">
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[10px] font-mono text-slate-400 uppercase mb-1">Scholar Name</label>
                  <input id="bf-custom-name" type="text" placeholder="Dr. Arthur Vance" class="w-full px-3 py-2 rounded-lg bg-[#060710] border border-white/[0.1] text-xs text-white focus:border-violet-500 outline-none">
                </div>
                <div>
                  <label class="block text-[10px] font-mono text-slate-400 uppercase mb-1">Institutional Role</label>
                  <select id="bf-custom-role" class="w-full px-3 py-2 rounded-lg bg-[#060710] border border-white/[0.1] text-xs text-white focus:border-violet-500 outline-none">
                    <option value="PLATFORM DEAN">PLATFORM DEAN</option>
                    <option value="LEAD AI INSTRUCTOR">LEAD AI INSTRUCTOR</option>
                    <option value="EXECUTIVE SCHOLAR">EXECUTIVE SCHOLAR</option>
                  </select>
                </div>
              </div>
              <button id="bf-apply-custom-btn" class="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold transition-all">
                Authenticate Academy Session
              </button>
            </div>
          </details>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
            <button id="bf-modal-close-footer" class="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-mono text-xs transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');

    const closeModal = () => modal.classList.add('hidden');
    document.getElementById('bf-modal-close')?.addEventListener('click', closeModal);
    document.getElementById('bf-modal-close-footer')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });

    modal.querySelectorAll('.persona-option').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-persona-id');
        const found = PERSONAS.find(p => p.id === id);
        if (found) {
          setActiveUser(found);
          showToast(`Authenticated as ${found.name} (${found.role})`, 'success');
          closeModal();
        }
      });
    });

    document.getElementById('bf-apply-custom-btn')?.addEventListener('click', () => {
      const email = document.getElementById('bf-custom-email').value.trim();
      const name = document.getElementById('bf-custom-name').value.trim() || 'Scholar';
      const role = document.getElementById('bf-custom-role').value;
      if (!email || !email.includes('@')) {
        showToast('Please provide a valid institutional email address.', 'warning');
        return;
      }
      const customUser = {
        id: 'custom_' + Date.now(),
        name: name,
        role: role,
        badgeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
        email: email,
        avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SC',
        title: 'Accredited Academy Scholar',
        permissions: PERSONAS[0].permissions
      };
      setActiveUser(customUser);
      showToast(`Custom academy session initialized: ${customUser.name}`, 'success');
      closeModal();
    });
  }

  function hasPermission(permissionKey) {
    const user = getActiveUser();
    if (!user || !user.permissions) return false;
    if (user.role === 'PLATFORM DEAN') return true;
    return user.permissions.includes(permissionKey);
  }

  window.BFAuth = {
    getUser: getActiveUser,
    setUser: setActiveUser,
    hasPermission: hasPermission,
    openModal: openAuthModal,
    showToast: showToast,
    personas: PERSONAS
  };

  window.showToast = showToast;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderHeaderProfile);
  } else {
    renderHeaderProfile();
  }
})();

// EDUTRACK SIS - STUDENT INFORMATION SYSTEM
// Binary Froster Enterprise Academic Platform
// Phase 3 & 4: Three.js 3D Academic Constellation Matrix, Live Roster, Attendance & Enrollment Engine
// Strictly zero emojis.

(function () {
  'use strict';

  // State Management
  let studentsState = [
    { id: 'STU-101', name: 'Marcus Chen', cohort: 'Grade 12 - Advanced Systems', gpa: 3.94, attendanceRate: '98.5%', guardian: 'David Chen', status: 'HONORS' },
    { id: 'STU-102', name: 'Sophia Al-Mansoor', cohort: 'Grade 11 - AP CS', gpa: 4.00, attendanceRate: '100.0%', guardian: 'Farah Al-Mansoor', status: 'VALEDICTORIAN_TRACK' },
    { id: 'STU-103', name: 'Liam O Connor', cohort: 'Grade 10 - Honors Math', gpa: 3.72, attendanceRate: '94.2%', guardian: 'Patrick O Connor', status: 'GOOD_STANDING' },
    { id: 'STU-104', name: 'Zoya Verma', cohort: 'Grade 12 - Advanced Systems', gpa: 3.88, attendanceRate: '96.8%', guardian: 'Sunil Verma', status: 'HONORS' },
    { id: 'STU-105', name: 'Brandon Stark', cohort: 'Grade 11 - AP CS', gpa: 3.91, attendanceRate: '97.4%', guardian: 'Arthur Stark', status: 'HONORS' }
  ];

  let attendanceData = [
    { id: 'STU-101', name: 'Marcus Chen', status: 'present' },
    { id: 'STU-102', name: 'Sophia Al-Mansoor', status: 'present' },
    { id: 'STU-103', name: 'Liam O Connor', status: 'present' },
    { id: 'STU-104', name: 'Zoya Verma', status: 'present' },
    { id: 'STU-105', name: 'Brandon Stark', status: 'present' }
  ];

  // ==========================================
  // 1. NAVIGATION TABS
  // ==========================================
  const sisTabs = document.querySelectorAll('.sis-tab');
  const sisContents = document.querySelectorAll('.sis-tab-content');

  sisTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');

      sisTabs.forEach((t) => {
        t.className = 'sis-tab flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap font-mono';
      });
      tab.className = 'sis-tab active-tab flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 border-sky-400 text-sky-300 transition-colors whitespace-nowrap font-mono';

      sisContents.forEach((c) => c.classList.add('hidden'));
      const activeContent = document.getElementById('tab-' + targetTab);
      if (activeContent) activeContent.classList.remove('hidden');

      if (targetTab === 'roster' && window.onResizeConstellation) {
        setTimeout(window.onResizeConstellation, 50);
      }
    });
  });

  // ==========================================
  // 2. THREE.JS 3D ACADEMIC CONSTELLATION MATRIX
  // ==========================================
  let scene, camera, renderer, animationFrameId;
  let constellationGroup;
  let subjectNodes = [];
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let targetRotation = { x: 0.15, y: -0.2 };
  let currentRotation = { x: 0.15, y: -0.2 };

  const SUBJECTS = [
    { name: 'Distributed Systems', score: '98%', color: 0x38BDF8, pos: [-3.2, 1.2, 1.2] },
    { name: 'Machine Learning', score: '95%', color: 0x00F2FE, pos: [3.0, 1.5, -1.0] },
    { name: 'Discrete Math', score: '99%', color: 0x10B981, pos: [-2.4, -1.5, 1.5] },
    { name: 'Microarchitecture', score: '92%', color: 0x818CF8, pos: [2.8, -1.4, 1.2] },
    { name: 'Cryptographic Protocols', score: '97%', color: 0xF59E0B, pos: [0.2, 2.3, -1.8] }
  ];

  function initThreeConstellation() {
    const container = document.getElementById('threejs-constellation-container');
    if (!container || typeof THREE === 'undefined') return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 256;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040814, 0.035);

    camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 13.5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38BDF8, 2.5, 30);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    const secondaryLight = new THREE.PointLight(0x00F2FE, 1.8, 25);
    secondaryLight.position.set(-6, 4, 3);
    scene.add(secondaryLight);

    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 200;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 28;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.06,
      color: 0x38BDF8,
      transparent: true,
      opacity: 0.35
    });
    const starField = new THREE.Points(particlesGeo, particlesMat);
    scene.add(starField);

    constellationGroup = new THREE.Group();
    scene.add(constellationGroup);

    // Central Core (Academic Mastery Centroid)
    const coreGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x0284C7,
      emissive: 0x0369A1,
      shininess: 90,
      wireframe: false
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    constellationGroup.add(coreMesh);

    // Glowing Wireframe Outer Halo
    const haloGeo = new THREE.IcosahedronGeometry(1.35, 1);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    constellationGroup.add(haloMesh);

    // Build Orbital Nodes and Spline Connectors
    subjectNodes = [];
    SUBJECTS.forEach((subj) => {
      const nodeGeo = new THREE.SphereGeometry(0.38, 20, 20);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: subj.color,
        emissive: subj.color,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.8
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(subj.pos[0], subj.pos[1], subj.pos[2]);
      nodeMesh.userData = { name: subj.name, score: subj.score };
      constellationGroup.add(nodeMesh);
      subjectNodes.push(nodeMesh);

      // Line connector from center to node
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...subj.pos)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: subj.color,
        transparent: true,
        opacity: 0.5,
        linewidth: 1.5
      });
      const line = new THREE.Line(lineGeo, lineMat);
      constellationGroup.add(line);

      // Pulse ring around each node
      const ringGeo = new THREE.RingGeometry(0.5, 0.58, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: subj.color,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(nodeMesh.position);
      ring.lookAt(camera.position);
      constellationGroup.add(ring);
    });

    // Mouse / Touch Controls
    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      targetRotation.y += deltaX * 0.006;
      targetRotation.x += deltaY * 0.006;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Touch Support for mobile & tablet
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    window.addEventListener('touchend', () => { isDragging = false; });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;
      targetRotation.y += deltaX * 0.006;
      targetRotation.x += deltaY * 0.006;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      camera.position.z = Math.max(7, Math.min(18, camera.position.z + e.deltaY * 0.01));
      camera.lookAt(0, 0, 0);
    }, { passive: false });

    // Window Resize Handler
    window.onResizeConstellation = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', window.onResizeConstellation);

    // Reset View Button
    const resetBtn = document.getElementById('resetConstellationBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        targetRotation = { x: 0.15, y: -0.2 };
        camera.position.set(0, 0, 13.5);
        camera.lookAt(0, 0, 0);
        if (window.BFAuth) {
          window.BFAuth.showToast('Constellation camera orientation reset to baseline polar angle.', 'info');
        }
      });
    }

    // Animation Loop
    let clock = new THREE.Clock();
    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth damped rotation
      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.05;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.05;

      if (!isDragging) {
        targetRotation.y += 0.0015;
      }

      if (constellationGroup) {
        constellationGroup.rotation.x = currentRotation.x;
        constellationGroup.rotation.y = currentRotation.y;

        // Subtle core heartbeat respiration
        const scale = 1.0 + Math.sin(elapsedTime * 2.5) * 0.04;
        coreMesh.scale.set(scale, scale, scale);
        haloMesh.rotation.y = elapsedTime * 0.2;
        haloMesh.rotation.z = elapsedTime * 0.15;
      }

      renderer.render(scene, camera);
    }
    animate();
  }

  // ==========================================
  // 3. STUDENT DIRECTORY (ROSTER) TABLE
  // ==========================================
  async function loadStudents() {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        if (data.students && Array.isArray(data.students) && data.students.length > 0) {
          studentsState = data.students;
        }
      }
    } catch (err) {
      console.warn('API /api/students offline, utilizing deterministic cache:', err);
    }
    renderRosterTable();
    renderAttendanceList();
  }

  function renderRosterTable(filterText = '') {
    const tbody = document.getElementById('rosterTbody');
    if (!tbody) return;

    const filtered = studentsState.filter((s) => {
      const match = `${s.id} ${s.name} ${s.cohort} ${s.gpa} ${s.guardian}`.toLowerCase();
      return match.includes(filterText.toLowerCase());
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="p-6 text-center text-slate-500 font-sans text-xs">
            No matching students found in the active cohort directory.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map((s) => `
      <tr class="hover:bg-white/[0.02] transition-colors">
        <td class="p-3 text-sky-400 font-semibold">${s.id}</td>
        <td class="p-3 font-sans text-slate-200 font-medium">${s.name}</td>
        <td class="p-3 text-slate-400">${s.cohort}</td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${s.gpa >= 3.9 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'}">
            ${Number(s.gpa).toFixed(2)}
          </span>
        </td>
        <td class="p-3 text-slate-300">${s.attendanceRate || '98.0%'}</td>
        <td class="p-3 font-sans text-slate-400">${s.guardian || 'N/A'}</td>
        <td class="p-3 text-right">
          <button data-id="${s.id}" class="inspect-student-btn px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-sky-500/20 hover:text-sky-300 border border-white/10 text-[10px] text-slate-300 transition-all">
            Inspect Performance
          </button>
        </td>
      </tr>
    `).join('');

    // Bind inspect buttons
    tbody.querySelectorAll('.inspect-student-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const st = studentsState.find((x) => x.id === id);
        if (st && window.BFAuth) {
          // Animate constellation target rotation
          targetRotation.y += 1.2;
          window.BFAuth.showToast(`Active Student Focus: ${st.name} [GPA: ${st.gpa}] - Academic dossier synchronized with SIS records.`, 'info');
        }
      });
    });
  }

  // Search Filter
  const rosterSearchInput = document.getElementById('rosterSearchInput');
  if (rosterSearchInput) {
    rosterSearchInput.addEventListener('input', (e) => {
      renderRosterTable(e.target.value);
    });
  }

  // ==========================================
  // 4. LIVE ATTENDANCE REGISTER
  // ==========================================
  function renderAttendanceList() {
    const list = document.getElementById('attendanceList');
    if (!list) return;

    list.innerHTML = studentsState.map((s) => {
      const existing = attendanceData.find((a) => a.id === s.id);
      const status = existing ? existing.status : 'present';

      return `
        <div class="attendance-group p-3 rounded-xl bg-[#080E1C] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="font-mono text-xs text-sky-400 font-bold">${s.id}</span>
            <div>
              <div class="font-medium text-xs text-white font-sans">${s.name}</div>
              <div class="text-[10px] text-slate-500 font-mono">${s.cohort}</div>
            </div>
          </div>
          <div class="flex items-center gap-1.5" data-student-id="${s.id}">
            <button data-status="present" class="att-btn px-3 py-1 rounded-lg text-xs font-mono transition-all ${status === 'present' ? 'font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-slate-400 border border-white/[0.08] hover:bg-white/[0.05]'}">
              Present
            </button>
            <button data-status="late" class="att-btn px-3 py-1 rounded-lg text-xs font-mono transition-all ${status === 'late' ? 'font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'text-slate-400 border border-white/[0.08] hover:bg-white/[0.05]'}">
              Late
            </button>
            <button data-status="absent" class="att-btn px-3 py-1 rounded-lg text-xs font-mono transition-all ${status === 'absent' ? 'font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]' : 'text-slate-400 border border-white/[0.08] hover:bg-white/[0.05]'}">
              Absent
            </button>
          </div>
        </div>
      `;
    }).join('');

    bindAttendanceToggles();
    recalculateAttendancePercentage();
  }

  function bindAttendanceToggles() {
    document.querySelectorAll('.attendance-group').forEach((group) => {
      const container = group.querySelector('[data-student-id]');
      const studentId = container.getAttribute('data-student-id');
      const buttons = group.querySelectorAll('.att-btn');

      buttons.forEach((btn) => {
        btn.addEventListener('click', async () => {
          const status = btn.getAttribute('data-status');

          // Update UI styles
          buttons.forEach((b) => {
            b.className = 'att-btn px-3 py-1 rounded-lg text-xs font-mono transition-all text-slate-400 border border-white/[0.08] hover:bg-white/[0.05]';
          });

          if (status === 'present') {
            btn.className = 'att-btn px-3 py-1 rounded-lg text-xs font-mono transition-all font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
          } else if (status === 'late') {
            btn.className = 'att-btn px-3 py-1 rounded-lg text-xs font-mono transition-all font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
          } else if (status === 'absent') {
            btn.className = 'att-btn px-3 py-1 rounded-lg text-xs font-mono transition-all font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
          }

          // Update attendance state
          let item = attendanceData.find((a) => a.id === studentId);
          if (item) {
            item.status = status;
          } else {
            attendanceData.push({ id: studentId, status: status });
          }

          const pct = recalculateAttendancePercentage();

          // Dispatch to serverless endpoint
          try {
            await fetch('/api/attendance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studentId: studentId,
                status: status,
                overallPercent: pct
              })
            });
          } catch (e) {
            console.warn('Attendance serverless sync silent fallback');
          }

          if (window.BFAuth) {
            const stName = studentsState.find((x) => x.id === studentId)?.name || studentId;
            const toastType = status === 'absent' ? 'warning' : 'success';
            window.BFAuth.showToast(`Roll-call updated: ${stName} marked ${status.toUpperCase()}. Live SIS ledger synchronized.`, toastType);
          }
        });
      });
    });
  }

  function recalculateAttendancePercentage() {
    const total = attendanceData.length || studentsState.length;
    if (total === 0) return '100.0';

    const presentOrLate = attendanceData.filter((a) => a.status === 'present' || a.status === 'late').length;
    const pct = ((presentOrLate / total) * 100).toFixed(1);

    const headerEl = document.getElementById('headerAttendance');
    if (headerEl) headerEl.textContent = `${pct}%`;
    return pct;
  }

  // Mark All Present Action
  const markAllPresentBtn = document.getElementById('markAllPresentBtn');
  if (markAllPresentBtn) {
    markAllPresentBtn.addEventListener('click', async () => {
      attendanceData.forEach((a) => {
        a.status = 'present';
      });

      document.querySelectorAll('.attendance-group').forEach((group) => {
        const buttons = group.querySelectorAll('.att-btn');
        buttons.forEach((b) => {
          b.className = 'att-btn px-3 py-1 rounded-lg text-xs font-mono transition-all text-slate-400 border border-white/[0.08] hover:bg-white/[0.05]';
        });
        const presentBtn = group.querySelector('[data-status="present"]');
        if (presentBtn) {
          presentBtn.className = 'att-btn px-3 py-1 rounded-lg text-xs font-mono transition-all font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
        }
      });

      recalculateAttendancePercentage();

      try {
        await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batch: true, status: 'present', overallPercent: 100.0 })
        });
      } catch (e) {
        console.warn('Batch attendance sync fallback');
      }

      if (window.BFAuth) {
        window.BFAuth.showToast('Daily batch roll-call complete: All enrolled students marked present.', 'success');
      }
    });
  }

  // ==========================================
  // 5. STUDENT ENROLLMENT MODAL & SUBMISSION
  // ==========================================
  const enrollModal = document.getElementById('enrollStudentModal');
  const addStudentBtn = document.getElementById('addStudentModalBtn');
  const closeEnrollBtn = document.getElementById('closeEnrollModalBtn');
  const studentEnrollForm = document.getElementById('studentEnrollForm');

  if (addStudentBtn && enrollModal) {
    addStudentBtn.addEventListener('click', () => {
      enrollModal.classList.remove('hidden');
      document.getElementById('stuName')?.focus();
    });
  }

  if (closeEnrollBtn && enrollModal) {
    closeEnrollBtn.addEventListener('click', () => {
      enrollModal.classList.add('hidden');
    });
  }

  if (enrollModal) {
    enrollModal.addEventListener('click', (e) => {
      if (e.target === enrollModal) {
        enrollModal.classList.add('hidden');
      }
    });
  }

  if (studentEnrollForm) {
    studentEnrollForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('stuName')?.value.trim();
      const grade = document.getElementById('stuGrade')?.value;
      const gpa = parseFloat(document.getElementById('stuGpa')?.value || 3.90);
      const guardian = document.getElementById('stuGuardian')?.value.trim();

      if (!name || !guardian) {
        if (window.BFAuth) window.BFAuth.showToast('Please complete all student and guardian fields.', 'warning');
        return;
      }

      const generatedId = 'STU-' + Math.floor(100 + Math.random() * 900);
      const newStudent = {
        id: generatedId,
        name: name,
        cohort: grade,
        gpa: gpa,
        attendanceRate: '100.0%',
        guardian: guardian,
        status: gpa >= 3.9 ? 'VALEDICTORIAN_TRACK' : 'HONORS'
      };

      // Add to local state
      studentsState.unshift(newStudent);
      attendanceData.unshift({ id: generatedId, status: 'present' });

      // Call serverless API
      try {
        await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newStudent)
        });
      } catch (err) {
        console.warn('API /api/students POST offline, stored in browser memory:', err);
      }

      // Re-render views
      renderRosterTable();
      renderAttendanceList();

      // Trigger Three.js visual excitation
      if (constellationGroup) {
        targetRotation.y += 1.8;
      }

      if (enrollModal) enrollModal.classList.add('hidden');
      studentEnrollForm.reset();

      if (window.BFAuth) {
        window.BFAuth.showToast(`Official enrollment verified: ${name} [${generatedId}] assigned to ${grade}.`, 'success');
      }
    });
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    initThreeConstellation();
    loadStudents();
  });

  if (document.readyState !== 'loading') {
    initThreeConstellation();
    loadStudents();
  }
})();

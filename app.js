// LEARNBRIDGE LMS - ENTERPRISE ACADEMY APPLICATION LOGIC
// Binary Froster Enterprise Learning Platform
// Connected to Live Serverless Backend (/api/courses, /api/quiz, /api/certificates, /api/progress)
// Enhanced with Three.js 3D Holographic Verifiable Credential Stage
// Strictly zero emojis.

(function () {
  'use strict';

  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================
  const STATE = {
    activeTab: 'learning',
    activeFilter: 'all',
    isPlaying: false,
    videoSeconds: 258, // 04:18 initial timecode
    videoDuration: 1122, // 18:42 in seconds
    playbackSpeed: 1.0,
    isMuted: false,
    activeCourseId: 'course_dist_sys_301',
    activeLesson: {
      id: 'les_7',
      lessonNumber: '2.3',
      moduleNumber: 2,
      moduleTitle: 'Module 2: Kernel Bypass & io_uring Systems',
      title: 'Zero-Copy Sockets via io_uring & SQPOLL Threads',
      duration: '18:42',
      durationSeconds: 1122,
      description: 'In this deep-dive lesson, we explore how modern Linux kernels leverage io_uring to eliminate context-switching overhead in microservices processing 1M+ requests per second. We dissect fixed buffer allocations and memory-mapped submission/completion ring queues.'
    },
    enrolledCourses: new Set(['course_dist_sys_301', 'course_fullstack_201']),
    completedLessons: new Set(['les_1', 'les_2', 'les_3', 'les_4', 'les_5', 'les_6', 'les_9', 'les_10', 'les_11', 'les_12', 'les_13']),
    streakDays: 14,
    certScore: '100% (High Honors)',
    certHash: '0x8F32B94AE6C901D2',
    notes: [],
    catalog: [],
    modules: [],
    expandedModules: new Set([1, 2, 3, 4])
  };

  let videoTimer = null;

  // LocalStorage keys
  const NOTES_STORAGE_KEY = 'bf_learnbridge_notes';
  const PROGRESS_STORAGE_KEY = 'bf_learnbridge_progress';

  // Load persisted state
  function loadPersistedState() {
    try {
      const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
      if (savedNotes) {
        STATE.notes = JSON.parse(savedNotes);
      } else {
        // Default seed notes
        STATE.notes = [
          {
            id: 'note_1',
            timecodeSeconds: 105,
            formattedTime: '01:45',
            text: 'Context switching cost: ~1.2 microseconds per syscall when handling 50k sockets.',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'note_2',
            timecodeSeconds: 200,
            formattedTime: '03:20',
            text: 'Shared memory submission queues (SQ) and completion queues (CQ) avoid kernel traps.',
            timestamp: new Date(Date.now() - 1800000).toISOString()
          }
        ];
      }

      const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (parsed.completedLessons && Array.isArray(parsed.completedLessons)) {
          STATE.completedLessons = new Set(parsed.completedLessons);
        }
        if (parsed.enrolledCourses && Array.isArray(parsed.enrolledCourses)) {
          STATE.enrolledCourses = new Set(parsed.enrolledCourses);
        }
      }
    } catch (e) {
      console.warn('State restoration warning:', e);
    }
  }

  function persistProgress() {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({
        completedLessons: Array.from(STATE.completedLessons),
        enrolledCourses: Array.from(STATE.enrolledCourses)
      }));
    } catch (e) {}
  }

  function persistNotes() {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(STATE.notes));
    } catch (e) {}
  }

  // =========================================================================
  // DOM REFERENCES
  // =========================================================================
  const DOM = {
    // Tabs & Navigation
    tabs: document.querySelectorAll('.lms-tab'),
    tabContents: document.querySelectorAll('.lms-tab-content'),
    catalogGrid: document.getElementById('courseCatalogGrid'),
    catalogFilterBtns: document.querySelectorAll('.catalog-filter-btn'),

    // Telemetry & Headers
    streakCountDisplay: document.getElementById('streakCountDisplay'),
    headerProgressDisplay: document.getElementById('headerProgressDisplay'),
    hudProgressPercentText: document.getElementById('hudProgressPercentText'),
    hudProgressBar: document.getElementById('hudProgressBar'),
    activeCourseTitleBanner: document.getElementById('activeCourseTitleBanner'),
    activeInstructorBanner: document.getElementById('activeInstructorBanner'),
    downloadSyllabusHeaderBtn: document.getElementById('downloadSyllabusHeaderBtn'),

    // Video Player
    playBtn: document.getElementById('playBtn'),
    videoPlayPauseBtn: document.getElementById('videoPlayPauseBtn'),
    prevLessonBtn: document.getElementById('prevLessonBtn'),
    nextLessonBtn: document.getElementById('nextLessonBtn'),
    videoScrubBar: document.getElementById('videoScrubBar'),
    videoScrubProgress: document.getElementById('videoScrubProgress'),
    videoScrubThumb: document.getElementById('videoScrubThumb'),
    videoTimecode: document.getElementById('videoTimecode'),
    playerLessonTitle: document.getElementById('playerLessonTitle'),
    playbackSpeedSelect: document.getElementById('playbackSpeedSelect'),
    volumeToggleBtn: document.getElementById('volumeToggleBtn'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),

    // Lesson Info & Controls
    currentModuleBadge: document.getElementById('currentModuleBadge'),
    activeLessonHeading: document.getElementById('activeLessonHeading'),
    activeLessonDescription: document.getElementById('activeLessonDescription'),
    markCompleteBtn: document.getElementById('markCompleteBtn'),
    markCompleteBtnLabel: document.getElementById('markCompleteBtnLabel'),
    openQuizFromVideoBtn: document.getElementById('openQuizFromVideoBtn'),
    downloadSyllabusBtn: document.getElementById('downloadSyllabusBtn'),
    openDrawerFromVideoBtn: document.getElementById('openDrawerFromVideoBtn'),

    // Notebook
    notesList: document.getElementById('notesList'),
    newNoteInput: document.getElementById('newNoteInput'),
    addNoteBtn: document.getElementById('addNoteBtn'),
    noteCurrentTimeBadge: document.getElementById('noteCurrentTimeBadge'),
    exportNotesBtn: document.getElementById('exportNotesBtn'),

    // Syllabus
    syllabusContainer: document.getElementById('syllabusContainer'),
    syllabusProgressSummary: document.getElementById('syllabusProgressSummary'),
    downloadSyllabusTabBtn: document.getElementById('downloadSyllabusTabBtn'),

    // Syllabus Drawer
    openSyllabusDrawerBtn: document.getElementById('openSyllabusDrawerBtn'),
    syllabusDrawer: document.getElementById('syllabusDrawer'),
    closeSyllabusDrawerBtn: document.getElementById('closeSyllabusDrawerBtn'),
    drawerSyllabusList: document.getElementById('drawerSyllabusList'),
    downloadSyllabusDrawerBtn: document.getElementById('downloadSyllabusDrawerBtn'),

    // Quiz
    quizForm: document.getElementById('quizForm'),
    quizScoreTallyChip: document.getElementById('quizScoreTallyChip'),
    quizResultBanner: document.getElementById('quizResultBanner'),
    retakeQuizBtn: document.getElementById('retakeQuizBtn'),
    submitExamBtn: document.getElementById('submitExamBtn'),

    // 3D Certificate Modal
    viewCertBtn: document.getElementById('viewCertBtn'),
    certModal: document.getElementById('threejs-cert-modal'),
    closeCertModalBtn: document.getElementById('closeCertModalBtn'),
    certContainer: document.getElementById('threejs-cert-container'),
    modalScholarName: document.getElementById('modalScholarName'),
    modalGradeLabel: document.getElementById('modalGradeLabel'),
    certHashLabel: document.getElementById('certHashLabel'),
    downloadCertBtn: document.getElementById('downloadCertBtn')
  };

  // Helper Toast Trigger
  function toast(msg, type = 'info') {
    if (window.showToast) {
      window.showToast(msg, type);
    } else if (window.BFAuth && window.BFAuth.showToast) {
      window.BFAuth.showToast(msg, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${msg}`);
    }
  }

  function formatSeconds(secs) {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return (mins < 10 ? '0' : '') + mins + ':' + (rem < 10 ? '0' : '') + rem;
  }

  // =========================================================================
  // 1. THREE.JS 3D HOLOGRAPHIC CREDENTIAL STAGE
  // =========================================================================
  let scene, camera, renderer, certMesh, particles;
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };
  let certRotation = { x: 0.15, y: 0.25 };
  let targetRotation = { x: 0.15, y: 0.25 };
  let threeClock = new THREE.Clock();

  function initThreeJSCertificate() {
    if (!DOM.certContainer || typeof THREE === 'undefined') return;

    const width = DOM.certContainer.clientWidth || 580;
    const height = DOM.certContainer.clientHeight || 320;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    DOM.certContainer.innerHTML = '';
    DOM.certContainer.appendChild(renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0x2e1065, 2.0);
    scene.add(ambientLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 3.5, 25);
    goldLight.position.set(4, 5, 5);
    scene.add(goldLight);

    const cyanLight = new THREE.PointLight(0x00f2fe, 2.5, 25);
    cyanLight.position.set(-4, -4, 4);
    scene.add(cyanLight);

    // Diploma Geometry & Texture
    const canvasTexture = createDiplomaTexture();
    const cardWidth = 4.4;
    const cardHeight = 3.0;
    const cardDepth = 0.08;

    const geometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardDepth);

    const materials = [
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.2 }),
      new THREE.MeshStandardMaterial({ map: canvasTexture, roughness: 0.25, metalness: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0x0f1124, wireframe: true })
    ];

    certMesh = new THREE.Mesh(geometry, materials);
    scene.add(certMesh);

    // Background Particle Field
    const particleCount = 100;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 8.5;
      pPos[i + 1] = (Math.random() - 0.5) * 6.5;
      pPos[i + 2] = (Math.random() - 0.5) * 4.5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xa855f7, size: 0.045, transparent: true, opacity: 0.75 });
    particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Interactive Drag Orbit Controls
    DOM.certContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      targetRotation.y += deltaX * 0.008;
      targetRotation.x += deltaY * 0.008;
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    // Touch Support
    DOM.certContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    window.addEventListener('touchend', () => { isDragging = false; });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;
      targetRotation.y += deltaX * 0.008;
      targetRotation.x += deltaY * 0.008;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    // Scroll Zoom
    DOM.certContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      camera.position.z = Math.max(4.5, Math.min(11.0, camera.position.z + e.deltaY * 0.006));
      camera.lookAt(0, 0, 0);
    }, { passive: false });

    window.addEventListener('resize', onCertWindowResize);
    animateCertThreeJS();
  }

  function onCertWindowResize() {
    if (!DOM.certContainer || !renderer || !camera) return;
    const width = DOM.certContainer.clientWidth || 580;
    const height = DOM.certContainer.clientHeight || 320;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function createDiplomaTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');

    // Solid Background
    ctx.fillStyle = '#0B0D1E';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer Gold Foil Border
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Inner Hairline
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

    // Corner Ornaments
    ctx.fillStyle = '#D4AF37';
    const corners = [[56, 56], [canvas.width - 56, 56], [56, canvas.height - 56], [canvas.width - 56, canvas.height - 56]];
    corners.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Header Institute Text
    ctx.fillStyle = '#818CF8';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LEARNBRIDGE ACADEMY OF ADVANCED SYSTEMS', canvas.width / 2, 120);

    // Diploma Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('CERTIFICATE OF MASTERY', canvas.width / 2, 185);

    // Subtitle
    ctx.fillStyle = '#94A3B8';
    ctx.font = '18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('THIS HIGH-LEVEL ENGINEERING CREDENTIAL IS CONFERRED UPON', canvas.width / 2, 240);

    // Recipient Name
    const activeUser = window.BFAuth ? window.BFAuth.getUser() : { name: 'Jordan Reed' };
    ctx.fillStyle = '#00F2FE';
    ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(activeUser.name.toUpperCase(), canvas.width / 2, 310);

    // Course Title
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('For demonstrated mastery in Kernel Bypass, Async io_uring, and Raft Consensus', canvas.width / 2, 380);

    // Distinction
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.fillText(`GRADE: ${STATE.certScore}`, canvas.width / 2, 430);

    // Dean Signature & Verifiable Seal Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(150, 560);
    ctx.lineTo(400, 560);
    ctx.moveTo(624, 560);
    ctx.lineTo(874, 560);
    ctx.stroke();

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillText('DR. ARIS THORNE', 275, 590);
    ctx.fillStyle = '#64748B';
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillText('Dean of Curriculum', 275, 615);

    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.fillText(`ED25519: ${STATE.certHash}`, 749, 590);
    ctx.fillStyle = '#64748B';
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillText('Verifiable Ledger Signature', 749, 615);

    const texture = new THREE.CanvasTexture(canvas);
    texture.canvasSource = canvas; // Preserve canvas reference for high-res export
    return texture;
  }

  function updateCertificateVisuals() {
    if (!certMesh) return;
    const newTex = createDiplomaTexture();
    certMesh.material[4].map = newTex;
    certMesh.material[4].needsUpdate = true;

    const user = window.BFAuth ? window.BFAuth.getUser() : { name: 'Jordan Reed' };
    if (DOM.modalScholarName) DOM.modalScholarName.textContent = user.name;
    if (DOM.modalGradeLabel) DOM.modalGradeLabel.textContent = STATE.certScore;
    if (DOM.certHashLabel) DOM.certHashLabel.textContent = `ED25519: ${STATE.certHash}`;
  }

  function animateCertThreeJS() {
    requestAnimationFrame(animateCertThreeJS);

    const elapsed = threeClock.getElapsedTime();

    certRotation.x += (targetRotation.x - certRotation.x) * 0.08;
    certRotation.y += (targetRotation.y - certRotation.y) * 0.08;

    if (certMesh) {
      certMesh.rotation.x = certRotation.x;
      certMesh.rotation.y = certRotation.y + Math.sin(elapsed * 0.8) * 0.05;
      certMesh.position.y = Math.sin(elapsed * 1.5) * 0.08;
    }

    if (particles) {
      particles.rotation.y = elapsed * 0.06;
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  function openCertificateModal() {
    if (DOM.certModal) {
      DOM.certModal.classList.remove('hidden');
      const user = window.BFAuth ? window.BFAuth.getUser() : { name: 'Jordan Reed' };
      if (DOM.modalScholarName) DOM.modalScholarName.textContent = user.name;
      if (DOM.modalGradeLabel) DOM.modalGradeLabel.textContent = STATE.certScore;
      if (DOM.certHashLabel) DOM.certHashLabel.textContent = `ED25519: ${STATE.certHash}`;
      setTimeout(() => {
        if (!renderer) {
          initThreeJSCertificate();
        } else {
          onCertWindowResize();
        }
        updateCertificateVisuals();
      }, 50);
    }
  }

  function closeCertificateModal() {
    DOM.certModal?.classList.add('hidden');
  }

  // =========================================================================
  // 2. VIDEO PLAYBACK & LESSON STAGE CONTROLS
  // =========================================================================
  function updatePlayerUI() {
    if (DOM.videoTimecode) {
      DOM.videoTimecode.textContent = `${formatSeconds(STATE.videoSeconds)} / ${formatSeconds(STATE.videoDuration)}`;
    }
    const percent = Math.min(100, Math.max(0, (STATE.videoSeconds / STATE.videoDuration) * 100));
    if (DOM.videoScrubProgress) {
      DOM.videoScrubProgress.style.width = `${percent}%`;
    }
    if (DOM.videoScrubThumb) {
      DOM.videoScrubThumb.style.left = `${percent}%`;
    }
    if (DOM.noteCurrentTimeBadge) {
      DOM.noteCurrentTimeBadge.textContent = `[${formatSeconds(STATE.videoSeconds)}]`;
    }
  }

  function togglePlay() {
    STATE.isPlaying = !STATE.isPlaying;
    const playSvg = '<svg class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    const pauseSvg = '<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    const smallPlaySvg = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    const smallPauseSvg = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

    if (STATE.isPlaying) {
      if (DOM.playBtn) DOM.playBtn.innerHTML = pauseSvg;
      if (DOM.videoPlayPauseBtn) DOM.videoPlayPauseBtn.innerHTML = smallPauseSvg;

      startVideoInterval();
      toast('Resuming AWS S3 video stream (1080p 60fps).', 'info');
    } else {
      if (DOM.playBtn) DOM.playBtn.innerHTML = playSvg;
      if (DOM.videoPlayPauseBtn) DOM.videoPlayPauseBtn.innerHTML = smallPlaySvg;

      clearInterval(videoTimer);
      videoTimer = null;
    }
  }

  function startVideoInterval() {
    clearInterval(videoTimer);
    const intervalMs = Math.round(1000 / STATE.playbackSpeed);
    videoTimer = setInterval(() => {
      if (STATE.videoSeconds < STATE.videoDuration) {
        STATE.videoSeconds++;
        updatePlayerUI();
      } else {
        // Video finished
        clearInterval(videoTimer);
        STATE.isPlaying = false;
        if (DOM.playBtn) DOM.playBtn.innerHTML = '<svg class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        if (DOM.videoPlayPauseBtn) DOM.videoPlayPauseBtn.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        markActiveLessonComplete(true);
        toast(`Lesson completed! Telemetry recorded.`, 'success');
      }
    }, intervalMs);
  }

  function seekVideo(percent) {
    STATE.videoSeconds = Math.round((percent / 100) * STATE.videoDuration);
    updatePlayerUI();
    toast(`Seeked to [${formatSeconds(STATE.videoSeconds)}]`, 'info');
  }

  function loadLesson(lesson, autoPlay = true) {
    if (!lesson) return;
    STATE.activeLesson = lesson;
    STATE.videoDuration = lesson.durationSeconds || 1122;
    STATE.videoSeconds = 0;

    if (DOM.playerLessonTitle) {
      DOM.playerLessonTitle.textContent = `Lesson ${lesson.lessonNumber || ''}: ${lesson.title}`;
    }
    if (DOM.currentModuleBadge) {
      DOM.currentModuleBadge.textContent = `MODULE ${lesson.moduleNumber || 2} &middot; LESSON ${lesson.lessonNumber || ''}`;
    }
    if (DOM.activeLessonHeading) {
      DOM.activeLessonHeading.textContent = lesson.title;
    }
    if (DOM.activeLessonDescription) {
      DOM.activeLessonDescription.textContent = lesson.description || 'In this deep-dive lesson, we explore distributed kernel bypass architectures, zero-copy packet queues, and high-throughput networking.';
    }

    updateMarkCompleteBtnUI();
    updatePlayerUI();
    renderSyllabus();
    renderDrawerSyllabus();

    // Switch to classroom tab if not active
    switchTab('learning');

    if (autoPlay && !STATE.isPlaying) {
      togglePlay();
    } else if (STATE.isPlaying) {
      startVideoInterval();
    }

    toast(`Loaded lesson: ${lesson.title}`, 'info');
  }

  function updateMarkCompleteBtnUI() {
    const isCompleted = STATE.completedLessons.has(STATE.activeLesson.id);
    if (DOM.markCompleteBtnLabel) {
      DOM.markCompleteBtnLabel.textContent = isCompleted ? 'Lesson Completed' : 'Mark Lesson Complete';
    }
    if (DOM.markCompleteBtn) {
      if (isCompleted) {
        DOM.markCompleteBtn.className = 'px-3.5 py-2 rounded-xl border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 font-mono text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-[0.98]';
      } else {
        DOM.markCompleteBtn.className = 'px-3.5 py-2 rounded-xl border border-white/[0.1] hover:bg-white/[0.05] text-slate-300 font-mono text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-[0.98]';
      }
    }
  }

  function markActiveLessonComplete(forceState = null) {
    const lessonId = STATE.activeLesson.id;
    const currentState = STATE.completedLessons.has(lessonId);
    const newState = forceState !== null ? forceState : !currentState;

    if (newState) {
      STATE.completedLessons.add(lessonId);
    } else {
      STATE.completedLessons.delete(lessonId);
    }

    persistProgress();
    updateMarkCompleteBtnUI();
    updateTelemetryUI();
    renderSyllabus();
    renderDrawerSyllabus();

    // Remote sync
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId: lessonId,
        completed: newState,
        timecodeSeconds: STATE.videoSeconds
      })
    }).catch(e => console.warn('Telemetry sync error:', e));

    if (newState) {
      toast(`Lesson marked complete. Progress updated to ${calculateProgressPercent()}%.`, 'success');
    } else {
      toast('Lesson marked incomplete.', 'info');
    }
  }

  function calculateProgressPercent() {
    const total = 16;
    const completed = STATE.completedLessons.size;
    return Math.min(100, Math.round((completed / total) * 100));
  }

  function updateTelemetryUI() {
    const total = 16;
    const completed = STATE.completedLessons.size;
    const pct = calculateProgressPercent();

    if (DOM.headerProgressDisplay) {
      DOM.headerProgressDisplay.textContent = `${completed}/${total} (${pct}%)`;
    }
    if (DOM.hudProgressPercentText) {
      DOM.hudProgressPercentText.textContent = `${pct}% (${completed}/${total} Lessons)`;
    }
    if (DOM.hudProgressBar) {
      DOM.hudProgressBar.style.width = `${pct}%`;
    }
    if (DOM.syllabusProgressSummary) {
      DOM.syllabusProgressSummary.textContent = `${completed} / ${total} Lessons Completed`;
    }
    if (DOM.streakCountDisplay) {
      DOM.streakCountDisplay.textContent = `${STATE.streakDays} Days`;
    }
  }

  // Next / Prev Lesson Navigation
  function getAllLessonsList() {
    const all = [];
    STATE.modules.forEach(m => {
      if (m.lessons && Array.isArray(m.lessons)) {
        m.lessons.forEach(l => {
          all.push({ ...l, moduleNumber: m.moduleNumber, moduleTitle: m.title });
        });
      }
    });
    return all;
  }

  function navigateLesson(direction) {
    const all = getAllLessonsList();
    if (!all.length) return;
    const currentIndex = all.findIndex(l => l.id === STATE.activeLesson.id);
    if (currentIndex === -1) return;

    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < all.length) {
      loadLesson(all[nextIndex], STATE.isPlaying);
    } else {
      toast(direction > 0 ? 'End of curriculum reached.' : 'Already at first lesson.', 'info');
    }
  }

  // =========================================================================
  // 3. SYNCHRONIZED ENGINEERING NOTEBOOK
  // =========================================================================
  function renderNotes() {
    if (!DOM.notesList) return;
    if (STATE.notes.length === 0) {
      DOM.notesList.innerHTML = `
        <div class="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center text-xs text-slate-500 font-mono">
          No engineering notes recorded yet. Type below to capture synchronized timestamps.
        </div>
      `;
      return;
    }

    DOM.notesList.innerHTML = STATE.notes.map(note => `
      <div class="note-card p-3 rounded-xl bg-[#070916] border border-white/[0.06] hover:border-violet-500/30 transition-all text-xs space-y-1 group" data-note-id="${note.id}">
        <div class="flex justify-between items-center font-mono text-[10px]">
          <button class="jump-time-btn text-violet-400 font-bold hover:text-cyan-400 hover:underline cursor-pointer" title="Jump video to this timestamp" data-secs="${note.timecodeSeconds}">
            [${note.formattedTime}]
          </button>
          <div class="flex items-center gap-2">
            <span class="text-slate-500">${note.timestamp ? new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Saved'}</span>
            <button class="delete-note-btn text-slate-600 hover:text-rose-400 font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity" title="Delete note">&times;</button>
          </div>
        </div>
        <p class="text-slate-300 font-sans leading-relaxed">${note.text}</p>
      </div>
    `).join('');

    // Attach click events
    DOM.notesList.querySelectorAll('.jump-time-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const secs = parseInt(btn.getAttribute('data-secs'), 10) || 0;
        STATE.videoSeconds = secs;
        updatePlayerUI();
        toast(`Video jumped to note timestamp [${formatSeconds(secs)}]`, 'info');
      });
    });

    DOM.notesList.querySelectorAll('.delete-note-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.note-card');
        const id = card?.getAttribute('data-note-id');
        STATE.notes = STATE.notes.filter(n => n.id !== id);
        persistNotes();
        renderNotes();
        toast('Note deleted from student ledger.', 'info');
      });
    });
  }

  function addNote() {
    if (!DOM.newNoteInput) return;
    const val = DOM.newNoteInput.value.trim();
    if (!val) return;
    DOM.newNoteInput.value = '';

    const newNote = {
      id: 'note_' + Date.now(),
      timecodeSeconds: STATE.videoSeconds,
      formattedTime: formatSeconds(STATE.videoSeconds),
      text: val,
      timestamp: new Date().toISOString()
    };

    STATE.notes.unshift(newNote);
    persistNotes();
    renderNotes();

    // Telemetry remote post
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId: STATE.activeLesson.id,
        timecodeSeconds: STATE.videoSeconds,
        noteText: val
      })
    }).catch(e => console.warn('Progress note sync warning:', e));

    toast(`Timestamped note recorded at [${newNote.formattedTime}]`, 'success');
  }

  function exportNotes() {
    if (STATE.notes.length === 0) {
      toast('No notes available to export.', 'warning');
      return;
    }

    const scholarName = window.BFAuth ? window.BFAuth.getUser().name : 'Jordan Reed';
    let content = `# LearnBridge LMS - Engineering Notes Export\n`;
    content += `Curriculum: Advanced Distributed Systems & Consensus Architecture\n`;
    content += `Scholar: ${scholarName}\n`;
    content += `Export Date: ${new Date().toISOString()}\n\n`;
    content += `========================================================\n\n`;

    STATE.notes.forEach(n => {
      content += `[${n.formattedTime}] - ${n.text}\n`;
      content += `Recorded: ${n.timestamp}\n\n`;
    });

    downloadTextFile(content, `LearnBridge_Notes_${Date.now()}.md`);
    toast('Engineering notes exported as Markdown asset.', 'success');
  }

  // =========================================================================
  // 4. COURSE SYLLABUS (EXPANDABLE CHAPTER ACCORDIONS & DRAWER)
  // =========================================================================
  function renderSyllabus() {
    if (!DOM.syllabusContainer) return;

    if (!STATE.modules.length) {
      DOM.syllabusContainer.innerHTML = '<div class="p-4 text-xs text-slate-500 font-mono">Loading curriculum tree from serverless repository...</div>';
      return;
    }

    DOM.syllabusContainer.innerHTML = STATE.modules.map(mod => {
      const isExpanded = STATE.expandedModules.has(mod.moduleNumber);
      const modCompletedCount = mod.lessons.filter(l => STATE.completedLessons.has(l.id)).length;
      const allModDone = modCompletedCount === mod.lessons.length;

      return `
        <div class="module-card rounded-xl bg-[#070916] border ${allModDone ? 'border-emerald-500/20' : 'border-white/[0.08]'} overflow-hidden transition-all">
          <!-- Module Header / Accordion Trigger -->
          <div class="module-header p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] select-none" data-mod-num="${mod.moduleNumber}">
            <div class="flex items-center gap-3">
              <svg class="chevron-icon w-4 h-4 text-violet-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
              <div>
                <span class="font-bold text-white font-mono text-xs block">${mod.title}</span>
                <span class="text-[11px] text-slate-400 font-sans block mt-0.5">${mod.description}</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono ${allModDone ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-slate-400 bg-white/[0.03] border-white/[0.08]'} px-2 py-0.5 rounded border">
                ${modCompletedCount} / ${mod.lessons.length} Finished
              </span>
            </div>
          </div>

          <!-- Module Lessons List -->
          <div class="module-lessons ${isExpanded ? '' : 'hidden'} border-t border-white/[0.06] p-2 space-y-1 bg-[#050611]">
            ${mod.lessons.map(l => {
              const isCurrent = l.id === STATE.activeLesson.id;
              const isDone = STATE.completedLessons.has(l.id);

              return `
                <div class="lesson-row flex items-center justify-between p-2.5 rounded-lg ${isCurrent ? 'bg-violet-950/40 border border-violet-500/40 text-violet-200' : 'hover:bg-white/[0.03] text-slate-300'} text-xs transition-all cursor-pointer group" data-lesson-id="${l.id}">
                  <div class="flex items-center gap-3">
                    <!-- Completion Checkmark Toggle Button -->
                    <button class="toggle-lesson-check-btn w-5 h-5 rounded-full flex items-center justify-center border transition-all ${isDone ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-slate-600 hover:border-slate-400 text-transparent'}" title="Toggle Completion" data-lesson-id="${l.id}">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                    </button>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-semibold text-xs ${isCurrent ? 'text-violet-300' : 'text-slate-200 group-hover:text-white'}">
                          ${l.lessonNumber ? `${l.lessonNumber}. ` : ''}${l.title}
                        </span>
                        ${isCurrent ? '<span class="px-1.5 py-0.2 rounded text-[9px] font-mono bg-violet-500/30 text-violet-300 uppercase font-bold">[PLAYING]</span>' : ''}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                    <span class="px-2 py-0.5 rounded bg-white/[0.03]">${l.duration}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Attach listeners
    DOM.syllabusContainer.querySelectorAll('.module-header').forEach(hdr => {
      hdr.addEventListener('click', () => {
        const modNum = parseInt(hdr.getAttribute('data-mod-num'), 10);
        if (STATE.expandedModules.has(modNum)) {
          STATE.expandedModules.delete(modNum);
        } else {
          STATE.expandedModules.add(modNum);
        }
        renderSyllabus();
      });
    });

    DOM.syllabusContainer.querySelectorAll('.toggle-lesson-check-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-lesson-id');
        if (STATE.completedLessons.has(id)) {
          STATE.completedLessons.delete(id);
        } else {
          STATE.completedLessons.add(id);
        }
        persistProgress();
        updateMarkCompleteBtnUI();
        updateTelemetryUI();
        renderSyllabus();
        renderDrawerSyllabus();
        toast('Lesson completion toggled.', 'info');
      });
    });

    DOM.syllabusContainer.querySelectorAll('.lesson-row').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-lesson-id');
        const lesson = getAllLessonsList().find(l => l.id === id);
        if (lesson) {
          loadLesson(lesson, true);
        }
      });
    });
  }

  function renderDrawerSyllabus() {
    if (!DOM.drawerSyllabusList) return;

    DOM.drawerSyllabusList.innerHTML = STATE.modules.map(mod => {
      const isExpanded = STATE.expandedModules.has(mod.moduleNumber);
      return `
        <div class="rounded-xl bg-[#090C1E] border border-white/[0.08] p-3 space-y-2">
          <div class="flex items-center justify-between cursor-pointer" onclick="this.nextElementSibling.classList.toggle('hidden')">
            <span class="text-xs font-bold font-mono text-white">${mod.title}</span>
            <span class="text-[10px] font-mono text-violet-400">[Toggle]</span>
          </div>
          <div class="${isExpanded ? '' : 'hidden'} space-y-1.5 pt-1 border-t border-white/[0.04]">
            ${mod.lessons.map(l => {
              const isCurrent = l.id === STATE.activeLesson.id;
              const isDone = STATE.completedLessons.has(l.id);
              return `
                <div class="drawer-lesson-item flex items-center justify-between p-2 rounded-lg ${isCurrent ? 'bg-violet-900/30 text-violet-200' : 'hover:bg-white/[0.04] text-slate-300'} text-[11px] cursor-pointer" data-lesson-id="${l.id}">
                  <div class="flex items-center gap-2 truncate">
                    <span class="w-2 h-2 rounded-full ${isDone ? 'bg-emerald-400' : 'bg-slate-600'}"></span>
                    <span class="truncate">${l.lessonNumber} ${l.title}</span>
                  </div>
                  <span class="font-mono text-[10px] text-slate-400 pl-2">${l.duration}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    DOM.drawerSyllabusList.querySelectorAll('.drawer-lesson-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-lesson-id');
        const lesson = getAllLessonsList().find(l => l.id === id);
        if (lesson) {
          loadLesson(lesson, true);
          closeSyllabusDrawer();
        }
      });
    });
  }

  function openSyllabusDrawer() {
    if (DOM.syllabusDrawer) {
      DOM.syllabusDrawer.classList.remove('hidden');
      renderDrawerSyllabus();
    }
  }

  function closeSyllabusDrawer() {
    DOM.syllabusDrawer?.classList.add('hidden');
  }

  function downloadSyllabusFile() {
    const courseTitle = 'Advanced Distributed Systems & Consensus Architecture';
    let outline = `========================================================\n`;
    outline += `LEARNBRIDGE ACADEMY - ENTERPRISE SYLLABUS OUTLINE\n`;
    outline += `Course: ${courseTitle}\n`;
    outline += `Instructor: Dr. Aris Thorne (Principal Systems Architect)\n`;
    outline += `Accreditation: IEEE & ISO/IEC 27001 Software Engineering\n`;
    outline += `========================================================\n\n`;

    STATE.modules.forEach(m => {
      outline += `\n${m.title.toUpperCase()}\n`;
      outline += `Description: ${m.description}\n`;
      outline += `--------------------------------------------------------\n`;
      m.lessons.forEach(l => {
        const status = STATE.completedLessons.has(l.id) ? '[COMPLETED]' : '[PENDING]';
        outline += `  ${l.lessonNumber}. ${l.title} (${l.duration}) ${status}\n`;
      });
    });

    downloadTextFile(outline, 'LearnBridge_Distributed_Systems_Syllabus.txt');
    toast('Course curriculum syllabus downloaded successfully.', 'success');
  }

  function downloadTextFile(text, filename) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // =========================================================================
  // 5. COURSE CATALOG & DOMAIN FILTER TRACKS
  // =========================================================================
  async function loadCoursesCatalog() {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        if (data.catalog && Array.isArray(data.catalog)) {
          STATE.catalog = data.catalog;
        } else if (data.allCourses && Array.isArray(data.allCourses)) {
          STATE.catalog = data.allCourses;
        }

        if (data.modules && Array.isArray(data.modules)) {
          STATE.modules = data.modules;
        } else if (data.course && data.course.modules) {
          STATE.modules = data.course.modules;
        }

        renderCatalog();
        renderSyllabus();
        renderDrawerSyllabus();
        updateTelemetryUI();
        return;
      }
    } catch (e) {
      console.warn('Courses API fetch warning:', e);
    }

    // Fallback seed data if offline
    STATE.catalog = [
      {
        id: 'course_dist_sys_301',
        category: 'cloud-devops',
        categoryLabel: 'Cloud DevOps',
        title: 'Advanced Distributed Systems & Consensus Architecture',
        instructor: 'Dr. Aris Thorne',
        level: 'Advanced',
        duration: '14.5 Hours',
        totalLessons: 16,
        progressPercent: 75,
        rating: '4.98',
        enrolledCount: '2,840 Scholars',
        enrolled: true,
        syllabusSummary: 'Kernel bypass, Linux io_uring, lockless ring buffers, Raft consensus invariants, and distributed state machine replication.',
        tags: ['io_uring', 'Raft', 'eBPF', 'Rust']
      },
      {
        id: 'course_fullstack_201',
        category: 'full-stack',
        categoryLabel: 'Full-Stack',
        title: 'High-Throughput Full-Stack Systems & Microservices',
        instructor: 'Prof. Maya Patel',
        level: 'Advanced',
        duration: '18.2 Hours',
        totalLessons: 20,
        progressPercent: 25,
        rating: '4.95',
        enrolledCount: '3,410 Scholars',
        enrolled: true,
        syllabusSummary: 'Distributed event buses, gRPC streaming, zero-copy serialization with Capn Proto, and PostgreSQL connection pool optimization.',
        tags: ['gRPC', 'PostgreSQL', 'Next.js']
      },
      {
        id: 'course_ai_401',
        category: 'ai-engineering',
        categoryLabel: 'AI Engineering',
        title: 'Autonomous LLM Agent Architecture & Vector Pipelines',
        instructor: 'Dr. Aris Thorne & Prof. Maya Patel',
        level: 'Specialized',
        duration: '21.0 Hours',
        totalLessons: 24,
        progressPercent: 0,
        rating: '4.99',
        enrolledCount: '4,120 Scholars',
        enrolled: false,
        syllabusSummary: 'Multi-agent orchestration, speculative decoding, dynamic KV-cache compression, and production vector embeddings at scale.',
        tags: ['LLM Agents', 'Vector Search', 'HNSW']
      },
      {
        id: 'course_devops_302',
        category: 'cloud-devops',
        categoryLabel: 'Cloud DevOps',
        title: 'Zero-Trust Kubernetes & Cloud-Native Security Infrastructure',
        instructor: 'Jordan Reed',
        level: 'Intermediate-Advanced',
        duration: '16.8 Hours',
        totalLessons: 18,
        progressPercent: 0,
        rating: '4.92',
        enrolledCount: '1,980 Scholars',
        enrolled: false,
        syllabusSummary: 'eBPF-driven network observability, Cilium service meshes, SPIFFE/SPIRE workload identities, and verifiable container supply chains.',
        tags: ['Kubernetes', 'eBPF', 'Cilium']
      }
    ];

    renderCatalog();
    renderSyllabus();
    renderDrawerSyllabus();
  }

  function renderCatalog() {
    if (!DOM.catalogGrid) return;

    const filtered = STATE.activeFilter === 'all'
      ? STATE.catalog
      : STATE.catalog.filter(c => c.category === STATE.activeFilter);

    if (!filtered.length) {
      DOM.catalogGrid.innerHTML = `
        <div class="col-span-2 p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.08]">
          <p class="text-xs text-slate-400 font-mono">No courses found matching category [${STATE.activeFilter}].</p>
        </div>
      `;
      return;
    }

    DOM.catalogGrid.innerHTML = filtered.map(course => {
      const isEnrolled = STATE.enrolledCourses.has(course.id) || course.enrolled;
      const pct = course.id === 'course_dist_sys_301' ? calculateProgressPercent() : (course.progressPercent || 0);

      return `
        <div class="course-card double-bezel hover:scale-[1.01] transition-transform" data-course-id="${course.id}">
          <div class="double-bezel-inner p-5 flex flex-col justify-between space-y-4 h-full">

            <!-- Card Top Metadata -->
            <div>
              <div class="flex items-center justify-between text-xs font-mono mb-2">
                <span class="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30 text-[10px] font-semibold uppercase">
                  ${course.categoryLabel || course.category}
                </span>
                <span class="text-emerald-400 font-bold text-[11px]">RATING: ${course.rating || '4.95'}</span>
              </div>

              <h3 class="text-base font-bold text-white tracking-tight leading-snug">${course.title}</h3>
              <p class="text-[11px] text-slate-400 font-sans mt-2 leading-relaxed">${course.syllabusSummary || course.description}</p>

              <!-- Tags -->
              <div class="flex flex-wrap gap-1 mt-3">
                ${(course.tags || []).map(t => `<span class="px-2 py-0.5 rounded bg-white/[0.04] text-[10px] font-mono text-slate-300 border border-white/[0.06]">${t}</span>`).join('')}
              </div>
            </div>

            <!-- Card Progress / Enrollment Bar -->
            <div class="pt-3 border-t border-white/[0.08] space-y-3">
              <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>INSTRUCTOR: <strong class="text-slate-300">${course.instructor}</strong></span>
                <span>${course.duration || '14.5 Hours'} &middot; ${course.totalLessons || 16} Lessons</span>
              </div>

              ${isEnrolled ? `
                <div class="space-y-1">
                  <div class="flex justify-between text-[10px] font-mono">
                    <span class="text-emerald-400 font-bold">ENROLLED SCHOLAR</span>
                    <span class="text-violet-300 font-bold">${pct}% Completed</span>
                  </div>
                  <div class="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                    <div class="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400" style="width: ${pct}%"></div>
                  </div>
                </div>
              ` : `
                <div class="text-[10px] font-mono text-slate-500">
                  Open Registration &middot; ${course.enrolledCount || '2,400 Scholars'} Active
                </div>
              `}

              <!-- Action Buttons -->
              <div class="flex items-center gap-2 pt-1">
                ${isEnrolled ? `
                  <button class="continue-learning-btn flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold transition-all text-center active:scale-[0.98]" data-course-id="${course.id}">
                    Continue Learning
                  </button>
                ` : `
                  <button class="enroll-course-btn flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold transition-all text-center shadow active:scale-[0.98]" data-course-id="${course.id}">
                    Enroll Course
                  </button>
                `}
                <button class="download-course-syllabus-btn px-3 py-2 rounded-xl border border-white/[0.1] hover:bg-white/[0.06] text-slate-300 hover:text-white font-mono text-xs font-semibold transition-all" data-course-id="${course.id}" title="Download Course Syllabus Outline">
                  Outline
                </button>
              </div>
            </div>

          </div>
        </div>
      `;
    }).join('');

    // Attach Catalog Button Handlers
    DOM.catalogGrid.querySelectorAll('.enroll-course-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cid = btn.getAttribute('data-course-id');
        STATE.enrolledCourses.add(cid);
        persistProgress();
        renderCatalog();
        toast('Enrolled in course track successfully. Cohort seat confirmed.', 'success');
      });
    });

    DOM.catalogGrid.querySelectorAll('.continue-learning-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        switchTab('learning');
        toast('Entering interactive classroom stage...', 'info');
      });
    });

    DOM.catalogGrid.querySelectorAll('.download-course-syllabus-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadSyllabusFile();
      });
    });
  }

  // Filter Click Handlers
  DOM.catalogFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter') || 'all';
      STATE.activeFilter = filter;
      DOM.catalogFilterBtns.forEach(b => {
        b.className = 'catalog-filter-btn px-3 py-1.5 rounded-lg text-xs font-mono font-semibold text-slate-400 hover:text-white transition-all whitespace-nowrap';
      });
      btn.className = 'catalog-filter-btn active-filter px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-violet-600 text-white transition-all whitespace-nowrap';
      renderCatalog();
    });
  });

  // =========================================================================
  // 6. QUIZ ASSESSMENT & INSTANT ANSWER FEEDBACK
  // =========================================================================
  const QUIZ_EXPLANATIONS = {
    q1: {
      A: { isCorrect: true, text: 'Correct. io_uring utilizes lockless circular ring buffers mapped into user and kernel address space via mmap(), eliminating context-switch traps during steady-state packet processing.' },
      B: { isCorrect: false, text: 'Incorrect. Conventional epoll requires per-event syscall context switches, whereas io_uring bypasses syscalls through shared memory rings.' },
      C: { isCorrect: false, text: 'Incorrect. Hardware interrupt routing does not avoid kernel mode switches in user-space sockets.' }
    },
    q2: {
      A: { isCorrect: true, text: 'Correct. Pre-pinning pages with IORING_REGISTER_BUFFERS allows the Linux kernel to validate and map physical pages once at startup, eliminating the costly get_user_pages() lock on every request.' },
      B: { isCorrect: false, text: 'Incorrect. Fixed buffers do not flush CPU caches or alter memory limits; they pin virtual memory to avoid runtime page-table traversal.' },
      C: { isCorrect: false, text: 'Incorrect. Physical RAM limits remain unchanged.' }
    },
    q3: {
      A: { isCorrect: true, text: 'Correct. The Leader Completeness Property ensures that a candidate can only win an election if its log is at least as up-to-date as a majority quorum of peers, guaranteeing committed entries are never lost.' },
      B: { isCorrect: false, text: 'Incorrect. Raft avoids 2-phase commit disk locking; it relies on majority quorum term comparison during RequestVote RPCs.' },
      C: { isCorrect: false, text: 'Incorrect. Heartbeats maintain leadership authority, but the log invariant is guaranteed by RequestVote term & index checks.' }
    }
  };

  function setupQuizInteractions() {
    if (!DOM.quizForm) return;

    // Radio change -> Instant feedback
    DOM.quizForm.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const qid = radio.name;
        const val = radio.value;
        const card = radio.closest('.quiz-question-card');
        const feedbackBox = card?.querySelector('.quiz-feedback-box');
        const statusPill = card?.querySelector('.quiz-status-pill');

        const info = QUIZ_EXPLANATIONS[qid]?.[val];
        if (info && feedbackBox) {
          feedbackBox.classList.remove('hidden');
          if (info.isCorrect) {
            feedbackBox.className = 'quiz-feedback-box p-3 rounded-lg text-xs font-mono space-y-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300';
            feedbackBox.innerHTML = `
              <div class="flex items-center gap-1.5 font-bold">
                <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <span>[CORRECT ARCHITECTURAL ANALYSIS]</span>
              </div>
              <p class="font-sans text-[11px] text-slate-300 leading-relaxed">${info.text}</p>
            `;
            if (statusPill) {
              statusPill.textContent = 'Correct';
              statusPill.className = 'quiz-status-pill text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30';
            }
          } else {
            feedbackBox.className = 'quiz-feedback-box p-3 rounded-lg text-xs font-mono space-y-1 bg-rose-500/10 border border-rose-500/30 text-rose-300';
            feedbackBox.innerHTML = `
              <div class="flex items-center gap-1.5 font-bold">
                <svg class="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                <span>[ARCHITECTURAL REASONING FLAW]</span>
              </div>
              <p class="font-sans text-[11px] text-slate-300 leading-relaxed">${info.text}</p>
            `;
            if (statusPill) {
              statusPill.textContent = 'Incorrect';
              statusPill.className = 'quiz-status-pill text-[10px] font-mono text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30';
            }
          }
        }

        updateLiveQuizScore();
      });
    });

    // Form Submission
    DOM.quizForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const q1 = DOM.quizForm.elements['q1']?.value;
      const q2 = DOM.quizForm.elements['q2']?.value;
      const q3 = DOM.quizForm.elements['q3']?.value;

      if (!q1 || !q2 || !q3) {
        toast('Please answer all 3 examination questions before submitting.', 'warning');
        return;
      }

      let correctCount = 0;
      if (q1 === 'A') correctCount++;
      if (q2 === 'A') correctCount++;
      if (q3 === 'A') correctCount++;

      const scorePercent = Math.round((correctCount / 3) * 100);
      const passed = scorePercent >= 80;

      // Remote POST to /api/quiz
      try {
        const res = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: { q1, q2, q3 }, courseId: 'course_dist_sys_301' })
        });
        if (res.ok) {
          const remoteData = await res.json();
          console.log('Quiz grading verified by serverless authority:', remoteData);
        }
      } catch (err) {
        console.warn('Quiz API warning:', err);
      }

      // Render Result Banner
      if (DOM.quizResultBanner) {
        DOM.quizResultBanner.classList.remove('hidden');
        if (passed) {
          STATE.certScore = `${scorePercent}% (High Honors)`;
          STATE.certHash = '0x' + Math.random().toString(16).substring(2, 10).toUpperCase() + '...C901';

          // Sync with /api/certificates
          try {
            fetch('/api/certificates', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studentName: window.BFAuth ? window.BFAuth.getUser().name : 'Jordan Reed',
                score: STATE.certScore,
                hash: STATE.certHash
              })
            }).catch(e => console.warn('Cert issuance warning:', e));
          } catch (e) {}

          DOM.quizResultBanner.className = 'p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3';
          DOM.quizResultBanner.innerHTML = `
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                <span class="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">[EXAMINATION ACCREDITED - 100% SCORE]</span>
              </div>
              <span class="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">STATUS: PASSED (HIGH HONORS)</span>
            </div>
            <p class="text-xs text-slate-200 font-sans leading-relaxed">
              Congratulations! You have demonstrated verified engineering mastery in Linux <code>io_uring</code> zero-copy architectures and Raft consensus invariants. Your cryptographic credential has been recorded into the accreditation ledger.
            </p>
            <div class="flex items-center gap-3 pt-1">
              <button id="viewClaimedCertBtn" class="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                Launch 3D Holographic Diploma Stage
              </button>
            </div>
          `;

          document.getElementById('viewClaimedCertBtn')?.addEventListener('click', openCertificateModal);
          toast(`Examination Passed with ${scorePercent}%! Verifiable 3D Diploma Stage Unlocked.`, 'success');
        } else {
          DOM.quizResultBanner.className = 'p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3';
          DOM.quizResultBanner.innerHTML = `
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">[SCORE: ${scorePercent}% - PASSING THRESHOLD: 80%]</span>
              <span class="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">STATUS: REQUIRES REVIEW</span>
            </div>
            <p class="text-xs text-slate-200 font-sans leading-relaxed">
              You correctly answered ${correctCount} of 3 questions (${scorePercent}%). An 80% passing threshold is required for verifiable credential conferral. Review Module 2 lessons and retake the examination.
            </p>
          `;
          toast(`Score: ${scorePercent}%. 80% required to confer credential. Retake available.`, 'warning');
        }
      }
    });

    // Retake Exam Button
    DOM.retakeQuizBtn?.addEventListener('click', () => {
      DOM.quizForm.reset();
      DOM.quizForm.querySelectorAll('.quiz-feedback-box').forEach(box => {
        box.classList.add('hidden');
        box.innerHTML = '';
      });
      DOM.quizForm.querySelectorAll('.quiz-status-pill').forEach(pill => {
        pill.textContent = 'Pending Answer';
        pill.className = 'quiz-status-pill text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded bg-white/[0.03]';
      });
      if (DOM.quizResultBanner) {
        DOM.quizResultBanner.classList.add('hidden');
        DOM.quizResultBanner.innerHTML = '';
      }
      if (DOM.quizScoreTallyChip) {
        DOM.quizScoreTallyChip.textContent = 'Current Score: 0%';
      }
      toast('Examination reset. Ready for re-attempt.', 'info');
    });
  }

  function updateLiveQuizScore() {
    const q1 = DOM.quizForm.elements['q1']?.value;
    const q2 = DOM.quizForm.elements['q2']?.value;
    const q3 = DOM.quizForm.elements['q3']?.value;

    let correct = 0;
    let answered = 0;

    if (q1) { answered++; if (q1 === 'A') correct++; }
    if (q2) { answered++; if (q2 === 'A') correct++; }
    if (q3) { answered++; if (q3 === 'A') correct++; }

    const liveScore = answered > 0 ? Math.round((correct / 3) * 100) : 0;
    if (DOM.quizScoreTallyChip) {
      DOM.quizScoreTallyChip.textContent = `Current Score: ${liveScore}% (${answered}/3 Answered)`;
    }
  }

  // =========================================================================
  // 7. HIGH-RESOLUTION CERTIFICATE DOWNLOAD EXPORT
  // =========================================================================
  function downloadCertificateAsset() {
    const activeUser = window.BFAuth ? window.BFAuth.getUser() : { name: 'Jordan Reed' };
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');

    // Rich Dark Navy/Slate Background
    ctx.fillStyle = '#070918';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle Radial Glow
    const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, 800);
    grad.addColorStop(0, '#1A183C');
    grad.addColorStop(1, '#070918');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Triple Filigree Border with Gold Foil Sheen
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 18;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(74, 74, canvas.width - 148, canvas.height - 148);

    ctx.strokeStyle = 'rgba(129, 140, 248, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(88, 88, canvas.width - 176, canvas.height - 176);

    // Corner Ornaments
    ctx.fillStyle = '#D4AF37';
    [[80, 80], [canvas.width - 80, 80], [80, canvas.height - 80], [canvas.width - 80, canvas.height - 80]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
    });

    // Institute Header
    ctx.fillStyle = '#818CF8';
    ctx.font = 'bold 30px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LEARNBRIDGE ACADEMY OF ADVANCED SYSTEMS ENGINEERING', canvas.width / 2, 190);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 54px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('CERTIFICATE OF DEMONSTRATED MASTERY', canvas.width / 2, 280);

    // Conferred Line
    ctx.fillStyle = '#94A3B8';
    ctx.font = '22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('THIS CRYPTOGRAPHICALLY VERIFIABLE DIPLOMA IS ACCREDITED UPON', canvas.width / 2, 360);

    // Recipient Name
    ctx.fillStyle = '#00F2FE';
    ctx.font = 'bold 64px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(activeUser.name.toUpperCase(), canvas.width / 2, 460);

    // Course Title & Specialization
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Advanced Distributed Systems & Consensus Architecture', canvas.width / 2, 550);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Specialization: Kernel Bypass, Linux io_uring, and Raft State Machine Replication', canvas.width / 2, 600);

    // Grade Distinction
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 30px "JetBrains Mono", monospace';
    ctx.fillText(`GRADE DISTINCTION: ${STATE.certScore}`, canvas.width / 2, 680);

    // Accreditation Standards
    ctx.fillStyle = '#64748B';
    ctx.font = '18px "JetBrains Mono", monospace';
    ctx.fillText('Accredited under IEEE Continuing Engineering Education & ISO/IEC 27001 Standards', canvas.width / 2, 740);

    // Signatures Section
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(250, 890);
    ctx.lineTo(600, 890);
    ctx.moveTo(1000, 890);
    ctx.lineTo(1350, 890);
    ctx.stroke();

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '22px "JetBrains Mono", monospace';
    ctx.fillText('DR. ARIS THORNE', 425, 930);
    ctx.fillStyle = '#64748B';
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillText('Dean of Engineering Curriculum', 425, 960);

    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText(`SIGNATURE: ${STATE.certHash}`, 1175, 930);
    ctx.fillStyle = '#64748B';
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillText('Ed25519 Cryptographic Verification Key', 1175, 960);

    // Trigger Canvas Blob Download with DataURL fallback
    if (canvas.toBlob) {
      canvas.toBlob((blob) => {
        if (!blob) {
          fallbackDataUrlDownload();
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LearnBridge_Mastery_Certificate_${activeUser.name.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast('High-resolution cryptographic diploma exported successfully.', 'success');
      });
    } else {
      fallbackDataUrlDownload();
    }

    function fallbackDataUrlDownload() {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `LearnBridge_Mastery_Certificate_${activeUser.name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast('High-resolution cryptographic diploma exported successfully.', 'success');
    }
  }

  // =========================================================================
  // 8. TAB NAVIGATION LOGIC
  // =========================================================================
  function switchTab(targetTab) {
    STATE.activeTab = targetTab;
    DOM.tabs.forEach(t => {
      const tabKey = t.getAttribute('data-tab');
      if (tabKey === targetTab) {
        t.className = 'lms-tab active-tab flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 border-violet-400 text-violet-300 transition-colors whitespace-nowrap font-mono';
      } else {
        t.className = 'lms-tab flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap font-mono';
      }
    });

    DOM.tabContents.forEach(content => {
      content.classList.add('hidden');
    });

    const activeEl = document.getElementById('tab-' + targetTab);
    if (activeEl) {
      activeEl.classList.remove('hidden');
    }
  }

  DOM.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      if (target) switchTab(target);
    });
  });

  // =========================================================================
  // 9. EVENT LISTENERS INITIALIZATION
  // =========================================================================
  function initEventListeners() {
    // Play / Pause Triggers
    DOM.playBtn?.addEventListener('click', togglePlay);
    DOM.videoPlayPauseBtn?.addEventListener('click', togglePlay);

    // Prev / Next Lesson
    DOM.prevLessonBtn?.addEventListener('click', () => navigateLesson(-1));
    DOM.nextLessonBtn?.addEventListener('click', () => navigateLesson(1));

    // Scrubber click
    DOM.videoScrubBar?.addEventListener('click', (e) => {
      const rect = DOM.videoScrubBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = (clickX / rect.width) * 100;
      seekVideo(pct);
    });

    // Speed Selector
    DOM.playbackSpeedSelect?.addEventListener('change', (e) => {
      STATE.playbackSpeed = parseFloat(e.target.value) || 1.0;
      if (STATE.isPlaying) {
        startVideoInterval();
      }
      toast(`Playback speed adjusted to ${STATE.playbackSpeed}x`, 'info');
    });

    // Volume Toggle
    DOM.volumeToggleBtn?.addEventListener('click', () => {
      STATE.isMuted = !STATE.isMuted;
      toast(STATE.isMuted ? 'Audio stream muted.' : 'Audio stream unmuted (Studio Master).', 'info');
    });

    // Fullscreen Toggle
    DOM.fullscreenBtn?.addEventListener('click', () => {
      const videoFrame = DOM.playBtn?.closest('.aspect-video');
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => {});
      } else if (videoFrame && videoFrame.requestFullscreen) {
        videoFrame.requestFullscreen().catch(e => {});
      } else {
        toast('Fullscreen toggled.', 'info');
      }
    });

    // Mark Complete Button
    DOM.markCompleteBtn?.addEventListener('click', () => markActiveLessonComplete());

    // Take Quiz from Video Button
    DOM.openQuizFromVideoBtn?.addEventListener('click', () => {
      switchTab('quiz');
      toast('Opening Module 2 Certification Examination...', 'info');
    });

    // Syllabus Downloads
    DOM.downloadSyllabusHeaderBtn?.addEventListener('click', downloadSyllabusFile);
    DOM.downloadSyllabusBtn?.addEventListener('click', downloadSyllabusFile);
    DOM.downloadSyllabusTabBtn?.addEventListener('click', downloadSyllabusFile);
    DOM.downloadSyllabusDrawerBtn?.addEventListener('click', downloadSyllabusFile);

    // Drawer Toggles
    DOM.openSyllabusDrawerBtn?.addEventListener('click', openSyllabusDrawer);
    DOM.openDrawerFromVideoBtn?.addEventListener('click', openSyllabusDrawer);
    DOM.closeSyllabusDrawerBtn?.addEventListener('click', closeSyllabusDrawer);
    DOM.syllabusDrawer?.addEventListener('click', (e) => {
      if (e.target === DOM.syllabusDrawer) closeSyllabusDrawer();
    });

    // Notes Handlers
    DOM.addNoteBtn?.addEventListener('click', addNote);
    DOM.newNoteInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addNote();
    });
    DOM.exportNotesBtn?.addEventListener('click', exportNotes);

    // 3D Certificate Modal Handlers
    DOM.viewCertBtn?.addEventListener('click', () => {
      openCertificateModal();
      toast('Loading 3D cryptographic credential stage...', 'info');
    });
    DOM.closeCertModalBtn?.addEventListener('click', closeCertificateModal);
    DOM.certModal?.addEventListener('click', (e) => {
      if (e.target === DOM.certModal) closeCertificateModal();
    });
    DOM.downloadCertBtn?.addEventListener('click', downloadCertificateAsset);

    // Keyboard Shortcuts (Escape closes modals)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCertificateModal();
        closeSyllabusDrawer();
      }
    });

    // Auth Changed -> Update Certificate & UI
    window.addEventListener('bf:auth-changed', () => {
      updateCertificateVisuals();
    });

    // Quiz form setup
    setupQuizInteractions();
  }

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  loadPersistedState();
  initEventListeners();
  renderNotes();
  updatePlayerUI();
  updateMarkCompleteBtnUI();
  updateTelemetryUI();
  loadCoursesCatalog();

})();

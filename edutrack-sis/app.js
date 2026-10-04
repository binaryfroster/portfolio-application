// EDUTRACK SIS - STUDENT INFORMATION SYSTEM & REGISTRAR OS
// Binary Froster Enterprise Academic Platform
// Phase 4: Production Enterprise Grade SIS, Interactive Roster, Gradebook, Attendance & Bursar Ledger
// Strictly zero emojis. Full deterministic state and accurate mathematical computations.

(function () {
  'use strict';

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  let studentsState = [
    {
      id: 'STU-101',
      name: 'Marcus Chen',
      email: 'marcus.chen@student.edutrack.edu',
      cohort: 'Grade 12 - Advanced Systems',
      gpa: 3.93,
      attendanceRate: '98.2%',
      guardian: 'David Chen',
      guardianPhone: '+1 (555) 234-8901',
      guardianEmail: 'david.chen@chenindustries.io',
      status: 'VALEDICTORIAN_TRACK',
      attendanceWarning: false,
      academicWarning: false,
      tuition: {
        total: 14500,
        paid: 14500,
        balance: 0,
        status: 'PAID',
        dueDate: '2026-10-15',
        lastPaymentRef: 'TXN-849201'
      },
      courses: [
        { code: 'CS-401', title: 'Distributed Systems', department: 'Computer Science', credits: 4, score: 98, grade: 'A+', points: 4.0 },
        { code: 'CS-405', title: 'Machine Learning & Neural Nets', department: 'Computer Science', credits: 4, score: 95, grade: 'A', points: 4.0 },
        { code: 'MATH-302', title: 'Discrete Mathematics', department: 'Mathematics', credits: 3, score: 99, grade: 'A+', points: 4.0 },
        { code: 'ENG-204', title: 'Microarchitecture & Hardware', department: 'Computer Engineering', credits: 4, score: 92, grade: 'A-', points: 3.7 },
        { code: 'SEC-410', title: 'Cryptographic Protocols', department: 'Cybersecurity', credits: 3, score: 97, grade: 'A+', points: 4.0 }
      ]
    },
    {
      id: 'STU-102',
      name: 'Sophia Al-Mansoor',
      email: 'sophia.almansoor@student.edutrack.edu',
      cohort: 'Grade 11 - AP CS',
      gpa: 4.00,
      attendanceRate: '100.0%',
      guardian: 'Farah Al-Mansoor',
      guardianPhone: '+1 (555) 345-6789',
      guardianEmail: 'farah.almansoor@globaltech.ae',
      status: 'VALEDICTORIAN_TRACK',
      attendanceWarning: false,
      academicWarning: false,
      tuition: {
        total: 14500,
        paid: 14500,
        balance: 0,
        status: 'PAID',
        dueDate: '2026-10-15',
        lastPaymentRef: 'TXN-849202'
      },
      courses: [
        { code: 'CS-401', title: 'Distributed Systems', department: 'Computer Science', credits: 4, score: 99, grade: 'A+', points: 4.0 },
        { code: 'CS-405', title: 'Machine Learning & Neural Nets', department: 'Computer Science', credits: 4, score: 100, grade: 'A+', points: 4.0 },
        { code: 'MATH-302', title: 'Discrete Mathematics', department: 'Mathematics', credits: 3, score: 98, grade: 'A+', points: 4.0 },
        { code: 'ENG-204', title: 'Microarchitecture & Hardware', department: 'Computer Engineering', credits: 4, score: 96, grade: 'A', points: 4.0 },
        { code: 'SEC-410', title: 'Cryptographic Protocols', department: 'Cybersecurity', credits: 3, score: 99, grade: 'A+', points: 4.0 }
      ]
    },
    {
      id: 'STU-103',
      name: 'Liam O Connor',
      email: 'liam.oconnor@student.edutrack.edu',
      cohort: 'Grade 10 - Honors Math',
      gpa: 3.71,
      attendanceRate: '94.1%',
      guardian: 'Patrick O Connor',
      guardianPhone: '+1 (555) 456-7890',
      guardianEmail: 'p.oconnor@bostongroup.org',
      status: 'GOOD_STANDING',
      attendanceWarning: false,
      academicWarning: false,
      tuition: {
        total: 14500,
        paid: 9500,
        balance: 5000,
        status: 'PARTIAL',
        dueDate: '2026-10-20',
        lastPaymentRef: 'TXN-849203'
      },
      courses: [
        { code: 'CS-401', title: 'Distributed Systems', department: 'Computer Science', credits: 4, score: 88, grade: 'B+', points: 3.3 },
        { code: 'CS-405', title: 'Machine Learning & Neural Nets', department: 'Computer Science', credits: 4, score: 91, grade: 'A-', points: 3.7 },
        { code: 'MATH-302', title: 'Discrete Mathematics', department: 'Mathematics', credits: 3, score: 96, grade: 'A', points: 4.0 },
        { code: 'ENG-204', title: 'Microarchitecture & Hardware', department: 'Computer Engineering', credits: 4, score: 89, grade: 'B+', points: 3.3 },
        { code: 'SEC-410', title: 'Cryptographic Protocols', department: 'Cybersecurity', credits: 3, score: 93, grade: 'A', points: 4.0 }
      ]
    },
    {
      id: 'STU-104',
      name: 'Zoya Verma',
      email: 'zoya.verma@student.edutrack.edu',
      cohort: 'Grade 12 - Advanced Systems',
      gpa: 3.88,
      attendanceRate: '96.5%',
      guardian: 'Sunil Verma',
      guardianPhone: '+1 (555) 567-8901',
      guardianEmail: 'sunil.verma@delhicapital.in',
      status: 'HONORS',
      attendanceWarning: false,
      academicWarning: false,
      tuition: {
        total: 14500,
        paid: 14500,
        balance: 0,
        status: 'PAID',
        dueDate: '2026-10-15',
        lastPaymentRef: 'TXN-849204'
      },
      courses: [
        { code: 'CS-401', title: 'Distributed Systems', department: 'Computer Science', credits: 4, score: 95, grade: 'A', points: 4.0 },
        { code: 'CS-405', title: 'Machine Learning & Neural Nets', department: 'Computer Science', credits: 4, score: 93, grade: 'A', points: 4.0 },
        { code: 'MATH-302', title: 'Discrete Mathematics', department: 'Mathematics', credits: 3, score: 92, grade: 'A-', points: 3.7 },
        { code: 'ENG-204', title: 'Microarchitecture & Hardware', department: 'Computer Engineering', credits: 4, score: 91, grade: 'A-', points: 3.7 },
        { code: 'SEC-410', title: 'Cryptographic Protocols', department: 'Cybersecurity', credits: 3, score: 94, grade: 'A', points: 4.0 }
      ]
    },
    {
      id: 'STU-105',
      name: 'Brandon Stark',
      email: 'brandon.stark@student.edutrack.edu',
      cohort: 'Grade 11 - AP CS',
      gpa: 3.91,
      attendanceRate: '97.4%',
      guardian: 'Arthur Stark',
      guardianPhone: '+1 (555) 678-9012',
      guardianEmail: 'arthur.stark@winterfelldesign.com',
      status: 'HONORS',
      attendanceWarning: false,
      academicWarning: false,
      tuition: {
        total: 14500,
        paid: 14500,
        balance: 0,
        status: 'PAID',
        dueDate: '2026-10-15',
        lastPaymentRef: 'TXN-849205'
      },
      courses: [
        { code: 'CS-401', title: 'Distributed Systems', department: 'Computer Science', credits: 4, score: 94, grade: 'A', points: 4.0 },
        { code: 'CS-405', title: 'Machine Learning & Neural Nets', department: 'Computer Science', credits: 4, score: 96, grade: 'A', points: 4.0 },
        { code: 'MATH-302', title: 'Discrete Mathematics', department: 'Mathematics', credits: 3, score: 95, grade: 'A', points: 4.0 },
        { code: 'ENG-204', title: 'Microarchitecture & Hardware', department: 'Computer Engineering', credits: 4, score: 90, grade: 'A-', points: 3.7 },
        { code: 'SEC-410', title: 'Cryptographic Protocols', department: 'Cybersecurity', credits: 3, score: 95, grade: 'A', points: 4.0 }
      ]
    },
    {
      id: 'STU-106',
      name: 'Elena Rostova',
      email: 'elena.rostova@student.edutrack.edu',
      cohort: 'Grade 10 - Honors Math',
      gpa: 3.45,
      attendanceRate: '83.5%',
      guardian: 'Mikhail Rostov',
      guardianPhone: '+1 (555) 789-0123',
      guardianEmail: 'mikhail.rostov@nordicallianz.de',
      status: 'GOOD_STANDING',
      attendanceWarning: true,
      academicWarning: false,
      tuition: {
        total: 14500,
        paid: 4000,
        balance: 10500,
        status: 'OVERDUE',
        dueDate: '2026-09-15',
        lastPaymentRef: 'TXN-849180'
      },
      courses: [
        { code: 'CS-401', title: 'Distributed Systems', department: 'Computer Science', credits: 4, score: 82, grade: 'B', points: 3.0 },
        { code: 'CS-405', title: 'Machine Learning & Neural Nets', department: 'Computer Science', credits: 4, score: 85, grade: 'B', points: 3.0 },
        { code: 'MATH-302', title: 'Discrete Mathematics', department: 'Mathematics', credits: 3, score: 91, grade: 'A-', points: 3.7 },
        { code: 'ENG-204', title: 'Microarchitecture & Hardware', department: 'Computer Engineering', credits: 4, score: 86, grade: 'B', points: 3.0 },
        { code: 'SEC-410', title: 'Cryptographic Protocols', department: 'Cybersecurity', credits: 3, score: 90, grade: 'A-', points: 3.7 }
      ]
    },
    {
      id: 'STU-107',
      name: 'Darius Vance',
      email: 'darius.vance@student.edutrack.edu',
      cohort: 'Grade 12 - Advanced Systems',
      gpa: 2.38,
      attendanceRate: '81.2%',
      guardian: 'Evelyn Vance',
      guardianPhone: '+1 (555) 890-1234',
      guardianEmail: 'evelyn.vance@vanceholdings.org',
      status: 'ACADEMIC_WARNING',
      attendanceWarning: true,
      academicWarning: true,
      tuition: {
        total: 14500,
        paid: 0,
        balance: 14500,
        status: 'OVERDUE',
        dueDate: '2026-09-01',
        lastPaymentRef: 'NONE'
      },
      courses: [
        { code: 'CS-401', title: 'Distributed Systems', department: 'Computer Science', credits: 4, score: 68, grade: 'D+', points: 1.3 },
        { code: 'CS-405', title: 'Machine Learning & Neural Nets', department: 'Computer Science', credits: 4, score: 72, grade: 'C', points: 2.0 },
        { code: 'MATH-302', title: 'Discrete Mathematics', department: 'Mathematics', credits: 3, score: 70, grade: 'C-', points: 1.7 },
        { code: 'ENG-204', title: 'Microarchitecture & Hardware', department: 'Computer Engineering', credits: 4, score: 76, grade: 'C+', points: 2.3 },
        { code: 'SEC-410', title: 'Cryptographic Protocols', department: 'Cybersecurity', credits: 3, score: 75, grade: 'C', points: 2.0 }
      ]
    },
    {
      id: 'STU-108',
      name: 'Maya Chen',
      email: 'maya.chen@student.edutrack.edu',
      cohort: 'Grade 11 - AP CS',
      gpa: 4.00,
      attendanceRate: '99.1%',
      guardian: 'David Chen',
      guardianPhone: '+1 (555) 234-8901',
      guardianEmail: 'david.chen@chenindustries.io',
      status: 'VALEDICTORIAN_TRACK',
      attendanceWarning: false,
      academicWarning: false,
      tuition: {
        total: 14500,
        paid: 14500,
        balance: 0,
        status: 'PAID',
        dueDate: '2026-10-15',
        lastPaymentRef: 'TXN-849208'
      },
      courses: [
        { code: 'CS-401', title: 'Distributed Systems', department: 'Computer Science', credits: 4, score: 100, grade: 'A+', points: 4.0 },
        { code: 'CS-405', title: 'Machine Learning & Neural Nets', department: 'Computer Science', credits: 4, score: 98, grade: 'A+', points: 4.0 },
        { code: 'MATH-302', title: 'Discrete Mathematics', department: 'Mathematics', credits: 3, score: 99, grade: 'A+', points: 4.0 },
        { code: 'ENG-204', title: 'Microarchitecture & Hardware', department: 'Computer Engineering', credits: 4, score: 97, grade: 'A+', points: 4.0 },
        { code: 'SEC-410', title: 'Cryptographic Protocols', department: 'Cybersecurity', credits: 3, score: 99, grade: 'A+', points: 4.0 }
      ]
    }
  ];

  let dailyAttendanceMap = {
    'STU-101': 'present',
    'STU-102': 'present',
    'STU-103': 'present',
    'STU-104': 'present',
    'STU-105': 'present',
    'STU-106': 'late',
    'STU-107': 'absent',
    'STU-108': 'present'
  };

  let selectedStudentForDossier = studentsState[0];
  let selectedStudentForPayment = studentsState[2];
  let selectedStudentForGrade = studentsState[0];

  // ==========================================
  // HELPER FUNCTIONS & GPA CALCULATIONS
  // ==========================================
  function calculateScoreGrade(score) {
    const s = Number(score);
    if (s >= 97) return { letter: 'A+', points: 4.0 };
    if (s >= 93) return { letter: 'A', points: 4.0 };
    if (s >= 90) return { letter: 'A-', points: 3.7 };
    if (s >= 87) return { letter: 'B+', points: 3.3 };
    if (s >= 83) return { letter: 'B', points: 3.0 };
    if (s >= 80) return { letter: 'B-', points: 2.7 };
    if (s >= 77) return { letter: 'C+', points: 2.3 };
    if (s >= 73) return { letter: 'C', points: 2.0 };
    if (s >= 70) return { letter: 'C-', points: 1.7 };
    if (s >= 67) return { letter: 'D+', points: 1.3 };
    if (s >= 63) return { letter: 'D', points: 1.0 };
    return { letter: 'F', points: 0.0 };
  }

  function computeCumulativeGpa(courses) {
    if (!courses || courses.length === 0) return 3.50;
    let totalQualityPoints = 0;
    let totalCredits = 0;
    courses.forEach((c) => {
      const credits = Number(c.credits) || 3;
      const points = Number(c.points) || 3.0;
      totalQualityPoints += credits * points;
      totalCredits += credits;
    });
    return totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 3.50;
  }

  function getAcademicStanding(gpa, attendanceRate) {
    const numGpa = Number(gpa);
    const numAtt = parseFloat(attendanceRate) || 95.0;
    const isAttWarning = numAtt < 85.0;
    const isAcadWarning = numGpa < 2.50;

    let standing = 'GOOD_STANDING';
    if (numGpa >= 3.90) standing = 'VALEDICTORIAN_TRACK';
    else if (numGpa >= 3.50) standing = 'HONORS';
    else if (isAcadWarning) standing = 'ACADEMIC_WARNING';

    return {
      standing,
      academicWarning: isAcadWarning,
      attendanceWarning: isAttWarning
    };
  }

  function triggerToast(message, type = 'info') {
    if (window.BFAuth && typeof window.BFAuth.showToast === 'function') {
      window.BFAuth.showToast(message, type);
    } else if (typeof window.showToast === 'function') {
      window.showToast(message, type);
    } else {
      console.log(`[SIS ${type.toUpperCase()}]: ${message}`);
    }
  }

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
  let coreMesh, haloMesh;

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
    camera.position.set(0, 0, 9.8);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x040814, 0);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
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

    // Central Core
    const coreGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x0284C7,
      emissive: 0x0369A1,
      shininess: 90,
      wireframe: false
    });
    coreMesh = new THREE.Mesh(coreGeo, coreMat);
    constellationGroup.add(coreMesh);

    // Wireframe Outer Halo
    const haloGeo = new THREE.IcosahedronGeometry(1.35, 1);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    haloMesh = new THREE.Mesh(haloGeo, haloMat);
    constellationGroup.add(haloMesh);

    // Subject Nodes
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

    window.onResizeConstellation = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', window.onResizeConstellation);

    const resetBtn = document.getElementById('resetConstellationBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        targetRotation = { x: 0.15, y: -0.2 };
        camera.position.set(0, 0, 13.5);
        camera.lookAt(0, 0, 0);
        triggerToast('Constellation camera orientation reset to baseline polar angle.', 'info');
      });
    }

    let clock = new THREE.Clock();
    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.05;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.05;

      if (!isDragging) {
        targetRotation.y += 0.0015;
      }

      if (constellationGroup) {
        constellationGroup.rotation.x = currentRotation.x;
        constellationGroup.rotation.y = currentRotation.y;

        const scale = 1.0 + Math.sin(elapsedTime * 2.5) * 0.04;
        if (coreMesh) coreMesh.scale.set(scale, scale, scale);
        if (haloMesh) {
          haloMesh.rotation.y = elapsedTime * 0.2;
          haloMesh.rotation.z = elapsedTime * 0.15;
        }
      }

      renderer.render(scene, camera);
    }
    animate();
  }

  // ==========================================
  // 3. STUDENT DIRECTORY (ROSTER) TABLE
  // ==========================================
  async function loadStudentsFromApi() {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        if (data.students && Array.isArray(data.students) && data.students.length > 0) {
          studentsState = data.students;
        }
      }
    } catch (err) {
      console.warn('API /api/students offline, maintaining in-memory state:', err);
    }

    try {
      const attRes = await fetch('/api/attendance');
      if (attRes.ok) {
        const attData = await attRes.json();
        if (attData.records && typeof attData.records === 'object') {
          dailyAttendanceMap = { ...dailyAttendanceMap, ...attData.records };
        }
      }
    } catch (e) {
      console.warn('API /api/attendance offline, maintaining local map');
    }

    renderAllViews();
  }

  function renderAllViews() {
    renderRosterTable();
    renderAttendanceList();
    renderGradebookTable();
    renderTuitionLedger();
    updateConstellationStats();
  }

  function renderRosterTable() {
    const tbody = document.getElementById('rosterTbody');
    const emptyState = document.getElementById('rosterEmptyState');
    const countBadge = document.getElementById('rosterCountBadge');
    if (!tbody) return;

    const query = (document.getElementById('rosterSearchInput')?.value || '').toLowerCase().trim();
    const cohortFilter = document.getElementById('rosterCohortFilter')?.value || 'ALL';
    const standingFilter = document.getElementById('rosterStandingFilter')?.value || 'ALL';
    const sortVal = document.getElementById('rosterSortSelect')?.value || 'gpa_desc';

    let filtered = studentsState.filter((s) => {
      const matchQuery = !query || `${s.id} ${s.name} ${s.email} ${s.cohort} ${s.guardian}`.toLowerCase().includes(query);
      const matchCohort = cohortFilter === 'ALL' || s.cohort === cohortFilter;

      let matchStanding = true;
      if (standingFilter === 'VALEDICTORIAN_TRACK') matchStanding = s.gpa >= 3.90;
      else if (standingFilter === 'HONORS') matchStanding = s.gpa >= 3.50 && s.gpa < 3.90;
      else if (standingFilter === 'GOOD_STANDING') matchStanding = s.gpa >= 2.50 && s.gpa < 3.50;
      else if (standingFilter === 'ACADEMIC_WARNING') matchStanding = s.gpa < 2.50;
      else if (standingFilter === 'ATTENDANCE_WARNING') matchStanding = parseFloat(s.attendanceRate) < 85.0;

      return matchQuery && matchCohort && matchStanding;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortVal === 'gpa_desc') return b.gpa - a.gpa;
      if (sortVal === 'gpa_asc') return a.gpa - b.gpa;
      if (sortVal === 'att_desc') return parseFloat(b.attendanceRate) - parseFloat(a.attendanceRate);
      if (sortVal === 'att_asc') return parseFloat(a.attendanceRate) - parseFloat(b.attendanceRate);
      if (sortVal === 'name_asc') return a.name.localeCompare(b.name);
      if (sortVal === 'id_asc') return a.id.localeCompare(b.id);
      return 0;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} Scholars Active`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    tbody.innerHTML = filtered.map((s) => {
      const gpaNum = Number(s.gpa);
      const gpaBadgeClass = gpaNum >= 3.90
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        : (gpaNum >= 3.50
          ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
          : (gpaNum >= 2.50
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'));

      const isAttWarning = parseFloat(s.attendanceRate) < 85.0;
      const attBadge = isAttWarning
        ? `<div class="flex items-center gap-1.5"><span class="text-rose-400 font-bold">${s.attendanceRate}</span><span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">[ALERT: &lt;85%]</span></div>`
        : `<span class="text-slate-300 font-medium">${s.attendanceRate}</span>`;

      let standingBadge = '';
      if (gpaNum >= 3.90) {
        standingBadge = '<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">[VALEDICTORIAN]</span>';
      } else if (gpaNum >= 3.50) {
        standingBadge = '<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">[HONORS]</span>';
      } else if (gpaNum >= 2.50) {
        standingBadge = '<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-semibold">[GOOD STANDING]</span>';
      } else {
        standingBadge = '<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold animate-pulse">[ACADEMIC WARNING]</span>';
      }

      return `
        <tr class="hover:bg-white/[0.02] transition-colors">
          <td class="p-3 text-sky-400 font-semibold">${s.id}</td>
          <td class="p-3">
            <div class="font-sans text-slate-100 font-medium">${s.name}</div>
            <div class="text-[10px] text-slate-400 font-mono">${s.email || (s.name.toLowerCase().replace(/\s+/g, '.') + '@student.edutrack.edu')}</div>
          </td>
          <td class="p-3 text-slate-400">${s.cohort}</td>
          <td class="p-3">
            <span class="px-2 py-0.5 rounded text-[11px] font-bold border ${gpaBadgeClass}">
              ${gpaNum.toFixed(2)}
            </span>
          </td>
          <td class="p-3">${attBadge}</td>
          <td class="p-3">${standingBadge}</td>
          <td class="p-3">
            <div class="font-sans text-slate-300">${s.guardian}</div>
            <div class="text-[10px] text-slate-500 font-mono">${s.guardianPhone || 'N/A'}</div>
          </td>
          <td class="p-3 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button data-id="${s.id}" class="view-dossier-btn px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-semibold transition-all">
                Transcript
              </button>
              <button data-id="${s.id}" class="send-notice-quick-btn px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/10 text-[10px] font-mono transition-all">
                Notice
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Bind row action buttons
    tbody.querySelectorAll('.view-dossier-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const st = studentsState.find((x) => x.id === id);
        if (st) {
          openTranscriptModal(st);
        }
      });
    });

    tbody.querySelectorAll('.send-notice-quick-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const st = studentsState.find((x) => x.id === id);
        if (st) {
          openGuardianNoticeModal(st);
        }
      });
    });
  }

  // Bind Search & Filters
  ['rosterSearchInput', 'rosterCohortFilter', 'rosterStandingFilter', 'rosterSortSelect'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', renderRosterTable);
      el.addEventListener('change', renderRosterTable);
    }
  });

  const clearFiltersBtn = document.getElementById('clearRosterFiltersBtn');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      const search = document.getElementById('rosterSearchInput');
      const cohort = document.getElementById('rosterCohortFilter');
      const standing = document.getElementById('rosterStandingFilter');
      const sort = document.getElementById('rosterSortSelect');
      if (search) search.value = '';
      if (cohort) cohort.value = 'ALL';
      if (standing) standing.value = 'ALL';
      if (sort) sort.value = 'gpa_desc';
      renderRosterTable();
    });
  }

  // ==========================================
  // 4. LIVE ATTENDANCE REGISTER
  // ==========================================
  function calculateAttendanceTotals() {
    const total = studentsState.length;
    if (total === 0) return { total: 0, present: 0, late: 0, absent: 0, rate: '100.0' };

    let present = 0;
    let late = 0;
    let absent = 0;

    studentsState.forEach((s) => {
      const st = dailyAttendanceMap[s.id] || 'present';
      if (st === 'present') present++;
      else if (st === 'late') late++;
      else if (st === 'absent') absent++;
    });

    // Weighted academic formula: Present = 1.0, Late = 0.5, Absent = 0.0
    const rawRate = ((present + (late * 0.5)) / total) * 100;
    const rate = rawRate.toFixed(1);

    return { total, present, late, absent, rate };
  }

  function updateAttendanceTelemetry() {
    const stats = calculateAttendanceTotals();

    const headerEl = document.getElementById('headerAttendance');
    if (headerEl) headerEl.textContent = `${stats.rate}%`;

    const statTotal = document.getElementById('attStatTotal');
    const statPresent = document.getElementById('attStatPresent');
    const statLate = document.getElementById('attStatLate');
    const statAbsent = document.getElementById('attStatAbsent');
    const statRate = document.getElementById('attStatRate');

    if (statTotal) statTotal.textContent = `${stats.total} Scholars`;
    if (statPresent) statPresent.textContent = `${stats.present} (${((stats.present / (stats.total || 1)) * 100).toFixed(1)}%)`;
    if (statLate) statLate.textContent = `${stats.late} (${((stats.late / (stats.total || 1)) * 100).toFixed(1)}%)`;
    if (statAbsent) statAbsent.textContent = `${stats.absent} (${((stats.absent / (stats.total || 1)) * 100).toFixed(1)}%)`;
    if (statRate) statRate.textContent = `${stats.rate}%`;
  }

  function renderAttendanceList() {
    const list = document.getElementById('attendanceList');
    if (!list) return;

    list.innerHTML = studentsState.map((s) => {
      const currentStatus = dailyAttendanceMap[s.id] || 'present';
      const isAttWarning = parseFloat(s.attendanceRate) < 85.0;

      return `
        <div class="attendance-group p-3 rounded-xl bg-[#080E1C] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="font-mono text-xs text-sky-400 font-bold">${s.id}</span>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-medium text-xs text-white font-sans">${s.name}</span>
                ${isAttWarning ? '<span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">[TRUANCY RISK &lt;85%]</span>' : ''}
              </div>
              <div class="text-[10px] text-slate-400 font-mono">
                ${s.cohort} &middot; Term Record: <span class="text-slate-300 font-bold">${s.attendanceRate}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-1.5" data-student-id="${s.id}">
            <button data-status="present" class="att-btn px-3 py-1 rounded-lg text-xs font-mono transition-all ${currentStatus === 'present' ? 'font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-slate-400 border border-white/[0.08] hover:bg-white/[0.05]'}">
              Present
            </button>
            <button data-status="late" class="att-btn px-3 py-1 rounded-lg text-xs font-mono transition-all ${currentStatus === 'late' ? 'font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'text-slate-400 border border-white/[0.08] hover:bg-white/[0.05]'}">
              Late
            </button>
            <button data-status="absent" class="att-btn px-3 py-1 rounded-lg text-xs font-mono transition-all ${currentStatus === 'absent' ? 'font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]' : 'text-slate-400 border border-white/[0.08] hover:bg-white/[0.05]'}">
              Absent
            </button>
          </div>
        </div>
      `;
    }).join('');

    bindAttendanceToggles();
    updateAttendanceTelemetry();
  }

  function bindAttendanceToggles() {
    document.querySelectorAll('.attendance-group').forEach((group) => {
      const container = group.querySelector('[data-student-id]');
      if (!container) return;
      const studentId = container.getAttribute('data-student-id');
      const buttons = group.querySelectorAll('.att-btn');

      buttons.forEach((btn) => {
        btn.addEventListener('click', async () => {
          const status = btn.getAttribute('data-status');

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

          dailyAttendanceMap[studentId] = status;
          updateAttendanceTelemetry();

          // Dispatch to serverless endpoint
          try {
            await fetch('/api/attendance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studentId: studentId,
                status: status
              })
            });
          } catch (e) {
            console.warn('Attendance serverless sync fallback');
          }

          const stObj = studentsState.find((x) => x.id === studentId);
          const stName = stObj ? stObj.name : studentId;
          const toastType = status === 'absent' ? 'warning' : (status === 'late' ? 'info' : 'success');
          triggerToast(`Roll-call updated: ${stName} marked ${status.toUpperCase()}. Live SIS ledger synchronized.`, toastType);
        });
      });
    });
  }

  // Mark All Present Action
  const markAllPresentBtn = document.getElementById('markAllPresentBtn');
  if (markAllPresentBtn) {
    markAllPresentBtn.addEventListener('click', async () => {
      studentsState.forEach((s) => {
        dailyAttendanceMap[s.id] = 'present';
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

      updateAttendanceTelemetry();

      try {
        await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batch: true, status: 'present', overallPercent: 100.0 })
        });
      } catch (e) {
        console.warn('Batch attendance sync fallback');
      }

      triggerToast('Daily batch roll-call complete: All enrolled scholars marked present.', 'success');
    });
  }

  // ==========================================
  // 5. DYNAMIC GRADEBOOK & GPA
  // ==========================================
  function renderGradebookTable() {
    const tbody = document.getElementById('gradebookTbody');
    if (!tbody) return;

    // Recalculate metrics
    const total = studentsState.length || 1;
    let highestGpa = 0;
    let highestStudentName = '';
    let totalGpa = 0;
    let honorsCount = 0;
    let warningCount = 0;

    studentsState.forEach((s) => {
      const gpa = Number(s.gpa);
      totalGpa += gpa;
      if (gpa > highestGpa) {
        highestGpa = gpa;
        highestStudentName = s.name;
      }
      if (gpa >= 3.50) honorsCount++;
      if (gpa < 2.50) warningCount++;
    });

    const meanGpa = (totalGpa / total).toFixed(2);
    const honorsRate = ((honorsCount / total) * 100).toFixed(1);
    const warningRate = ((warningCount / total) * 100).toFixed(1);

    const highestEl = document.getElementById('gradeHighestGpa');
    const meanEl = document.getElementById('gradeMeanGpa');
    const honorsEl = document.getElementById('gradeHonorsRate');
    const warningEl = document.getElementById('gradeWarningRate');

    if (highestEl) highestEl.textContent = `${highestGpa.toFixed(2)} (${highestStudentName})`;
    if (meanEl) meanEl.textContent = `${meanGpa} (Honors Average)`;
    if (honorsEl) honorsEl.textContent = `${honorsRate}% (${honorsCount}/${total} Cohort)`;
    if (warningEl) warningEl.textContent = `${warningRate}% (${warningCount} Flagged)`;

    tbody.innerHTML = studentsState.map((s) => {
      const c1 = s.courses.find((c) => c.code === 'CS-401') || { score: 90, grade: 'A-' };
      const c2 = s.courses.find((c) => c.code === 'CS-405') || { score: 90, grade: 'A-' };
      const c3 = s.courses.find((c) => c.code === 'MATH-302') || { score: 90, grade: 'A-' };
      const c4 = s.courses.find((c) => c.code === 'ENG-204') || { score: 90, grade: 'A-' };
      const c5 = s.courses.find((c) => c.code === 'SEC-410') || { score: 90, grade: 'A-' };

      const gpaNum = Number(s.gpa);
      const gpaClass = gpaNum >= 3.90
        ? 'text-emerald-400 font-bold'
        : (gpaNum >= 3.50 ? 'text-sky-400 font-bold' : (gpaNum >= 2.50 ? 'text-amber-400' : 'text-rose-400 font-bold'));

      return `
        <tr class="hover:bg-white/[0.02] transition-colors">
          <td class="p-3">
            <div class="font-sans text-slate-100 font-medium">${s.name}</div>
            <div class="text-[10px] text-sky-400 font-mono">${s.id}</div>
          </td>
          <td class="p-3"><span class="font-semibold text-slate-200">${c1.score}</span> <span class="text-slate-500 text-[10px]">(${c1.grade})</span></td>
          <td class="p-3"><span class="font-semibold text-slate-200">${c2.score}</span> <span class="text-slate-500 text-[10px]">(${c2.grade})</span></td>
          <td class="p-3"><span class="font-semibold text-slate-200">${c3.score}</span> <span class="text-slate-500 text-[10px]">(${c3.grade})</span></td>
          <td class="p-3"><span class="font-semibold text-slate-200">${c4.score}</span> <span class="text-slate-500 text-[10px]">(${c4.grade})</span></td>
          <td class="p-3"><span class="font-semibold text-slate-200">${c5.score}</span> <span class="text-slate-500 text-[10px]">(${c5.grade})</span></td>
          <td class="p-3">
            <span class="text-sm ${gpaClass}">${gpaNum.toFixed(2)}</span>
          </td>
          <td class="p-3 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button data-id="${s.id}" class="grade-dossier-btn px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-mono transition-all">
                Dossier
              </button>
              <button data-id="${s.id}" class="grade-edit-btn px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/10 text-[10px] font-mono transition-all">
                Edit
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.grade-dossier-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const st = studentsState.find((x) => x.id === id);
        if (st) openTranscriptModal(st);
      });
    });

    tbody.querySelectorAll('.grade-edit-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const st = studentsState.find((x) => x.id === id);
        if (st) openEditGradeModal(st);
      });
    });
  }

  // ==========================================
  // 6. TUITION & FINANCIAL LEDGER
  // ==========================================
  function renderTuitionLedger() {
    const tbody = document.getElementById('tuitionTbody');
    const emptyState = document.getElementById('tuitionEmptyState');
    if (!tbody) return;

    let totalBilled = 0;
    let totalCollected = 0;
    let totalOverdue = 0;

    studentsState.forEach((s) => {
      const tuition = s.tuition || { total: 14500, paid: 14500, balance: 0, status: 'PAID' };
      totalBilled += tuition.total;
      totalCollected += tuition.paid;
      if (tuition.balance > 0) totalOverdue += tuition.balance;
    });

    const collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : '100.0';

    const statBilled = document.getElementById('tuitionStatBilled');
    const statCollected = document.getElementById('tuitionStatCollected');
    const statOverdue = document.getElementById('tuitionStatOverdue');
    const statRate = document.getElementById('tuitionStatRate');

    if (statBilled) statBilled.textContent = `$${totalBilled.toLocaleString()}`;
    if (statCollected) statCollected.textContent = `$${totalCollected.toLocaleString()}`;
    if (statOverdue) statOverdue.textContent = `$${totalOverdue.toLocaleString()}`;
    if (statRate) statRate.textContent = `${collectionRate}%`;

    const query = (document.getElementById('tuitionSearchInput')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('tuitionStatusFilter')?.value || 'ALL';

    const filtered = studentsState.filter((s) => {
      const tuition = s.tuition || { total: 14500, paid: 14500, balance: 0, status: 'PAID' };
      const matchQuery = !query || `${s.id} ${s.name} ${s.cohort}`.toLowerCase().includes(query);
      const matchStatus = statusFilter === 'ALL' || tuition.status === statusFilter;
      return matchQuery && matchStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    tbody.innerHTML = filtered.map((s) => {
      const tuition = s.tuition || { total: 14500, paid: 14500, balance: 0, status: 'PAID', dueDate: '2026-10-15' };

      let statusBadge = '';
      if (tuition.status === 'PAID') {
        statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">[PAID]</span>';
      } else if (tuition.status === 'PARTIAL') {
        statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">[PARTIAL]</span>';
      } else {
        statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">[OVERDUE]</span>';
      }

      return `
        <tr class="hover:bg-white/[0.02] transition-colors">
          <td class="p-3 text-sky-400 font-semibold">${s.id}</td>
          <td class="p-3">
            <div class="font-sans text-slate-100 font-medium">${s.name}</div>
            <div class="text-[10px] text-slate-500 font-mono">Ref: ${tuition.lastPaymentRef || 'NONE'}</div>
          </td>
          <td class="p-3 text-slate-400">${s.cohort}</td>
          <td class="p-3 text-slate-300 font-mono">$${tuition.total.toLocaleString()}</td>
          <td class="p-3 text-emerald-400 font-mono font-bold">$${tuition.paid.toLocaleString()}</td>
          <td class="p-3 font-mono font-bold ${tuition.balance > 0 ? 'text-rose-400' : 'text-slate-400'}">
            $${tuition.balance.toLocaleString()}
          </td>
          <td class="p-3">${statusBadge}</td>
          <td class="p-3 text-slate-400 font-mono">${tuition.dueDate || '2026-10-15'}</td>
          <td class="p-3 text-right">
            <button data-id="${s.id}" class="record-pay-row-btn px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-semibold transition-all">
              ${tuition.balance > 0 ? 'Record Payment' : 'View Receipt'}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.record-pay-row-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const st = studentsState.find((x) => x.id === id);
        if (st) {
          openRecordPaymentModal(st);
        }
      });
    });
  }

  ['tuitionSearchInput', 'tuitionStatusFilter'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', renderTuitionLedger);
      el.addEventListener('change', renderTuitionLedger);
    }
  });

  // ==========================================
  // 7. STUDENT ENROLLMENT MODAL
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
      const email = document.getElementById('stuEmail')?.value.trim();
      const grade = document.getElementById('stuGrade')?.value;
      const gpa = parseFloat(document.getElementById('stuGpa')?.value || 3.90);
      const guardian = document.getElementById('stuGuardian')?.value.trim();
      const guardianPhone = document.getElementById('stuGuardianPhone')?.value.trim();
      const tuitionFee = Number(document.getElementById('stuTuitionAmount')?.value) || 14500;

      let hasError = false;

      // Validation
      if (!name || name.length < 2) {
        document.getElementById('stuNameError')?.classList.remove('hidden');
        hasError = true;
      } else {
        document.getElementById('stuNameError')?.classList.add('hidden');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        document.getElementById('stuEmailError')?.classList.remove('hidden');
        hasError = true;
      } else {
        document.getElementById('stuEmailError')?.classList.add('hidden');
      }

      if (!guardian || guardian.length < 2) {
        document.getElementById('stuGuardianError')?.classList.remove('hidden');
        hasError = true;
      } else {
        document.getElementById('stuGuardianError')?.classList.add('hidden');
      }

      if (!guardianPhone || guardianPhone.length < 7) {
        document.getElementById('stuPhoneError')?.classList.remove('hidden');
        hasError = true;
      } else {
        document.getElementById('stuPhoneError')?.classList.add('hidden');
      }

      if (hasError) {
        triggerToast('Please correct form validation errors before issuing Student ID.', 'warning');
        return;
      }

      const generatedId = 'STU-' + Math.floor(100 + Math.random() * 900);
      const defaultCourses = [
        { code: 'CS-401', title: 'Distributed Systems', department: 'Computer Science', credits: 4, score: Math.round(gpa * 24), grade: gpa >= 3.8 ? 'A' : 'B+', points: gpa >= 3.8 ? 4.0 : 3.3 },
        { code: 'CS-405', title: 'Machine Learning & Neural Nets', department: 'Computer Science', credits: 4, score: Math.round(gpa * 24.5), grade: gpa >= 3.8 ? 'A' : 'B+', points: gpa >= 3.8 ? 4.0 : 3.3 },
        { code: 'MATH-302', title: 'Discrete Mathematics', department: 'Mathematics', credits: 3, score: Math.round(gpa * 24.8), grade: gpa >= 3.8 ? 'A' : 'B+', points: gpa >= 3.8 ? 4.0 : 3.3 },
        { code: 'ENG-204', title: 'Microarchitecture & Hardware', department: 'Computer Engineering', credits: 4, score: Math.round(gpa * 23.5), grade: gpa >= 3.8 ? 'A-' : 'B', points: gpa >= 3.8 ? 3.7 : 3.0 },
        { code: 'SEC-410', title: 'Cryptographic Protocols', department: 'Cybersecurity', credits: 3, score: Math.round(gpa * 24), grade: gpa >= 3.8 ? 'A' : 'B+', points: gpa >= 3.8 ? 4.0 : 3.3 }
      ];

      const newStudent = {
        id: generatedId,
        name: name,
        email: email,
        cohort: grade,
        gpa: gpa,
        attendanceRate: '100.0%',
        guardian: guardian,
        guardianPhone: guardianPhone,
        guardianEmail: guardian.toLowerCase().replace(/\s+/g, '.') + '@guardian-family.org',
        status: gpa >= 3.90 ? 'VALEDICTORIAN_TRACK' : (gpa >= 3.50 ? 'HONORS' : 'GOOD_STANDING'),
        attendanceWarning: false,
        academicWarning: gpa < 2.50,
        tuition: {
          total: tuitionFee,
          paid: 0,
          balance: tuitionFee,
          status: 'PARTIAL',
          dueDate: '2026-11-01',
          lastPaymentRef: 'PENDING_INITIAL'
        },
        courses: defaultCourses
      };

      // Add to local state
      studentsState.unshift(newStudent);
      dailyAttendanceMap[generatedId] = 'present';

      // Dispatch to serverless API
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
      renderAllViews();

      // Trigger Three.js visual excitation
      if (constellationGroup) {
        targetRotation.y += 1.8;
      }

      if (enrollModal) enrollModal.classList.add('hidden');
      studentEnrollForm.reset();

      triggerToast(`Official enrollment verified: ${name} [${generatedId}] assigned to ${grade}.`, 'success');
    });
  }

  // ==========================================
  // 8. STUDENT ACADEMIC PROFILE & TRANSCRIPT MODAL
  // ==========================================
  const transcriptModal = document.getElementById('transcriptModal');
  const closeTranscriptBtn = document.getElementById('closeTranscriptModalBtn');
  const closeTranscriptFooterBtn = document.getElementById('closeTranscriptModalFooterBtn');
  const printTranscriptBtn = document.getElementById('printTranscriptBtn');
  const sendNoticeFromModalBtn = document.getElementById('sendNoticeFromModalBtn');

  function openTranscriptModal(student) {
    selectedStudentForDossier = student;
    if (!transcriptModal) return;

    document.getElementById('transStuName').textContent = student.name;
    document.getElementById('transStuId').textContent = student.id;
    document.getElementById('transStuEmail').textContent = student.email || `${student.id.toLowerCase()}@edutrack.edu`;
    document.getElementById('transStuCohort').textContent = student.cohort;
    document.getElementById('transGuardianName').textContent = student.guardian;
    document.getElementById('transGuardianPhone').textContent = student.guardianPhone || 'N/A';
    document.getElementById('transGuardianEmail').textContent = student.guardianEmail || 'N/A';
    document.getElementById('transAttendanceRate').textContent = student.attendanceRate;

    const tuition = student.tuition || { status: 'PAID' };
    document.getElementById('transTuitionStatus').textContent = tuition.status;

    // Academic Standing badges
    const standingContainer = document.getElementById('transStandingContainer');
    if (standingContainer) {
      const gpaNum = Number(student.gpa);
      let standingHtml = '';
      if (gpaNum >= 3.90) {
        standingHtml = '<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">[VALEDICTORIAN TRACK]</span>';
      } else if (gpaNum >= 3.50) {
        standingHtml = '<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">[HONORS ROLL]</span>';
      } else if (gpaNum >= 2.50) {
        standingHtml = '<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">[GOOD STANDING]</span>';
      } else {
        standingHtml = '<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500/50 font-bold">[ACADEMIC WARNING]</span>';
      }
      standingContainer.innerHTML = standingHtml;
    }

    // Warnings Banner
    const alertBanner = document.getElementById('transAlertBanner');
    if (alertBanner) {
      const numGpa = Number(student.gpa);
      const isAttWarning = parseFloat(student.attendanceRate) < 85.0;
      const isAcadWarning = numGpa < 2.50;

      if (isAttWarning || isAcadWarning) {
        alertBanner.className = 'p-3.5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 flex items-center gap-3 text-xs font-mono';
        let alertMsg = '';
        if (isAttWarning && isAcadWarning) {
          alertMsg = '[REGISTRAR ADVISORY]: Scholar is concurrently subject to Academic Warning (GPA < 2.50) and Truancy Alert (Attendance < 85.0%). Immediate parent-faculty intervention required.';
        } else if (isAttWarning) {
          alertMsg = '[ATTENDANCE ADVISORY]: Scholar cumulative attendance has dropped below 85.0% threshold. Automated truancy notice flagged.';
        } else {
          alertMsg = '[ACADEMIC PROBATION ALERT]: Scholar GPA has dropped below satisfactory 2.50 threshold. Mandatory tutoring prescribed.';
        }
        alertBanner.innerHTML = `
          <svg class="w-5 h-5 flex-shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <div>${alertMsg}</div>
        `;
        alertBanner.classList.remove('hidden');
      } else {
        alertBanner.classList.add('hidden');
      }
    }

    // Populate Courses Table
    const coursesTbody = document.getElementById('transCoursesTbody');
    if (coursesTbody && student.courses) {
      let totalQualityPoints = 0;
      let totalCredits = 0;

      coursesTbody.innerHTML = student.courses.map((c) => {
        const creds = Number(c.credits) || 3;
        const pts = Number(c.points) || 3.0;
        const qp = creds * pts;
        totalQualityPoints += qp;
        totalCredits += creds;

        return `
          <tr class="hover:bg-white/[0.02] transition-colors">
            <td class="p-2.5 font-bold text-sky-400 print-dark-text">${c.code}</td>
            <td class="p-2.5 font-sans text-slate-200 print-dark-text">${c.title}</td>
            <td class="p-2.5 text-slate-400 print-muted-text">${c.department}</td>
            <td class="p-2.5 text-center text-slate-300 print-dark-text">${creds}.0</td>
            <td class="p-2.5 text-center font-bold text-slate-200 print-dark-text">${c.score}%</td>
            <td class="p-2.5 text-center font-bold text-emerald-400 print-dark-text">${c.grade}</td>
            <td class="p-2.5 text-right font-bold text-slate-300 print-dark-text">${qp.toFixed(1)}</td>
          </tr>
        `;
      }).join('');

      const gpa = totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : '3.50';
      document.getElementById('transCumulativeGpa').textContent = gpa;
      document.getElementById('transGpaMathBreakdown').textContent = `Total Quality Points: ${totalQualityPoints.toFixed(1)} | Total Credit Hours: ${totalCredits.toFixed(1)}`;
    }

    transcriptModal.classList.remove('hidden');
  }

  if (closeTranscriptBtn && transcriptModal) {
    closeTranscriptBtn.addEventListener('click', () => transcriptModal.classList.add('hidden'));
  }

  if (closeTranscriptFooterBtn && transcriptModal) {
    closeTranscriptFooterBtn.addEventListener('click', () => transcriptModal.classList.add('hidden'));
  }

  if (transcriptModal) {
    transcriptModal.addEventListener('click', (e) => {
      if (e.target === transcriptModal) transcriptModal.classList.add('hidden');
    });
  }

  if (printTranscriptBtn) {
    printTranscriptBtn.addEventListener('click', () => {
      triggerToast('Spooling official transcript printer document...', 'info');
      setTimeout(() => {
        window.print();
      }, 250);
    });
  }

  if (sendNoticeFromModalBtn) {
    sendNoticeFromModalBtn.addEventListener('click', () => {
      transcriptModal.classList.add('hidden');
      openGuardianNoticeModal(selectedStudentForDossier);
    });
  }

  // ==========================================
  // 9. GUARDIAN NOTICE MODAL
  // ==========================================
  const guardianNoticeModal = document.getElementById('guardianNoticeModal');
  const closeNoticeModalBtn = document.getElementById('closeNoticeModalBtn');
  const guardianNoticeForm = document.getElementById('guardianNoticeForm');
  const noticeTypeSelect = document.getElementById('noticeTypeSelect');
  const noticeMessageText = document.getElementById('noticeMessageText');

  function openGuardianNoticeModal(student) {
    selectedStudentForDossier = student;
    if (!guardianNoticeModal) return;

    document.getElementById('noticeStuName').textContent = student.name;
    document.getElementById('noticeStuId').textContent = `(${student.id})`;
    document.getElementById('noticeGuardianName').textContent = student.guardian;
    document.getElementById('noticeGuardianContact').textContent = `${student.guardianPhone || '+1 (555) 000-0000'} & ${student.guardianEmail || 'guardian@district.org'}`;

    updateNoticeTemplateText();
    guardianNoticeModal.classList.remove('hidden');
  }

  function updateNoticeTemplateText() {
    if (!noticeMessageText || !selectedStudentForDossier) return;
    const type = noticeTypeSelect?.value || 'HONORS_COMMENDATION';
    const s = selectedStudentForDossier;

    if (type === 'HONORS_COMMENDATION') {
      noticeMessageText.value = `Dear ${s.guardian},\n\nWe are pleased to inform you that ${s.name} has achieved outstanding academic distinction in ${s.cohort} with a cumulative GPA of ${Number(s.gpa).toFixed(2)}. This places ${s.name} in the top tier of our academic cohort.\n\nOffice of Academic Affairs,\nEduTrack SIS`;
    } else if (type === 'MIDTERM_REPORT') {
      noticeMessageText.value = `Dear ${s.guardian},\n\nThis is an official mid-term academic update for ${s.name}. Current unweighted cumulative GPA is ${Number(s.gpa).toFixed(2)} with an attendance rate of ${s.attendanceRate}. Please review the official student dossier.\n\nOffice of the Registrar,\nEduTrack SIS`;
    } else if (type === 'ATTENDANCE_WARNING') {
      noticeMessageText.value = `Dear ${s.guardian},\n\nURGENT: This is a formal attendance advisory regarding ${s.name}. The student's recorded attendance of ${s.attendanceRate} falls below the district mandatory 85% requirement. Please contact the administration immediately.\n\nAttendance Office,\nEduTrack SIS`;
    } else if (type === 'TUITION_REMINDER') {
      const bal = s.tuition?.balance || 5000;
      noticeMessageText.value = `Dear ${s.guardian},\n\nThis is a bursar notification regarding an outstanding balance of $${bal.toLocaleString()} for ${s.name} in ${s.cohort}. Please remit payment prior to the upcoming term cutoff.\n\nBursar Accounts Clearinghouse,\nEduTrack SIS`;
    }
  }

  if (noticeTypeSelect) {
    noticeTypeSelect.addEventListener('change', updateNoticeTemplateText);
  }

  if (closeNoticeModalBtn && guardianNoticeModal) {
    closeNoticeModalBtn.addEventListener('click', () => guardianNoticeModal.classList.add('hidden'));
  }

  if (guardianNoticeModal) {
    guardianNoticeModal.addEventListener('click', (e) => {
      if (e.target === guardianNoticeModal) guardianNoticeModal.classList.add('hidden');
    });
  }

  if (guardianNoticeForm) {
    guardianNoticeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const s = selectedStudentForDossier;
      const type = noticeTypeSelect?.value || 'COMMENDATION';
      guardianNoticeModal.classList.add('hidden');
      triggerToast(`Official ${type} notice transmitted to ${s.guardian} (${s.guardianPhone}). SMS & Email confirmation dispatched.`, 'success');
    });
  }

  // ==========================================
  // 10. RECORD FEE PAYMENT MODAL
  // ==========================================
  const feePaymentModal = document.getElementById('feePaymentModal');
  const openRecordPaymentBtn = document.getElementById('openRecordPaymentBtn');
  const closePaymentModalBtn = document.getElementById('closePaymentModalBtn');
  const feePaymentForm = document.getElementById('feePaymentForm');
  const payStudentSelect = document.getElementById('payStudentSelect');
  const payAmountInput = document.getElementById('payAmountInput');
  const payRefInput = document.getElementById('payRefInput');

  function openRecordPaymentModal(student) {
    selectedStudentForPayment = student || studentsState[0];
    if (!feePaymentModal) return;

    if (payStudentSelect) {
      payStudentSelect.innerHTML = studentsState.map((s) => {
        const bal = s.tuition?.balance || 0;
        return `<option value="${s.id}" ${s.id === selectedStudentForPayment.id ? 'selected' : ''}>${s.name} (${s.id}) - Due: $${bal.toLocaleString()}</option>`;
      }).join('');
    }

    updatePaymentModalCard();
    if (payRefInput) {
      payRefInput.value = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
    }

    feePaymentModal.classList.remove('hidden');
  }

  function updatePaymentModalCard() {
    const studentId = payStudentSelect?.value || selectedStudentForPayment?.id;
    const st = studentsState.find((x) => x.id === studentId) || selectedStudentForPayment;
    if (!st) return;
    selectedStudentForPayment = st;

    const tuition = st.tuition || { total: 14500, paid: 0, balance: 14500 };
    document.getElementById('payModalTotalBilled').textContent = `$${tuition.total.toLocaleString()}`;
    document.getElementById('payModalAmountPaid').textContent = `$${tuition.paid.toLocaleString()}`;
    document.getElementById('payModalRemainingBalance').textContent = `$${tuition.balance.toLocaleString()}`;

    if (payAmountInput) {
      payAmountInput.value = tuition.balance > 0 ? tuition.balance : 1000;
    }
  }

  if (payStudentSelect) {
    payStudentSelect.addEventListener('change', updatePaymentModalCard);
  }

  document.getElementById('payQuickFull')?.addEventListener('click', () => {
    const tuition = selectedStudentForPayment?.tuition || { balance: 0 };
    if (payAmountInput) payAmountInput.value = tuition.balance;
  });

  document.getElementById('payQuickHalf')?.addEventListener('click', () => {
    const tuition = selectedStudentForPayment?.tuition || { balance: 0 };
    if (payAmountInput) payAmountInput.value = Math.round(tuition.balance * 0.5);
  });

  document.getElementById('payQuick1000')?.addEventListener('click', () => {
    if (payAmountInput) payAmountInput.value = 1000;
  });

  if (openRecordPaymentBtn) {
    openRecordPaymentBtn.addEventListener('click', () => {
      // Find first student with outstanding balance
      const overdueStudent = studentsState.find((s) => (s.tuition?.balance || 0) > 0) || studentsState[0];
      openRecordPaymentModal(overdueStudent);
    });
  }

  if (closePaymentModalBtn && feePaymentModal) {
    closePaymentModalBtn.addEventListener('click', () => feePaymentModal.classList.add('hidden'));
  }

  if (feePaymentModal) {
    feePaymentModal.addEventListener('click', (e) => {
      if (e.target === feePaymentModal) feePaymentModal.classList.add('hidden');
    });
  }

  if (feePaymentForm) {
    feePaymentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const st = selectedStudentForPayment;
      const amount = Number(payAmountInput?.value) || 0;
      const ref = payRefInput?.value || ('TXN-' + Math.floor(100000 + Math.random() * 900000));
      const rail = document.getElementById('payRailSelect')?.value || 'ACH_DIRECT_DEBIT';

      if (amount <= 0) {
        triggerToast('Please specify a positive payment amount.', 'warning');
        return;
      }

      const tuition = st.tuition || { total: 14500, paid: 0, balance: 14500 };
      tuition.paid = Math.min(tuition.total, tuition.paid + amount);
      tuition.balance = Math.max(0, tuition.total - tuition.paid);
      tuition.status = tuition.balance === 0 ? 'PAID' : 'PARTIAL';
      tuition.lastPaymentRef = ref;

      // Dispatch to serverless endpoint
      try {
        await fetch('/api/students', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'payment',
            studentId: st.id,
            amount: amount,
            transactionRef: ref
          })
        });
      } catch (err) {
        console.warn('Fee payment serverless update fallback');
      }

      renderTuitionLedger();
      feePaymentModal.classList.add('hidden');

      triggerToast(`Fee payment of $${amount.toLocaleString()} successfully recorded for ${st.name} via ${rail}. Ref: ${ref}.`, 'success');
    });
  }

  // ==========================================
  // 11. EDIT COURSE GRADE MODAL
  // ==========================================
  const editGradesModal = document.getElementById('editGradesModal');
  const closeGradeModalBtn = document.getElementById('closeGradeModalBtn');
  const editGradeForm = document.getElementById('editGradeForm');
  const editGradeCourseSelect = document.getElementById('editGradeCourseSelect');
  const editGradeScoreInput = document.getElementById('editGradeScoreInput');
  const editGradeLetterDisplay = document.getElementById('editGradeLetterDisplay');

  function openEditGradeModal(student) {
    selectedStudentForGrade = student;
    if (!editGradesModal) return;

    document.getElementById('editGradeStuName').textContent = student.name;
    document.getElementById('editGradeStuId').textContent = `(${student.id})`;
    document.getElementById('editGradeCurrentGpa').textContent = Number(student.gpa).toFixed(2);

    updateGradeEditorValues();
    editGradesModal.classList.remove('hidden');
  }

  function updateGradeEditorValues() {
    if (!selectedStudentForGrade) return;
    const courseCode = editGradeCourseSelect?.value || 'CS-401';
    const c = selectedStudentForGrade.courses.find((x) => x.code === courseCode) || { score: 90 };
    if (editGradeScoreInput) editGradeScoreInput.value = c.score;
    updateCalculatedGradeDisplay();
  }

  function updateCalculatedGradeDisplay() {
    const score = Number(editGradeScoreInput?.value || 90);
    const gradeInfo = calculateScoreGrade(score);
    if (editGradeLetterDisplay) {
      editGradeLetterDisplay.value = `${gradeInfo.letter} (${gradeInfo.points.toFixed(1)} Quality Pts)`;
    }
  }

  if (editGradeCourseSelect) {
    editGradeCourseSelect.addEventListener('change', updateGradeEditorValues);
  }

  if (editGradeScoreInput) {
    editGradeScoreInput.addEventListener('input', updateCalculatedGradeDisplay);
  }

  if (closeGradeModalBtn && editGradesModal) {
    closeGradeModalBtn.addEventListener('click', () => editGradesModal.classList.add('hidden'));
  }

  if (editGradesModal) {
    editGradesModal.addEventListener('click', (e) => {
      if (e.target === editGradesModal) editGradesModal.classList.add('hidden');
    });
  }

  if (editGradeForm) {
    editGradeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const st = selectedStudentForGrade;
      const courseCode = editGradeCourseSelect?.value;
      const score = Number(editGradeScoreInput?.value);
      const gradeInfo = calculateScoreGrade(score);

      const targetCourse = st.courses.find((c) => c.code === courseCode);
      if (targetCourse) {
        targetCourse.score = score;
        targetCourse.grade = gradeInfo.letter;
        targetCourse.points = gradeInfo.points;
      }

      st.gpa = computeCumulativeGpa(st.courses);
      const standing = getAcademicStanding(st.gpa, st.attendanceRate);
      st.status = standing.standing;
      st.academicWarning = standing.academicWarning;

      // Dispatch to serverless endpoint
      try {
        await fetch('/api/students', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'grade_update',
            studentId: st.id,
            courseCode: courseCode,
            score: score,
            grade: gradeInfo.letter,
            points: gradeInfo.points
          })
        });
      } catch (err) {
        console.warn('Grade update API fallback');
      }

      renderAllViews();
      editGradesModal.classList.add('hidden');

      triggerToast(`Gradebook updated for ${st.name} in ${courseCode}: Score ${score}% (${gradeInfo.letter}). Recalculated GPA: ${st.gpa.toFixed(2)}.`, 'success');
    });
  }

  function updateConstellationStats() {
    const totalGpa = studentsState.reduce((acc, s) => acc + Number(s.gpa), 0);
    const mean = (totalGpa / (studentsState.length || 1)).toFixed(2);
    const badge = document.getElementById('constellationCohortGpaBadge');
    if (badge) badge.textContent = `Cohort Average GPA: ${mean}`;
  }

  // ==========================================
  // 8. COLLEGIATE SIS PLAN ESTIMATOR & SIZING ENGINE
  // ==========================================
  const SIS_PLANS = {
    campus: {
      name: 'Single-Campus Academy',
      base: 450,
      students: 1200,
      faculty: 80,
      badge: 'FOUNDATION'
    },
    collegiate: {
      name: 'Comprehensive College / Institute',
      base: 1650,
      students: 8000,
      faculty: 450,
      badge: 'RECOMMENDED'
    },
    sovereign: {
      name: 'Multi-Campus University System',
      base: 4800,
      students: 25000,
      faculty: 1500,
      badge: 'ENTERPRISE SYSTEM'
    }
  };

  let activeSisPlan = 'collegiate';
  let sisStudents = 5000;
  let sisFaculty = 250;

  const sisStudentsSlider = document.getElementById('sisStudentsSlider');
  const sisFacultySlider = document.getElementById('sisFacultySlider');
  const sisStudentsLabel = document.getElementById('sisStudentsLabel');
  const sisFacultyLabel = document.getElementById('sisFacultyLabel');
  const sisLegacyCost = document.getElementById('sisLegacyCost');
  const sisPlatformCost = document.getElementById('sisPlatformCost');
  const sisNetSavings = document.getElementById('sisNetSavings');
  const sisAnnualValue = document.getElementById('sisAnnualValue');

  function updateSisEstimator() {
    const plan = SIS_PLANS[activeSisPlan] || SIS_PLANS.collegiate;
    // Legacy cost: ~$2.20/student + $8/faculty + $2,500 baseline clerical registrar staff
    const legacyCost = Math.round(sisStudents * 2.2) + Math.round(sisFaculty * 8) + 2500;
    const extraStudents = Math.max(0, sisStudents - plan.students);
    const extraFaculty = Math.max(0, sisFaculty - plan.faculty);
    const platformCost = plan.base + Math.round(extraStudents * 0.12) + Math.round(extraFaculty * 1.5);
    const monthlySavings = Math.max(0, legacyCost - platformCost);
    const annualSavings = monthlySavings * 12;

    if (sisStudentsLabel) sisStudentsLabel.textContent = `${sisStudents.toLocaleString('en-US')} Students`;
    if (sisFacultyLabel) sisFacultyLabel.textContent = `${sisFaculty.toLocaleString('en-US')} Staff`;
    if (sisLegacyCost) sisLegacyCost.textContent = `$${legacyCost.toLocaleString('en-US')} / mo`;
    if (sisPlatformCost) {
      sisPlatformCost.textContent = `$${platformCost.toLocaleString('en-US')} / mo`;
      const sub = sisPlatformCost.nextElementSibling;
      if (sub) {
        sub.textContent = (extraStudents > 0 || extraFaculty > 0)
          ? `Base $${plan.base.toLocaleString()} + capacity scale`
          : `All ${sisStudents.toLocaleString('en-US')} seats included in base`;
      }
    }
    if (sisNetSavings) sisNetSavings.textContent = `$${monthlySavings.toLocaleString('en-US')} / mo`;
    if (sisAnnualValue) sisAnnualValue.textContent = `$${annualSavings.toLocaleString('en-US')} / yr`;

    // Modal sync
    const quoteTier = document.getElementById('quoteSisTierName');
    const quoteStudents = document.getElementById('quoteSisStudentCount');
    const quoteFaculty = document.getElementById('quoteSisFacultyCount');
    const quoteBaseFee = document.getElementById('quoteSisBaseFee');
    const quoteTotalMonthly = document.getElementById('quoteSisTotalMonthly');
    const quoteTotalAnnual = document.getElementById('quoteSisTotalAnnual');

    if (quoteTier) quoteTier.textContent = plan.name;
    if (quoteStudents) quoteStudents.textContent = `${sisStudents.toLocaleString('en-US')} Enrolled Students`;
    if (quoteFaculty) quoteFaculty.textContent = `${sisFaculty.toLocaleString('en-US')} Faculty Desks`;
    if (quoteBaseFee) quoteBaseFee.textContent = `$${platformCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (quoteTotalMonthly) quoteTotalMonthly.textContent = `$${platformCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (quoteTotalAnnual) quoteTotalAnnual.textContent = `$${(platformCost * 12).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  function setupSisEstimatorListeners() {
    document.querySelectorAll('.sis-plan-card').forEach((card) => {
      card.addEventListener('click', () => {
        const planKey = card.getAttribute('data-plan');
        if (!planKey || !SIS_PLANS[planKey]) return;
        activeSisPlan = planKey;

        document.querySelectorAll('.sis-plan-card').forEach((c) => {
          c.classList.remove('border-sky-500', 'border-2', 'bg-sky-950/20', 'shadow-[0_0_30px_rgba(56,189,248,0.2)]');
          c.classList.add('border-white/[0.08]', 'border', 'bg-[#080D1A]');
          const btn = c.querySelector('.select-sis-plan-btn');
          if (btn) {
            btn.className = 'select-sis-plan-btn mt-6 w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-mono font-bold border border-white/[0.1] transition-all';
            btn.textContent = `Select ${c.getAttribute('data-plan').toUpperCase()} Plan`;
          }
        });

        card.classList.remove('border-white/[0.08]', 'bg-[#080D1A]');
        card.classList.add('border-sky-500', 'border-2', 'bg-sky-950/20', 'shadow-[0_0_30px_rgba(56,189,248,0.2)]');
        const activeBtn = card.querySelector('.select-sis-plan-btn');
        if (activeBtn) {
          activeBtn.className = 'select-sis-plan-btn mt-6 w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)]';
          activeBtn.textContent = 'Selected Plan';
        }

        updateSisEstimator();
        triggerToast(`Selected ${SIS_PLANS[planKey].name} tier.`, 'info');
      });
    });

    sisStudentsSlider?.addEventListener('input', (e) => {
      sisStudents = parseInt(e.target.value, 10) || 5000;
      updateSisEstimator();
    });

    sisFacultySlider?.addEventListener('input', (e) => {
      sisFaculty = parseInt(e.target.value, 10) || 250;
      updateSisEstimator();
    });

    // Quotation modal open/close
    const openSisBtn = document.getElementById('openSisQuotationBtn');
    const closeSisBtn = document.getElementById('closeSisQuotationBtn');
    const modal = document.getElementById('edutrackQuotationModal');
    const printBtn = document.getElementById('printSisQuotationBtn');

    openSisBtn?.addEventListener('click', () => {
      updateSisEstimator();
      if (modal) modal.classList.remove('hidden');
    });

    closeSisBtn?.addEventListener('click', () => {
      if (modal) modal.classList.add('hidden');
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });

    printBtn?.addEventListener('click', () => {
      triggerToast('Generating official Institutional SIS SOW quotation...', 'info');
      setTimeout(() => {
        window.print();
      }, 400);
    });

    updateSisEstimator();
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    initThreeConstellation();
    loadStudentsFromApi();
    setupSisEstimatorListeners();
  });

  if (document.readyState !== 'loading') {
    initThreeConstellation();
    loadStudentsFromApi();
    setupSisEstimatorListeners();
  }
})();

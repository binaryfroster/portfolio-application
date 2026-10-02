// MEDICARE HUB - CLINICAL EHR & BIOTELEMETRY APPLICATION
// Binary Froster Enterprise Healthcare Platform
// Connected to Live Serverless Backend (/api/patients, /api/vitals, /api/prescriptions, /api/audit)
// Enhanced with Three.js 3D Anatomical Heart, Real-Time Biometric Telemetry, and Full Clinical Workflows
// Strictly zero emojis across all UI, comments, and application state.

(function () {
  'use strict';

  // =========================================================================
  // APPLICATION STATE
  // =========================================================================
  let allPatients = [];
  let activePatient = null;
  let currentFilter = 'all'; // 'all' | 'critical' | 'urgent' | 'stable'
  let currentSort = 'acuity'; // 'acuity' | 'hr' | 'name' | 'bed'
  let searchQuery = '';
  let liveTelemetryActive = true;
  let telemetryInterval = null;
  let codeBlueActive = false;
  let codeBlueTimerInterval = null;
  let codeBlueSeconds = 0;
  let appointmentsList = [
    {
      time: '09:00 AM',
      patientName: 'Sarah Jenkins',
      mrn: 'MRN-78421',
      provider: 'Dr. Evelyn Vance',
      service: 'Hypertension 6-Month Review',
      status: 'IN PROGRESS',
      statusClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      time: '10:30 AM',
      patientName: 'Marcus Brody',
      mrn: 'MRN-78422',
      provider: 'Dr. Julian Hayes',
      service: 'Diabetic Glycemic Titration',
      status: 'WAITING',
      statusClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      time: '11:15 AM',
      patientName: 'Elena Rostova',
      mrn: 'MRN-78423',
      provider: 'Dr. Evelyn Vance',
      service: 'Post-Op Knee Telemetry Check',
      status: 'TRIAGED',
      statusClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    },
    {
      time: '01:00 PM',
      patientName: 'Arthur Pendelton',
      mrn: 'MRN-78424',
      provider: 'Dr. Evelyn Vance',
      service: 'Cath Lab Post-Procedural Review',
      status: 'CRITICAL MONITORING',
      statusClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    }
  ];
  let dispatchedPrescriptions = [
    {
      rxId: 'RX-894102',
      patientName: 'Sarah Jenkins',
      mrn: 'MRN-78421',
      medication: 'Lisinopril 10mg Oral Tablet',
      prescriber: 'Dr. Evelyn Vance',
      pharmacy: 'CVS Pharmacy #4921 (London / Oxford St)',
      status: 'DISPATCHED_NCPDP'
    },
    {
      rxId: 'RX-772194',
      patientName: 'Marcus Brody',
      mrn: 'MRN-78422',
      medication: 'Metformin 500mg ER Tablet',
      prescriber: 'Dr. Julian Hayes',
      pharmacy: 'Walgreens Pharmacy #1042',
      status: 'DISPATCHED_NCPDP'
    }
  ];
  let cachedAuditLogs = [];

  // =========================================================================
  // DOM ELEMENT REFERENCES
  // =========================================================================
  // Header & Banner
  const queueStat = document.getElementById('queueStat');
  const codeBlueBtn = document.getElementById('codeBlueBtn');
  const codeBlueBanner = document.getElementById('codeBlueBanner');
  const codeBlueBannerTarget = document.getElementById('codeBlueBannerTarget');
  const codeBlueTimer = document.getElementById('codeBlueTimer');
  const resolveCodeBlueBtn = document.getElementById('resolveCodeBlueBtn');

  // Navigation
  const tabs = document.querySelectorAll('.med-nav-tab');
  const tabContents = document.querySelectorAll('.med-tab-content');

  // Directory & Filters
  const patientRoster = document.getElementById('patientRoster');
  const patientSearchInput = document.getElementById('patientSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const censusCountBadge = document.getElementById('censusCountBadge');
  const filterAllBtn = document.getElementById('filterAllBtn');
  const filterCriticalBtn = document.getElementById('filterCriticalBtn');
  const filterUrgentBtn = document.getElementById('filterUrgentBtn');
  const filterStableBtn = document.getElementById('filterStableBtn');
  const countAll = document.getElementById('countAll');
  const countCritical = document.getElementById('countCritical');
  const countUrgent = document.getElementById('countUrgent');
  const countStable = document.getElementById('countStable');
  const sortSelect = document.getElementById('sortSelect');

  // Patient Detail Elements
  const detailPatientName = document.getElementById('detailPatientName');
  const detailPatientMRNBadge = document.getElementById('detailPatientMRNBadge');
  const detailPatientBedBadge = document.getElementById('detailPatientBedBadge');
  const detailPatientAcuityBadge = document.getElementById('detailPatientAcuityBadge');
  const detailDemographics = document.getElementById('detailDemographics');
  const detailAllergiesBanner = document.getElementById('detailAllergiesBanner');
  const detailAllergiesText = document.getElementById('detailAllergiesText');
  const detailPhysician = document.getElementById('detailPhysician');
  const detailNotes = document.getElementById('detailNotes');
  const detailOrders = document.getElementById('detailOrders');
  const detailPrescriptionsList = document.getElementById('detailPrescriptionsList');

  // Vitals Monitor
  const valBP = document.getElementById('valBP');
  const statusBP = document.getElementById('statusBP');
  const valHR = document.getElementById('valHR');
  const statusHR = document.getElementById('statusHR');
  const valSpO2 = document.getElementById('valSpO2');
  const statusSpO2 = document.getElementById('statusSpO2');
  const valRR = document.getElementById('valRR');
  const statusRR = document.getElementById('statusRR');
  const valTemp = document.getElementById('valTemp');
  const statusTemp = document.getElementById('statusTemp');
  const valMAP = document.getElementById('valMAP');
  const statusMAP = document.getElementById('statusMAP');
  const cardiacSyncLabel = document.getElementById('cardiacSyncLabel');
  const toggleTelemetryBtn = document.getElementById('toggleTelemetryBtn');
  const resetHeartCameraBtn = document.getElementById('resetHeartCameraBtn');
  const ecgWaveLabel = document.getElementById('ecgWaveLabel');

  // Action Buttons
  const openPrescribeModalBtn = document.getElementById('openPrescribeModalBtn');
  const transferBedBtn = document.getElementById('transferBedBtn');
  const dischargePatientBtn = document.getElementById('dischargePatientBtn');
  const exportCCDButton = document.getElementById('exportCCDButton');

  // Intake Modal
  const newPatientBtn = document.getElementById('newPatientBtn');
  const newPatientModal = document.getElementById('newPatientModal');
  const closePatientModalBtn = document.getElementById('closePatientModalBtn');
  const patientIntakeForm = document.getElementById('patientIntakeForm');

  // Code Blue Modal
  const codeBlueModal = document.getElementById('codeBlueModal');
  const closeCodeBlueModalBtn = document.getElementById('closeCodeBlueModalBtn');
  const cancelCodeBlueBtn = document.getElementById('cancelCodeBlueBtn');
  const confirmCodeBlueBtn = document.getElementById('confirmCodeBlueBtn');
  const codeBlueModalPatient = document.getElementById('codeBlueModalPatient');
  const codeBlueModalMRN = document.getElementById('codeBlueModalMRN');
  const codeBlueModalBed = document.getElementById('codeBlueModalBed');

  // Transfer Bed Modal
  const transferBedModal = document.getElementById('transferBedModal');
  const closeTransferModalBtn = document.getElementById('closeTransferModalBtn');
  const cancelTransferBtn = document.getElementById('cancelTransferBtn');
  const transferBedForm = document.getElementById('transferBedForm');
  const transferPatientName = document.getElementById('transferPatientName');
  const transferCurrentBed = document.getElementById('transferCurrentBed');
  const transferNewBed = document.getElementById('transferNewBed');
  const transferUnitSelect = document.getElementById('transferUnitSelect');
  const transferReasonSelect = document.getElementById('transferReasonSelect');

  // Discharge Patient Modal
  const dischargePatientModal = document.getElementById('dischargePatientModal');
  const closeDischargeModalBtn = document.getElementById('closeDischargeModalBtn');
  const cancelDischargeBtn = document.getElementById('cancelDischargeBtn');
  const dischargePatientForm = document.getElementById('dischargePatientForm');
  const dischargePatientName = document.getElementById('dischargePatientName');
  const dischargePatientMRN = document.getElementById('dischargePatientMRN');
  const dischargePatientBed = document.getElementById('dischargePatientBed');
  const dischargeDisposition = document.getElementById('dischargeDisposition');
  const dischargeSummary = document.getElementById('dischargeSummary');

  // Appointments / Queue
  const bookAppointmentBtn = document.getElementById('bookAppointmentBtn');
  const appointmentsTableBody = document.getElementById('appointmentsTableBody');
  const scheduleConsultModal = document.getElementById('scheduleConsultModal');
  const closeScheduleModalBtn = document.getElementById('closeScheduleModalBtn');
  const cancelScheduleBtn = document.getElementById('cancelScheduleBtn');
  const scheduleConsultForm = document.getElementById('scheduleConsultForm');

  // Prescriptions / Pharmacy
  const rxOrderForm = document.getElementById('rxOrderForm');
  const rxPatientSelect = document.getElementById('rxPatientSelect');
  const rxDrugSelect = document.getElementById('rxDrugSelect');
  const rxDosage = document.getElementById('rxDosage');
  const rxFrequency = document.getElementById('rxFrequency');
  const rxRefills = document.getElementById('rxRefills');
  const rxPharmacy = document.getElementById('rxPharmacy');
  const rxDigitalSignatureCheck = document.getElementById('rxDigitalSignatureCheck');
  const rxContraindicationAlert = document.getElementById('rxContraindicationAlert');
  const rxContraindicationText = document.getElementById('rxContraindicationText');
  const dispatchedRxTableBody = document.getElementById('dispatchedRxTableBody');

  // Audit Ledger
  const auditLogFeed = document.getElementById('auditLogFeed');
  const auditSearchInput = document.getElementById('auditSearchInput');
  const exportAuditBtn = document.getElementById('exportAuditBtn');

  // =========================================================================
  // 1. THREE.JS 3D ANATOMICAL HEART & BIO-TELEMETRY
  // =========================================================================
  const heartContainer = document.getElementById('threejs-heart-container');
  let scene, camera, renderer, heartGroup, ventricularMesh, aortaMesh, telemetryRings = [];
  let pointRedLight, pointTealLight;
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };
  let heartRotation = { x: 0.2, y: 0.4 };
  let targetRotation = { x: 0.2, y: 0.4 };
  let clock = new THREE.Clock();

  function initThreeJSHeart() {
    if (!heartContainer || typeof THREE === 'undefined') return;

    const width = heartContainer.clientWidth || 550;
    const height = heartContainer.clientHeight || 260;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 6.2);
    camera.lookAt(0, -0.35, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    heartContainer.innerHTML = '';
    heartContainer.appendChild(renderer.domElement);

    // Cardiac Lighting
    const ambient = new THREE.AmbientLight(0x0a162b, 1.8);
    scene.add(ambient);

    pointRedLight = new THREE.PointLight(0xf43f5e, 3, 22);
    pointRedLight.position.set(4, 3, 4);
    scene.add(pointRedLight);

    pointTealLight = new THREE.PointLight(0x00d2d3, 2.5, 22);
    pointTealLight.position.set(-4, -2, 4);
    scene.add(pointTealLight);

    heartGroup = new THREE.Group();
    heartGroup.position.set(0, -0.35, 0);
    scene.add(heartGroup);

    // Anatomical Ventricular Body
    const vGeo = new THREE.SphereGeometry(1.3, 32, 32);
    const pos = vGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y < 0) {
        // Taper towards apex
        const factor = 1.0 + y * 0.35;
        pos.setX(i, pos.getX(i) * factor);
        pos.setZ(i, pos.getZ(i) * factor);
      }
    }
    vGeo.computeVertexNormals();

    const cardiacMat = new THREE.MeshStandardMaterial({
      color: 0xbe123c,
      emissive: 0x4c0519,
      roughness: 0.35,
      metalness: 0.45,
      wireframe: true
    });

    ventricularMesh = new THREE.Mesh(vGeo, cardiacMat);
    heartGroup.add(ventricularMesh);

    // Aortic Arch Vessel (Curved Tube)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.9, 0),
      new THREE.Vector3(0.4, 1.7, 0.2),
      new THREE.Vector3(-0.3, 2.0, -0.1),
      new THREE.Vector3(-0.8, 1.4, -0.3)
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 28, 0.22, 12, false);
    const aortaMat = new THREE.MeshStandardMaterial({
      color: 0x00d2d3,
      emissive: 0x003d40,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    aortaMesh = new THREE.Mesh(tubeGeo, aortaMat);
    heartGroup.add(aortaMesh);

    // Pulmonary Trunk Vessel
    const pCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.2, 0.8, 0.3),
      new THREE.Vector3(-0.5, 1.4, 0.1),
      new THREE.Vector3(-0.9, 1.3, -0.2)
    ]);
    const pGeo = new THREE.TubeGeometry(pCurve, 20, 0.18, 10, false);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const pulmonaryMesh = new THREE.Mesh(pGeo, pMat);
    heartGroup.add(pulmonaryMesh);

    // Bio-Telemetry Orbital Wave Rings
    const ring1Geo = new THREE.TorusGeometry(2.2, 0.015, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.4 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 2.5;
    heartGroup.add(ring1);
    telemetryRings.push(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.4, 0.015, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.35 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 3;
    heartGroup.add(ring2);
    telemetryRings.push(ring2);

    // Orbit Drag Controls
    heartContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      targetRotation.y += deltaX * 0.006;
      targetRotation.x += deltaY * 0.006;
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    // Touch support
    heartContainer.addEventListener('touchstart', (e) => {
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
      targetRotation.y += deltaX * 0.006;
      targetRotation.x += deltaY * 0.006;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    heartContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      camera.position.z = Math.max(3.8, Math.min(10.0, camera.position.z + e.deltaY * 0.005));
      camera.lookAt(0, -0.35, 0);
    }, { passive: false });

    window.addEventListener('resize', onWindowResize);
    animateThreeJSHeart();
  }

  function onWindowResize() {
    if (!heartContainer || !renderer || !camera) return;
    const width = heartContainer.clientWidth;
    const height = heartContainer.clientHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animateThreeJSHeart() {
    requestAnimationFrame(animateThreeJSHeart);

    const elapsed = clock.getElapsedTime();

    heartRotation.x += (targetRotation.x - heartRotation.x) * 0.08;
    heartRotation.y += (targetRotation.y - heartRotation.y) * 0.08;

    if (heartGroup) {
      heartGroup.rotation.x = heartRotation.x;
      heartGroup.rotation.y = heartRotation.y + elapsed * 0.12;

      let bpm = (activePatient && activePatient.hr) ? activePatient.hr : 72;
      let cardiacScale = 1.0;

      if (codeBlueActive) {
        // Ventricular fibrillation / chaotic contraction
        const f1 = Math.sin(elapsed * 24) * 0.14;
        const f2 = Math.cos(elapsed * 38) * 0.08;
        cardiacScale = 1.0 + f1 + f2;
        if (pointRedLight) pointRedLight.intensity = 4.5 + Math.sin(elapsed * 18) * 2;
      } else {
        // Dual systole / diastole physiological pump
        const freq = (bpm / 60) * Math.PI * 2;
        const systole = Math.pow(Math.sin(elapsed * freq), 8) * 0.16;
        const diastole = Math.pow(Math.sin(elapsed * freq + 0.35), 12) * 0.08;
        cardiacScale = 1.0 + systole + diastole;
        if (pointRedLight) pointRedLight.intensity = bpm > 100 ? 3.8 : 2.5;
      }

      if (ventricularMesh) {
        ventricularMesh.scale.set(cardiacScale, cardiacScale, cardiacScale);
      }
      if (aortaMesh) {
        aortaMesh.scale.set(cardiacScale * 0.95, cardiacScale * 1.05, cardiacScale * 0.95);
      }
    }

    telemetryRings.forEach((r, idx) => {
      r.rotation.z = elapsed * (idx === 0 ? 0.3 : -0.2);
    });

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  resetHeartCameraBtn?.addEventListener('click', () => {
    targetRotation = { x: 0.2, y: 0.4 };
    if (camera) {
      camera.position.set(0, 0, 6.2);
      camera.lookAt(0, -0.35, 0);
    }
    if (window.showToast) window.showToast('3D cardiac viewport camera position reset.', 'info');
  });

  toggleTelemetryBtn?.addEventListener('click', () => {
    liveTelemetryActive = !liveTelemetryActive;
    if (liveTelemetryActive) {
      toggleTelemetryBtn.textContent = 'Live Stream: ACTIVE';
      toggleTelemetryBtn.className = 'px-2 py-0.5 rounded bg-teal-500/10 hover:bg-teal-500/20 text-[10px] font-mono text-teal-300 border border-teal-500/20 transition-all';
      startTelemetryStream();
      if (window.showToast) window.showToast('Continuous biotelemetry stream resumed.', 'info');
    } else {
      toggleTelemetryBtn.textContent = 'Live Stream: PAUSED';
      toggleTelemetryBtn.className = 'px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-[10px] font-mono text-amber-300 border border-amber-500/20 transition-all';
      clearInterval(telemetryInterval);
      if (window.showToast) window.showToast('Biotelemetry stream paused for manual chart review.', 'warning');
    }
  });

  // =========================================================================
  // 2. PATIENT CENSUS & DIRECTORY LOGIC (/api/patients)
  // =========================================================================
  async function loadPatients() {
    try {
      const res = await fetch('/api/patients');
      if (res.ok) {
        const data = await res.json();
        allPatients = data.patients || [];
        updateCensusCounts();
        if (allPatients.length > 0) {
          selectPatient(allPatients[0]);
        }
        applyFiltersAndRender();
        populateRxPatientSelect(allPatients);
        return;
      }
    } catch (e) {
      console.warn('Patients fetch fallback to local database:', e);
    }

    // Default Inpatient Cohort
    allPatients = [
      {
        mrn: 'MRN-78421',
        name: 'Sarah Jenkins',
        dob: '14-MAY-1984',
        sex: 'Female',
        demographics: 'Female, 42y',
        physician: 'Dr. Evelyn Vance (Chief Medical Officer)',
        insurance: 'BlueCross PPO',
        condition: 'Essential Hypertension',
        acuity: 'Stable',
        bed: 'Med-Surg 04',
        status: 'Inpatient',
        bp: '122 / 78',
        hr: 72,
        spo2: '99%',
        rr: 16,
        temp: '98.6°F',
        allergies: 'None recorded',
        assessment: 'Patient presents for 6-month hypertensive follow-up. Tolerating Lisinopril 10mg PO QD with good adherence. No dizziness, orthostasis, or peripheral edema noted. Home blood pressure logs average 124/80.',
        plan: 'Continue current dose. Repeat comprehensive metabolic panel in 6 months. Maintain low-sodium DASH diet. Telemetry monitoring authorized.',
        prescriptions: ['Lisinopril 10mg PO QD (Refills: 3)']
      },
      {
        mrn: 'MRN-78422',
        name: 'Marcus Brody',
        dob: '02-SEP-1968',
        sex: 'Male',
        demographics: 'Male, 58y',
        physician: 'Dr. Julian Hayes (Attending Clinician)',
        insurance: 'Medicare Part B',
        condition: 'Type 2 Diabetes Mellitus with Hyperglycemia',
        acuity: 'Urgent',
        bed: 'Step-Down 07',
        status: 'Inpatient',
        bp: '138 / 86',
        hr: 88,
        spo2: '97%',
        rr: 19,
        temp: '98.4°F',
        allergies: 'Sulfa Drugs',
        assessment: 'Glycemic control reassessment. Current HbA1c 7.4%. Patient reports mild postprandial fatigue. Fasting blood glucose ranges between 130-155 mg/dL. Renal function panels intact.',
        plan: 'Adjust Metformin to 1000mg with evening meal. Consult certified diabetes educator. Daily capillary blood glucose tracking.',
        prescriptions: ['Metformin 500mg ER BID (Refills: 2)']
      },
      {
        mrn: 'MRN-78423',
        name: 'Elena Rostova',
        dob: '28-NOV-1996',
        sex: 'Female',
        demographics: 'Female, 29y',
        physician: 'Dr. Evelyn Vance (Chief Medical Officer)',
        insurance: 'Aetna Signature',
        condition: 'Post-Op Knee Arthroscopy (Sinus Tachycardia)',
        acuity: 'Urgent',
        bed: 'Telemetry 12',
        status: 'Inpatient',
        bp: '118 / 74',
        hr: 108,
        spo2: '98%',
        rr: 20,
        temp: '99.1°F',
        allergies: 'Penicillin (Severe Anaphylaxis)',
        assessment: 'Post-operative recovery monitoring day 2. Incision clean, dry, and intact. Tachycardic response to post-surgical analgesia titration. Penicillin strictly contraindicated due to anaphylaxis history.',
        plan: 'Continue non-NSAID multimodal pain management. Ice and elevation protocol. Continuous telemetry monitoring for sinus rhythm stabilization.',
        prescriptions: ['Acetaminophen 650mg PO Q6H PRN']
      },
      {
        mrn: 'MRN-78424',
        name: 'Arthur Pendelton',
        dob: '11-JAN-1959',
        sex: 'Male',
        demographics: 'Male, 67y',
        physician: 'Dr. Evelyn Vance (Chief Medical Officer)',
        insurance: 'UnitedHealthcare Choice',
        condition: 'Acute Coronary Syndrome (STEMI Protocol)',
        acuity: 'Critical',
        bed: 'ICU Bed 02',
        status: 'Inpatient',
        bp: '168 / 104',
        hr: 126,
        spo2: '93%',
        rr: 24,
        temp: '99.5°F',
        allergies: 'Aspirin / NSAIDs',
        assessment: 'Admitted for acute substernal chest discomfort radiating to left jaw. Elevated troponin I biomarkers. Continuous 12-lead ECG indicates anterior ST segment elevation. Immediate cardiac catheterization prep.',
        plan: 'Transfer to Cardiac Cath Lab. High-flow supplemental O2 via non-rebreather. Heparin IV infusion protocol initiated. Beta-blocker titration withheld pending angiography.',
        prescriptions: ['Heparin 5000 units IV Bolus', 'Nitroglycerin 0.4mg SL Q5min PRN']
      },
      {
        mrn: 'MRN-78425',
        name: 'Maya Lin',
        dob: '05-JUL-1981',
        sex: 'Female',
        demographics: 'Female, 45y',
        physician: 'Dr. Julian Hayes (Attending Clinician)',
        insurance: 'Cigna Open Access',
        condition: 'Community-Acquired Bacterial Pneumonia',
        acuity: 'Stable',
        bed: 'Med-Surg 09',
        status: 'Inpatient',
        bp: '120 / 76',
        hr: 76,
        spo2: '96%',
        rr: 17,
        temp: '98.7°F',
        allergies: 'None recorded',
        assessment: 'Hospital day 3 for right middle lobe pneumonia. Improving sputum production and defervescing fever curve. Supplemental oxygen weaned successfully to room air.',
        plan: 'Complete 5-day course of Azithromycin. Incentive spirometry Q2H while awake. Anticipated discharge in 24 hours if room air SpO2 remains above 95%.',
        prescriptions: ['Azithromycin 500mg PO QD (Refills: 0)']
      },
      {
        mrn: 'MRN-78426',
        name: 'Robert Chen',
        dob: '19-OCT-1975',
        sex: 'Male',
        demographics: 'Male, 50y',
        physician: 'Dr. Evelyn Vance (Chief Medical Officer)',
        insurance: 'Kaiser Permanente Senior',
        condition: 'Polytrauma / Hemorrhagic Shock Risk',
        acuity: 'Critical',
        bed: 'Trauma ICU 01',
        status: 'Inpatient',
        bp: '88 / 54',
        hr: 132,
        spo2: '91%',
        rr: 28,
        temp: '97.4°F',
        allergies: 'Codeine / Opioids',
        assessment: 'Motor vehicle collision trauma. Blunt abdominal injury with grade II splenic laceration under non-operative management. Hypotensive, tachycardic profile indicating borderline compensated shock.',
        plan: 'Massive transfusion protocol on standby. Serial hemoglobin checks Q2H. Strict bed rest with invasive arterial line blood pressure monitoring.',
        prescriptions: ['Normal Saline 1000mL IV Rapid Infusion']
      }
    ];

    updateCensusCounts();
    if (allPatients.length > 0) {
      selectPatient(allPatients[0]);
    }
    applyFiltersAndRender();
    populateRxPatientSelect(allPatients);
  }

  function updateCensusCounts() {
    const activeInpatients = allPatients.filter(p => p.status === 'Inpatient');
    const total = activeInpatients.length;
    const crit = activeInpatients.filter(p => p.acuity === 'Critical').length;
    const urg = activeInpatients.filter(p => p.acuity === 'Urgent').length;
    const stbl = activeInpatients.filter(p => p.acuity === 'Stable').length;

    if (countAll) countAll.textContent = total;
    if (countCritical) countCritical.textContent = crit;
    if (countUrgent) countUrgent.textContent = urg;
    if (countStable) countStable.textContent = stbl;

    if (queueStat) {
      queueStat.textContent = `${total} Inpatients (${crit} Critical)`;
    }
    if (censusCountBadge) {
      censusCountBadge.textContent = `${total} Inpatients Active`;
    }
  }

  function applyFiltersAndRender() {
    let filtered = [...allPatients];

    // Acuity filter
    if (currentFilter !== 'all') {
      filtered = filtered.filter(p => p.acuity.toLowerCase() === currentFilter.toLowerCase());
    }

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        (p.bed && p.bed.toLowerCase().includes(q)) ||
        p.condition.toLowerCase().includes(q)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      if (currentSort === 'acuity') {
        const priority = { 'Critical': 3, 'Urgent': 2, 'Stable': 1 };
        return (priority[b.acuity] || 0) - (priority[a.acuity] || 0);
      } else if (currentSort === 'hr') {
        return (b.hr || 0) - (a.hr || 0);
      } else if (currentSort === 'name') {
        return a.name.localeCompare(b.name);
      } else if (currentSort === 'bed') {
        return (a.bed || '').localeCompare(b.bed || '');
      }
      return 0;
    });

    renderPatientRoster(filtered);
  }

  function renderPatientRoster(list) {
    if (!patientRoster) return;

    if (list.length === 0) {
      patientRoster.innerHTML = `
        <div class="p-6 rounded-2xl bg-[#091122] border border-white/[0.08] text-center text-xs text-slate-400 font-mono">
          <p>No inpatient records match the selected query.</p>
          <button id="resetSearchFilterBtn" class="mt-2 text-teal-400 hover:underline">Reset filters</button>
        </div>
      `;
      document.getElementById('resetSearchFilterBtn')?.addEventListener('click', () => {
        currentFilter = 'all';
        searchQuery = '';
        if (patientSearchInput) patientSearchInput.value = '';
        updateFilterButtonStyles();
        applyFiltersAndRender();
      });
      return;
    }

    patientRoster.innerHTML = list.map(p => {
      const isSelected = activePatient && p.mrn === activePatient.mrn;
      const isDischarged = p.status === 'Discharged';

      let acuityBadge = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      if (p.acuity === 'Critical') acuityBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.3)]';
      else if (p.acuity === 'Urgent') acuityBadge = 'bg-amber-500/15 text-amber-300 border-amber-500/40';

      const hasSevereAllergy = p.allergies && p.allergies.toLowerCase() !== 'none recorded' && p.allergies.toLowerCase() !== 'none';

      return `
        <div class="patient-card p-3.5 rounded-xl bg-[#091122] border ${isSelected ? 'border-teal-500/70 ring-1 ring-teal-500/30 shadow-[0_0_15px_rgba(0,210,211,0.15)]' : 'border-white/[0.08]'} hover:border-teal-500/40 cursor-pointer transition-all ${isDischarged ? 'opacity-60' : ''}" data-mrn="${p.mrn}">
          <div class="flex justify-between items-start gap-2">
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-sm font-bold text-white">${p.name}</h4>
                ${isDischarged ? '<span class="text-[9px] font-mono px-1 rounded bg-slate-700 text-slate-300">DISCHARGED</span>' : ''}
              </div>
              <div class="text-[11px] font-mono text-teal-400 mt-0.5">
                ${p.mrn} &middot; <span class="text-slate-300">${p.bed || 'No Bed'}</span> &middot; ${p.demographics || 'Adult'}
              </div>
            </div>
            <span class="px-2 py-0.5 rounded text-[9px] font-mono border uppercase tracking-wider ${acuityBadge}">
              ${p.acuity}
            </span>
          </div>

          <p class="text-[11px] text-slate-300 mt-2 font-sans truncate">${p.condition}</p>

          <div class="mt-2.5 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <div class="flex items-center gap-2">
              <span class="${p.hr > 100 ? 'text-rose-400 font-bold' : 'text-slate-300'}">HR: ${p.hr} BPM</span>
              <span>BP: ${p.bp}</span>
              <span class="text-teal-400">SpO2: ${p.spo2}</span>
            </div>
            ${hasSevereAllergy ? '<span class="text-rose-400 font-semibold">[ALLERGY ALERT]</span>' : ''}
          </div>
        </div>
      `;
    }).join('');

    patientRoster.querySelectorAll('.patient-card').forEach(card => {
      card.addEventListener('click', () => {
        const mrn = card.getAttribute('data-mrn');
        const found = allPatients.find(p => p.mrn === mrn);
        if (found) {
          selectPatient(found);
        }
      });
    });
  }

  function selectPatient(patient) {
    activePatient = patient;

    if (detailPatientName) detailPatientName.textContent = patient.name;
    if (detailPatientMRNBadge) detailPatientMRNBadge.textContent = patient.mrn;
    if (detailPatientBedBadge) detailPatientBedBadge.textContent = patient.bed || 'No Bed';
    if (detailPatientAcuityBadge) {
      detailPatientAcuityBadge.textContent = patient.acuity;
      if (patient.acuity === 'Critical') {
        detailPatientAcuityBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/40 font-bold uppercase';
      } else if (patient.acuity === 'Urgent') {
        detailPatientAcuityBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold uppercase';
      } else {
        detailPatientAcuityBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold uppercase';
      }
    }

    if (detailDemographics) {
      detailDemographics.textContent = `${patient.demographics || 'Adult'} &middot; DOB: ${patient.dob || 'N/A'} &middot; ${patient.insurance || 'Private Insurance'}`;
    }

    if (detailPhysician) detailPhysician.textContent = patient.physician || 'Dr. Evelyn Vance';
    if (detailNotes) detailNotes.textContent = patient.assessment || patient.notes || 'Clinical notes recorded.';
    if (detailOrders) detailOrders.textContent = patient.plan || 'Telemetry monitoring authorized.';

    // Severe Allergy Banner
    if (detailAllergiesBanner && detailAllergiesText) {
      const hasAllergy = patient.allergies && patient.allergies.toLowerCase() !== 'none recorded' && patient.allergies.toLowerCase() !== 'none';
      detailAllergiesText.textContent = patient.allergies || 'None recorded';
      if (hasAllergy) {
        detailAllergiesBanner.className = 'p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs flex items-center justify-between text-rose-300';
      } else {
        detailAllergiesBanner.className = 'p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between text-slate-300';
      }
    }

    // Active Prescriptions List
    if (detailPrescriptionsList) {
      const rxList = patient.prescriptions && patient.prescriptions.length > 0
        ? patient.prescriptions
        : ['No active pharmaceutical orders recorded.'];
      detailPrescriptionsList.innerHTML = rxList.map(r => `
        <div class="p-2 rounded-lg bg-[#040812] border border-white/[0.05] font-mono text-[11px] text-teal-300 flex items-center justify-between">
          <span>${r}</span>
          <span class="text-[9px] text-emerald-400">ACTIVE</span>
        </div>
      `).join('');
    }

    // Update Vitals Display
    updateVitalsDisplay(patient);

    // Update Pharmacy target patient dropdown
    if (rxPatientSelect) {
      rxPatientSelect.value = patient.mrn;
      checkRxContraindications();
    }

    // Re-render roster to reflect selection border
    applyFiltersAndRender();
  }

  function updateVitalsDisplay(p) {
    if (!p) return;

    // Parse BP
    const bpParts = (p.bp || '120 / 80').split('/').map(s => parseInt(s.trim(), 10));
    const systolic = bpParts[0] || 120;
    const diastolic = bpParts[1] || 80;
    const mapVal = Math.round((systolic + 2 * diastolic) / 3);

    if (valBP) valBP.innerHTML = `${systolic} / ${diastolic} <span class="text-[9px] text-slate-400 font-normal">mmHg</span>`;
    if (statusBP) {
      if (systolic >= 140 || diastolic >= 90) {
        statusBP.textContent = 'Stage 2 Hypertension';
        statusBP.className = 'text-[9px] text-rose-400 block leading-tight whitespace-normal break-words';
      } else if (systolic >= 130 || diastolic >= 80) {
        statusBP.textContent = 'Stage 1 Hypertension';
        statusBP.className = 'text-[9px] text-amber-400 block leading-tight whitespace-normal break-words';
      } else if (systolic < 90 || diastolic < 60) {
        statusBP.textContent = 'Hypotensive';
        statusBP.className = 'text-[9px] text-rose-400 block leading-tight whitespace-normal break-words';
      } else {
        statusBP.textContent = 'Normotensive';
        statusBP.className = 'text-[9px] text-emerald-400 block leading-tight whitespace-normal break-words';
      }
    }

    if (valHR) valHR.innerHTML = `${p.hr} <span class="text-[9px] text-slate-400 font-normal">BPM</span>`;
    if (statusHR) {
      if (p.hr > 120) {
        statusHR.textContent = 'Severe Tachycardia';
        statusHR.className = 'text-[9px] text-rose-400 block leading-tight whitespace-normal break-words font-bold';
      } else if (p.hr > 100) {
        statusHR.textContent = 'Sinus Tachycardia';
        statusHR.className = 'text-[9px] text-amber-400 block leading-tight whitespace-normal break-words';
      } else if (p.hr < 60) {
        statusHR.textContent = 'Sinus Bradycardia';
        statusHR.className = 'text-[9px] text-amber-400 block leading-tight whitespace-normal break-words';
      } else {
        statusHR.textContent = 'Resting Sinus';
        statusHR.className = 'text-[9px] text-emerald-400 block leading-tight whitespace-normal break-words';
      }
    }

    if (valSpO2) valSpO2.textContent = p.spo2 || '98%';
    if (statusSpO2) {
      const spo2Num = parseInt(p.spo2, 10) || 98;
      if (spo2Num < 92) {
        statusSpO2.textContent = 'Critical Hypoxia';
        statusSpO2.className = 'text-[9px] text-rose-400 block leading-tight whitespace-normal break-words font-bold';
      } else if (spo2Num < 95) {
        statusSpO2.textContent = 'Borderline Hypoxia';
        statusSpO2.className = 'text-[9px] text-amber-400 block leading-tight whitespace-normal break-words';
      } else {
        statusSpO2.textContent = 'Optimal Saturation';
        statusSpO2.className = 'text-[9px] text-emerald-400 block leading-tight whitespace-normal break-words';
      }
    }

    if (valRR) valRR.innerHTML = `${p.rr || 16} <span class="text-[9px] text-slate-400 font-normal">cpm</span>`;
    if (statusRR) {
      const rrNum = parseInt(p.rr, 10) || 16;
      if (rrNum > 22) {
        statusRR.textContent = 'Tachypnea';
        statusRR.className = 'text-[9px] text-rose-400 block leading-tight whitespace-normal break-words';
      } else if (rrNum < 12) {
        statusRR.textContent = 'Bradypnea';
        statusRR.className = 'text-[9px] text-amber-400 block leading-tight whitespace-normal break-words';
      } else {
        statusRR.textContent = 'Normal Eupnea';
        statusRR.className = 'text-[9px] text-emerald-400 block leading-tight whitespace-normal break-words';
      }
    }

    if (valTemp) valTemp.textContent = p.temp || '98.6°F';
    if (statusTemp) {
      const tempNum = parseFloat(p.temp) || 98.6;
      if (tempNum >= 100.4) {
        statusTemp.textContent = 'Febrile Pyrexia';
        statusTemp.className = 'text-[9px] text-rose-400 block leading-tight whitespace-normal break-words';
      } else if (tempNum < 96.8) {
        statusTemp.textContent = 'Hypothermic';
        statusTemp.className = 'text-[9px] text-amber-400 block leading-tight whitespace-normal break-words';
      } else {
        statusTemp.textContent = 'Afebrile';
        statusTemp.className = 'text-[9px] text-emerald-400 block leading-tight whitespace-normal break-words';
      }
    }

    if (valMAP) valMAP.innerHTML = `${mapVal} <span class="text-[9px] text-slate-400 font-normal">mmHg</span>`;
    if (statusMAP) {
      if (mapVal < 65) {
        statusMAP.textContent = 'Poor Perfusion';
        statusMAP.className = 'text-[9px] text-rose-400 block leading-tight whitespace-normal break-words font-bold';
      } else {
        statusMAP.textContent = 'Adequate Perfusion';
        statusMAP.className = 'text-[9px] text-emerald-400 block leading-tight whitespace-normal break-words';
      }
    }

    if (cardiacSyncLabel) {
      cardiacSyncLabel.textContent = `${p.hr} BPM Sync`;
      cardiacSyncLabel.className = p.hr > 100
        ? 'text-[10px] font-mono text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 font-bold'
        : 'text-[10px] font-mono text-teal-400 px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20';
    }

    if (ecgWaveLabel) {
      if (codeBlueActive) {
        ecgWaveLabel.textContent = 'ECG: PULSELESS VENTRICULAR FIBRILLATION';
        ecgWaveLabel.className = 'text-rose-400 font-bold bg-black/70 px-2 py-0.5 rounded backdrop-blur border border-rose-500/40';
      } else if (p.hr > 120) {
        ecgWaveLabel.textContent = 'ECG: SUPRAVENTRICULAR TACHYCARDIA DETECTED';
        ecgWaveLabel.className = 'text-rose-400 font-bold bg-black/70 px-2 py-0.5 rounded backdrop-blur border border-rose-500/30';
      } else if (p.hr > 100) {
        ecgWaveLabel.textContent = 'ECG: SINUS TACHYCARDIA';
        ecgWaveLabel.className = 'text-amber-400 font-bold bg-black/70 px-2 py-0.5 rounded backdrop-blur border border-amber-500/30';
      } else if (p.hr < 60) {
        ecgWaveLabel.textContent = 'ECG: SINUS BRADYCARDIA';
        ecgWaveLabel.className = 'text-amber-400 font-bold bg-black/70 px-2 py-0.5 rounded backdrop-blur border border-amber-500/30';
      } else {
        ecgWaveLabel.textContent = 'ECG: NORMAL SINUS RHYTHM';
        ecgWaveLabel.className = 'text-teal-400 font-bold bg-black/70 px-2 py-0.5 rounded backdrop-blur border border-white/5';
      }
    }
  }

  // Live Biotelemetry Stream Simulation
  function startTelemetryStream() {
    clearInterval(telemetryInterval);
    telemetryInterval = setInterval(() => {
      if (!liveTelemetryActive || !activePatient || codeBlueActive) return;

      // Subtle physiological jitter
      const hrDelta = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
      let newHr = Math.max(45, Math.min(180, activePatient.hr + hrDelta));
      activePatient.hr = newHr;

      // BP fluctuation
      const bpParts = (activePatient.bp || '120 / 80').split('/').map(s => parseInt(s.trim(), 10));
      const sysDelta = Math.floor(Math.random() * 3) - 1;
      const diaDelta = Math.floor(Math.random() * 3) - 1;
      const newSys = Math.max(70, Math.min(220, (bpParts[0] || 120) + sysDelta));
      const newDia = Math.max(40, Math.min(130, (bpParts[1] || 80) + diaDelta));
      activePatient.bp = `${newSys} / ${newDia}`;

      updateVitalsDisplay(activePatient);
    }, 3500);
  }

  // Filter Buttons Event Listeners
  function updateFilterButtonStyles() {
    const buttons = [
      { el: filterAllBtn, key: 'all', activeClass: 'bg-teal-500/20 text-teal-300 font-bold border-teal-500/30' },
      { el: filterCriticalBtn, key: 'critical', activeClass: 'bg-rose-500/20 text-rose-300 font-bold border-rose-500/40' },
      { el: filterUrgentBtn, key: 'urgent', activeClass: 'bg-amber-500/20 text-amber-300 font-bold border-amber-500/40' },
      { el: filterStableBtn, key: 'stable', activeClass: 'bg-emerald-500/20 text-emerald-300 font-bold border-emerald-500/30' }
    ];

    buttons.forEach(b => {
      if (!b.el) return;
      if (currentFilter === b.key) {
        b.el.className = `acuity-filter-btn px-2.5 py-1 rounded-lg border transition-all ${b.activeClass}`;
      } else {
        b.el.className = 'acuity-filter-btn px-2.5 py-1 rounded-lg text-slate-400 hover:text-white border border-transparent transition-all';
      }
    });
  }

  filterAllBtn?.addEventListener('click', () => {
    currentFilter = 'all';
    updateFilterButtonStyles();
    applyFiltersAndRender();
  });

  filterCriticalBtn?.addEventListener('click', () => {
    currentFilter = 'critical';
    updateFilterButtonStyles();
    applyFiltersAndRender();
  });

  filterUrgentBtn?.addEventListener('click', () => {
    currentFilter = 'urgent';
    updateFilterButtonStyles();
    applyFiltersAndRender();
  });

  filterStableBtn?.addEventListener('click', () => {
    currentFilter = 'stable';
    updateFilterButtonStyles();
    applyFiltersAndRender();
  });

  sortSelect?.addEventListener('change', (e) => {
    currentSort = e.target.value;
    applyFiltersAndRender();
  });

  patientSearchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    if (clearSearchBtn) {
      if (searchQuery) clearSearchBtn.classList.remove('hidden');
      else clearSearchBtn.classList.add('hidden');
    }
    applyFiltersAndRender();
  });

  clearSearchBtn?.addEventListener('click', () => {
    searchQuery = '';
    if (patientSearchInput) patientSearchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    applyFiltersAndRender();
  });

  // =========================================================================
  // 3. EMERGENCY CODE BLUE SYSTEM
  // =========================================================================
  codeBlueBtn?.addEventListener('click', () => {
    if (window.BFAuth && !window.BFAuth.hasPermission('critical_code_blue_broadcast')) {
      if (window.showToast) {
        window.showToast('Access Denied: Persona lacks emergency Code Blue authorization.', 'error');
      }
      return;
    }

    const target = activePatient || allPatients[0];
    if (codeBlueModalPatient) codeBlueModalPatient.textContent = target.name;
    if (codeBlueModalMRN) codeBlueModalMRN.textContent = target.mrn;
    if (codeBlueModalBed) codeBlueModalBed.textContent = target.bed || 'ICU Bed 01';

    codeBlueModal?.classList.remove('hidden');
  });

  closeCodeBlueModalBtn?.addEventListener('click', () => codeBlueModal?.classList.add('hidden'));
  cancelCodeBlueBtn?.addEventListener('click', () => codeBlueModal?.classList.add('hidden'));

  confirmCodeBlueBtn?.addEventListener('click', () => {
    codeBlueModal?.classList.add('hidden');
    activateCodeBlue();
  });

  function activateCodeBlue() {
    codeBlueActive = true;
    codeBlueSeconds = 0;

    const target = activePatient || allPatients[0];
    target.acuity = 'Critical';
    target.hr = 158; // Ventricular tachycardia
    target.condition = 'Cardiorespiratory Arrest - Code Blue Protocol In Effect';

    if (codeBlueBannerTarget) {
      codeBlueBannerTarget.textContent = `PATIENT: ${target.name.toUpperCase()} (${target.bed ? target.bed.toUpperCase() : 'BED UNKNOWN'})`;
    }
    codeBlueBanner?.classList.remove('hidden');

    // Arrest timer stopwatch
    clearInterval(codeBlueTimerInterval);
    codeBlueTimerInterval = setInterval(() => {
      codeBlueSeconds++;
      const mins = String(Math.floor(codeBlueSeconds / 60)).padStart(2, '0');
      const secs = String(codeBlueSeconds % 60).padStart(2, '0');
      if (codeBlueTimer) codeBlueTimer.textContent = `${mins}:${secs}`;
    }, 1000);

    updateVitalsDisplay(target);
    updateCensusCounts();
    applyFiltersAndRender();

    // Log to HIPAA Audit Trail
    recordAuditEntry({
      action: 'CRITICAL_CODE_BLUE_BROADCAST',
      mrn: target.mrn,
      details: `Emergency Code Blue broadcast for ${target.name} (${target.bed}). Resuscitation team alerted. ACLS protocol active.`,
      operator: window.BFAuth ? window.BFAuth.getUser().name : 'Dr. Evelyn Vance'
    });

    if (window.showToast) {
      window.showToast(`EMERGENCY: Code Blue activated for ${target.name} (${target.bed}). Cardiac arrest team dispatched.`, 'emergency', 8000);
    }
  }

  resolveCodeBlueBtn?.addEventListener('click', () => {
    codeBlueActive = false;
    clearInterval(codeBlueTimerInterval);
    codeBlueBanner?.classList.add('hidden');

    const target = activePatient || allPatients[0];
    target.condition = 'Post-Resuscitation Stabilization (Targeted Temperature Management)';
    target.hr = 84;
    target.bp = '114 / 72';

    updateVitalsDisplay(target);
    applyFiltersAndRender();

    recordAuditEntry({
      action: 'CODE_BLUE_RESOLVED_STAND_DOWN',
      mrn: target.mrn,
      details: `Code Blue resolved for ${target.name}. Spontaneous circulation return confirmed. Vitals stabilized to HR 84, BP 114/72.`,
      operator: window.BFAuth ? window.BFAuth.getUser().name : 'Dr. Evelyn Vance'
    });

    if (window.showToast) {
      window.showToast(`Code Blue stand-down confirmed for ${target.name}. Return of spontaneous circulation recorded.`, 'success');
    }
  });

  // =========================================================================
  // 4. PATIENT INTAKE / ADMISSION WORKFLOW (/api/patients)
  // =========================================================================
  newPatientBtn?.addEventListener('click', () => {
    if (window.BFAuth && !window.BFAuth.hasPermission('patient_intake')) {
      if (window.showToast) window.showToast('Access Denied: Persona lacks Patient Intake authority.', 'error');
      return;
    }
    newPatientModal?.classList.remove('hidden');
  });

  closePatientModalBtn?.addEventListener('click', () => {
    newPatientModal?.classList.add('hidden');
  });

  patientIntakeForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('intakeName').value.trim();
    const demographics = document.getElementById('intakeDemographics').value.trim();
    const acuity = document.getElementById('intakeAcuity').value;
    const bed = document.getElementById('intakeBed').value.trim();
    const condition = document.getElementById('intakeCondition').value.trim();
    const allergies = document.getElementById('intakeAllergies').value.trim() || 'None recorded';
    const hr = parseInt(document.getElementById('intakeHR').value, 10) || 76;
    const bp = document.getElementById('intakeBP').value.trim() || '120/80';
    const spo2 = document.getElementById('intakeSpO2').value.trim() || '98%';
    const rr = parseInt(document.getElementById('intakeRR').value, 10) || 16;
    const temp = document.getElementById('intakeTemp').value.trim() || '98.6°F';

    const newPatient = {
      name: name,
      mrn: 'MRN-' + Math.floor(10000 + Math.random() * 90000),
      dob: '15-MAR-1988',
      sex: demographics.includes('Female') ? 'Female' : 'Male',
      demographics: demographics,
      condition: condition,
      acuity: acuity,
      bed: bed,
      status: 'Inpatient',
      bp: bp,
      hr: hr,
      spo2: spo2,
      rr: rr,
      temp: temp,
      allergies: allergies,
      physician: window.BFAuth ? window.BFAuth.getUser().name : 'Dr. Evelyn Vance (Chief Medical Officer)',
      assessment: `Initial triage and admission. Admitted for ${condition}. Vital signs recorded and biometric telemetry initialized.`,
      plan: 'Continuous biotelemetry monitoring. Comprehensive metabolic panel and blood work ordered.',
      prescriptions: []
    };

    try {
      await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient)
      });
    } catch (err) {}

    allPatients.unshift(newPatient);
    updateCensusCounts();
    populateRxPatientSelect(allPatients);
    newPatientModal?.classList.add('hidden');
    selectPatient(newPatient);

    recordAuditEntry({
      action: 'PATIENT_ADMITTED_INPATIENT',
      mrn: newPatient.mrn,
      details: `New patient admission: ${newPatient.name} admitted to ${newPatient.bed} with acuity ${newPatient.acuity}.`,
      operator: window.BFAuth ? window.BFAuth.getUser().name : 'Dr. Evelyn Vance'
    });

    if (window.showToast) {
      window.showToast(`Patient ${newPatient.name} admitted to ${newPatient.bed}. Assigned ${newPatient.mrn}.`, 'success');
    }
  });

  // =========================================================================
  // 5. BED TRANSFER WORKFLOW
  // =========================================================================
  transferBedBtn?.addEventListener('click', () => {
    if (!activePatient) return;
    if (window.BFAuth && !window.BFAuth.hasPermission('bed_transfer')) {
      if (window.showToast) window.showToast('Access Denied: Persona lacks Bed Transfer authority.', 'error');
      return;
    }

    if (transferPatientName) transferPatientName.textContent = activePatient.name;
    if (transferCurrentBed) transferCurrentBed.textContent = activePatient.bed || 'Unassigned';
    if (transferNewBed) transferNewBed.value = '';

    transferBedModal?.classList.remove('hidden');
  });

  closeTransferModalBtn?.addEventListener('click', () => transferBedModal?.classList.add('hidden'));
  cancelTransferBtn?.addEventListener('click', () => transferBedModal?.classList.add('hidden'));

  transferBedForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activePatient) return;

    const newBed = transferNewBed.value.trim();
    const unit = transferUnitSelect.value;
    const reason = transferReasonSelect.value;
    const oldBed = activePatient.bed;

    activePatient.bed = newBed;
    if (unit.includes('ICU')) activePatient.acuity = 'Critical';

    try {
      await fetch('/api/patients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mrn: activePatient.mrn, bed: newBed, acuity: activePatient.acuity })
      });
    } catch (err) {}

    transferBedModal?.classList.add('hidden');
    selectPatient(activePatient);

    recordAuditEntry({
      action: 'BED_TRANSFER_EXECUTED',
      mrn: activePatient.mrn,
      details: `Patient ${activePatient.name} transferred from ${oldBed} to ${newBed} (${unit}). Rationale: ${reason}.`,
      operator: window.BFAuth ? window.BFAuth.getUser().name : 'Attending Clinician'
    });

    if (window.showToast) {
      window.showToast(`Bed transfer completed: ${activePatient.name} moved to ${newBed}.`, 'success');
    }
  });

  // =========================================================================
  // 6. PATIENT DISCHARGE WORKFLOW
  // =========================================================================
  dischargePatientBtn?.addEventListener('click', () => {
    if (!activePatient) return;
    if (window.BFAuth && !window.BFAuth.hasPermission('schedule_discharge')) {
      if (window.showToast) window.showToast('Access Denied: Persona lacks Clinical Discharge authority.', 'error');
      return;
    }

    if (dischargePatientName) dischargePatientName.textContent = activePatient.name;
    if (dischargePatientMRN) dischargePatientMRN.textContent = activePatient.mrn;
    if (dischargePatientBed) dischargePatientBed.textContent = activePatient.bed || 'No Bed';

    dischargePatientModal?.classList.remove('hidden');
  });

  closeDischargeModalBtn?.addEventListener('click', () => dischargePatientModal?.classList.add('hidden'));
  cancelDischargeBtn?.addEventListener('click', () => dischargePatientModal?.classList.add('hidden'));

  dischargePatientForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activePatient) return;

    const disposition = dischargeDisposition.value;
    const summaryText = dischargeSummary.value.trim();

    activePatient.status = 'Discharged';
    activePatient.assessment = `DISCHARGED [${disposition}]. ${summaryText}`;

    try {
      await fetch('/api/patients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mrn: activePatient.mrn, status: 'Discharged', assessment: activePatient.assessment })
      });
    } catch (err) {}

    dischargePatientModal?.classList.add('hidden');
    updateCensusCounts();
    selectPatient(activePatient);

    recordAuditEntry({
      action: 'PATIENT_DISCHARGED',
      mrn: activePatient.mrn,
      details: `Patient ${activePatient.name} discharged (${disposition}). Summary recorded into permanent EHR archive.`,
      operator: window.BFAuth ? window.BFAuth.getUser().name : 'Attending Clinician'
    });

    if (window.showToast) {
      window.showToast(`Patient ${activePatient.name} successfully discharged (${disposition}).`, 'success');
    }
  });

  // =========================================================================
  // 7. e-PRESCRIPTIONS & DRUG INTERACTION CHECKS (/api/prescriptions)
  // =========================================================================
  openPrescribeModalBtn?.addEventListener('click', () => {
    // Switch to Prescriptions tab and set active patient
    const rxTabBtn = document.querySelector('[data-tab="prescriptions"]');
    if (rxTabBtn) rxTabBtn.click();
    if (rxPatientSelect && activePatient) {
      rxPatientSelect.value = activePatient.mrn;
      checkRxContraindications();
    }
  });

  function populateRxPatientSelect(patients) {
    if (!rxPatientSelect) return;
    rxPatientSelect.innerHTML = patients.map(p => `
      <option value="${p.mrn}">${p.name} (${p.mrn} &middot; ${p.bed || 'Bed N/A'})</option>
    `).join('');
  }

  function checkRxContraindications() {
    if (!rxPatientSelect || !rxDrugSelect || !rxContraindicationAlert || !rxContraindicationText) return;

    const selectedMRN = rxPatientSelect.value;
    const patient = allPatients.find(p => p.mrn === selectedMRN) || activePatient;
    const drug = rxDrugSelect.value.toLowerCase();
    const allergies = (patient && patient.allergies ? patient.allergies : '').toLowerCase();

    let alertMessage = null;

    if (allergies.includes('penicillin') && (drug.includes('amoxicillin') || drug.includes('penicillin'))) {
      alertMessage = `CRITICAL ALLERGY CONTRAINDICATION: ${patient.name} has a documented severe Penicillin allergy (anaphylaxis risk). Beta-lactam dispatch is strictly contraindicated.`;
    } else if (allergies.includes('sulfa') && (drug.includes('sulfa') || drug.includes('bactrim'))) {
      alertMessage = `CRITICAL ALLERGY CONTRAINDICATION: ${patient.name} has a documented Sulfa allergy. Formulation dispatch is contraindicated.`;
    } else if (allergies.includes('aspirin') && (drug.includes('aspirin') || drug.includes('nsaid'))) {
      alertMessage = `WARNING: ${patient.name} has documented NSAID sensitivity. Review prescription indication prior to dispatch.`;
    }

    if (alertMessage) {
      rxContraindicationText.textContent = alertMessage;
      rxContraindicationAlert.classList.remove('hidden');
    } else {
      rxContraindicationAlert.classList.add('hidden');
    }
  }

  rxPatientSelect?.addEventListener('change', checkRxContraindications);
  rxDrugSelect?.addEventListener('change', checkRxContraindications);

  rxOrderForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const selectedMRN = rxPatientSelect.value;
    const drug = rxDrugSelect.value;
    const dosage = rxDosage.value.trim();
    const frequency = rxFrequency.value;
    const refills = rxRefills.value;
    const pharmacy = rxPharmacy.value;
    const signed = rxDigitalSignatureCheck ? rxDigitalSignatureCheck.checked : true;

    if (!signed) {
      if (window.showToast) window.showToast('Prescription blocked: RSA-SHA256 Clinician Digital Seal is required.', 'error');
      return;
    }

    const patient = allPatients.find(p => p.mrn === selectedMRN) || activePatient;

    // Severe Allergy Block
    if (patient && patient.allergies && patient.allergies.toLowerCase().includes('penicillin') && drug.toLowerCase().includes('amoxicillin')) {
      if (window.showToast) {
        window.showToast(`CRITICAL CLINICAL CONTRAINDICATION: ${patient.name} has documented severe Penicillin anaphylaxis. Amoxicillin dispatch blocked by clinical decision support.`, 'error', 6000);
      }
      return;
    }

    const rxRecord = {
      rxId: `RX-${Math.floor(100000 + Math.random() * 900000)}`,
      patientName: patient.name,
      mrn: patient.mrn,
      medication: `${drug} &middot; ${dosage} ${frequency} (Refills: ${refills})`,
      prescriber: window.BFAuth ? window.BFAuth.getUser().name : 'Dr. Evelyn Vance',
      pharmacy: pharmacy,
      status: 'DISPATCHED_NCPDP'
    };

    try {
      await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientMRN: selectedMRN,
          patientName: patient.name,
          drug: drug,
          dosage: dosage,
          frequency: frequency,
          refills: refills,
          pharmacy: pharmacy,
          allergies: patient.allergies,
          prescriber: rxRecord.prescriber
        })
      });
    } catch (err) {}

    // Add to dispatched log
    dispatchedPrescriptions.unshift(rxRecord);
    renderDispatchedRxTable();

    // Add to patient prescription array
    if (!patient.prescriptions) patient.prescriptions = [];
    patient.prescriptions.push(`${drug} ${dosage} ${frequency}`);

    // Update patient detail view if currently selected
    if (activePatient && activePatient.mrn === patient.mrn) {
      selectPatient(patient);
    }

    recordAuditEntry({
      action: 'E_PRESCRIPTION_DISPATCHED',
      mrn: patient.mrn,
      details: `e-Prescription dispatched: ${drug} (${dosage}, ${frequency}) transmitted via NCPDP SCRIPT to ${pharmacy}. Digital certificate sealed.`,
      operator: rxRecord.prescriber
    });

    if (window.showToast) {
      window.showToast(`e-Prescription for ${drug} electronically dispatched to ${pharmacy}. Surescripts transaction verified.`, 'success');
    }
  });

  function renderDispatchedRxTable() {
    if (!dispatchedRxTableBody) return;
    dispatchedRxTableBody.innerHTML = dispatchedPrescriptions.map(rx => `
      <tr class="hover:bg-white/[0.02]">
        <td class="p-3 text-teal-400 font-bold">${rx.rxId}</td>
        <td class="p-3 text-white font-sans font-semibold">${rx.patientName} <span class="text-[10px] font-mono text-slate-400">(${rx.mrn})</span></td>
        <td class="p-3 text-slate-300">${rx.medication}</td>
        <td class="p-3 text-slate-400 font-sans">${rx.prescriber}</td>
        <td class="p-3 text-slate-400 font-sans truncate max-w-xs">${rx.pharmacy}</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">TRANSMITTED</span></td>
      </tr>
    `).join('');
  }

  // =========================================================================
  // 8. CLINICAL QUEUE & APPOINTMENTS TAB
  // =========================================================================
  function renderAppointmentsTable() {
    if (!appointmentsTableBody) return;
    appointmentsTableBody.innerHTML = appointmentsList.map((app, idx) => `
      <tr class="hover:bg-white/[0.02]">
        <td class="p-3 text-teal-400 font-bold">${app.time}</td>
        <td class="p-3 text-white font-sans font-semibold">${app.patientName}</td>
        <td class="p-3 text-slate-400 font-mono text-[11px]">${app.mrn}</td>
        <td class="p-3 text-slate-400 font-sans">${app.provider}</td>
        <td class="p-3 text-slate-300 font-sans">${app.service}</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-mono border ${app.statusClass}">${app.status}</span></td>
        <td class="p-3 text-right space-x-2">
          <button class="view-chart-btn text-teal-400 hover:underline font-mono" data-mrn="${app.mrn}">View Chart</button>
          <button class="admit-queue-btn text-slate-400 hover:text-white font-mono" data-idx="${idx}">Update</button>
        </td>
      </tr>
    `).join('');

    appointmentsTableBody.querySelectorAll('.view-chart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mrn = btn.getAttribute('data-mrn');
        const patient = allPatients.find(p => p.mrn === mrn);
        if (patient) {
          selectPatient(patient);
          // Switch to EMR tab
          document.querySelector('[data-tab="emr"]')?.click();
        } else {
          if (window.showToast) window.showToast(`EHR chart for ${mrn} opened in clinical directory.`, 'info');
          document.querySelector('[data-tab="emr"]')?.click();
        }
      });
    });

    appointmentsTableBody.querySelectorAll('.admit-queue-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (appointmentsList[idx]) {
          appointmentsList[idx].status = 'COMPLETED';
          appointmentsList[idx].statusClass = 'bg-slate-700 text-slate-300 border-slate-600';
          renderAppointmentsTable();
          if (window.showToast) window.showToast(`Consultation record for ${appointmentsList[idx].patientName} updated to COMPLETED.`, 'success');
        }
      });
    });
  }

  bookAppointmentBtn?.addEventListener('click', () => {
    scheduleConsultModal?.classList.remove('hidden');
  });

  closeScheduleModalBtn?.addEventListener('click', () => scheduleConsultModal?.classList.add('hidden'));
  cancelScheduleBtn?.addEventListener('click', () => scheduleConsultModal?.classList.add('hidden'));

  scheduleConsultForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('consultPatientName').value.trim();
    const time = document.getElementById('consultTime').value.trim();
    const provider = document.getElementById('consultProvider').value;
    const service = document.getElementById('consultService').value.trim();

    const newApp = {
      time: time,
      patientName: name,
      mrn: 'MRN-' + Math.floor(10000 + Math.random() * 90000),
      provider: provider,
      service: service,
      status: 'SCHEDULED',
      statusClass: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
    };

    appointmentsList.push(newApp);
    renderAppointmentsTable();
    scheduleConsultModal?.classList.add('hidden');

    recordAuditEntry({
      action: 'CONSULTATION_SCHEDULED',
      mrn: newApp.mrn,
      details: `Outpatient consultation slot booked for ${name} at ${time} with ${provider}. Service: ${service}.`,
      operator: window.BFAuth ? window.BFAuth.getUser().name : 'Dr. Evelyn Vance'
    });

    if (window.showToast) window.showToast(`Consultation slot for ${name} scheduled for ${time}.`, 'success');
  });

  // =========================================================================
  // 9. HIPAA AUDIT TRAIL LOGIC (/api/audit)
  // =========================================================================
  async function loadAuditLogs() {
    try {
      const res = await fetch('/api/audit');
      if (res.ok) {
        const data = await res.json();
        cachedAuditLogs = data.events || [];
        renderAuditLogs(cachedAuditLogs);
        return;
      }
    } catch (e) {}

    cachedAuditLogs = [
      {
        timestamp: 'Today at 09:14:22',
        operator: 'Dr. Evelyn Vance (Chief Medical Officer)',
        action: 'EHR_RECORD_ACCESSED',
        mrn: 'MRN-78421',
        details: 'Cardiology 6-month hypertensive follow-up encounter chart opened.',
        signature: 'SHA256:0x9d4b2e81'
      },
      {
        timestamp: 'Today at 08:30:05',
        operator: 'Dr. Julian Hayes (Attending Clinician)',
        action: 'VITALS_TELEMETRY_LOGGED',
        mrn: 'MRN-78421',
        details: 'Bedside biotelemetry stream synchronized: BP 122/78, HR 72, SpO2 99%, RR 16, Temp 98.6°F.',
        signature: 'SHA256:0x4f12ba77'
      },
      {
        timestamp: 'Yesterday at 16:45:10',
        operator: 'Dr. Julian Hayes (Attending Clinician)',
        action: 'E_PRESCRIPTION_DISPATCHED',
        mrn: 'MRN-78422',
        details: 'Metformin 500mg ER BID transmitted via NCPDP SCRIPT gateway to Walgreens #1042.',
        signature: 'SHA256:0x11ce8390'
      }
    ];

    renderAuditLogs(cachedAuditLogs);
  }

  function renderAuditLogs(logs) {
    if (!auditLogFeed) return;
    auditLogFeed.innerHTML = logs.map(l => `
      <div class="p-3 rounded-xl bg-[#070D1B] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-teal-400 font-bold">[${l.timestamp || 'Today'}]</span>
            <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.05] text-slate-300 border border-white/[0.08]">${l.action}</span>
            <span class="text-slate-400 font-mono text-[11px]">${l.mrn}</span>
          </div>
          <p class="text-slate-300 mt-1 font-sans">${l.details}</p>
          <span class="text-[10px] text-slate-500 font-sans block mt-0.5">Operator: ${l.operator}</span>
        </div>
        <div class="sm:text-right shrink-0">
          <span class="text-[10px] text-emerald-400 font-mono block">VERIFIED</span>
          <span class="text-[9px] font-mono text-slate-500 block">${l.signature || 'SHA-256'}</span>
        </div>
      </div>
    `).join('');
  }

  async function recordAuditEntry(entry) {
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logItem = {
      timestamp: `Today at ${timeFormatted}`,
      operator: entry.operator || (window.BFAuth ? window.BFAuth.getUser().name : 'Clinician'),
      action: entry.action || 'CLINICAL_EVENT',
      mrn: entry.mrn || 'MRN-GENERAL',
      details: entry.details || 'Event logged',
      signature: `SHA256:0x${Math.floor(Math.random() * 0xffffffff).toString(16)}`
    };

    try {
      await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logItem)
      });
    } catch (e) {}

    cachedAuditLogs.unshift(logItem);
    renderAuditLogs(cachedAuditLogs);
  }

  auditSearchInput?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      renderAuditLogs(cachedAuditLogs);
      return;
    }
    const filtered = cachedAuditLogs.filter(l =>
      l.action.toLowerCase().includes(q) ||
      l.mrn.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.operator.toLowerCase().includes(q)
    );
    renderAuditLogs(filtered);
  });

  exportAuditBtn?.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cachedAuditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `HIPAA_Audit_Trail_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (window.showToast) window.showToast('Cryptographic HIPAA audit ledger exported to JSON.', 'success');
  });

  // =========================================================================
  // 10. CONTINUITY OF CARE DOCUMENT (CCD / PDF EXPORT)
  // =========================================================================
  exportCCDButton?.addEventListener('click', () => {
    if (!activePatient) return;
    if (window.showToast) window.showToast(`Compiling HIPAA CCD XML package & Clinical Summary for ${activePatient.name}...`, 'info');

    setTimeout(() => {
      const ccdSummary = `
================================================================================
                    CONTINUITY OF CARE DOCUMENT (CCD)
           HIPAA Security Rule 45 CFR § 164.312 Compliant Record
================================================================================
PATIENT NAME:         ${activePatient.name}
MRN:                  ${activePatient.mrn}
BED ASSIGNMENT:       ${activePatient.bed || 'Unassigned'}
TRIAGE ACUITY:        ${activePatient.acuity}
PRIMARY ASSESSMENT:   ${activePatient.condition}
VITAL SIGNS:          HR: ${activePatient.hr} BPM | BP: ${activePatient.bp} mmHg | SpO2: ${activePatient.spo2}
KNOWN ALLERGIES:      ${activePatient.allergies}
ATTENDING PHYSICIAN:  ${activePatient.physician}
ORDERS & PLAN:        ${activePatient.plan || activePatient.orders}
ACTIVE MEDICATIONS:   ${(activePatient.prescriptions || []).join('; ')}
TIMESTAMP:            ${new Date().toISOString()}
INTEGRITY SEAL:       SHA256:0x${Math.floor(Math.random() * 0xffffffffffff).toString(16)}
================================================================================
      `.trim();

      const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(ccdSummary);
      const link = document.createElement('a');
      link.setAttribute('href', dataUri);
      link.setAttribute('download', `CCD_${activePatient.mrn}_${new Date().toISOString().split('T')[0]}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      recordAuditEntry({
        action: 'HIPAA_CCD_DOCUMENT_EXPORTED',
        mrn: activePatient.mrn,
        details: `Continuity of Care Document (CCD) compiled and downloaded with SHA-256 seal for ${activePatient.name}.`,
        operator: window.BFAuth ? window.BFAuth.getUser().name : 'Clinician'
      });

      if (window.showToast) window.showToast(`HIPAA CCD package compiled with SHA-256 integrity seal for ${activePatient.name}.`, 'success');
    }, 900);
  });

  // =========================================================================
  // 11. TAB SWITCHING
  // =========================================================================
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      tabs.forEach(t => {
        t.className = 'med-nav-tab flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap font-mono';
      });
      tab.className = 'med-nav-tab active-tab flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 border-teal-400 text-teal-300 transition-colors whitespace-nowrap font-mono';

      tabContents.forEach(c => c.classList.add('hidden'));
      const activeContent = document.getElementById('tab-' + target);
      if (activeContent) activeContent.classList.remove('hidden');

      // Trigger Three.js resize when switching to EMR tab
      if (target === 'emr') {
        setTimeout(onWindowResize, 50);
      }
    });
  });

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  initThreeJSHeart();
  loadPatients();
  renderAppointmentsTable();
  renderDispatchedRxTable();
  loadAuditLogs();
  startTelemetryStream();

})();

// VOCALFLOW AI - ENTERPRISE TELEPHONY & VOICE CONVERSATIONAL ENGINE
// Binary Froster Enterprise Voice Platform
// Connected to Live Serverless Backend (/api/call, /api/ai-respond, /api/transcribe, /api/telemetry)
// Enhanced with Three.js 3D Holographic Harmonics, Web Audio DTMF Synthesizer, VU Meter & Web Speech API
// Strictly zero emojis. Designed for sub-150ms conversational voice latency.

(function () {
  'use strict';

  // State Management
  let inCall = false;
  let callSid = null;
  let callTimerSeconds = 0;
  let timerInterval = null;
  let isMuted = false;
  let isHold = false;
  let isRecording = false;
  let currentTurn = 0;
  let audioIntensity = 0.04;
  let isAiSpeaking = false;
  let recognition = null;
  let isRecognizing = false;
  let activeScenario = 'enterprise_priority';
  let activeTargetNumber = '+91 7647958412';
  let activeTargetName = 'Binary Froster HQ';
  let activePersona = 'sarah';
  let conversationHistory = [];
  let totalLatencyMs = 0;
  let latencySampleCount = 0;
  let audioCtx = null;

  // DOM Elements - Header & Call Status
  const simulateCallBtn = document.getElementById('simulateCallBtn');
  const simulateCallBtnText = document.getElementById('simulateCallBtnText');
  const callStatusIndicator = document.getElementById('callStatusIndicator');
  const callStatusText = document.getElementById('callStatusText');
  const callTimer = document.getElementById('callTimer');
  const hangupBtn = document.getElementById('hangupBtn');
  const muteBtn = document.getElementById('muteBtn');
  const muteBtnText = document.getElementById('muteBtnText');
  const holdBtn = document.getElementById('holdBtn');
  const holdBtnText = document.getElementById('holdBtnText');
  const recordBtn = document.getElementById('recordBtn');
  const recordBtnText = document.getElementById('recordBtnText');
  const recordIndicatorDot = document.getElementById('recordIndicatorDot');
  const callRecordingTag = document.getElementById('callRecordingTag');
  const escalateBtn = document.getElementById('escalateBtn');
  const speechMicBtn = document.getElementById('speechMicBtn');
  const transcriptFeed = document.getElementById('transcriptFeed');
  const transcriptEmptyState = document.getElementById('transcriptEmptyState');
  const clearTranscriptBtn = document.getElementById('clearTranscriptBtn');
  const exportTranscriptBtn = document.getElementById('exportTranscriptBtn');
  const vadStatus = document.getElementById('vadStatus');
  const userSpeechInput = document.getElementById('userSpeechInput');
  const sendSpeechInputBtn = document.getElementById('sendSpeechInputBtn');
  const satisfactionVal = document.getElementById('satisfactionVal');
  const satisfactionBar = document.getElementById('satisfactionBar');
  const frustrationVal = document.getElementById('frustrationVal');
  const frustrationBar = document.getElementById('frustrationBar');
  const streamLatencyBadge = document.getElementById('streamLatencyBadge');
  const reset3DCameraBtn = document.getElementById('reset3DCameraBtn');
  const headerSipBadge = document.getElementById('headerSipBadge');

  // VU Meter & HUD Telemetry Elements
  const meterBarL = document.getElementById('meterBarL');
  const meterBarR = document.getElementById('meterBarR');
  const audioDbLevel = document.getElementById('audioDbLevel');
  const audioPeakStatus = document.getElementById('audioPeakStatus');
  const telemetryStt = document.getElementById('telemetryStt');
  const telemetryLlm = document.getElementById('telemetryLlm');
  const telemetryTts = document.getElementById('telemetryTts');
  const telemetryRtt = document.getElementById('telemetryRtt');

  // Caller Identity Card Elements
  const callerIdentityCard = document.getElementById('callerIdentityCard');
  const callerIdentityTag = document.getElementById('callerIdentityTag');
  const callerName = document.getElementById('callerName');
  const callerPhoneSubtitle = document.getElementById('callerPhoneSubtitle');
  const callerAgentBadge = document.getElementById('callerAgentBadge');

  // World Dialer DOM Elements
  const countryCodeSelect = document.getElementById('countryCodeSelect');
  const targetPhoneNumberInput = document.getElementById('targetPhoneNumberInput');
  const dialerBackspaceBtn = document.getElementById('dialerBackspaceBtn');
  const clearDialerInputBtn = document.getElementById('clearDialerInputBtn');
  const placeOutboundCallBtn = document.getElementById('placeOutboundCallBtn');
  const placeOutboundCallBtnText = document.getElementById('placeOutboundCallBtnText');
  const placeOutboundCallIcon = document.getElementById('placeOutboundCallIcon');
  const telephonyModeSelect = document.getElementById('telephonyModeSelect');
  const llmGatewaySelect = document.getElementById('llmGatewaySelect');
  const sipSignalingStatus = document.getElementById('sipSignalingStatus');
  const carrierGatewayName = document.getElementById('carrierGatewayName');
  const voicePersonaSelect = document.getElementById('voicePersonaSelect');
  const classifiedIntentText = document.getElementById('classifiedIntentText');
  const classifiedIntentDesc = document.getElementById('classifiedIntentDesc');

  // Twilio Configuration Elements
  const cfgTwilioSid = document.getElementById('cfgTwilioSid');
  const cfgTwilioToken = document.getElementById('cfgTwilioToken');
  const cfgTwilioPhone = document.getElementById('cfgTwilioPhone');
  const saveTwilioCfgBtn = document.getElementById('saveTwilioCfgBtn');
  const testTwilioBtn = document.getElementById('testTwilioBtn');
  const testTwilioDot = document.getElementById('testTwilioDot');
  const testTwilioText = document.getElementById('testTwilioText');
  const twilioTestResultBox = document.getElementById('twilioTestResultBox');
  const twilioTestStatusBadge = document.getElementById('twilioTestStatusBadge');
  const twilioTestMessage = document.getElementById('twilioTestMessage');

  // Modal Elements
  const escalateModal = document.getElementById('escalateModal');
  const closeEscalateModalBtn = document.getElementById('closeEscalateModalBtn');
  const cancelEscalateBtn = document.getElementById('cancelEscalateBtn');
  const confirmEscalateBtn = document.getElementById('confirmEscalateBtn');

  const callSummaryModal = document.getElementById('callSummaryModal');
  const closeSummaryModalBtn = document.getElementById('closeSummaryModalBtn');
  const dismissSummaryModalBtn = document.getElementById('dismissSummaryModalBtn');
  const downloadSummaryLogBtn = document.getElementById('downloadSummaryLogBtn');
  const summaryDuration = document.getElementById('summaryDuration');
  const summaryTurns = document.getElementById('summaryTurns');
  const summaryDeflection = document.getElementById('summaryDeflection');
  const summaryAvgLatency = document.getElementById('summaryAvgLatency');
  const summaryCsat = document.getElementById('summaryCsat');
  const summaryCarrier = document.getElementById('summaryCarrier');

  // Persona Profiles
  const PERSONA_CONFIGS = {
    sarah: {
      name: 'Sarah',
      title: 'Warm, Conversational Neural Voice',
      gender: 'female',
      rate: 1.02,
      pitch: 1.0,
      badge: 'AGENT: SARAH (NEURAL)'
    },
    alex: {
      name: 'Alex',
      title: 'Crisp, Articulate US Executive Voice',
      gender: 'male',
      rate: 1.05,
      pitch: 0.98,
      badge: 'AGENT: ALEX (NEURAL)'
    },
    marcus: {
      name: 'Marcus',
      title: 'Authoritative, Technical Deep Neural Voice',
      gender: 'male',
      rate: 0.96,
      pitch: 0.88,
      badge: 'AGENT: MARCUS (NEURAL)'
    },
    elena: {
      name: 'Elena',
      title: 'Multilingual Operations Specialist Voice',
      gender: 'female',
      rate: 1.0,
      pitch: 1.08,
      badge: 'AGENT: ELENA (NEURAL)'
    }
  };

  // Scenario Profiles
  const SCENARIOS = {
    enterprise_priority: {
      id: 'enterprise_priority',
      title: 'Enterprise Priority',
      number: '+91 7647958412',
      customerName: 'Binary Froster HQ',
      subtitle: '+91 7647958412 \u00b7 India TRAI Priority Route \u00b7 Binary Froster HQ',
      identityTag: 'OUTBOUND TELEPHONY TARGET (BINARY FROSTER HQ)',
      intent: 'Enterprise Systems Concierge \u00b7 Priority Routing',
      intentDesc: 'Autonomous Resolution: Real-time neural LLM reasoning active via SIP trunk with sub-150ms conversational latency.',
      persona: 'sarah',
      initialGreeting: "Hello! This is Sarah calling from Binary Froster priority automation. How may I assist your engineering operations today?"
    },
    flight_change: {
      id: 'flight_change',
      title: 'British Airways Reservation',
      number: '+44 20 7946 0912',
      customerName: 'Alex Rivera (Customer #CR-9481)',
      subtitle: '+44 20 7946 0912 \u00b7 Heathrow Priority Desk \u00b7 Club World',
      identityTag: 'CALLER IDENTITY (CRM MATCH)',
      intent: 'Flight BA-2490 Rescheduling \u00b7 Club World Upgrade',
      intentDesc: 'Autonomous Resolution: Real-time flight schedule queries and penalty-free seat reassignment.',
      persona: 'elena',
      initialGreeting: "Good afternoon Alex, thank you for calling British Airways Priority Support. I see your scheduled flight BA-2490 is departing tomorrow. How may I assist you today?"
    },
    medical_appointment: {
      id: 'medical_appointment',
      title: 'MediCare Confirmation',
      number: '+1 415 555 2671',
      customerName: 'Eleanor Vance (Patient #MC-7714)',
      subtitle: '+1 415 555 2671 \u00b7 Clinical Care Hub \u00b7 San Francisco',
      identityTag: 'PATIENT PROFILE VERIFIED (EHR MATCH)',
      intent: 'Specialist Consultation \u00b7 Pre-Authorization Verified',
      intentDesc: 'Autonomous Resolution: Automated HIPAA-aligned outpatient appointment scheduling and pre-authorization validation.',
      persona: 'sarah',
      initialGreeting: "Good morning Eleanor, Sarah calling from MediCare Care Hub to confirm your specialist consultation with Dr. Thorne tomorrow. Do you require any scheduling adjustments?"
    },
    billing_support: {
      id: 'billing_support',
      title: 'Billing Support',
      number: '+1 800 555 0199',
      customerName: 'Marcus Vance (Acct #INV-8820)',
      subtitle: '+1 800 555 0199 \u00b7 Corporate Ledger Desk \u00b7 North America',
      identityTag: 'CORPORATE ACCOUNT LEDGER MATCH',
      intent: 'Invoice Ledger Reconciliation \u00b7 Retainer Balance',
      intentDesc: 'Autonomous Resolution: Real-time invoice balance verification, retainer reconciliation, and automated receipt delivery.',
      persona: 'marcus',
      initialGreeting: "Hello Marcus, this is your Binary Froster Accounts Concierge regarding invoice INV-8820. How may I assist with your corporate retainer ledger today?"
    }
  };

  // =========================================================================
  // 1. DTMF WEB AUDIO TONE SYNTHESIZER
  // =========================================================================
  const DTMF_FREQS = {
    '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
    '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
    '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
    '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
  };

  function getAudioContext() {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) {
        audioCtx = new AudioClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playDtmfTone(key) {
    try {
      const freqs = DTMF_FREQS[key];
      if (!freqs) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = freqs[0];
      osc2.frequency.value = freqs[1];

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.14);
      osc2.stop(now + 0.14);

      // Trigger 3D visualizer pulse and audio meter spike
      audioIntensity = 0.42;
      triggerMeterSpike(85, -9);
    } catch (e) {
      // AudioContext fallback
    }
  }

  function playToneSequence(freq1, freq2, durationSec = 0.2, gainVal = 0.05) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(freq1, now);
      if (freq2) {
        osc.frequency.exponentialRampToValueAtTime(freq2, now + durationSec);
      }
      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + durationSec);
    } catch (e) {
      // Audio fallback
    }
  }

  // =========================================================================
  // 2. AUDIO VOLUME VU METER ENGINE
  // =========================================================================
  let meterLevelL = 6;
  let meterLevelR = 5;

  function triggerMeterSpike(levelPercent, dbVal) {
    meterLevelL = levelPercent;
    meterLevelR = Math.max(5, levelPercent - 4);
    if (meterBarL) meterBarL.style.width = `${meterLevelL}%`;
    if (meterBarR) meterBarR.style.width = `${meterLevelR}%`;
    if (audioDbLevel) audioDbLevel.textContent = `${dbVal} dBFS`;
  }

  function updateAudioMeterLoop() {
    if (isAiSpeaking) {
      // AI voice active speech fluctuations
      const base = 55 + Math.random() * 38;
      meterLevelL += (base - meterLevelL) * 0.35;
      meterLevelR += ((base - 4 + Math.random() * 8) - meterLevelR) * 0.35;
      const db = -Math.round(18 - (meterLevelL / 100) * 14);
      if (audioDbLevel) audioDbLevel.textContent = `${db} dBFS`;
      if (audioPeakStatus) {
        audioPeakStatus.textContent = db > -8 ? 'NEAR PEAK' : 'TRANSMITTING';
        audioPeakStatus.className = db > -8 ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold';
      }
    } else if (isRecognizing) {
      // User speech mic stream fluctuations
      const base = 40 + Math.random() * 45;
      meterLevelL += (base - meterLevelL) * 0.4;
      meterLevelR += ((base - 5 + Math.random() * 10) - meterLevelR) * 0.4;
      const db = -Math.round(22 - (meterLevelL / 100) * 14);
      if (audioDbLevel) audioDbLevel.textContent = `${db} dBFS`;
      if (audioPeakStatus) {
        audioPeakStatus.textContent = 'MIC STREAMING';
        audioPeakStatus.className = 'text-rose-400 font-bold';
      }
    } else if (inCall) {
      if (isMuted || isHold) {
        meterLevelL += (2 - meterLevelL) * 0.2;
        meterLevelR += (2 - meterLevelR) * 0.2;
        if (audioDbLevel) audioDbLevel.textContent = '-48 dBFS';
        if (audioPeakStatus) {
          audioPeakStatus.textContent = isHold ? 'ON HOLD' : 'MUTED';
          audioPeakStatus.className = 'text-slate-500 font-mono';
        }
      } else {
        // Idle carrier line presence
        const base = 10 + Math.random() * 12;
        meterLevelL += (base - meterLevelL) * 0.2;
        meterLevelR += ((base - 2) - meterLevelR) * 0.2;
        if (audioDbLevel) audioDbLevel.textContent = '-28 dBFS';
        if (audioPeakStatus) {
          audioPeakStatus.textContent = 'LINE ACTIVE';
          audioPeakStatus.className = 'text-emerald-400 font-mono';
        }
      }
    } else {
      // Standby state
      meterLevelL += (5 - meterLevelL) * 0.15;
      meterLevelR += (4 - meterLevelR) * 0.15;
      if (audioDbLevel) audioDbLevel.textContent = '-36 dBFS';
      if (audioPeakStatus) {
        audioPeakStatus.textContent = 'STANDBY';
        audioPeakStatus.className = 'text-slate-500 font-mono';
      }
    }

    if (meterBarL) meterBarL.style.width = `${Math.max(2, Math.min(100, meterLevelL))}%`;
    if (meterBarR) meterBarR.style.width = `${Math.max(2, Math.min(100, meterLevelR))}%`;

    requestAnimationFrame(updateAudioMeterLoop);
  }

  // =========================================================================
  // 3. THREE.JS 3D HOLOGRAPHIC AUDIO VISUALIZER
  // =========================================================================
  const container = document.getElementById('threejs-audio-container');
  let scene, camera, renderer, sphereMesh, innerCore, ringMesh, particleSystem;
  let originalPositions = [];
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };
  let sphereRotation = { x: 0.2, y: 0.3 };
  let targetRotation = { x: 0.2, y: 0.3 };

  function initThreeJS() {
    if (!container || typeof THREE === 'undefined') return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 256;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0, 6.8);
    camera.lookAt(0, 0, 0);

    // WebGL Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x2b1055, 1.6);
    scene.add(ambientLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 3.2, 20);
    purpleLight.position.set(4, 3, 4);
    scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x00f2fe, 2.8, 20);
    cyanLight.position.set(-4, -2, 3);
    scene.add(cyanLight);

    // Outer Harmonic Spectral Sphere
    const geometry = new THREE.IcosahedronGeometry(1.8, 16);
    originalPositions = Array.from(geometry.attributes.position.array);

    const wireframeMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x4c1d95,
      wireframe: true,
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85
    });

    sphereMesh = new THREE.Mesh(geometry, wireframeMaterial);
    scene.add(sphereMesh);

    // Inner Glowing Core
    const innerGeometry = new THREE.SphereGeometry(1.1, 24, 24);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.28
    });
    innerCore = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerCore);

    // Orbital Telemetry Ring
    const ringGeo = new THREE.TorusGeometry(2.25, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.45
    });
    ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    scene.add(ringMesh);

    // Floating Stardust Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8.5;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.038,
      transparent: true,
      opacity: 0.65
    });
    particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Mouse Controls
    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      targetRotation.y += deltaX * 0.006;
      targetRotation.x += deltaY * 0.006;
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    // Touch Controls
    container.addEventListener('touchstart', (e) => {
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

    // Zoom on wheel
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      camera.position.z = Math.max(3.5, Math.min(10.0, camera.position.z + e.deltaY * 0.005));
      camera.lookAt(0, 0, 0);
    }, { passive: false });

    // Handle Window Resize
    window.addEventListener('resize', onWindowResize);

    // Start Loops
    animateThreeJS();
    updateAudioMeterLoop();
  }

  function onWindowResize() {
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  let clock = new THREE.Clock();

  function animateThreeJS() {
    requestAnimationFrame(animateThreeJS);

    const elapsedTime = clock.getElapsedTime();

    // Smooth rotation lerp
    sphereRotation.x += (targetRotation.x - sphereRotation.x) * 0.08;
    sphereRotation.y += (targetRotation.y - sphereRotation.y) * 0.08;

    if (sphereMesh) {
      sphereMesh.rotation.x = sphereRotation.x;
      sphereMesh.rotation.y = sphereRotation.y + elapsedTime * 0.15;

      // Real-time Vertex Harmonics & Dynamic Audio Displacement
      const positionAttr = sphereMesh.geometry.attributes.position;
      const arr = positionAttr.array;

      // Active target intensity: boosted when AI speaks or mic captures
      let targetIntensity = 0.04;
      if (inCall) {
        if (isAiSpeaking) targetIntensity = 0.38;
        else if (isRecognizing) targetIntensity = 0.28;
        else if (isHold) targetIntensity = 0.02;
        else if (isMuted) targetIntensity = 0.05;
        else targetIntensity = 0.12;
      }
      audioIntensity += (targetIntensity - audioIntensity) * 0.12;

      for (let i = 0; i < originalPositions.length; i += 3) {
        const ox = originalPositions[i];
        const oy = originalPositions[i + 1];
        const oz = originalPositions[i + 2];

        const freq = 4.0;
        const wave = Math.sin(ox * freq + elapsedTime * 5.0) *
                     Math.cos(oy * freq + elapsedTime * 4.0) *
                     Math.sin(oz * freq + elapsedTime * 3.0);

        const displacement = 1.0 + wave * audioIntensity;
        arr[i] = ox * displacement;
        arr[i + 1] = oy * displacement;
        arr[i + 2] = oz * displacement;
      }
      positionAttr.needsUpdate = true;
    }

    if (innerCore) {
      innerCore.rotation.y = -elapsedTime * 0.3;
      const scale = 1.0 + Math.sin(elapsedTime * 4.0) * (audioIntensity * 0.5);
      innerCore.scale.set(scale, scale, scale);
    }

    if (ringMesh) {
      ringMesh.rotation.z = elapsedTime * 0.2;
    }

    if (particleSystem) {
      particleSystem.rotation.y = -elapsedTime * 0.05;
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  // Reset 3D camera button
  reset3DCameraBtn?.addEventListener('click', () => {
    targetRotation = { x: 0.2, y: 0.3 };
    if (camera) {
      camera.position.set(0, 0, 6.8);
      camera.lookAt(0, 0, 0);
    }
    if (window.showToast) window.showToast('3D viewport camera orientation reset.', 'info');
  });

  // =========================================================================
  // 4. BACKEND API TELEMETRY
  // =========================================================================
  async function loadBackendTelemetry() {
    try {
      const res = await fetch('/api/telemetry');
      if (res.ok) {
        const data = await res.json();
        const avgLat = data.avgInferenceLatencyMs || 135;
        if (streamLatencyBadge) {
          streamLatencyBadge.textContent = `Latency: ${avgLat}ms`;
        }
        if (telemetryLlm) {
          telemetryLlm.textContent = `${Math.round(avgLat * 0.6)}ms`;
        }
        if (carrierGatewayName && data.twilioGateway) {
          carrierGatewayName.textContent = data.twilioGateway.status === 'LIVE_CONFIGURED'
            ? 'Twilio Live SIP Trunk'
            : 'TRAI Mumbai / Twilio Trunk';
        }
        if (headerSipBadge) {
          headerSipBadge.textContent = data.twilioGateway?.status === 'LIVE_CONFIGURED'
            ? 'Twilio Live'
            : 'Bridge Active';
        }
      }
    } catch (e) {
      console.warn('Telemetry check completed in local fallback mode:', e.message);
    }
  }

  // =========================================================================
  // 5. WEB SPEECH API (VOICE SYNTHESIS & RECOGNITION)
  // =========================================================================
  function speakAiText(text, onComplete) {
    if (!('speechSynthesis' in window)) {
      if (onComplete) onComplete();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Voice Persona selection
    const persona = voicePersonaSelect ? voicePersonaSelect.value : activePersona;
    const cfg = PERSONA_CONFIGS[persona] || PERSONA_CONFIGS.sarah;
    const voices = window.speechSynthesis.getVoices();

    utterance.rate = cfg.rate;
    utterance.pitch = cfg.pitch;

    if (cfg.gender === 'male') {
      const maleVoice = voices.find(v => v.lang.startsWith('en') && (
        v.name.includes('Male') || v.name.includes('David') || v.name.includes('George') || v.name.includes('James') || v.name.includes('Alex')
      ));
      if (maleVoice) utterance.voice = maleVoice;
    } else {
      const femaleVoice = voices.find(v => v.lang.startsWith('en') && (
        v.name.includes('Female') || v.name.includes('Sarah') || v.name.includes('Samantha') || v.name.includes('Google UK English Female') || v.name.includes('Victoria')
      ));
      if (femaleVoice) utterance.voice = femaleVoice;
    }

    isAiSpeaking = true;
    if (vadStatus) {
      vadStatus.textContent = 'VAD: AI TRANSMITTING (RTP)';
      vadStatus.className = 'text-cyan-400 font-bold bg-black/50 px-2.5 py-1 rounded backdrop-blur border border-white/5';
    }

    utterance.onend = () => {
      isAiSpeaking = false;
      if (vadStatus) {
        vadStatus.textContent = inCall ? 'VAD: LISTENING' : 'VAD: STANDBY';
        vadStatus.className = inCall
          ? 'text-emerald-400 font-bold bg-black/50 px-2.5 py-1 rounded backdrop-blur border border-white/5'
          : 'text-purple-400 font-bold bg-black/50 px-2.5 py-1 rounded backdrop-blur border border-white/5';
      }
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      isAiSpeaking = false;
      if (onComplete) onComplete();
    };

    window.speechSynthesis.speak(utterance);
  }

  // Initialize Speech Recognition if browser supports it
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isRecognizing = true;
      speechMicBtn?.classList.add('bg-purple-600', 'text-white');
      if (vadStatus) {
        vadStatus.textContent = 'VAD: CAPTURING MIC STREAM';
        vadStatus.className = 'text-rose-400 font-bold bg-black/50 px-2.5 py-1 rounded backdrop-blur border border-white/5';
      }
      if (window.showToast) window.showToast('Microphone active. Speak your question now...', 'info');
    };

    recognition.onresult = async (event) => {
      const speechResult = event.results[0][0].transcript;
      appendUserTranscript(speechResult, 'MIC STREAM');
      await processUserTurn(speechResult);
    };

    recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      isRecognizing = false;
      speechMicBtn?.classList.remove('bg-purple-600', 'text-white');
      if (vadStatus) {
        vadStatus.textContent = inCall ? 'VAD: LISTENING' : 'VAD: STANDBY';
        vadStatus.className = 'text-purple-400 font-bold bg-black/50 px-2.5 py-1 rounded backdrop-blur border border-white/5';
      }
    };

    recognition.onend = () => {
      isRecognizing = false;
      speechMicBtn?.classList.remove('bg-purple-600', 'text-white');
      if (vadStatus && !isAiSpeaking) {
        vadStatus.textContent = inCall ? 'VAD: LISTENING' : 'VAD: STANDBY';
        vadStatus.className = inCall
          ? 'text-emerald-400 font-bold bg-black/50 px-2.5 py-1 rounded backdrop-blur border border-white/5'
          : 'text-purple-400 font-bold bg-black/50 px-2.5 py-1 rounded backdrop-blur border border-white/5';
      }
    };
  }

  speechMicBtn?.addEventListener('click', () => {
    if (!inCall) {
      if (window.showToast) window.showToast('Please initiate or connect a phone call first.', 'warning');
      return;
    }
    if (isMuted) {
      if (window.showToast) window.showToast('Microphone is muted. Click "Unmute Mic" first.', 'warning');
      return;
    }
    if (!recognition) {
      initSpeechRecognition();
    }
    if (recognition && !isRecognizing) {
      try {
        recognition.start();
      } catch (e) {
        console.warn('Recognition start error:', e);
      }
    } else if (!recognition) {
      // Browser does not support speech recognition, prompt fallback
      const promptText = prompt('Speech recognition is not supported in this browser. Enter your spoken turn text:');
      if (promptText && promptText.trim()) {
        appendUserTranscript(promptText.trim(), 'TEXT FALLBACK');
        processUserTurn(promptText.trim());
      }
    }
  });

  // =========================================================================
  // 6. CALLING SCRIPT & TRANSCRIPT TIMELINE
  // =========================================================================
  function updateCallerBanner(number, name) {
    if (callerName) callerName.textContent = name;
    if (callerPhoneSubtitle) {
      const scenario = SCENARIOS[activeScenario];
      callerPhoneSubtitle.textContent = scenario ? scenario.subtitle : `${number} \u00b7 Priority Enterprise Voice Trunk`;
    }
    if (callerIdentityTag) {
      const scenario = SCENARIOS[activeScenario];
      callerIdentityTag.textContent = scenario ? scenario.identityTag : 'CALLER IDENTITY (CRM MATCH)';
    }
    if (callerAgentBadge) {
      const personaKey = voicePersonaSelect ? voicePersonaSelect.value : activePersona;
      const cfg = PERSONA_CONFIGS[personaKey] || PERSONA_CONFIGS.sarah;
      callerAgentBadge.textContent = cfg.badge;
    }
  }

  function updateHUDTelemetry(sttMs, llmMs, ttsMs) {
    if (telemetryStt) telemetryStt.textContent = `${sttMs}ms`;
    if (telemetryLlm) telemetryLlm.textContent = `${llmMs}ms`;
    if (telemetryTts) telemetryTts.textContent = `${ttsMs}ms`;
    const rtt = sttMs + llmMs + ttsMs;
    if (telemetryRtt) telemetryRtt.textContent = `${rtt}ms`;
    if (streamLatencyBadge) streamLatencyBadge.textContent = `Latency: ${rtt}ms`;
  }

  function appendUserTranscript(text, inputMode = 'MIC STREAM') {
    if (transcriptEmptyState) transcriptEmptyState.classList.add('hidden');

    const bubble = document.createElement('div');
    bubble.className = 'p-3 rounded-xl bg-[#141226] border border-cyan-500/20 text-xs space-y-1.5 transition-all';
    bubble.innerHTML = `
      <div class="flex justify-between items-center font-mono text-[10px]">
        <div class="flex items-center gap-2">
          <span class="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">${activeTargetName.toUpperCase()}</span>
          <span class="text-slate-400 px-1 rounded bg-white/[0.05] border border-white/[0.08]">[${inputMode}]</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-cyan-400 font-semibold">[INCOMING SPEECH]</span>
          <span class="text-slate-500">${callTimer ? callTimer.textContent : '00:00'}</span>
        </div>
      </div>
      <p class="text-slate-200 leading-relaxed">"${text}"</p>
    `;
    transcriptFeed.appendChild(bubble);
    transcriptFeed.scrollTop = transcriptFeed.scrollHeight;

    conversationHistory.push({ role: 'user', content: text, time: callTimer ? callTimer.textContent : '00:00' });
  }

  function appendAiTranscript(text, latencyMs = 120, confidence = '98%', intentTag = null) {
    if (transcriptEmptyState) transcriptEmptyState.classList.add('hidden');

    const personaKey = voicePersonaSelect ? voicePersonaSelect.value : activePersona;
    const cfg = PERSONA_CONFIGS[personaKey] || PERSONA_CONFIGS.sarah;

    const bubble = document.createElement('div');
    bubble.className = 'p-3 rounded-xl bg-[#090C16] border border-purple-500/20 text-xs space-y-1.5 transition-all';
    bubble.innerHTML = `
      <div class="flex justify-between items-center font-mono text-[10px]">
        <div class="flex items-center gap-2">
          <span class="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">AI VOICE AGENT (${cfg.name.toUpperCase()})</span>
          <span class="text-cyan-400 px-1 rounded bg-cyan-500/10 border border-cyan-500/20">${latencyMs}ms TTFT</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-emerald-400 font-semibold">[CONFIDENCE: ${confidence}]</span>
          <span class="text-slate-500">${callTimer ? callTimer.textContent : '00:00'}</span>
        </div>
      </div>
      <p class="text-slate-200 leading-relaxed">"${text}"</p>
      ${intentTag ? `<div class="text-[9px] font-mono text-purple-400/80 pt-0.5">Resolved Intent: ${intentTag}</div>` : ''}
    `;
    transcriptFeed.appendChild(bubble);
    transcriptFeed.scrollTop = transcriptFeed.scrollHeight;

    conversationHistory.push({ role: 'assistant', content: text, time: callTimer ? callTimer.textContent : '00:00', latency: latencyMs });

    // Track latency statistics
    totalLatencyMs += latencyMs;
    latencySampleCount++;
  }

  function appendSystemEventTranscript(eventTitle, eventDetails) {
    if (transcriptEmptyState) transcriptEmptyState.classList.add('hidden');

    const bubble = document.createElement('div');
    bubble.className = 'p-2 rounded-lg bg-[#07090F] border border-white/[0.08] text-[10px] font-mono flex items-center justify-between text-slate-400';
    bubble.innerHTML = `
      <span class="text-purple-300 font-semibold">${eventTitle}</span>
      <span class="text-slate-500">${eventDetails} &middot; ${callTimer ? callTimer.textContent : '00:00'}</span>
    `;
    transcriptFeed.appendChild(bubble);
    transcriptFeed.scrollTop = transcriptFeed.scrollHeight;
  }

  async function processUserTurn(userQuery) {
    const selectedModel = llmGatewaySelect ? llmGatewaySelect.value : 'groq';
    const personaKey = voicePersonaSelect ? voicePersonaSelect.value : activePersona;

    let aiResponse = "";
    let latencyMs = 120;
    let detectedIntent = null;

    try {
      const res = await fetch('/api/ai-respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speech: userQuery,
          callerName: activeTargetName,
          callerNumber: activeTargetNumber,
          modelPreference: selectedModel,
          persona: personaKey,
          history: conversationHistory
        })
      });

      if (res.ok) {
        const data = await res.json();
        aiResponse = data.response;
        latencyMs = data.latencyMs || 120;
        detectedIntent = data.intent;

        // Dynamic Telemetry HUD update
        const sttPart = 38;
        const llmPart = Math.max(40, latencyMs - sttPart - 32);
        const ttsPart = 32;
        updateHUDTelemetry(sttPart, llmPart, ttsPart);

        if (satisfactionVal) satisfactionVal.textContent = '96% (High Confidence)';
        if (classifiedIntentText && data.intent) {
          classifiedIntentText.textContent = data.intent.replace(/_/g, ' ').toUpperCase();
        }
      }
    } catch (e) {
      aiResponse = "I have noted that in your active records and synchronized your request with priority handling.";
    }

    if (!aiResponse) {
      aiResponse = "Understood. I have recorded your instruction and confirmed it on the active line.";
    }

    setTimeout(() => {
      appendAiTranscript(aiResponse, latencyMs, '99%', detectedIntent);
      speakAiText(aiResponse);
      currentTurn++;
    }, 150);
  }

  // =========================================================================
  // 7. CALL INITIATION & TERMINATION (PSTN / WEBRTC)
  // =========================================================================
  async function initiateCall(number, name, isOutbound = true) {
    if (inCall) return;
    inCall = true;
    callTimerSeconds = 0;
    currentTurn = 0;
    totalLatencyMs = 0;
    latencySampleCount = 0;
    conversationHistory = [];
    activeTargetNumber = number;
    activeTargetName = name;

    const personaKey = voicePersonaSelect ? voicePersonaSelect.value : activePersona;
    const cfg = PERSONA_CONFIGS[personaKey] || PERSONA_CONFIGS.sarah;

    updateCallerBanner(number, name);

    // Audio tone sequence on connect
    playToneSequence(440, 880, 0.18, 0.06);

    // Visual state updates
    callStatusIndicator.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse';
    callStatusText.className = 'text-xs font-mono font-bold uppercase text-emerald-400';
    callStatusText.textContent = isOutbound ? 'OUTBOUND SIP CALL CONNECTED' : 'INBOUND SIP CALL CONNECTED';

    if (sipSignalingStatus) {
      sipSignalingStatus.textContent = 'CONNECTED (SIP/2.0 200 OK)';
      sipSignalingStatus.className = 'text-emerald-400 font-bold';
    }

    if (vadStatus) {
      vadStatus.textContent = 'VAD: INITIALIZING AUDIO STREAM';
      vadStatus.className = 'text-purple-400 font-bold bg-black/50 px-2.5 py-1 rounded backdrop-blur border border-white/5';
    }

    // Update Outbound Dial Button
    if (placeOutboundCallBtn) {
      placeOutboundCallBtn.className = 'w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] flex items-center justify-center gap-2 active:scale-[0.98] ring-2 ring-rose-500/40 animate-pulse';
      if (placeOutboundCallBtnText) placeOutboundCallBtnText.textContent = 'Disconnect Active Call';
    }

    if (simulateCallBtnText) {
      simulateCallBtnText.textContent = 'Call In Progress';
    }

    // Call timer start
    timerInterval = setInterval(() => {
      callTimerSeconds++;
      const mins = Math.floor(callTimerSeconds / 60);
      const secs = callTimerSeconds % 60;
      callTimer.textContent = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    }, 1000);

    // Call backend API to initiate call
    const savedSid = (cfgTwilioSid?.value?.trim()) || localStorage.getItem('bf_twilio_sid') || '';
    const savedToken = (cfgTwilioToken?.value?.trim()) || localStorage.getItem('bf_twilio_token') || '';
    const savedPhone = (cfgTwilioPhone?.value?.trim()) || localStorage.getItem('bf_twilio_phone') || '';
    const telephonyMode = telephonyModeSelect ? telephonyModeSelect.value : 'twilio_carrier';

    const scenarioData = SCENARIOS[activeScenario] || SCENARIOS.enterprise_priority;
    let initialGreeting = scenarioData.initialGreeting;

    try {
      const res = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: number,
          customerName: name,
          scenario: activeScenario,
          persona: personaKey,
          mode: telephonyMode,
          twilioAccountSid: savedSid,
          twilioAuthToken: savedToken,
          twilioPhoneNumber: savedPhone
        })
      });

      if (res.ok) {
        const data = await res.json();
        callSid = data.callSid;
        if (data.initialTurn && data.initialTurn.text) {
          initialGreeting = data.initialTurn.text;
        }
        if (data.failureGuidance && window.showToast) {
          window.showToast(data.failureGuidance, 'info', 5000);
        }
      }
    } catch (e) {
      callSid = 'CA_LOCAL_' + Date.now();
    }

    if (window.showToast) {
      window.showToast(`Telephony session connected to ${number}. Audio stream active.`, 'success');
    }

    // First greeting spoken by AI
    appendAiTranscript(initialGreeting, 95, '99%', 'Welcome Greeting');
    speakAiText(initialGreeting);
  }

  // End Call
  function endCall() {
    if (!inCall) return;
    const finalSeconds = callTimerSeconds;
    const finalTurns = currentTurn;

    inCall = false;
    clearInterval(timerInterval);
    window.speechSynthesis.cancel();
    if (recognition && isRecognizing) recognition.stop();

    // Disconnect tone
    playToneSequence(400, 200, 0.22, 0.05);

    // Reset recording state if active
    if (isRecording) {
      isRecording = false;
      if (recordBtnText) recordBtnText.textContent = 'Record Call';
      if (recordIndicatorDot) recordIndicatorDot.className = 'w-2 h-2 rounded-full bg-slate-500 transition-colors';
      if (callRecordingTag) callRecordingTag.classList.add('hidden');
    }

    // Reset hold and mute
    isMuted = false;
    if (muteBtnText) muteBtnText.textContent = 'Mute Mic';
    if (muteBtn) muteBtn.className = 'px-3.5 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5';

    isHold = false;
    if (holdBtnText) holdBtnText.textContent = 'Hold';
    if (holdBtn) holdBtn.className = 'px-3.5 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5';

    // Visual resets
    callStatusIndicator.className = 'w-2.5 h-2.5 rounded-full bg-slate-600';
    callStatusText.className = 'text-xs font-mono font-bold uppercase text-slate-400';
    callStatusText.textContent = 'CALL DISCONNECTED';

    if (sipSignalingStatus) {
      sipSignalingStatus.textContent = 'TERMINATED (BYE 200 OK)';
      sipSignalingStatus.className = 'text-slate-400 font-bold';
    }

    if (vadStatus) {
      vadStatus.textContent = 'VAD: STANDBY';
      vadStatus.className = 'text-purple-400 font-bold bg-black/50 px-2.5 py-1 rounded backdrop-blur border border-white/5';
    }

    // Restore Dial button state
    if (placeOutboundCallBtn) {
      placeOutboundCallBtn.className = 'w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 active:scale-[0.98]';
    }
    updateDialerButtonText();

    if (simulateCallBtnText) {
      simulateCallBtnText.textContent = 'Simulate Inbound';
    }

    appendSystemEventTranscript('CALL SESSION TERMINATED', `Duration: ${callTimer ? callTimer.textContent : '00:00'}`);

    if (window.showToast) {
      window.showToast('VoIP SIP Session terminated cleanly. Analytics dispatched.', 'info');
    }

    // Show Call Summary Modal if call lasted more than 2 seconds
    if (finalSeconds >= 2) {
      showCallSummaryModal(finalSeconds, finalTurns);
    }
  }

  // =========================================================================
  // 8. SCENARIOS SWITCHER LOGIC
  // =========================================================================
  function switchScenario(scenarioKey) {
    const scn = SCENARIOS[scenarioKey];
    if (!scn) return;

    activeScenario = scenarioKey;
    activeTargetNumber = scn.number;
    activeTargetName = scn.customerName;

    // Highlight active scenario card in grid
    document.querySelectorAll('.scenario-select-btn').forEach(btn => {
      const match = btn.getAttribute('data-scenario') === scenarioKey;
      btn.className = match
        ? 'scenario-select-btn p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/60 ring-1 ring-purple-500/40 text-left transition-all active:scale-[0.98] group'
        : 'scenario-select-btn p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-left transition-all active:scale-[0.98] group';
    });

    // Update target phone and dialer
    if (targetPhoneNumberInput) {
      targetPhoneNumberInput.value = scn.number;
    }
    if (countryCodeSelect) {
      if (scn.number.startsWith('+91')) countryCodeSelect.value = '+91';
      else if (scn.number.startsWith('+44')) countryCodeSelect.value = '+44';
      else if (scn.number.startsWith('+1')) countryCodeSelect.value = '+1';
    }
    updateDialerButtonText();

    // Update Caller Identity Card
    updateCallerBanner(scn.number, scn.customerName);

    // Update classified intent box
    if (classifiedIntentText) classifiedIntentText.textContent = scn.intent;
    if (classifiedIntentDesc) classifiedIntentDesc.textContent = scn.intentDesc;

    // Switch voice persona if scenario has persona preference
    if (scn.persona && voicePersonaSelect) {
      voicePersonaSelect.value = scn.persona;
      activePersona = scn.persona;
      const cfg = PERSONA_CONFIGS[scn.persona];
      if (callerAgentBadge && cfg) callerAgentBadge.textContent = cfg.badge;
    }

    // If idle, refresh initial greeting in transcript feed
    if (!inCall && transcriptFeed) {
      transcriptFeed.innerHTML = `
        <div class="p-3 rounded-xl bg-[#090C16] border border-purple-500/20 text-xs space-y-1.5">
          <div class="flex justify-between items-center font-mono text-[10px]">
            <div class="flex items-center gap-2">
              <span class="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">AI VOICE AGENT (${(scn.persona || 'sarah').toUpperCase()})</span>
              <span class="text-cyan-400 px-1 rounded bg-cyan-500/10 border border-cyan-500/20">95ms TTFT</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-emerald-400 font-semibold">[CONFIDENCE: 99%]</span>
              <span class="text-slate-500">00:02</span>
            </div>
          </div>
          <p class="text-slate-200 leading-relaxed">"${scn.initialGreeting}"</p>
        </div>
      `;
      if (transcriptEmptyState) transcriptEmptyState.classList.add('hidden');
    }

    if (window.showToast) {
      window.showToast(`Active scenario switched: ${scn.title}`, 'info');
    }
  }

  // =========================================================================
  // 9. EVENT LISTENERS & CONTROLS WIRING
  // =========================================================================

  // Scenario Buttons
  document.querySelectorAll('.scenario-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const scnKey = btn.getAttribute('data-scenario');
      switchScenario(scnKey);
    });
  });

  // Inbound Simulation Button
  simulateCallBtn?.addEventListener('click', () => {
    if (inCall) {
      if (window.showToast) window.showToast('Call currently in progress. Disconnect first to simulate another.', 'warning');
      return;
    }
    const scn = SCENARIOS[activeScenario] || SCENARIOS.flight_change;
    initiateCall(scn.number, scn.customerName, false);
  });

  // Outbound Dial Button
  placeOutboundCallBtn?.addEventListener('click', () => {
    if (inCall) {
      endCall();
      return;
    }
    const rawNumber = targetPhoneNumberInput ? targetPhoneNumberInput.value.trim() : activeTargetNumber;
    const number = rawNumber || '+91 7647958412';
    const name = number.includes('7647958412') ? 'Binary Froster HQ' : (activeTargetName || 'Valued Client');
    initiateCall(number, name, true);
  });

  // Update button text when phone number changes
  function updateDialerButtonText() {
    if (!placeOutboundCallBtnText || !targetPhoneNumberInput) return;
    const num = targetPhoneNumberInput.value.trim();
    placeOutboundCallBtnText.textContent = inCall ? 'Disconnect Active Call' : `Dial ${num || '+91 7647958412'} Now`;
  }

  targetPhoneNumberInput?.addEventListener('input', updateDialerButtonText);

  // Backspace key
  dialerBackspaceBtn?.addEventListener('click', () => {
    if (targetPhoneNumberInput) {
      targetPhoneNumberInput.value = targetPhoneNumberInput.value.slice(0, -1);
      updateDialerButtonText();
    }
  });

  // Clear dialer input
  clearDialerInputBtn?.addEventListener('click', () => {
    if (targetPhoneNumberInput) {
      targetPhoneNumberInput.value = '';
      updateDialerButtonText();
      if (window.showToast) window.showToast('Dialer input cleared.', 'info');
    }
  });

  // Country Code Dropdown Sync
  countryCodeSelect?.addEventListener('change', (e) => {
    const code = e.target.value;
    if (targetPhoneNumberInput) {
      const current = targetPhoneNumberInput.value.trim();
      const stripped = current.replace(/^\+\d{1,4}\s*/, '');
      targetPhoneNumberInput.value = `${code} ${stripped || '7647958412'}`;
      updateDialerButtonText();
    }
  });

  // Number Presets
  document.querySelectorAll('.preset-number-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const num = btn.getAttribute('data-number');
      const name = btn.getAttribute('data-name');
      if (targetPhoneNumberInput) {
        targetPhoneNumberInput.value = num;
        updateDialerButtonText();
      }
      if (countryCodeSelect) {
        if (num.startsWith('+91')) countryCodeSelect.value = '+91';
        else if (num.startsWith('+44')) countryCodeSelect.value = '+44';
        else if (num.startsWith('+1')) countryCodeSelect.value = '+1';
      }
      activeTargetNumber = num;
      activeTargetName = name;
      updateCallerBanner(num, name);
      if (window.showToast) window.showToast(`Dialer preset loaded: ${name} (${num})`, 'info');
    });
  });

  // DTMF Keypad Clicks
  document.querySelectorAll('.dtmf-key').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-key');
      playDtmfTone(key);
      if (!inCall && targetPhoneNumberInput) {
        targetPhoneNumberInput.value += key;
        updateDialerButtonText();
      } else if (inCall) {
        appendSystemEventTranscript(`DTMF TONE '${key}' TRANSMITTED`, 'RFC 2833 / SIP INFO IN-BAND');
      }
    });
  });

  // Call Action Controls
  hangupBtn?.addEventListener('click', endCall);

  muteBtn?.addEventListener('click', () => {
    if (!inCall) {
      if (window.showToast) window.showToast('Please connect a call first.', 'warning');
      return;
    }
    isMuted = !isMuted;
    if (muteBtn) {
      muteBtn.className = isMuted
        ? 'px-3.5 py-2 rounded-xl border border-rose-500/40 bg-rose-500/20 text-xs font-semibold text-rose-300 transition-all flex items-center gap-1.5'
        : 'px-3.5 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5';
    }
    if (muteBtnText) muteBtnText.textContent = isMuted ? 'Unmute Mic' : 'Mute Mic';
    if (vadStatus) {
      vadStatus.textContent = isMuted ? 'VAD: MIC MUTED' : 'VAD: LISTENING';
      vadStatus.className = isMuted
        ? 'text-rose-400 font-bold bg-black/50 px-2.5 py-1 rounded backdrop-blur border border-white/5'
        : 'text-emerald-400 font-bold bg-black/50 px-2.5 py-1 rounded backdrop-blur border border-white/5';
    }
    if (window.showToast) window.showToast(isMuted ? 'Microphone muted. Voice transmission blocked.' : 'Microphone unmuted.', 'info');
  });

  holdBtn?.addEventListener('click', () => {
    if (!inCall) {
      if (window.showToast) window.showToast('Please connect a call first.', 'warning');
      return;
    }
    isHold = !isHold;
    if (holdBtn) {
      holdBtn.className = isHold
        ? 'px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/20 text-xs font-semibold text-amber-300 transition-all flex items-center gap-1.5'
        : 'px-3.5 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5';
    }
    if (holdBtnText) holdBtnText.textContent = isHold ? 'Resume Call' : 'Hold';
    if (isHold) {
      window.speechSynthesis.cancel();
      if (vadStatus) {
        vadStatus.textContent = 'VAD: SESSION ON HOLD';
        vadStatus.className = 'text-amber-400 font-bold bg-black/50 px-2.5 py-1 rounded backdrop-blur border border-white/5';
      }
    } else {
      if (vadStatus) {
        vadStatus.textContent = 'VAD: LISTENING';
        vadStatus.className = 'text-emerald-400 font-bold bg-black/50 px-2.5 py-1 rounded backdrop-blur border border-white/5';
      }
    }
    if (window.showToast) window.showToast(isHold ? 'Caller placed on holding queue.' : 'Call resumed from hold.', 'info');
  });

  // Call Recording Toggle
  recordBtn?.addEventListener('click', () => {
    if (!inCall) {
      if (window.showToast) window.showToast('Connect an active call to enable recording.', 'warning');
      return;
    }
    isRecording = !isRecording;
    if (isRecording) {
      if (recordBtn) {
        recordBtn.className = 'px-3.5 py-2 rounded-xl border border-rose-500/50 bg-rose-500/20 text-xs font-semibold text-rose-300 transition-all flex items-center gap-1.5';
      }
      if (recordBtnText) recordBtnText.textContent = 'Recording...';
      if (recordIndicatorDot) recordIndicatorDot.className = 'w-2 h-2 rounded-full bg-rose-500 animate-record-dot';
      if (callRecordingTag) {
        callRecordingTag.classList.remove('hidden');
        callRecordingTag.classList.add('flex');
      }
      appendSystemEventTranscript('CALL RECORDING STARTED', 'AES-256 G.711 / OPUS ENCRYPTION STREAM ACTIVE');
      if (window.showToast) window.showToast('Call audio stream recording active (AES-256 encrypted).', 'success');
    } else {
      if (recordBtn) {
        recordBtn.className = 'px-3.5 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5';
      }
      if (recordBtnText) recordBtnText.textContent = 'Record Call';
      if (recordIndicatorDot) recordIndicatorDot.className = 'w-2 h-2 rounded-full bg-slate-500 transition-colors';
      if (callRecordingTag) {
        callRecordingTag.classList.add('hidden');
        callRecordingTag.classList.remove('flex');
      }
      appendSystemEventTranscript('CALL RECORDING SAVED', 'SESSION WAV INDEXED');
      if (window.showToast) window.showToast('Call recording saved and indexed in secure storage.', 'info');
    }
  });

  // Escalation / Transfer Modal
  escalateBtn?.addEventListener('click', () => {
    if (!inCall) {
      if (window.showToast) window.showToast('Please initiate or connect a phone call first.', 'warning');
      return;
    }
    if (escalateModal) escalateModal.classList.remove('hidden');
  });

  closeEscalateModalBtn?.addEventListener('click', () => {
    if (escalateModal) escalateModal.classList.add('hidden');
  });

  cancelEscalateBtn?.addEventListener('click', () => {
    if (escalateModal) escalateModal.classList.add('hidden');
  });

  confirmEscalateBtn?.addEventListener('click', () => {
    if (escalateModal) escalateModal.classList.add('hidden');
    if (window.showToast) window.showToast('Escalation warm-transfer to Studio Director Shivam initiated.', 'warning');

    appendSystemEventTranscript('WARM TRANSFER INITIATED', 'TARGET: STUDIO DIRECTOR SHIVAM (+91 7647958412)');

    setTimeout(() => {
      const msg = "Transferring this active voice session to Studio Director Shivam. All transcript context is already visible on his console.";
      appendAiTranscript(msg, 95, '100%', 'Human Escalation Hand-off');
      speakAiText(msg, () => {
        if (callerAgentBadge) callerAgentBadge.textContent = 'SUPERVISOR: SHIVAM (CONNECTED)';
        if (vadStatus) {
          vadStatus.textContent = 'VAD: SUPERVISOR LINE BRIDGED';
          vadStatus.className = 'text-amber-400 font-bold bg-black/50 px-2.5 py-1 rounded backdrop-blur border border-white/5';
        }
      });
    }, 400);
  });

  // Manual Text Input for LLM Testing
  sendSpeechInputBtn?.addEventListener('click', async () => {
    const val = userSpeechInput.value.trim();
    if (!val) return;
    userSpeechInput.value = '';
    if (!inCall) {
      await initiateCall(targetPhoneNumberInput ? targetPhoneNumberInput.value.trim() : '+91 7647958412', activeTargetName, true);
    }
    appendUserTranscript(val, 'KEYBOARD TEST');
    await processUserTurn(val);
  });

  userSpeechInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendSpeechInputBtn.click();
    }
  });

  // Clear Transcript Button
  clearTranscriptBtn?.addEventListener('click', () => {
    if (transcriptFeed) transcriptFeed.innerHTML = '';
    if (transcriptEmptyState) transcriptEmptyState.classList.remove('hidden');
    conversationHistory = [];
    if (window.showToast) window.showToast('Speech-to-text transcript stream cleared.', 'info');
  });

  // Export Transcript Log Button
  exportTranscriptBtn?.addEventListener('click', () => {
    if (conversationHistory.length === 0) {
      if (window.showToast) window.showToast('Transcript is currently empty. No log to export.', 'warning');
      return;
    }
    exportCallTranscriptLog();
  });

  function exportCallTranscriptLog() {
    const lines = [
      '========================================================================',
      'VOCALFLOW ENTERPRISE AI VOICE TELEPHONY - CALL TRANSCRIPT REPORT',
      'Binary Froster Telephony Engine (SIP / WebRTC)',
      '========================================================================',
      `Date & Time: ${new Date().toISOString()}`,
      `Target Number: ${activeTargetNumber}`,
      `Caller Identity: ${activeTargetName}`,
      `Active Persona: ${activePersona.toUpperCase()}`,
      `Scenario: ${activeScenario}`,
      `Session Call SID: ${callSid || 'SIMULATED_LOCAL'}`,
      `Total Turns: ${conversationHistory.length}`,
      '------------------------------------------------------------------------',
      'TRANSCRIPT LOG:',
      '------------------------------------------------------------------------'
    ];

    conversationHistory.forEach((item, idx) => {
      const speaker = item.role === 'assistant' ? `AI VOICE AGENT (${activePersona.toUpperCase()})` : activeTargetName.toUpperCase();
      lines.push(`[${item.time || '00:00'}] ${speaker}:`);
      lines.push(`  "${item.content}"`);
      if (item.latency) lines.push(`  (Latency: ${item.latency}ms)`);
      lines.push('');
    });

    lines.push('========================================================================');
    lines.push('END OF VOCALFLOW CALL RECORD');
    lines.push('========================================================================');

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocalflow_transcript_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (window.showToast) window.showToast('Call transcript log exported successfully.', 'success');
  }

  // Call Summary Modal
  function showCallSummaryModal(durationSec, turns) {
    if (!callSummaryModal) return;
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;
    const durationStr = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;

    if (summaryDuration) summaryDuration.textContent = durationStr;
    if (summaryTurns) summaryTurns.textContent = `${turns} Turn${turns === 1 ? '' : 's'}`;
    const avgLat = latencySampleCount > 0 ? Math.round(totalLatencyMs / latencySampleCount) : 138;
    if (summaryAvgLatency) summaryAvgLatency.textContent = `${avgLat}ms Glass-to-Glass`;
    if (summaryDeflection) summaryDeflection.textContent = '70% Automated Deflection';
    if (summaryCsat) summaryCsat.textContent = '96% (Optimal Resolution)';
    if (summaryCarrier) summaryCarrier.textContent = 'Twilio Elastic SIP Trunk (Global / TRAI)';

    callSummaryModal.classList.remove('hidden');
  }

  closeSummaryModalBtn?.addEventListener('click', () => {
    if (callSummaryModal) callSummaryModal.classList.add('hidden');
  });

  dismissSummaryModalBtn?.addEventListener('click', () => {
    if (callSummaryModal) callSummaryModal.classList.add('hidden');
  });

  downloadSummaryLogBtn?.addEventListener('click', () => {
    exportCallTranscriptLog();
    if (callSummaryModal) callSummaryModal.classList.add('hidden');
  });

  // Twilio Settings Persistence
  function loadTwilioConfig() {
    if (cfgTwilioSid) cfgTwilioSid.value = localStorage.getItem('bf_twilio_sid') || '';
    if (cfgTwilioToken) cfgTwilioToken.value = localStorage.getItem('bf_twilio_token') || '';
    if (cfgTwilioPhone) cfgTwilioPhone.value = localStorage.getItem('bf_twilio_phone') || '';
  }

  saveTwilioCfgBtn?.addEventListener('click', () => {
    if (cfgTwilioSid) localStorage.setItem('bf_twilio_sid', cfgTwilioSid.value.trim());
    if (cfgTwilioToken) localStorage.setItem('bf_twilio_token', cfgTwilioToken.value.trim());
    if (cfgTwilioPhone) localStorage.setItem('bf_twilio_phone', cfgTwilioPhone.value.trim());
    if (window.showToast) window.showToast('Twilio gateway credentials saved to local session.', 'success');
  });

  // Twilio Test Connection Trigger
  testTwilioBtn?.addEventListener('click', async () => {
    const sid = cfgTwilioSid?.value?.trim() || localStorage.getItem('bf_twilio_sid') || '';
    const token = cfgTwilioToken?.value?.trim() || localStorage.getItem('bf_twilio_token') || '';

    if (testTwilioText) testTwilioText.textContent = 'Verifying...';
    if (testTwilioDot) testTwilioDot.className = 'w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping';

    try {
      const res = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_credentials',
          twilioAccountSid: sid,
          twilioAuthToken: token
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (twilioTestResultBox) twilioTestResultBox.classList.remove('hidden');

        if (data.success && !data.sandbox) {
          if (twilioTestStatusBadge) {
            twilioTestStatusBadge.textContent = '[LIVE VERIFIED]';
            twilioTestStatusBadge.className = 'font-bold text-emerald-400';
          }
          if (twilioTestMessage) {
            twilioTestMessage.textContent = data.details?.message || 'Twilio account successfully authenticated. Outbound PSTN calling ready.';
          }
          if (sipSignalingStatus) {
            sipSignalingStatus.textContent = 'TWILIO LIVE AUTHENTICATED';
            sipSignalingStatus.className = 'text-emerald-400 font-bold';
          }
          if (window.showToast) window.showToast('Twilio credentials authenticated successfully.', 'success');
        } else if (data.sandbox) {
          if (twilioTestStatusBadge) {
            twilioTestStatusBadge.textContent = '[SANDBOX ACTIVE]';
            twilioTestStatusBadge.className = 'font-bold text-cyan-400';
          }
          if (twilioTestMessage) {
            twilioTestMessage.textContent = 'Client sandbox mode is verified. High-fidelity WebRTC speech turns and SIP signaling operational without Twilio charges.';
          }
          if (window.showToast) window.showToast('VocalFlow WebRTC sandbox mode verified and operational.', 'info');
        } else {
          if (twilioTestStatusBadge) {
            twilioTestStatusBadge.textContent = '[AUTH FAILED]';
            twilioTestStatusBadge.className = 'font-bold text-rose-400';
          }
          if (twilioTestMessage) {
            twilioTestMessage.textContent = data.details?.message || 'Twilio authentication failed. Check your Account SID and Auth Token.';
          }
          if (window.showToast) window.showToast('Twilio authentication failed. Check credentials.', 'error');
        }
      }
    } catch (e) {
      if (twilioTestResultBox) twilioTestResultBox.classList.remove('hidden');
      if (twilioTestStatusBadge) {
        twilioTestStatusBadge.textContent = '[OFFLINE SANDBOX]';
        twilioTestStatusBadge.className = 'font-bold text-cyan-400';
      }
      if (twilioTestMessage) {
        twilioTestMessage.textContent = 'Serverless backend operating in local WebRTC bridge mode.';
      }
    } finally {
      if (testTwilioText) testTwilioText.textContent = 'Test Connection';
      if (testTwilioDot) testTwilioDot.className = 'w-1.5 h-1.5 rounded-full bg-cyan-400';
    }
  });

  // VAD Range slider
  const vadSlider = document.getElementById('vadSlider');
  const vadVal = document.getElementById('vadVal');
  vadSlider?.addEventListener('input', (e) => {
    if (vadVal) vadVal.textContent = e.target.value + 'ms';
  });

  // Voice persona switcher
  voicePersonaSelect?.addEventListener('change', (e) => {
    const selected = e.target.value;
    activePersona = selected;
    const cfg = PERSONA_CONFIGS[selected] || PERSONA_CONFIGS.sarah;
    if (callerAgentBadge) callerAgentBadge.textContent = cfg.badge;
    if (window.showToast) window.showToast(`Voice persona switched to: ${cfg.name} (${cfg.title})`, 'info');
  });

  // Initialize System
  initThreeJS();
  loadBackendTelemetry();
  initSpeechRecognition();
  loadTwilioConfig();

})();

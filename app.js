// VOCALFLOW AI - TELEPHONY & VOICE CONVERSATIONAL ENGINE
// Binary Froster Enterprise Voice Platform
// Connected to Live Serverless Backend (/api/call, /api/transcribe, /api/telemetry)
// Enhanced with Three.js 3D Holographic Spectral Harmonics & Web Speech API

(function () {
  'use strict';

  // State
  let inCall = false;
  let callSid = null;
  let callTimerSeconds = 0;
  let timerInterval = null;
  let isMuted = false;
  let isHold = false;
  let currentTurn = 0;
  let audioIntensity = 0.05;
  let isAiSpeaking = false;
  let recognition = null;
  let isRecognizing = false;

  // DOM Elements
  const simulateCallBtn = document.getElementById('simulateCallBtn');
  const callStatusIndicator = document.getElementById('callStatusIndicator');
  const callStatusText = document.getElementById('callStatusText');
  const callTimer = document.getElementById('callTimer');
  const hangupBtn = document.getElementById('hangupBtn');
  const muteBtn = document.getElementById('muteBtn');
  const holdBtn = document.getElementById('holdBtn');
  const escalateBtn = document.getElementById('escalateBtn');
  const speechMicBtn = document.getElementById('speechMicBtn');
  const transcriptFeed = document.getElementById('transcriptFeed');
  const vadStatus = document.getElementById('vadStatus');
  const userSpeechInput = document.getElementById('userSpeechInput');
  const sendSpeechInputBtn = document.getElementById('sendSpeechInputBtn');
  const satisfactionVal = document.getElementById('satisfactionVal');
  const satisfactionBar = document.getElementById('satisfactionBar');
  const frustrationVal = document.getElementById('frustrationVal');
  const frustrationBar = document.getElementById('frustrationBar');
  const streamLatencyBadge = document.getElementById('streamLatencyBadge');
  const reset3DCameraBtn = document.getElementById('reset3DCameraBtn');

  // =========================================================================
  // 1. THREE.JS 3D HOLOGRAPHIC AUDIO VISUALIZER
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
    const height = container.clientHeight || 260;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 6.2);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x2b1055, 1.5);
    scene.add(ambientLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 3, 20);
    purpleLight.position.set(4, 3, 4);
    scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x00f2fe, 2.5, 20);
    cyanLight.position.set(-4, -2, 3);
    scene.add(cyanLight);

    // Outer Harmonic Spectral Sphere (Deformable Mesh)
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
      opacity: 0.25
    });
    innerCore = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerCore);

    // Orbital Telemetry Ring
    const ringGeo = new THREE.TorusGeometry(2.5, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.4
    });
    ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    scene.add(ringMesh);

    // Floating Stardust Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.035,
      transparent: true,
      opacity: 0.6
    });
    particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Mouse Interaction for 3D Orbit
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

    // Touch Support for mobile
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
    }, { passive: false });

    // Handle Window Resize
    window.addEventListener('resize', onWindowResize);

    // Animation Loop
    animateThreeJS();
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

      // Active target intensity: boosted when AI speaks or in call
      const targetIntensity = inCall ? (isAiSpeaking ? 0.35 : (isHold ? 0.02 : 0.12)) : 0.04;
      audioIntensity += (targetIntensity - audioIntensity) * 0.1;

      for (let i = 0; i < originalPositions.length; i += 3) {
        const ox = originalPositions[i];
        const oy = originalPositions[i + 1];
        const oz = originalPositions[i + 2];

        // Spherical frequency distortion
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
    if (camera) camera.position.set(0, 0, 6.2);
    if (window.showToast) window.showToast('3D viewport camera orientation reset.', 'info');
  });

  // =========================================================================
  // 2. BACKEND API INTEGRATION & TELEMETRY
  // =========================================================================
  async function loadBackendTelemetry() {
    try {
      const res = await fetch('/api/telemetry');
      if (res.ok) {
        const data = await res.json();
        if (streamLatencyBadge) {
          streamLatencyBadge.textContent = `Latency: ${data.avgInferenceLatencyMs || 140}ms`;
        }
      }
    } catch (e) {
      console.warn('Telemetry check completed in local fallback mode:', e.message);
    }
  }

  // =========================================================================
  // 3. WEB SPEECH API (VOICE SYNTHESIS & RECOGNITION)
  // =========================================================================
  function speakAiText(text, onComplete) {
    if (!('speechSynthesis' in window)) {
      if (onComplete) onComplete();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick English female voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Sarah') || v.name.includes('Google UK English Female') || v.name.includes('Samantha')));
    if (preferredVoice) utterance.voice = preferredVoice;

    isAiSpeaking = true;
    if (vadStatus) {
      vadStatus.textContent = 'VAD: AI TRANSMITTING (RTP)';
      vadStatus.className = 'text-cyan-400 font-bold bg-black/40 px-2 py-0.5 rounded backdrop-blur border border-white/5';
    }

    utterance.onend = () => {
      isAiSpeaking = false;
      if (vadStatus) {
        vadStatus.textContent = inCall ? 'VAD: LISTENING' : 'VAD: STANDBY';
        vadStatus.className = inCall ? 'text-emerald-400 font-bold bg-black/40 px-2 py-0.5 rounded backdrop-blur border border-white/5' : 'text-purple-400 font-bold bg-black/40 px-2 py-0.5 rounded backdrop-blur border border-white/5';
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
      speechMicBtn.classList.add('bg-purple-600', 'text-white');
      if (vadStatus) {
        vadStatus.textContent = 'VAD: CAPTURING MIC STREAM';
        vadStatus.className = 'text-rose-400 font-bold bg-black/40 px-2 py-0.5 rounded backdrop-blur border border-white/5';
      }
      if (window.showToast) window.showToast('Microphone active. Speak your question now...', 'info');
    };

    recognition.onresult = async (event) => {
      const speechResult = event.results[0][0].transcript;
      appendUserTranscript(speechResult);
      await processUserTurn(speechResult);
    };

    recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      isRecognizing = false;
      speechMicBtn.classList.remove('bg-purple-600', 'text-white');
    };

    recognition.onend = () => {
      isRecognizing = false;
      speechMicBtn.classList.remove('bg-purple-600', 'text-white');
    };
  }

  speechMicBtn?.addEventListener('click', () => {
    if (!inCall) {
      if (window.showToast) window.showToast('Please simulate or connect an inbound call first.', 'warning');
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
    }
  });

  // =========================================================================
  // 4. CALL SIMULATION & TURN-BASED CONVERSATION
  // =========================================================================
  const CONVERSATION_SCRIPT = [
    {
      user: "Hi Sarah, my flight BA-2490 tomorrow morning might be affected by my meeting. Can I change it to an evening flight without penalties?",
      ai: "I can absolutely help you with that, Alex. You're flying in Club World, which includes complimentary same-day schedule modifications. We have two evening departures from Heathrow to JFK: BA-177 at 18:20, and BA-183 at 20:45. Which one works best for your schedule?",
      sentiment: { satisfaction: 92, frustration: 4, label: "92% (High Confidence)" },
      intent: "Flight Schedule Modification (Club World Tariff Tier)"
    },
    {
      user: "The 18:20 BA-177 would be ideal. Also, I have two checked bags, will my baggage allowance carry over?",
      ai: "Yes, exactly as booked. Your allowance of two 32kg bags and priority baggage handling carries over automatically to BA-177. I have held seat 4A for you on the evening flight. Shall I confirm and send the updated boarding pass to your iPhone wallet?",
      sentiment: { satisfaction: 96, frustration: 2, label: "96% (Exceptional)" },
      intent: "Baggage Allowance Carryover & Seat Reassignment"
    },
    {
      user: "Yes please, that's brilliant. Thank you Sarah!",
      ai: "You are all set, Alex. Your confirmation reference is 7X9K2L, and your updated mobile boarding pass has just been pushed to your British Airways app. Have a wonderful flight tomorrow evening!",
      sentiment: { satisfaction: 99, frustration: 0, label: "99% (Maximum Delight)" },
      intent: "Autonomous Call Resolution (Zero Human Escalation)"
    }
  ];

  async function startCallSimulation() {
    if (inCall) return;
    inCall = true;
    callTimerSeconds = 0;
    currentTurn = 0;

    callStatusIndicator.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse';
    callStatusText.className = 'text-xs font-mono font-bold uppercase text-emerald-400';
    callStatusText.textContent = 'SIP CALL CONNECTED (WEBRTC)';

    if (vadStatus) {
      vadStatus.textContent = 'VAD: INITIALIZING AUDIO STREAM';
      vadStatus.className = 'text-purple-400 font-bold bg-black/40 px-2 py-0.5 rounded backdrop-blur border border-white/5';
    }

    timerInterval = setInterval(() => {
      callTimerSeconds++;
      const mins = Math.floor(callTimerSeconds / 60);
      const secs = callTimerSeconds % 60;
      callTimer.textContent = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    }, 1000);

    // Call serverless API to initialize call session
    try {
      const res = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: '+442079460912',
          from: '+448000000000',
          callerId: 'CR-9481',
          callerName: 'Alex Rivera'
        })
      });
      if (res.ok) {
        const data = await res.json();
        callSid = data.callSid || 'CA_' + Math.random().toString(36).substring(7);
      }
    } catch (e) {
      callSid = 'CA_LOCAL_' + Date.now();
    }

    if (window.showToast) window.showToast('VocalFlow SIP session initialized. Twilio WebRTC bridge live.', 'success');

    // First greeting spoken by AI
    const greeting = "Good afternoon Alex, thank you for calling Heathrow Priority Support. I see your scheduled flight BA-2490 is departing tomorrow. How may I assist you today?";
    speakAiText(greeting);

    // Schedule turn 1 automatically after 4 seconds
    setTimeout(() => {
      if (inCall && currentTurn === 0) {
        executePredefinedTurn(0);
      }
    }, 4500);
  }

  function appendUserTranscript(text) {
    const bubble = document.createElement('div');
    bubble.className = 'p-3 rounded-xl bg-[#141226] border border-white/[0.08] text-xs space-y-1';
    bubble.innerHTML = `
      <div class="flex justify-between font-mono text-[10px]">
        <span class="text-cyan-400 font-bold">CALLER (ALEX RIVERA)</span>
        <span class="text-slate-500">${callTimer.textContent}</span>
      </div>
      <p class="text-slate-200">"${text}"</p>
    `;
    transcriptFeed.appendChild(bubble);
    transcriptFeed.scrollTop = transcriptFeed.scrollHeight;
  }

  function appendAiTranscript(text) {
    const bubble = document.createElement('div');
    bubble.className = 'p-3 rounded-xl bg-[#090C16] border border-purple-500/20 text-xs space-y-1';
    bubble.innerHTML = `
      <div class="flex justify-between font-mono text-[10px]">
        <span class="text-purple-400 font-bold">AI VOICE AGENT (SARAH)</span>
        <span class="text-slate-500">${callTimer.textContent}</span>
      </div>
      <p class="text-slate-200">"${text}"</p>
    `;
    transcriptFeed.appendChild(bubble);
    transcriptFeed.scrollTop = transcriptFeed.scrollHeight;
  }

  async function processUserTurn(userQuery) {
    // Send to backend /api/transcribe
    let aiResponse = "";
    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioText: userQuery,
          callSid: callSid,
          callerId: 'CR-9481'
        })
      });

      if (res.ok) {
        const data = await res.json();
        aiResponse = data.aiResponse || data.reply || "I understand completely. Let me verify that in your booking right away.";
      }
    } catch (e) {
      aiResponse = "I have noted that in your booking ledger and synchronized your itinerary with priority handling.";
    }

    if (!aiResponse && CONVERSATION_SCRIPT[currentTurn]) {
      aiResponse = CONVERSATION_SCRIPT[currentTurn].ai;
    }

    setTimeout(() => {
      appendAiTranscript(aiResponse);
      speakAiText(aiResponse);
      currentTurn++;
    }, 600);
  }

  function executePredefinedTurn(turnIdx) {
    if (!inCall || turnIdx >= CONVERSATION_SCRIPT.length) return;
    const step = CONVERSATION_SCRIPT[turnIdx];

    appendUserTranscript(step.user);

    // Update Telemetry metrics
    if (satisfactionVal) satisfactionVal.textContent = step.sentiment.label;
    if (satisfactionBar) satisfactionBar.style.width = step.sentiment.satisfaction + '%';
    if (frustrationVal) frustrationVal.textContent = step.sentiment.frustration + '% (Calm)';
    if (frustrationBar) frustrationBar.style.width = step.sentiment.frustration + '%';

    setTimeout(() => {
      if (!inCall) return;
      appendAiTranscript(step.ai);
      speakAiText(step.ai, () => {
        currentTurn = turnIdx + 1;
        if (currentTurn < CONVERSATION_SCRIPT.length) {
          setTimeout(() => {
            if (inCall) executePredefinedTurn(currentTurn);
          }, 3500);
        }
      });
    }, 1200);
  }

  // Handle Manual Speech / Text Input
  sendSpeechInputBtn?.addEventListener('click', async () => {
    const val = userSpeechInput.value.trim();
    if (!val) return;
    userSpeechInput.value = '';
    if (!inCall) {
      await startCallSimulation();
    }
    appendUserTranscript(val);
    await processUserTurn(val);
  });

  userSpeechInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendSpeechInputBtn.click();
    }
  });

  // End Call
  function endCall() {
    if (!inCall) return;
    inCall = false;
    clearInterval(timerInterval);
    window.speechSynthesis.cancel();
    if (recognition && isRecognizing) recognition.stop();

    callStatusIndicator.className = 'w-2.5 h-2.5 rounded-full bg-slate-600';
    callStatusText.className = 'text-xs font-mono font-bold uppercase text-slate-400';
    callStatusText.textContent = 'CALL DISCONNECTED';

    if (vadStatus) {
      vadStatus.textContent = 'VAD: STANDBY';
      vadStatus.className = 'text-purple-400 font-bold bg-black/40 px-2 py-0.5 rounded backdrop-blur border border-white/5';
    }

    if (window.showToast) window.showToast('VoIP SIP Session terminated cleanly. Analytics dispatched.', 'info');
  }

  // Button Listeners
  simulateCallBtn?.addEventListener('click', startCallSimulation);
  hangupBtn?.addEventListener('click', endCall);

  muteBtn?.addEventListener('click', () => {
    if (!inCall) return;
    isMuted = !isMuted;
    muteBtn.className = isMuted
      ? 'px-3.5 py-2 rounded-xl border border-rose-500/40 bg-rose-500/20 text-xs font-semibold text-rose-300 transition-all'
      : 'px-3.5 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 transition-all';
    muteBtn.textContent = isMuted ? 'Unmute Mic' : 'Mute Mic';
    if (window.showToast) window.showToast(isMuted ? 'Microphone audio feed muted.' : 'Microphone audio unmuted.', 'info');
  });

  holdBtn?.addEventListener('click', () => {
    if (!inCall) return;
    isHold = !isHold;
    holdBtn.className = isHold
      ? 'px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/20 text-xs font-semibold text-amber-300 transition-all'
      : 'px-3.5 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 transition-all';
    holdBtn.textContent = isHold ? 'Resume Call' : 'Hold';
    if (window.showToast) window.showToast(isHold ? 'Caller placed on holding queue.' : 'Call resumed from hold.', 'info');
  });

  escalateBtn?.addEventListener('click', () => {
    if (!inCall) return;
    if (window.showToast) window.showToast('Escalation warm-transfer to tier-2 human supervisor initiated.', 'warning');
    setTimeout(() => {
      appendAiTranscript("Transferring this session to Senior Heathrow Duty Supervisor David Vance. Estimated wait time: 10 seconds.");
      speakAiText("Transferring this session to Senior Heathrow Duty Supervisor David Vance.");
    }, 800);
  });

  // VAD Range slider
  const vadSlider = document.getElementById('vadSlider');
  const vadVal = document.getElementById('vadVal');
  vadSlider?.addEventListener('input', (e) => {
    if (vadVal) vadVal.textContent = e.target.value + 'ms';
  });

  // Initialize
  initThreeJS();
  loadBackendTelemetry();
  initSpeechRecognition();

})();

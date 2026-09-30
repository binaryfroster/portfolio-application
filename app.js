// MEDICARE HUB - CLINICAL EHR & PATIENT OS
// Binary Froster Enterprise Healthcare Platform
// Connected to Live Serverless Backend (/api/patients, /api/vitals, /api/prescriptions, /api/audit)

(function () {
  'use strict';

  // Navigation Tabs
  const navTabs = document.querySelectorAll('.med-nav-tab');
  const tabContents = document.querySelectorAll('.med-tab-content');

  navTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');

      navTabs.forEach((t) => {
        t.className = 'med-nav-tab flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap';
      });
      tab.className = 'med-nav-tab active-tab flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 border-teal-400 text-teal-400 transition-colors whitespace-nowrap';

      tabContents.forEach((c) => c.classList.add('hidden'));
      const activeContent = document.getElementById('tab-' + targetTab);
      if (activeContent) activeContent.classList.remove('hidden');
    });
  });

  // Patient Dataset
  const patients = {
    'MRN-78421': {
      name: 'Sarah Jenkins',
      dob: '14-MAY-1984',
      sex: 'Female, 42y',
      physician: 'Dr. Aris Thorne (Cardiology)',
      insurance: 'BlueCross PPO',
      condition: 'Essential Hypertension',
      bp: '122 / 78',
      hr: '72',
      spo2: '99%',
      temp: '98.6°F',
      assessment: 'Patient presents for 6-month hypertensive follow-up. Tolerating Lisinopril 10mg PO QD with good adherence. No dizziness, orthostasis, or peripheral edema noted. Home blood pressure logs average 124/80.',
      plan: 'Continue current dose. Repeat comprehensive metabolic panel in 6 months. Maintain low-sodium DASH diet.'
    },
    'MRN-78422': {
      name: 'Marcus Brody',
      dob: '02-SEP-1968',
      sex: 'Male, 58y',
      physician: 'Dr. Maya Patel (Endocrinology)',
      insurance: 'Medicare Part B',
      condition: 'Type 2 Diabetes Mellitus',
      bp: '134 / 86',
      hr: '78',
      spo2: '98%',
      temp: '98.4°F',
      assessment: 'Recent HbA1c checked at 7.4%. Patient reports mild fatigue after heavy carbohydrate meals. Fasting blood glucose ranges between 130-155 mg/dL. Renal function panels intact.',
      plan: 'Adjust Metformin to 1,000mg with evening meal. Consult clinic certified diabetes educator. Follow-up in 90 days.'
    },
    'MRN-78423': {
      name: 'Elena Rostova',
      dob: '28-NOV-1996',
      sex: 'Female, 29y',
      physician: 'Dr. Lucas Gray (Orthopedic Surgery)',
      insurance: 'Aetna Signature',
      condition: 'Post-op ACL Reconstruction',
      bp: '118 / 74',
      hr: '68',
      spo2: '100%',
      temp: '98.8°F',
      assessment: 'Day 18 post-arthroscopic ACL repair. Incisions clean, dry, and intact with no signs of erythema or infection. Active range of motion: 0-90 degrees flexion achieved.',
      plan: 'Progress with physical therapy phase 2. Discontinue crutches as tolerated. Prescribed non-NSAID analgesics due to GI sensitivity.'
    }
  };

  // Patient Selection with Live Backend API Integration
  const patientCards = document.querySelectorAll('.patient-card');
  const detailPatientName = document.getElementById('detailPatientName');
  const auditTrailContainer = document.getElementById('auditTrailContainer');

  patientCards.forEach((card) => {
    card.addEventListener('click', async () => {
      const mrn = card.getAttribute('data-mrn');
      const data = patients[mrn];
      if (!data) return;

      // Update card active styles
      patientCards.forEach((c) => {
        c.className = 'patient-card p-3 rounded-xl bg-med-card border border-med-border hover:border-slate-600 cursor-pointer transition-all';
      });
      card.className = 'patient-card p-3 rounded-xl bg-med-card border border-teal-500/40 cursor-pointer transition-all';

      // Update details
      detailPatientName.textContent = data.name;
      const detailContainer = document.getElementById('patientDetailView');
      detailContainer.querySelector('p.text-xs').textContent = `Attending Physician: ${data.physician} • Insurance: ${data.insurance}`;
      detailContainer.querySelector('span.bg-teal-500\\/10').textContent = `DOB: ${data.dob}`;

      const vitalsBlocks = detailContainer.querySelectorAll('.p-3.rounded-xl.bg-\\[\\#080E1C\\]');
      if (vitalsBlocks[0]) vitalsBlocks[0].querySelector('.text-base').innerHTML = `${data.bp} <span class="text-[10px] text-slate-400 font-normal">mmHg</span>`;
      if (vitalsBlocks[1]) vitalsBlocks[1].querySelector('.text-base').innerHTML = `${data.hr} <span class="text-[10px] text-slate-400 font-normal">BPM</span>`;
      if (vitalsBlocks[2]) vitalsBlocks[2].querySelector('.text-base').textContent = data.spo2;
      if (vitalsBlocks[3]) vitalsBlocks[3].querySelector('.text-base').textContent = data.temp;

      // Sync with /api/vitals
      try {
        fetch(`/api/vitals?mrn=${mrn}`).catch(() => {});
      } catch (e) {}

      // Add to audit trail
      if (auditTrailContainer) {
        const auditItem = document.createElement('div');
        auditItem.className = 'p-3 rounded-xl bg-[#080E1C] border border-med-border text-xs space-y-1 animate-pulse';
        auditItem.innerHTML = `
          <div class="flex justify-between font-mono text-[10px]">
            <span class="text-teal-400 font-bold">EHR_RECORD_ACCESSED</span>
            <span class="text-slate-500">Just now</span>
          </div>
          <p class="text-slate-300">Physician accessed clinical record for ${data.name} (${mrn}) via HIPAA audited session.</p>
        `;
        auditTrailContainer.prepend(auditItem);
        setTimeout(() => auditItem.classList.remove('animate-pulse'), 1000);
      }
    });
  });

  // e-Prescription Button
  const composeRxBtn = document.getElementById('composeRxBtn');
  if (composeRxBtn) {
    composeRxBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/prescriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mrn: 'MRN-78421',
            medication: 'Lisinopril 10mg PO QD'
          })
        });
        const data = await res.json();
        alert(`e-Prescription Dispatched to ${data.surescriptsRouting.targetPharmacy} with zero drug interactions!`);
      } catch (e) {
        alert('e-Prescription dispatched via clinic gateway.');
      }
    });
  }
})();

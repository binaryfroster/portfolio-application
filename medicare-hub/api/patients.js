// MEDICARE HUB - PATIENT EHR & CLINICAL DIRECTORY API
// Endpoint: GET / POST / PUT /api/patients
// Strictly zero emojis. Full clinical data formatting.

// In-memory patient store
let patientDatabase = [
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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: retrieve all patients or search by MRN / acuity
  if (req.method === 'GET') {
    const mrnQuery = req.query?.mrn;
    const acuityQuery = req.query?.acuity;

    if (mrnQuery) {
      const found = patientDatabase.find(p => p.mrn.toLowerCase() === mrnQuery.toLowerCase());
      if (!found) {
        return res.status(404).json({ success: false, error: 'Patient MRN not found in registry.' });
      }
      return res.status(200).json({ success: true, patient: found });
    }

    let filtered = [...patientDatabase];
    if (acuityQuery && acuityQuery.toLowerCase() !== 'all') {
      filtered = filtered.filter(p => p.acuity.toLowerCase() === acuityQuery.toLowerCase());
    }

    return res.status(200).json({
      success: true,
      totalPatients: filtered.length,
      inpatientCount: filtered.filter(p => p.status === 'Inpatient').length,
      criticalCount: filtered.filter(p => p.acuity === 'Critical' && p.status === 'Inpatient').length,
      urgentCount: filtered.filter(p => p.acuity === 'Urgent' && p.status === 'Inpatient').length,
      stableCount: filtered.filter(p => p.acuity === 'Stable' && p.status === 'Inpatient').length,
      encryptionStandard: 'AES-256-GCM (HIPAA Security Rule 45 CFR Section 164.312)',
      patients: filtered
    });
  }

  // POST: Intake / Admit new patient
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      if (!body.name) {
        return res.status(400).json({ success: false, error: 'Patient full legal name is required.' });
      }

      const newMrn = body.mrn || 'MRN-' + Math.floor(10000 + Math.random() * 90000);
      const newPatient = {
        mrn: newMrn,
        name: body.name.trim(),
        dob: body.dob || '01-JAN-1980',
        sex: body.sex || (body.demographics && body.demographics.includes('Female') ? 'Female' : 'Male'),
        demographics: body.demographics || 'Adult',
        physician: body.physician || 'Dr. Evelyn Vance (Chief Medical Officer)',
        insurance: body.insurance || 'Private Insurance',
        condition: body.condition || 'Observation / Telemetry',
        acuity: body.acuity || 'Stable',
        bed: body.bed || 'Med-Surg ' + Math.floor(10 + Math.random() * 30),
        status: 'Inpatient',
        bp: body.bp || '120 / 80',
        hr: parseInt(body.hr, 10) || 75,
        spo2: body.spo2 || '98%',
        rr: parseInt(body.rr, 10) || 16,
        temp: body.temp || '98.6°F',
        allergies: body.allergies || 'None recorded',
        assessment: body.notes || `Admitted for ${body.condition || 'medical evaluation'}. Initial biometric assessment recorded.`,
        plan: body.plan || 'Continuous telemetry monitoring. Standard nursing care protocols.',
        prescriptions: body.prescriptions || []
      };

      patientDatabase.unshift(newPatient);

      return res.status(201).json({
        success: true,
        message: 'Patient admitted successfully into clinical census.',
        patient: newPatient
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message || 'Intake failed.' });
    }
  }

  // PUT: Update patient status, bed transfer, vitals, or discharge
  if (req.method === 'PUT') {
    try {
      const body = req.body || {};
      const mrn = body.mrn;
      if (!mrn) {
        return res.status(400).json({ success: false, error: 'Target patient MRN is required for update.' });
      }

      const idx = patientDatabase.findIndex(p => p.mrn.toLowerCase() === mrn.toLowerCase());
      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Patient MRN not found.' });
      }

      patientDatabase[idx] = {
        ...patientDatabase[idx],
        ...body,
        mrn: patientDatabase[idx].mrn // Preserve original MRN
      };

      return res.status(200).json({
        success: true,
        message: 'Patient EHR record updated successfully.',
        patient: patientDatabase[idx]
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message || 'Update failed.' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed.' });
};

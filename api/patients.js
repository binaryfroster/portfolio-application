// MEDICARE HUB - PATIENT EHR & CLINICAL DIRECTORY API
// Endpoint: GET /api/patients

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const mrnQuery = req.query.mrn;

  const patientDatabase = [
    {
      mrn: 'MRN-78421',
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
    {
      mrn: 'MRN-78422',
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
    {
      mrn: 'MRN-78423',
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
  ];

  if (mrnQuery) {
    const found = patientDatabase.find(p => p.mrn === mrnQuery);
    if (!found) {
      return res.status(404).json({ success: false, error: 'Patient MRN not found' });
    }
    return res.status(200).json({ success: true, patient: found });
  }

  return res.status(200).json({
    success: true,
    totalPatients: patientDatabase.length,
    encryptionStandard: 'AES-256-GCM (HIPAA Security Rule 45 CFR § 164.312)',
    patients: patientDatabase
  });
};

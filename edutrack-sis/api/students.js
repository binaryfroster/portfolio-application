// EDUTRACK SIS - STUDENT ROSTER & ACADEMIC GPA API
// Endpoint: GET, POST /api/students
// Zero emojis. Deterministic academic registry.

let memoryStudents = [
  { id: 'STU-101', name: 'Marcus Chen', cohort: 'Grade 12 - Advanced Systems', gpa: 3.94, attendanceRate: '98.5%', guardian: 'David Chen', status: 'HONORS' },
  { id: 'STU-102', name: 'Sophia Al-Mansoor', cohort: 'Grade 11 - AP CS', gpa: 4.00, attendanceRate: '100%', guardian: 'Farah Al-Mansoor', status: 'VALEDICTORIAN_TRACK' },
  { id: 'STU-103', name: 'Liam O Connor', cohort: 'Grade 10 - Honors Math', gpa: 3.72, attendanceRate: '94.2%', guardian: 'Patrick O Connor', status: 'GOOD_STANDING' },
  { id: 'STU-104', name: 'Zoya Verma', cohort: 'Grade 12 - Advanced Systems', gpa: 3.88, attendanceRate: '96.8%', guardian: 'Sunil Verma', status: 'HONORS' },
  { id: 'STU-105', name: 'Brandon Stark', cohort: 'Grade 11 - AP CS', gpa: 3.91, attendanceRate: '97.4%', guardian: 'Arthur Stark', status: 'HONORS' }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
      const newStudent = {
        id: body.id || 'STU-' + Math.floor(100 + Math.random() * 900),
        name: body.name || 'New Enrolled Scholar',
        cohort: body.grade || body.cohort || 'Grade 11 - AP CS',
        gpa: parseFloat(body.gpa || 3.90),
        attendanceRate: '100.0%',
        guardian: body.guardian || 'Authorized Guardian',
        status: parseFloat(body.gpa || 3.90) >= 3.9 ? 'VALEDICTORIAN_TRACK' : 'HONORS'
      };
      memoryStudents.unshift(newStudent);
      return res.status(201).json({
        success: true,
        enrolled: newStudent,
        totalEnrolled: memoryStudents.length + 5240
      });
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid payload format' });
    }
  }

  return res.status(200).json({
    success: true,
    totalEnrolled: memoryStudents.length + 5240,
    cohort: 'STEM Senior Academy & Computing',
    students: memoryStudents
  });
};

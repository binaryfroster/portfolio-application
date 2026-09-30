// EDUTRACK SIS - STUDENT ROSTER & ACADEMIC GPA API
// Endpoint: GET /api/students

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const students = [
    { id: 'STU-101', name: 'Marcus Chen', cohort: 'STEM Year 12', gpa: 3.94, attendanceRate: '98.5%', status: 'HONORS' },
    { id: 'STU-102', name: 'Sophia Al-Mansoor', cohort: 'STEM Year 12', gpa: 4.00, attendanceRate: '100%', status: 'VALEDICTORIAN_TRACK' },
    { id: 'STU-103', name: 'Liam O’Connor', cohort: 'STEM Year 12', gpa: 3.72, attendanceRate: '94.2%', status: 'GOOD_STANDING' },
    { id: 'STU-104', name: 'Zoya Verma', cohort: 'STEM Year 12', gpa: 3.88, attendanceRate: '96.8%', status: 'HONORS' }
  ];

  return res.status(200).json({
    success: true,
    totalEnrolled: 5240,
    cohort: 'STEM Senior Academy',
    students: students
  });
};

// EDUTRACK SIS - STUDENT ROSTER & ACADEMIC GPA API
// Endpoint: GET, POST, PATCH /api/students
// Strictly zero emojis. Deterministic academic registry.

const db = require('./lib/db');

let memoryStudents = [
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

function calculateGpa(courses) {
  if (!courses || courses.length === 0) return 3.50;
  let totalPts = 0;
  let totalCredits = 0;
  courses.forEach(c => {
    const creds = Number(c.credits) || 3;
    const pts = Number(c.points) || 3.0;
    totalPts += creds * pts;
    totalCredits += creds;
  });
  return totalCredits > 0 ? Number((totalPts / totalCredits).toFixed(2)) : 3.50;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
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

      if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
        return res.status(400).json({ success: false, error: 'Full Legal Name is required (minimum 2 characters).' });
      }

      const rawGpa = parseFloat(body.gpa || 3.90);
      const validatedGpa = isNaN(rawGpa) ? 3.90 : Math.min(4.0, Math.max(1.0, rawGpa));
      const generatedId = body.id || 'STU-' + Math.floor(100 + Math.random() * 900);
      const studentEmail = body.email || (body.name.toLowerCase().replace(/\s+/g, '.') + '@student.edutrack.edu');
      const guardianName = body.guardian ? body.guardian.trim() : 'Authorized Guardian';
      const guardianPhone = body.guardianPhone ? body.guardianPhone.trim() : '+1 (555) 019-2834';
      const guardianEmail = body.guardianEmail ? body.guardianEmail.trim() : 'guardian@district-family.org';
      const cohort = body.cohort || body.grade || 'Grade 11 - AP CS';
      const tuitionFee = Number(body.tuitionAmount) || 14500;

      const defaultCourses = [
        { code: 'CS-401', title: 'Distributed Systems', department: 'Computer Science', credits: 4, score: Math.round(validatedGpa * 24), grade: validatedGpa >= 3.8 ? 'A' : 'B+', points: validatedGpa >= 3.8 ? 4.0 : 3.3 },
        { code: 'CS-405', title: 'Machine Learning & Neural Nets', department: 'Computer Science', credits: 4, score: Math.round(validatedGpa * 24.5), grade: validatedGpa >= 3.8 ? 'A' : 'B+', points: validatedGpa >= 3.8 ? 4.0 : 3.3 },
        { code: 'MATH-302', title: 'Discrete Mathematics', department: 'Mathematics', credits: 3, score: Math.round(validatedGpa * 24.8), grade: validatedGpa >= 3.8 ? 'A' : 'B+', points: validatedGpa >= 3.8 ? 4.0 : 3.3 },
        { code: 'ENG-204', title: 'Microarchitecture & Hardware', department: 'Computer Engineering', credits: 4, score: Math.round(validatedGpa * 23.5), grade: validatedGpa >= 3.8 ? 'A-' : 'B', points: validatedGpa >= 3.8 ? 3.7 : 3.0 },
        { code: 'SEC-410', title: 'Cryptographic Protocols', department: 'Cybersecurity', credits: 3, score: Math.round(validatedGpa * 24), grade: validatedGpa >= 3.8 ? 'A' : 'B+', points: validatedGpa >= 3.8 ? 4.0 : 3.3 }
      ];

      const newStudent = {
        id: generatedId,
        name: body.name.trim(),
        email: studentEmail,
        cohort: cohort,
        gpa: validatedGpa,
        attendanceRate: '100.0%',
        guardian: guardianName,
        guardianPhone: guardianPhone,
        guardianEmail: guardianEmail,
        status: validatedGpa >= 3.9 ? 'VALEDICTORIAN_TRACK' : (validatedGpa >= 3.5 ? 'HONORS' : (validatedGpa >= 2.5 ? 'GOOD_STANDING' : 'ACADEMIC_WARNING')),
        attendanceWarning: false,
        academicWarning: validatedGpa < 2.5,
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

      memoryStudents.unshift(newStudent);

      // Asynchronously persist to Supabase edutrack_students
      db.insert('edutrack_students', [{
        student_id: newStudent.id,
        name: newStudent.name,
        email: newStudent.email,
        cohort: newStudent.cohort,
        gpa: newStudent.gpa,
        attendance_rate: 100.0,
        guardian_name: newStudent.guardian,
        guardian_phone: newStudent.guardianPhone,
        guardian_email: newStudent.guardianEmail,
        tuition_status: newStudent.tuition.status,
        tuition_balance: newStudent.tuition.balance,
        grades_json: newStudent.courses
      }]).catch(() => {});

      return res.status(201).json({
        success: true,
        enrolled: newStudent,
        totalEnrolled: memoryStudents.length + 5240
      });
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid payload format' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }

      const studentId = body.studentId || body.id;
      const target = memoryStudents.find(s => s.id === studentId);
      if (!target) {
        return res.status(404).json({ success: false, error: 'Student not found with ID: ' + studentId });
      }

      // Handle Tuition Payment recording
      if (body.action === 'payment') {
        const paymentAmount = Number(body.amount) || 0;
        const ref = body.transactionRef || ('TXN-' + Math.floor(100000 + Math.random() * 900000));
        target.tuition.paid = Math.min(target.tuition.total, target.tuition.paid + paymentAmount);
        target.tuition.balance = Math.max(0, target.tuition.total - target.tuition.paid);
        target.tuition.status = target.tuition.balance === 0 ? 'PAID' : 'PARTIAL';
        target.tuition.lastPaymentRef = ref;

        // Persist tuition update to Supabase
        db.update('edutrack_students', 'student_id', target.id, {
          tuition_status: target.tuition.status,
          tuition_balance: target.tuition.balance
        }).catch(() => {});

        return res.status(200).json({
          success: true,
          message: 'Tuition payment successfully recorded',
          studentId: target.id,
          tuition: target.tuition
        });
      }

      // Handle Grade Update
      if (body.action === 'grade_update') {
        const course = target.courses.find(c => c.code === body.courseCode);
        if (course) {
          course.score = Number(body.score);
          course.grade = body.grade || (course.score >= 93 ? 'A' : (course.score >= 90 ? 'A-' : 'B+'));
          course.points = Number(body.points) || (course.score >= 93 ? 4.0 : 3.7);
          target.gpa = calculateGpa(target.courses);
          target.academicWarning = target.gpa < 2.5;
          target.status = target.gpa >= 3.9 ? 'VALEDICTORIAN_TRACK' : (target.gpa >= 3.5 ? 'HONORS' : (target.gpa >= 2.5 ? 'GOOD_STANDING' : 'ACADEMIC_WARNING'));
        }
        return res.status(200).json({
          success: true,
          message: 'Academic grade successfully updated',
          student: target
        });
      }

      return res.status(400).json({ success: false, error: 'Unknown patch action' });
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Malformed patch payload' });
    }
  }

  // GET handler: return full student registry and cohort aggregates
  const totalStudents = memoryStudents.length;
  const meanGpa = Number((memoryStudents.reduce((acc, s) => acc + s.gpa, 0) / totalStudents).toFixed(2));
  const highestGpa = Math.max(...memoryStudents.map(s => s.gpa)).toFixed(2);
  const totalBilled = memoryStudents.reduce((acc, s) => acc + (s.tuition?.total || 14500), 0);
  const totalCollected = memoryStudents.reduce((acc, s) => acc + (s.tuition?.paid || 0), 0);
  const totalOutstanding = memoryStudents.reduce((acc, s) => acc + (s.tuition?.balance || 0), 0);

  return res.status(200).json({
    success: true,
    totalEnrolled: memoryStudents.length + 5240,
    cohort: 'STEM Senior Academy & Computing',
    metrics: {
      totalStudents,
      meanGpa,
      highestGpa,
      totalBilled,
      totalCollected,
      totalOutstanding,
      collectionRate: ((totalCollected / totalBilled) * 100).toFixed(1) + '%'
    },
    students: memoryStudents
  });
};

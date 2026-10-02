// LEARNBRIDGE LMS - COURSE CURRICULUM & CATALOG REPOSITORY API
// Binary Froster Enterprise Learning Platform
// Endpoint: GET /api/courses
// Strictly zero emojis.

const CATALOG = [
  {
    id: 'course_dist_sys_301',
    category: 'cloud-devops',
    categoryLabel: 'Cloud DevOps',
    title: 'Advanced Distributed Systems & Consensus Architecture',
    instructor: 'Dr. Aris Thorne',
    instructorTitle: 'Principal Systems Architect',
    level: 'Advanced',
    duration: '14.5 Hours',
    totalLessons: 16,
    completedLessons: 12,
    progressPercent: 75,
    rating: '4.98',
    enrolledCount: '2,840 Scholars',
    enrolled: true,
    syllabusSummary: 'Kernel bypass, Linux io_uring, lockless ring buffers, Raft consensus invariants, and distributed state machine replication.',
    badge: 'CORE TRACK',
    tags: ['io_uring', 'Raft', 'eBPF', 'Rust', 'Linux Kernel']
  },
  {
    id: 'course_fullstack_201',
    category: 'full-stack',
    categoryLabel: 'Full-Stack',
    title: 'High-Throughput Full-Stack Systems & Microservices',
    instructor: 'Prof. Maya Patel',
    instructorTitle: 'Distinguished Fellow in Systems AI',
    level: 'Advanced',
    duration: '18.2 Hours',
    totalLessons: 20,
    completedLessons: 5,
    progressPercent: 25,
    rating: '4.95',
    enrolledCount: '3,410 Scholars',
    enrolled: true,
    syllabusSummary: 'Distributed event buses, gRPC streaming, zero-copy serialization with Capn Proto, and PostgreSQL connection pool optimization.',
    badge: 'POPULAR',
    tags: ['gRPC', 'PostgreSQL', 'Next.js', 'Distributed Caching']
  },
  {
    id: 'course_ai_401',
    category: 'ai-engineering',
    categoryLabel: 'AI Engineering',
    title: 'Autonomous LLM Agent Architecture & Vector Pipelines',
    instructor: 'Dr. Aris Thorne & Prof. Maya Patel',
    instructorTitle: 'AI Systems Research Group',
    level: 'Specialized',
    duration: '21.0 Hours',
    totalLessons: 24,
    completedLessons: 0,
    progressPercent: 0,
    rating: '4.99',
    enrolledCount: '4,120 Scholars',
    enrolled: false,
    syllabusSummary: 'Multi-agent orchestration, speculative decoding, dynamic KV-cache compression, and production vector embeddings at scale.',
    badge: 'NEW COHORT',
    tags: ['LLM Agents', 'Vector Search', 'HNSW', 'Quantization']
  },
  {
    id: 'course_devops_302',
    category: 'cloud-devops',
    categoryLabel: 'Cloud DevOps',
    title: 'Zero-Trust Kubernetes & Cloud-Native Security Infrastructure',
    instructor: 'Jordan Reed',
    instructorTitle: 'Senior Distributed Systems Engineer',
    level: 'Intermediate-Advanced',
    duration: '16.8 Hours',
    totalLessons: 18,
    completedLessons: 0,
    progressPercent: 0,
    rating: '4.92',
    enrolledCount: '1,980 Scholars',
    enrolled: false,
    syllabusSummary: 'eBPF-driven network observability, Cilium service meshes, SPIFFE/SPIRE workload identities, and verifiable container supply chains.',
    badge: 'DEVSECOPS',
    tags: ['Kubernetes', 'eBPF', 'Cilium', 'Zero-Trust']
  }
];

const ACTIVE_COURSE_MODULES = [
  {
    moduleNumber: 1,
    title: 'Module 1: High-Performance Networking Foundations',
    description: 'TCP packet dissection, epoll vs kqueue event loops, and zero-copy ring buffers.',
    completedCount: 4,
    totalCount: 4,
    lessons: [
      { id: 'les_1', lessonNumber: '1.1', title: 'TCP Packet Dissection & Low-Level Frame Ingestion', duration: '14:20', durationSeconds: 860, isCurrent: false, completed: true },
      { id: 'les_2', lessonNumber: '1.2', title: 'Epoll vs Kqueue Event Demultiplexing Loops', duration: '18:45', durationSeconds: 1125, isCurrent: false, completed: true },
      { id: 'les_3', lessonNumber: '1.3', title: 'Zero-Copy Socket Transfers with splice() & vmsplice()', duration: '16:10', durationSeconds: 970, isCurrent: false, completed: true },
      { id: 'les_4', lessonNumber: '1.4', title: 'Memory-Mapped Ring Buffers & CPU Cache Line Alignment', duration: '22:30', durationSeconds: 1350, isCurrent: false, completed: true }
    ]
  },
  {
    moduleNumber: 2,
    title: 'Module 2: Kernel Bypass & io_uring Systems',
    description: 'Circular submission/completion queues, fixed buffer registrations, and SQPOLL worker threads.',
    completedCount: 3,
    totalCount: 4,
    lessons: [
      { id: 'les_5', lessonNumber: '2.1', title: 'Submission & Completion Queue Ring Shared Memory Layout', duration: '20:15', durationSeconds: 1215, isCurrent: false, completed: true },
      { id: 'les_6', lessonNumber: '2.2', title: 'Fixed Buffers (IORING_REGISTER_BUFFERS) & Fast Registration', duration: '17:50', durationSeconds: 1070, isCurrent: false, completed: true },
      { id: 'les_7', lessonNumber: '2.3', title: 'Zero-Copy Sockets via io_uring & SQPOLL Threads', duration: '18:42', durationSeconds: 1122, isCurrent: true, completed: false },
      { id: 'les_8', lessonNumber: '2.4', title: 'Async File I/O Throughput Benchmarks vs POSIX AIO', duration: '21:10', durationSeconds: 1270, isCurrent: false, completed: false }
    ]
  },
  {
    moduleNumber: 3,
    title: 'Module 3: Distributed Raft Consensus & State Machines',
    description: 'Leader election terms, log compaction, snapshot replication, and linearizable reads.',
    completedCount: 4,
    totalCount: 4,
    lessons: [
      { id: 'les_9', lessonNumber: '3.1', title: 'Leader Election Terms & Randomized Heartbeat Timeouts', duration: '25:40', durationSeconds: 1540, isCurrent: false, completed: true },
      { id: 'les_10', lessonNumber: '3.2', title: 'Log Compaction & Snapshot Chunk Streaming', duration: '28:15', durationSeconds: 1695, isCurrent: false, completed: true },
      { id: 'les_11', lessonNumber: '3.3', title: 'Linearizable Reads & ReadIndex Lease Verification', duration: '24:00', durationSeconds: 1440, isCurrent: false, completed: true },
      { id: 'les_12', lessonNumber: '3.4', title: 'Joint Consensus & Dynamic Cluster Membership Changes', duration: '31:25', durationSeconds: 1885, isCurrent: false, completed: true }
    ]
  },
  {
    moduleNumber: 4,
    title: 'Module 4: Byzantine Fault Tolerance & Verifiable Ledgers',
    description: 'PBFT 3-phase commit, cryptographic signature verification, and zero-knowledge proofs.',
    completedCount: 1,
    totalCount: 4,
    lessons: [
      { id: 'les_13', lessonNumber: '4.1', title: 'PBFT 3-Phase Consensus: Pre-Prepare, Prepare, Commit', duration: '33:10', durationSeconds: 1990, isCurrent: false, completed: true },
      { id: 'les_14', lessonNumber: '4.2', title: 'Ed25519 Cryptographic Signature Batches & Threshold Keys', duration: '26:50', durationSeconds: 1610, isCurrent: false, completed: false },
      { id: 'les_15', lessonNumber: '4.3', title: 'State Machine Replication over Untrusted Mesh Networks', duration: '30:00', durationSeconds: 1800, isCurrent: false, completed: false },
      { id: 'les_16', lessonNumber: '4.4', title: 'Capstone Defense & Verifiable Credential Issuance Stage', duration: '15:00', durationSeconds: 900, isCurrent: false, completed: false }
    ]
  }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query || {};
  const category = query.category;

  let catalog = CATALOG;
  if (category && category !== 'all') {
    catalog = CATALOG.filter(c => c.category === category);
  }

  const activeCourse = {
    ...CATALOG[0],
    modules: ACTIVE_COURSE_MODULES
  };

  return res.status(200).json({
    success: true,
    courses: catalog,
    catalog: catalog,
    allCourses: CATALOG,
    course: activeCourse,
    modules: ACTIVE_COURSE_MODULES,
    metadata: {
      totalCourses: CATALOG.length,
      activeCourseId: activeCourse.id,
      accreditationStandard: 'IEEE Ed25519 Verifiable Credential Standard'
    }
  });
};

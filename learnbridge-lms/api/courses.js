// LEARNBRIDGE LMS - COURSE CURRICULUM & MODULE TREE API
// Endpoint: GET /api/courses

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json({
    success: true,
    course: {
      id: 'course_dist_sys_301',
      title: 'Advanced Distributed Systems & Consensus Architecture',
      instructor: 'Dr. Aris Thorne (Principal Systems Architect)',
      totalLessons: 16,
      completedLessons: 6,
      progressPercent: 37.5,
      totalDurationHours: '14.5 Hours',
      modules: [
        {
          moduleNumber: 1,
          title: 'Foundations & Low-Level I/O Concurrency',
          lessons: [
            { id: 'les_1', title: '1. Memory-Mapped I/O & Ring Buffers (io_uring)', duration: '18:42', isCurrent: true, completed: true },
            { id: 'les_2', title: '2. Epoll vs Kqueue Async Event Loops', duration: '24:10', isCurrent: false, completed: true },
            { id: 'les_3', title: '3. Zero-Copy Socket Transfers with splice()', duration: '21:05', isCurrent: false, completed: true }
          ]
        },
        {
          moduleNumber: 2,
          title: 'Consensus Protocols & Fault Tolerance',
          lessons: [
            { id: 'les_4', title: '4. Raft Leader Election & Term Transitions', duration: '32:15', isCurrent: false, completed: true },
            { id: 'les_5', title: '5. Log Compaction & Snapshot Replication', duration: '28:40', isCurrent: false, completed: true },
            { id: 'les_6', title: '6. Paxos Multi-Decree State Synchronization', duration: '35:20', isCurrent: false, completed: true },
            { id: 'les_7', title: '7. Byzantine Fault Tolerance (BFT) Quorums', duration: '41:10', isCurrent: false, completed: false }
          ]
        }
      ]
    }
  });
};

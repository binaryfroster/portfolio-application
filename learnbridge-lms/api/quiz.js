// LEARNBRIDGE LMS - QUIZ EVALUATION & CERTIFICATION API
// Endpoint: POST /api/quiz

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = req.body || {};
    const selectedOption = body.selectedOption || 'A';
    const isCorrect = selectedOption === 'A';

    return res.status(200).json({
      success: true,
      questionId: 'q_io_uring_arch',
      selectedOption: selectedOption,
      isCorrect: isCorrect,
      score: isCorrect ? 100 : 0,
      explanation: isCorrect
        ? 'Correct! io_uring utilizes two lockless ring buffers (Submission Queue and Completion Queue) mapped into both user-space and kernel memory, completely eliminating context switch overhead on Linux.'
        : 'Incorrect. epoll still requires per-event syscall context switches, whereas io_uring bypasses syscalls using memory-mapped ring buffers.',
      nextModuleUnlocked: isCorrect,
      certificateEligibility: isCorrect ? 'Eligible upon Module 2 Completion' : 'Retry available immediately'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Quiz evaluation failed'
    });
  }
};

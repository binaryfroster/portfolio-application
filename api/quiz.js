// LEARNBRIDGE LMS - QUIZ EVALUATION & CERTIFICATION API
// Binary Froster Enterprise Learning Platform
// Endpoint: GET /api/quiz, POST /api/quiz
// Strictly zero emojis.

const QUESTIONS = [
  {
    id: 'q1',
    number: 1,
    prompt: 'What primary mechanism enables io_uring to avoid kernel context switches during high-throughput network packet ingestion?',
    options: [
      { id: 'A', text: 'Shared memory circular ring buffers mapped into both user and kernel address space' },
      { id: 'B', text: 'Synchronous thread pool spinning on epoll file descriptors' },
      { id: 'C', text: 'Hardware interrupt vector overriding via PCI root complexes' }
    ],
    correctOption: 'A',
    explanation: 'Correct. io_uring utilizes two lockless ring buffers (Submission Queue and Completion Queue) mapped into both user-space and kernel memory via mmap(), eliminating context-switch traps during steady-state packet processing.',
    incorrectExplanation: 'Incorrect. Conventional epoll requires per-event syscall context switches, whereas io_uring bypasses syscalls through shared memory rings.'
  },
  {
    id: 'q2',
    number: 2,
    prompt: 'Why are fixed buffer registrations (IORING_REGISTER_BUFFERS) critical for sub-millisecond tail latency?',
    options: [
      { id: 'A', text: 'They eliminate dynamic get_user_pages() page table locking overhead per I/O operation' },
      { id: 'B', text: 'They force CPU caches to flush instantly after socket reads' },
      { id: 'C', text: 'They increase Linux memory limits beyond physical RAM boundaries' }
    ],
    correctOption: 'A',
    explanation: 'Correct. Pre-pinning pages with IORING_REGISTER_BUFFERS allows the Linux kernel to validate and map physical pages once at startup, eliminating the costly get_user_pages() lock on every request.',
    incorrectExplanation: 'Incorrect. Fixed buffers do not flush CPU caches or alter memory limits; they pin virtual memory to avoid runtime page-table traversal.'
  },
  {
    id: 'q3',
    number: 3,
    prompt: 'In Raft consensus, what invariant guarantees that an elected leader possesses all previously committed log entries?',
    options: [
      { id: 'A', text: 'Leader Completeness Property enforced via RequestVote candidate term and log index checks' },
      { id: 'B', text: 'Strict 2-phase commit consensus locks on disk write headers' },
      { id: 'C', text: 'Randomized client heartbeat intervals exceeding election timeouts' }
    ],
    correctOption: 'A',
    explanation: 'Correct. The Leader Completeness Property ensures that a candidate can only win an election if its log is at least as up-to-date as a majority quorum of peers, guaranteeing committed entries are never lost.',
    incorrectExplanation: 'Incorrect. Raft avoids 2-phase commit disk locking; it relies on majority quorum term comparison during RequestVote RPCs.'
  }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Return questions without exposing correct answers directly
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      quizTitle: 'Module 2: Kernel Bypass & io_uring Systems Certification Exam',
      passingThresholdPercent: 80,
      totalQuestions: QUESTIONS.length,
      questions: QUESTIONS.map(q => ({
        id: q.id,
        number: q.number,
        prompt: q.prompt,
        options: q.options
      }))
    });
  }

  // POST: Evaluate answers or single question
  try {
    const body = req.body || {};

    // Mode 1: Single question evaluation for instant feedback
    if (body.questionId && body.selectedOption) {
      const q = QUESTIONS.find(item => item.id === body.questionId);
      if (!q) {
        return res.status(404).json({ success: false, error: 'Question not found' });
      }
      const isCorrect = body.selectedOption === q.correctOption;
      return res.status(200).json({
        success: true,
        mode: 'single',
        questionId: q.id,
        selectedOption: body.selectedOption,
        isCorrect: isCorrect,
        correctOption: q.correctOption,
        explanation: isCorrect ? q.explanation : q.incorrectExplanation
      });
    }

    // Mode 2: Full exam evaluation
    const answers = body.answers || {};
    // Backward compatibility: if only selectedOption is sent
    if (!body.answers && body.selectedOption) {
      answers.q1 = body.selectedOption;
    }

    let correctCount = 0;
    const results = {};

    QUESTIONS.forEach(q => {
      const userChoice = answers[q.id];
      const isCorrect = userChoice === q.correctOption;
      if (isCorrect) correctCount++;
      results[q.id] = {
        questionNumber: q.number,
        selected: userChoice || null,
        correctOption: q.correctOption,
        isCorrect: isCorrect,
        explanation: isCorrect ? q.explanation : q.incorrectExplanation
      };
    });

    const scorePercent = Math.round((correctCount / QUESTIONS.length) * 100);
    const passed = scorePercent >= 80;

    return res.status(200).json({
      success: true,
      mode: 'exam',
      totalQuestions: QUESTIONS.length,
      correctCount: correctCount,
      score: scorePercent,
      scorePercent: scorePercent,
      passingThreshold: 80,
      passed: passed,
      results: results,
      certificateEligibility: passed ? 'ELIGIBLE' : 'REQUIRES_RETAKE',
      verificationHashPreview: passed ? '0x' + Math.random().toString(16).substring(2, 10).toUpperCase() + 'C901' : null,
      feedbackMessage: passed
        ? `Examination Passed with ${scorePercent}%. High Honors accredited.`
        : `Score: ${scorePercent}%. 80% required to confer credential. Review Module 2 curriculum and retake.`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Quiz evaluation failed'
    });
  }
};

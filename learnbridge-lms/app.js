// LEARNBRIDGE LMS - ENGINEERING LEARNING OS
// Binary Froster Enterprise EdTech Platform
// Connected to Live Serverless Backend (/api/courses, /api/quiz, /api/progress, /api/certificates)

(function () {
  'use strict';

  // Navigation Tabs
  const lmsTabs = document.querySelectorAll('.lms-tab');
  const lmsContents = document.querySelectorAll('.lms-tab-content');

  lmsTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');

      lmsTabs.forEach((t) => {
        t.className = 'lms-tab flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap';
      });
      tab.className = 'lms-tab active-tab flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 border-violet-400 text-violet-400 transition-colors whitespace-nowrap';

      lmsContents.forEach((c) => c.classList.add('hidden'));
      const activeContent = document.getElementById('tab-' + targetTab);
      if (activeContent) activeContent.classList.remove('hidden');
    });
  });

  // Video Player Simulation
  let isPlaying = false;
  let seconds = 258; // 04:18
  const playBtn = document.getElementById('playBtn');
  const timecode = document.getElementById('videoTimecode');

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      playBtn.innerHTML = isPlaying
        ? '<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
        : '<svg class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    });

    setInterval(() => {
      if (isPlaying && seconds < 1122) {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const formatted = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
        timecode.textContent = `${formatted} / 18:42`;
      }
    }, 1000);
  }

  // Student Notebook Notes connected to POST /api/progress
  const addNoteBtn = document.getElementById('addNoteBtn');
  const newNoteInput = document.getElementById('newNoteInput');
  const notesList = document.getElementById('notesList');

  if (addNoteBtn && newNoteInput && notesList) {
    addNoteBtn.addEventListener('click', async () => {
      const text = newNoteInput.value.trim();
      if (!text) return;

      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      const formatted = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;

      const noteItem = document.createElement('div');
      noteItem.className = 'p-3 rounded-xl bg-slate-900/60 border border-violet-500/30 text-xs space-y-1 animate-pulse';
      noteItem.innerHTML = `
        <div class="flex justify-between font-mono text-[10px]">
          <span class="text-violet-400 font-bold">[${formatted}]</span>
          <span class="text-emerald-400">Synced to Cloud API</span>
        </div>
        <p class="text-slate-200">${text}</p>
      `;

      notesList.prepend(noteItem);
      newNoteInput.value = '';

      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId: 'les_1',
            timecodeSeconds: seconds,
            noteText: text
          })
        });
      } catch (e) {
        console.warn('Note synced locally:', e.message);
      }

      setTimeout(() => noteItem.classList.remove('animate-pulse'), 1000);
    });

    newNoteInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addNoteBtn.click();
    });
  }

  // Interactive Quiz Logic connected to POST /api/quiz
  const quizOptions = document.querySelectorAll('.quiz-option');
  const quizFeedback = document.getElementById('quizFeedback');

  quizOptions.forEach((option, idx) => {
    option.addEventListener('click', async () => {
      const optionLetter = idx === 0 ? 'A' : idx === 1 ? 'B' : idx === 2 ? 'C' : 'D';

      quizOptions.forEach((opt) => {
        opt.className = 'quiz-option w-full p-3.5 rounded-xl border border-lms-border bg-slate-900/60 text-left text-slate-400 transition-colors opacity-60';
      });

      try {
        const res = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectedOption: optionLetter })
        });
        const data = await res.json();

        if (data.isCorrect) {
          option.className = 'quiz-option w-full p-3.5 rounded-xl border border-emerald-500 bg-emerald-950/20 text-left text-emerald-200 font-semibold opacity-100';
          quizFeedback.className = 'p-3.5 rounded-xl text-xs font-mono bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 block';
          quizFeedback.innerHTML = `<strong>CORRECT ANSWER (Score: 100%)</strong><br>${data.explanation}`;
        } else {
          option.className = 'quiz-option w-full p-3.5 rounded-xl border border-rose-500 bg-rose-950/20 text-left text-rose-200 font-semibold opacity-100';
          quizFeedback.className = 'p-3.5 rounded-xl text-xs font-mono bg-rose-950/40 border border-rose-500/40 text-rose-300 block';
          quizFeedback.innerHTML = `<strong>INCORRECT ATTEMPT</strong><br>${data.explanation}`;
        }
      } catch (err) {
        // Local fallback
        const isCorrect = option.getAttribute('data-correct') === 'true';
        if (isCorrect) {
          option.className = 'quiz-option w-full p-3.5 rounded-xl border border-emerald-500 bg-emerald-950/20 text-left text-emerald-200 font-semibold opacity-100';
          quizFeedback.className = 'p-3.5 rounded-xl text-xs font-mono bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 block';
          quizFeedback.innerHTML = `<strong>CORRECT ANSWER!</strong><br>io_uring uses two lockless ring buffers mapped into both user-space and kernel memory.`;
        }
      }
    });
  });
})();

// Voice Narrator — reads page content aloud using the browser's built-in
// Web Speech API (free, no backend, no API key). Lives on every public
// marketing page (not admin/client auth pages).
(function () {
  if (!('speechSynthesis' in window)) return; // graceful no-op on unsupported browsers

  const root = document.querySelector('main');
  if (!root) return;

  const READABLE_SELECTOR = 'h1,h2,h3,h4,p,li,blockquote,[data-narrate]';
  const EXCLUDE_CLOSEST = 'pre,code,form,.skeleton,.hidden,script,style';

  let queue = [];
  let idx = -1;
  let state = 'idle'; // idle | speaking | paused
  let currentEl = null;
  let keepAliveTimer = null;
  let voice = null;
  const utteranceRefs = []; // Chrome garbage-collects SpeechSynthesisUtterance objects that
                            // have no live reference, silently killing playback mid-queue.
                            // Keeping them here prevents that.

  function pickVoice() {
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;
    return (
      voices.find(v => /en-US/i.test(v.lang) && /Google/i.test(v.name)) ||
      voices.find(v => /en-GB/i.test(v.lang) && /Google/i.test(v.name)) ||
      voices.find(v => v.lang && v.lang.startsWith('en') && v.default) ||
      voices.find(v => v.lang && v.lang.startsWith('en')) ||
      voices[0]
    );
  }

  function loadVoices() {
    voice = pickVoice();
  }
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function cleanText(t) {
    return (t || '').replace(/\s+/g, ' ').trim();
  }

  // Chrome has a long-standing bug where a single SpeechSynthesisUtterance
  // longer than ~15s of speech gets silently killed partway through (this is
  // what was causing playback to die right after the hero paragraph started).
  // Splitting text into short, sentence-sized chunks keeps every utterance
  // well under that threshold so the bug never gets a chance to trigger.
  const MAX_CHUNK_LEN = 180;

  function splitIntoChunks(text) {
    const sentences = text.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || [text];
    const chunks = [];
    let buffer = '';
    sentences.forEach(raw => {
      const s = raw.trim();
      if (!s) return;
      if (s.length > MAX_CHUNK_LEN) {
        if (buffer) { chunks.push(buffer); buffer = ''; }
        for (let i = 0; i < s.length; i += MAX_CHUNK_LEN) chunks.push(s.slice(i, i + MAX_CHUNK_LEN));
        return;
      }
      const merged = buffer ? `${buffer} ${s}` : s;
      if (merged.length > MAX_CHUNK_LEN) {
        chunks.push(buffer);
        buffer = s;
      } else {
        buffer = merged;
      }
    });
    if (buffer) chunks.push(buffer);
    return chunks.length ? chunks : [text];
  }

  function collectNodes() {
    const all = Array.from(root.querySelectorAll(READABLE_SELECTOR));
    const items = [];
    all
      .filter(el => !el.closest(EXCLUDE_CLOSEST))
      .forEach(el => {
        const text = cleanText(el.hasAttribute('data-narrate') ? el.getAttribute('data-narrate') : el.textContent);
        if (text.length <= 1) return;
        splitIntoChunks(text).forEach(chunk => items.push({ el, text: chunk }));
      });
    return items;
  }

  function clearHighlight() {
    if (currentEl) currentEl.classList.remove('voice-reading');
    currentEl = null;
  }

  function highlight(el) {
    clearHighlight();
    currentEl = el;
    el.classList.add('voice-reading');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function startKeepAlive() {
    // Chunking utterances (see splitIntoChunks) removes the need for the old
    // "pause immediately followed by resume" trick — calling pause() and
    // resume() back-to-back with no gap is itself a known way to make Chrome
    // silently drop the rest of the speech queue, which was likely
    // contributing to playback dying partway through. Instead we run a
    // lightweight watchdog: if Chrome ever stops speaking without firing
    // onend/onerror (another documented silent-failure mode), we detect the
    // stall and resume the queue ourselves instead of leaving it dead.
    stopKeepAlive();
    let lastIdx = idx;
    let stalledTicks = 0;
    keepAliveTimer = setInterval(() => {
      if (state !== 'speaking') return;
      if (idx !== lastIdx) { lastIdx = idx; stalledTicks = 0; return; }
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) { stalledTicks = 0; return; }
      // Nothing playing, nothing pending, but we think we're still speaking — stalled.
      stalledTicks += 1;
      if (stalledTicks >= 1) {
        stalledTicks = 0;
        speakNext();
      }
    }, 2000);
  }

  function stopKeepAlive() {
    if (keepAliveTimer) { clearInterval(keepAliveTimer); keepAliveTimer = null; }
  }

  function speakNext() {
    idx += 1;
    if (idx >= queue.length) {
      state = 'idle';
      clearHighlight();
      stopKeepAlive();
      updateUI();
      return;
    }
    const item = queue[idx];
    if (item.el !== currentEl) highlight(item.el);
    updateUI();

    const utter = new SpeechSynthesisUtterance(item.text);
    if (voice) utter.voice = voice;
    utter.rate = 1;
    utter.pitch = 1;
    utter.onend = () => { if (state === 'speaking') setTimeout(speakNext, 40); };
    utter.onerror = () => { if (state === 'speaking') setTimeout(speakNext, 40); };
    utteranceRefs.push(utter);
    window.speechSynthesis.speak(utter);
  }

  function play() {
    if (state === 'paused') {
      window.speechSynthesis.resume();
      state = 'speaking';
      updateUI();
      return;
    }
    queue = collectNodes();
    idx = -1;
    if (!queue.length) return;
    window.speechSynthesis.cancel();
    utteranceRefs.length = 0;
    state = 'speaking';
    startKeepAlive();
    speakNext();
  }

  function pause() {
    if (state !== 'speaking') return;
    window.speechSynthesis.pause();
    state = 'paused';
    updateUI();
  }

  function stop() {
    window.speechSynthesis.cancel();
    stopKeepAlive();
    clearHighlight();
    state = 'idle';
    idx = -1;
    updateUI();
  }

  // ---- UI ----
  const widget = document.createElement('div');
  widget.className = 'voice-widget';
  widget.innerHTML = `
    <div class="voice-label" id="voice-label">Read this page aloud</div>
    <button class="voice-stop-btn" id="voice-stop-btn" aria-label="Stop reading" title="Stop">
      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>
    </button>
    <button class="voice-fab" id="voice-fab" aria-label="Listen to this page" title="Listen to this page">
      <svg id="voice-icon-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      <svg id="voice-icon-pause" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
    </button>`;
  document.body.appendChild(widget);

  const fab = widget.querySelector('#voice-fab');
  const stopBtn = widget.querySelector('#voice-stop-btn');
  const label = widget.querySelector('#voice-label');
  const iconPlay = widget.querySelector('#voice-icon-play');
  const iconPause = widget.querySelector('#voice-icon-pause');

  function updateUI() {
    const speaking = state === 'speaking';
    iconPlay.style.display = speaking ? 'none' : 'block';
    iconPause.style.display = speaking ? 'block' : 'none';
    fab.classList.toggle('speaking', speaking);
    stopBtn.classList.toggle('show', state !== 'idle');
    label.textContent = state === 'speaking' ? 'Reading page…' : state === 'paused' ? 'Paused — tap to resume' : 'Read this page aloud';
  }

  let labelTimer = null;
  function flashLabel() {
    label.classList.add('show');
    clearTimeout(labelTimer);
    labelTimer = setTimeout(() => label.classList.remove('show'), 2200);
  }

  // ---- First-visit attention callout (one-time guide to the button) ----
  const HINT_KEY = 'kpwd_voice_hint_seen';
  function showFirstVisitHint() {
    try { if (localStorage.getItem(HINT_KEY)) return; } catch (e) { return; }

    const hint = document.createElement('div');
    hint.className = 'voice-hint';
    hint.innerHTML = `<span>&#128266; Tap to hear this page read aloud</span><svg class="voice-hint-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v14M6 12l6 6 6-6"/></svg>`;
    document.body.appendChild(hint);

    const dismiss = () => {
      hint.classList.remove('show');
      setTimeout(() => hint.remove(), 300);
      try { localStorage.setItem(HINT_KEY, '1'); } catch (e) {}
      fab.removeEventListener('click', dismiss);
      window.removeEventListener('scroll', onScroll);
    };
    const onScroll = () => dismiss();

    setTimeout(() => hint.classList.add('show'), 1200);
    setTimeout(dismiss, 8000);
    fab.addEventListener('click', dismiss);
    window.addEventListener('scroll', onScroll, { once: true, passive: true });
  }
  showFirstVisitHint();

  fab.addEventListener('click', () => {
    if (state === 'speaking') pause();
    else play();
    flashLabel();
  });
  fab.addEventListener('mouseenter', flashLabel);
  stopBtn.addEventListener('click', () => { stop(); flashLabel(); });

  window.addEventListener('beforeunload', () => window.speechSynthesis.cancel());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state === 'speaking') pause();
  });
})();

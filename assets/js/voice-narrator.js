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

  function collectNodes() {
    const all = Array.from(root.querySelectorAll(READABLE_SELECTOR));
    return all
      .filter(el => !el.closest(EXCLUDE_CLOSEST))
      .map(el => ({
        el,
        text: cleanText(el.hasAttribute('data-narrate') ? el.getAttribute('data-narrate') : el.textContent)
      }))
      .filter(item => item.text.length > 1);
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
    // Chrome bug: speechSynthesis silently stops after ~15s on long utterances.
    // Periodically nudging pause/resume keeps it alive.
    stopKeepAlive();
    keepAliveTimer = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
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
    highlight(item.el);
    updateUI();

    const utter = new SpeechSynthesisUtterance(item.text);
    if (voice) utter.voice = voice;
    utter.rate = 1;
    utter.pitch = 1;
    utter.onend = () => { if (state === 'speaking') speakNext(); };
    utter.onerror = () => { if (state === 'speaking') speakNext(); };
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

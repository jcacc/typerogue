/* rogue-audio.js — TYPEROGUE audio engine
   Dungeonsynth edition: slow pads, deep drones, sparse organ melody, cave reverb.
   Three themes: 'dungeon' (map/rest), 'combat' (normal fight), 'boss' (boss fight).
   SFX unchanged. Music completely reworked — no techno drums, no arpeggios.
   Public API: window.ROGUE_AUDIO */
(function () {
  'use strict';
  let _ac = null, _noiseBuf = null;

  function getAC() {
    if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
    if (_ac.state === 'suspended') _ac.resume();
    return _ac;
  }

  function noise() {
    if (_noiseBuf) return _noiseBuf;
    const ac = getAC();
    _noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = _noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return _noiseBuf;
  }

  // ── SFX helpers ──────────────────────────────────────────────────────────────
  function tone(freq, type, dur, vol, delay, dest) {
    const ac = getAC();
    const osc = ac.createOscillator(), g = ac.createGain();
    const t = ac.currentTime + (delay || 0);
    osc.connect(g); g.connect(dest || ac.destination);
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t); osc.stop(t + dur + 0.01);
  }

  function sweep(f0, f1, type, dur, vol, delay, dest) {
    const ac = getAC();
    const osc = ac.createOscillator(), g = ac.createGain();
    const t = ac.currentTime + (delay || 0);
    osc.connect(g); g.connect(dest || ac.destination);
    osc.type = type || 'sawtooth';
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t); osc.stop(t + dur + 0.01);
  }

  // ── Music instruments ─────────────────────────────────────────────────────────

  // Ambient pad: two detuned sawtooths through lowpass, slow attack/release
  function _pad(t, freq, dur, vol) {
    if (!freq || !_m.masterGain) return;
    const ac = getAC();
    const osc1 = ac.createOscillator(), osc2 = ac.createOscillator();
    const flt = ac.createBiquadFilter(), g = ac.createGain();
    osc1.connect(flt); osc2.connect(flt);
    flt.connect(g);
    g.connect(_m.masterGain);
    if (_m.rev) g.connect(_m.rev);
    osc1.type = 'sawtooth'; osc1.frequency.value = freq;
    osc2.type = 'sawtooth'; osc2.frequency.value = freq * 1.009;
    flt.type = 'lowpass'; flt.frequency.value = 480; flt.Q.value = 0.7;
    const atk = Math.min(dur * 0.35, 1.2);
    const rel = Math.min(dur * 0.30, 1.0);
    const v = vol || 0.07;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + atk);
    g.gain.setValueAtTime(v, t + dur - rel);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    osc1.start(t); osc1.stop(t + dur + 0.1);
    osc2.start(t); osc2.stop(t + dur + 0.1);
  }

  // Deep bass drone: sine through heavy lowpass
  function _drone(t, freq, dur, vol) {
    if (!freq || !_m.masterGain) return;
    const ac = getAC();
    const osc = ac.createOscillator(), flt = ac.createBiquadFilter(), g = ac.createGain();
    osc.connect(flt); flt.connect(g); g.connect(_m.masterGain);
    osc.type = 'sine'; osc.frequency.value = freq;
    flt.type = 'lowpass'; flt.frequency.value = 160;
    const atk = Math.min(dur * 0.25, 0.8);
    const rel = Math.min(dur * 0.25, 0.8);
    const v = vol || 0.18;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + atk);
    g.gain.setValueAtTime(v, t + dur - rel);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    osc.start(t); osc.stop(t + dur + 0.1);
  }

  // Organ melody: square + sub-octave sine, quick attack
  function _organ(t, freq, dur, vol) {
    if (!freq || !_m.masterGain) return;
    const ac = getAC();
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.connect(g); g.connect(_m.masterGain);
    if (_m.rev) g.connect(_m.rev);
    osc.type = 'square'; osc.frequency.value = freq;
    const sub = ac.createOscillator(), gs = ac.createGain();
    sub.connect(gs); gs.connect(_m.masterGain);
    if (_m.rev) gs.connect(_m.rev);
    sub.type = 'sine'; sub.frequency.value = freq * 0.5;
    const v = vol || 0.04;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + 0.07);
    g.gain.setValueAtTime(v, t + dur - 0.15);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    gs.gain.setValueAtTime(0.0001, t);
    gs.gain.linearRampToValueAtTime(v * 0.55, t + 0.09);
    gs.gain.setValueAtTime(v * 0.55, t + dur - 0.15);
    gs.gain.linearRampToValueAtTime(0.0001, t + dur);
    osc.start(t); osc.stop(t + dur + 0.1);
    sub.start(t); sub.stop(t + dur + 0.1);
  }

  // Boss-only: deep low rumble (no techno kick — menacing sub thud)
  function _rumble(t, vol) {
    if (!_m.masterGain) return;
    const ac = getAC();
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.connect(g); g.connect(_m.masterGain);
    osc.frequency.setValueAtTime(75, t);
    osc.frequency.exponentialRampToValueAtTime(22, t + 0.55);
    g.gain.setValueAtTime(vol || 0.20, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
    osc.start(t); osc.stop(t + 0.7);
  }

  // Simple cave reverb: two feedback delay lines
  function _makeReverb(ac, masterGain) {
    const input = ac.createGain();
    const d1 = ac.createDelay(1.0), d2 = ac.createDelay(1.0);
    const fb1 = ac.createGain(), fb2 = ac.createGain();
    const wet = ac.createGain();
    d1.delayTime.value = 0.31;
    d2.delayTime.value = 0.43;
    fb1.gain.value = 0.38;
    fb2.gain.value = 0.32;
    wet.gain.value = 0.22;
    input.connect(d1); input.connect(d2);
    d1.connect(fb1); fb1.connect(d1);
    d2.connect(fb2); fb2.connect(d2);
    d1.connect(wet); d2.connect(wet);
    wet.connect(masterGain);
    return input;
  }

  // ── Patterns ──────────────────────────────────────────────────────────────────
  // 32 steps. Notes trigger every 8 steps; drone/pad sustain 8.5 steps, melody 4 steps.
  // Sparse = dungeonsynth. Pattern array: non-zero = Hz, 0 = silence.

  const STEPS = 32;

  // Dungeon (map/rest) — 55 BPM, A Aeolian, minimal
  const [dA1,dF1,dE1]           = [55, 43.7, 41.2];
  const [dA2,dC3,dF2]           = [110, 130.8, 87.3];
  const [dA3,dC4]               = [220, 261.6];
  const P_DRONE_DNG = [dA1,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,  dF1,0,0,0,0,0,0,0,  dE1,0,0,0,0,0,0,0];
  const P_PAD_DNG   = [dA2,0,0,0,0,0,0,0,  dC3,0,0,0,0,0,0,0, dF2,0,0,0,0,0,0,0,  dA2,0,0,0,0,0,0,0];
  const P_MEL_DNG   = [0,0,0,0,0,0,0,0,   dA3,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,   0,0,0,0,dC4,0,0,0];

  // Combat — 68 BPM, A Phrygian (dark, medieval)
  const [cA1,cE1,cF1]           = [55, 41.2, 43.7];
  const [cA2,cC3,cF3,cE3]       = [110, 130.8, 174.6, 164.8];
  const [cA3,cC4,cE4]           = [220, 261.6, 329.6];
  const P_DRONE_CMB = [cA1,0,0,0,0,0,0,0,  cE1,0,0,0,0,0,0,0,  cF1,0,0,0,0,0,0,0,  cE1,0,0,0,0,0,0,0];
  const P_PAD_CMB   = [cA2,0,0,0,0,0,0,0,  cC3,0,0,0,0,0,0,0,  cF3,0,0,0,0,0,0,0,  cE3,0,0,0,0,0,0,0];
  const P_MEL_CMB   = [0,0,0,0,cA3,0,0,0,  0,0,0,0,0,0,0,0,   cC4,0,0,0,0,0,0,0,  0,0,0,0,cE4,0,0,0];

  // Boss — 78 BPM, tritone/chromatic dissonance (A + Eb)
  const [bA1,bEb2,bF1,bB0]      = [55, 77.8, 43.7, 30.9];
  const [bA2,bEb3,bD3,bG3]      = [110, 155.6, 146.8, 196];
  const [bA3,bEb4,bD4,bG4]      = [220, 311.1, 293.7, 392];
  const P_DRONE_BSS = [bA1,0,0,0,0,0,0,0,  bEb2,0,0,0,0,0,0,0,  bF1,0,0,0,0,0,0,0,  bB0,0,0,0,0,0,0,0];
  const P_PAD_BSS   = [bA2,0,0,0,0,0,0,0,  bEb3,0,0,0,0,0,0,0,  bD3,0,0,0,0,0,0,0,  bG3,0,0,0,0,0,0,0];
  const P_MEL_BSS   = [bA3,0,0,0,bEb4,0,0,0,  0,0,0,0,bD4,0,0,0,  bA3,0,0,0,0,0,0,0,  bG4,0,0,0,bA3,0,0,0];
  const P_RUMBLE    = [0,0,0,0,0,0,0,0,  1,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,  1,0,0,0,0,0,0,0];

  // ── Sequencer ─────────────────────────────────────────────────────────────────
  let _m = {
    playing:false, paused:false, muted:false,
    step:0, nextTime:0, timerId:null,
    masterGain:null, rev:null, bpm:68,
    theme:'combat',
  };

  function _stepDur() { return 60 / (_m.bpm * 4); }

  function _schedule() {
    if (!_m.playing || _m.paused) return;
    const ac = getAC();
    while (_m.nextTime < ac.currentTime + 0.12) {
      const s = _m.step % STEPS, t = _m.nextTime;
      const th = _m.theme;
      const sd = _stepDur();
      const padDur = sd * 8.5;
      const melDur = sd * 4.2;

      if (th === 'dungeon') {
        _drone(t, P_DRONE_DNG[s], padDur, 0.13);
        _pad(t,   P_PAD_DNG[s],   padDur, 0.055);
        _organ(t, P_MEL_DNG[s],   melDur, 0.032);
      } else if (th === 'boss') {
        _drone(t, P_DRONE_BSS[s], padDur, 0.16);
        _pad(t,   P_PAD_BSS[s],   padDur, 0.08);
        _organ(t, P_MEL_BSS[s],   melDur, 0.048);
        if (P_RUMBLE[s]) _rumble(t, 0.20);
      } else { // combat
        _drone(t, P_DRONE_CMB[s], padDur, 0.14);
        _pad(t,   P_PAD_CMB[s],   padDur, 0.065);
        _organ(t, P_MEL_CMB[s],   melDur, 0.038);
      }

      _m.nextTime += sd;
      _m.step = (_m.step + 1) % STEPS;
    }
    _m.timerId = setTimeout(_schedule, 25);
  }

  // ── Public API ───────────────────────────────────────────────────────────────
  window.ROGUE_AUDIO = {
    // SFX
    playKeyCorrect()   { tone(1100, 'sine', 0.05, 0.07); },
    playKeyWrong()     { sweep(200, 110, 'square', 0.06, 0.06); },
    playWordDestroy()  {
      sweep(330, 660, 'sine', 0.12, 0.12);
      tone(880, 'sine', 0.10, 0.08, 0.06);
    },
    playAttackHit()    {
      sweep(180, 60, 'sawtooth', 0.20, 0.20);
      tone(120, 'square', 0.08, 0.12, 0.03);
    },
    playEnemyHit()     {
      sweep(300, 120, 'sawtooth', 0.12, 0.16);
      tone(150, 'square', 0.06, 0.10, 0.02);
    },
    playPlayerHit()    {
      sweep(220, 55, 'sawtooth', 0.28, 0.22);
      sweep(100, 40, 'square',   0.20, 0.10, 0.05);
    },
    playSpellCast()    {
      [440, 550, 660, 880, 1100].forEach((f, i) => tone(f, 'sine', 0.18, 0.10, i * 0.04));
      sweep(1100, 220, 'sine', 0.30, 0.06, 0.22);
    },
    playBossPhase()    {
      [110, 83, 62, 46, 35].forEach((f, i) => sweep(f * 1.2, f * 0.5, 'sawtooth', 0.30, 0.18, i * 0.08));
      sweep(600, 30, 'square', 0.50, 0.20, 0.05);
    },
    playRoomClear()    {
      [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 'sine', 0.22, 0.12, i * 0.07));
      tone(1319, 'sine', 0.28, 0.08, 0.38);
    },
    playUpgradePick()  {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 'sine', 0.18, 0.10, i * 0.06));
    },
    playVictory()      {
      [262, 330, 392, 523, 659, 784, 1047, 1319].forEach((f, i) =>
        tone(f, 'sine', 0.35, 0.13, i * 0.09));
    },
    playGameOver()     {
      [330, 247, 196, 147, 110].forEach((f, i) =>
        sweep(f * 1.05, f, 'sawtooth', 0.30, 0.16, i * 0.14));
    },

    // Theme music
    setTheme(name) {
      const bpms = { dungeon:55, combat:68, boss:78 };
      if (_m.theme === name && _m.playing) return;
      _m.theme = name;
      if (_m.playing) {
        _m.bpm = bpms[name] || 68;
        if (_m.masterGain) {
          const ac = getAC();
          _m.masterGain.gain.cancelScheduledValues(ac.currentTime);
          _m.masterGain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.8);
          setTimeout(() => {
            _m.step = 0;
            if (_m.masterGain)
              _m.masterGain.gain.linearRampToValueAtTime(_m.muted ? 0 : 0.6, getAC().currentTime + 1.2);
          }, 850);
        }
      }
    },

    startMusic(themeName) {
      if (_m.playing) { this.setTheme(themeName || 'combat'); return; }
      const th = themeName || 'combat';
      const bpms = { dungeon:55, combat:68, boss:78 };
      const ac = getAC();
      _m.masterGain = ac.createGain();
      _m.masterGain.gain.setValueAtTime(0, ac.currentTime);
      _m.masterGain.gain.linearRampToValueAtTime(0.6, ac.currentTime + 2.5);
      _m.masterGain.connect(ac.destination);
      _m.rev = _makeReverb(ac, _m.masterGain);
      _m.theme   = th;
      _m.bpm     = bpms[th] || 68;
      _m.step    = 0;
      _m.nextTime = ac.currentTime + 0.1;
      _m.playing = true;
      _m.paused  = false;
      _m.muted   = false;
      _schedule();
    },

    stopMusic(fadeSecs) {
      clearTimeout(_m.timerId); _m.timerId = null;
      const fade = fadeSecs || 0;
      if (fade && _m.masterGain) {
        const ac = getAC();
        _m.masterGain.gain.cancelScheduledValues(ac.currentTime);
        _m.masterGain.gain.linearRampToValueAtTime(0, ac.currentTime + fade);
      }
      setTimeout(() => { _m.playing = false; _m.paused = false; _m.rev = null; }, fade * 1000 + 200);
    },

    pauseMusic() {
      if (!_m.playing || _m.paused) return;
      _m.paused = true;
      clearTimeout(_m.timerId); _m.timerId = null;
      if (_m.masterGain) {
        const ac = getAC();
        _m.masterGain.gain.cancelScheduledValues(ac.currentTime);
        _m.masterGain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.3);
      }
    },

    resumeMusic() {
      if (!_m.playing || !_m.paused) return;
      _m.paused = false;
      const ac = getAC();
      _m.nextTime = ac.currentTime + 0.05;
      if (_m.masterGain) {
        _m.masterGain.gain.cancelScheduledValues(ac.currentTime);
        _m.masterGain.gain.linearRampToValueAtTime(_m.muted ? 0 : 0.6, ac.currentTime + 0.5);
      }
      _schedule();
    },

    toggleMute() {
      _m.muted = !_m.muted;
      if (_m.masterGain) {
        const ac = getAC();
        _m.masterGain.gain.cancelScheduledValues(ac.currentTime);
        _m.masterGain.gain.linearRampToValueAtTime(_m.muted ? 0 : 0.6, ac.currentTime + 0.15);
      }
      return _m.muted;
    },

    isMuted()   { return _m.muted; },
    isPlaying() { return _m.playing && !_m.paused; },
  };
})();

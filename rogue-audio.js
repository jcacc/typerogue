/* rogue-audio.js — TYPEROGUE audio engine
   Adapted from typerun/audio.js. Adds dungeon themes + roguelike SFX.
   Three themes: 'dungeon' (map/rest), 'combat' (normal fight), 'boss' (boss fight).
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

  // ── Music engine ─────────────────────────────────────────────────────────────
  // Three sets of patterns for three themes.

  // Shared percusssion (reused, BPM varies)
  const STEPS = 32;
  const P_KICK  = [1,0,0,0,1,0,0,0, 1,0,0,0,1,0,0,0, 1,0,0,0,1,0,0,0, 1,0,0,0,1,0,0,0];
  const P_CLAP  = [0,0,0,0,1,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,1,0,0,0];
  const P_HHC   = [0,0,1,0,0,0,1,0, 0,0,1,0,0,0,1,0, 0,0,1,0,0,0,1,0, 0,0,1,0,0,0,1,0];
  const P_HHO   = [0,0,0,0,0,0,0,1, 0,0,0,0,0,0,0,1, 0,0,0,0,0,0,0,1, 0,0,0,0,0,0,0,1];

  // Dungeon theme (95 BPM, ominous A-minor, no kick, sparse)
  const P_KICK_DNG  = [0,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0];
  const [dA1,dE1,dG1,dC2,dD2] = [55, 82.4, 49, 65.4, 73.4];
  const P_BASS_DNG = [
    dA1,0,0,0,  0,0,dE1,0,  dA1,0,0,0,  dG1,0,0,0,
    dA1,0,0,0,  0,dD2,0,0,  dA1,0,dE1,0, dC2,0,0,0,
  ];
  const [dA3,dE4,dC4,dG3] = [220, 329.6, 261.6, 196];
  const P_ARP_DNG = [
    0,dA3,0,0, 0,0,0,dE4, 0,dA3,0,0, 0,dG3,0,0,
    0,0,dA3,0, 0,dC4,0,0, 0,dA3,0,0, dE4,0,0,0,
  ];

  // Combat theme (120 BPM, aggressive A-minor)
  const [cA1,cE2,cD2,cG1,cC2,cF1] = [55, 82.4, 73.4, 49, 65.4, 43.7];
  const P_BASS_CMB = [
    cA1,cA1,0,0, cE2,0,cD2,0, cA1,0,cC2,0, cG1,cG1,0,0,
    cA1,cA1,cA1,0, cE2,cD2,0,0, cA1,0,0,cC2, cG1,0,cA1,0,
  ];
  const [cA3,cC4,cD4,cE4,cG3,cF4] = [220, 261.6, 293.7, 329.6, 196, 349.2];
  const P_ARP_CMB = [
    0,0,cA3,0, 0,0,cE4,0, 0,cA3,0,0, cD4,0,0,0,
    0,0,0,cC4, 0,0,cG3,0, cA3,0,0,0, cE4,0,cD4,0,
  ];

  // Boss theme (140 BPM, intensified — extra arp layer)
  const [bA1,bE2,bD2,bG1,bA0] = [55, 82.4, 73.4, 49, 27.5];
  const P_BASS_BSS = [
    bA1,bA1,bA0,0, bE2,0,bD2,0, bA1,bA0,bA1,0, bG1,bA1,0,0,
    bA1,bA0,bA1,0, bE2,bD2,bA0,0, bA1,0,bA0,0, bG1,0,bA1,bA0,
  ];
  const [bA4,bE5,bD5,bC5,bG4] = [440, 659.3, 587.3, 523.3, 392];
  const P_ARP_BSS = [  // extra high layer for boss
    0,bA4,0,bA4, 0,bE5,0,0, bA4,0,bD5,0, 0,bC5,0,bA4,
    0,bA4,0,0,   bE5,0,bA4,0, 0,bD5,0,bA4, bC5,0,0,bA4,
  ];

  let _m = {
    playing:false, paused:false, muted:false,
    step:0, nextTime:0, timerId:null,
    masterGain:null, bpm:120,
    theme:'combat',
  };

  function _stepDur() { return 60 / (_m.bpm * 4); }

  function _kick(t) {
    const ac = getAC();
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.connect(g); g.connect(_m.masterGain);
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.07);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    osc.start(t); osc.stop(t + 0.36);
    const src = ac.createBufferSource(), cg = ac.createGain();
    src.buffer = noise(); src.connect(cg); cg.connect(_m.masterGain);
    cg.gain.setValueAtTime(0.4, t);
    cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);
    src.start(t); src.stop(t + 0.014);
  }

  function _clap(t) {
    const ac = getAC();
    const src = ac.createBufferSource(), flt = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = noise(); src.connect(flt); flt.connect(g); g.connect(_m.masterGain);
    flt.type = 'bandpass'; flt.frequency.value = 1200; flt.Q.value = 0.65;
    g.gain.setValueAtTime(0.45, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    src.start(t); src.stop(t + 0.12);
  }

  function _hihat(t, open) {
    const ac = getAC();
    const src = ac.createBufferSource(), flt = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = noise(); src.connect(flt); flt.connect(g); g.connect(_m.masterGain);
    flt.type = 'highpass'; flt.frequency.value = open ? 7000 : 9000;
    const dur = open ? 0.14 : 0.030;
    g.gain.setValueAtTime(open ? 0.16 : 0.08, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.start(t); src.stop(t + dur + 0.005);
  }

  function _bass(t, freq) {
    if (!freq) return;
    const ac = getAC();
    const osc = ac.createOscillator(), flt = ac.createBiquadFilter(), g = ac.createGain();
    osc.connect(flt); flt.connect(g); g.connect(_m.masterGain);
    osc.type = 'sawtooth'; osc.frequency.value = freq;
    flt.type = 'lowpass'; flt.Q.value = 8;
    const sd = _stepDur();
    flt.frequency.setValueAtTime(1800, t);
    flt.frequency.exponentialRampToValueAtTime(130, t + sd * 1.6);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + sd * 1.9);
    osc.start(t); osc.stop(t + sd * 2);
  }

  function _arp(t, freq, vol) {
    if (!freq) return;
    const ac = getAC();
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.connect(g); g.connect(_m.masterGain);
    osc.type = 'square'; osc.frequency.value = freq;
    const sd = _stepDur();
    g.gain.setValueAtTime(vol || 0.038, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + sd * 0.7);
    osc.start(t); osc.stop(t + sd * 0.8);
  }

  function _schedule() {
    if (!_m.playing || _m.paused) return;
    const ac = getAC();
    while (_m.nextTime < ac.currentTime + 0.12) {
      const s = _m.step % STEPS, t = _m.nextTime;
      const th = _m.theme;

      if (th === 'dungeon') {
        if (P_KICK_DNG[s]) _kick(t);
        if (P_HHC[s] && s % 4 === 2) _hihat(t, false); // sparse hats
        _bass(t, P_BASS_DNG[s]);
        _arp(t, P_ARP_DNG[s], 0.025);
      } else if (th === 'boss') {
        if (P_KICK[s]) _kick(t);
        if (P_CLAP[s]) _clap(t);
        if (P_HHC[s])  _hihat(t, false);
        if (P_HHO[s])  _hihat(t, true);
        _bass(t, P_BASS_BSS[s]);
        _arp(t, P_ARP_CMB[s], 0.038);
        _arp(t, P_ARP_BSS[s], 0.018); // extra high layer
      } else { // combat
        if (P_KICK[s]) _kick(t);
        if (P_CLAP[s]) _clap(t);
        if (P_HHC[s])  _hihat(t, false);
        if (P_HHO[s])  _hihat(t, true);
        _bass(t, P_BASS_CMB[s]);
        _arp(t, P_ARP_CMB[s]);
      }

      _m.nextTime += _stepDur();
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
      sweep(100, 40, 'square', 0.20, 0.10, 0.05);
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
      const bpms = { dungeon:95, combat:120, boss:140 };
      const bpm = bpms[name] || 120;
      if (_m.theme === name && _m.playing) return;
      _m.theme = name;
      if (_m.playing) {
        _m.bpm = bpm;
        // Crossfade: fade out, swap pattern, fade in
        if (_m.masterGain) {
          const ac = getAC();
          _m.masterGain.gain.cancelScheduledValues(ac.currentTime);
          _m.masterGain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.4);
          setTimeout(() => {
            _m.step = 0;
            if (_m.masterGain)
              _m.masterGain.gain.linearRampToValueAtTime(_m.muted ? 0 : 0.5, getAC().currentTime + 0.6);
          }, 420);
        }
      }
    },

    startMusic(themeName) {
      if (_m.playing) { this.setTheme(themeName || 'combat'); return; }
      const th = themeName || 'combat';
      const bpms = { dungeon:95, combat:120, boss:140 };
      const ac = getAC();
      _m.masterGain = ac.createGain();
      _m.masterGain.gain.setValueAtTime(0, ac.currentTime);
      _m.masterGain.gain.linearRampToValueAtTime(0.5, ac.currentTime + 1.5);
      _m.masterGain.connect(ac.destination);
      _m.theme   = th;
      _m.bpm     = bpms[th] || 120;
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
      setTimeout(() => { _m.playing = false; _m.paused = false; }, fade * 1000 + 200);
    },

    pauseMusic() {
      if (!_m.playing || _m.paused) return;
      _m.paused = true;
      clearTimeout(_m.timerId); _m.timerId = null;
      if (_m.masterGain) {
        const ac = getAC();
        _m.masterGain.gain.cancelScheduledValues(ac.currentTime);
        _m.masterGain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.15);
      }
    },

    resumeMusic() {
      if (!_m.playing || !_m.paused) return;
      _m.paused = false;
      const ac = getAC();
      _m.nextTime = ac.currentTime + 0.05;
      if (_m.masterGain) {
        _m.masterGain.gain.cancelScheduledValues(ac.currentTime);
        _m.masterGain.gain.linearRampToValueAtTime(_m.muted ? 0 : 0.5, ac.currentTime + 0.3);
      }
      _schedule();
    },

    toggleMute() {
      _m.muted = !_m.muted;
      if (_m.masterGain) {
        const ac = getAC();
        _m.masterGain.gain.cancelScheduledValues(ac.currentTime);
        _m.masterGain.gain.linearRampToValueAtTime(_m.muted ? 0 : 0.5, ac.currentTime + 0.12);
      }
      return _m.muted;
    },

    isMuted() { return _m.muted; },
    isPlaying() { return _m.playing && !_m.paused; },
  };
})();

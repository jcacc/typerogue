/* rogue-data.js — TYPEROGUE static game data */
'use strict';
window.ROGUE_DATA = {

  // ── Player classes ──────────────────────────────────────────────────────────
  classes: {
    warrior: {
      id: 'warrior', name: 'WARRIOR', hp: 120, dmgMult: 1.0, wordSpeedMult: 1.0,
      startSpell: null, passive: 'iron_skin',
      desc: 'Iron Skin: +15 max HP. Balanced and resilient.',
      color: '#74b9ff', icon: '⚔',
    },
    rogue: {
      id: 'rogue', name: 'ROGUE', hp: 65, dmgMult: 1.5, wordSpeedMult: 1.35,
      startSpell: null, passive: 'quick_draw',
      desc: 'Quick Draw: combo gauge fills faster. High risk, high reward.',
      color: '#ff7675', icon: '🗡',
    },
    mage: {
      id: 'mage', name: 'MAGE', hp: 85, dmgMult: 1.15, wordSpeedMult: 1.0,
      startSpell: 'freeze', passive: 'spell_amp',
      desc: 'Spell Amp: spells deal 50% more effect. Starts with Freeze.',
      color: '#a29bfe', icon: '✦',
    },
  },

  // ── Enemies ──────────────────────────────────────────────────────────────────
  enemies: {
    // ── Floor 1 ──
    goblin_scout: {
      id: 'goblin_scout', name: 'Goblin Scout', floor: 1, type: 'normal',
      hp: 60, wordSpeed: 26, wordInterval: 2200, attackInterval: 9000, attackDmg: 8,
      wordTiers: [0, 1], loot: { gold: 15 }, phases: [],
      color: '#55efc4', bodyColor: '#27ae60', eyeColor: '#e74c3c',
      size: 18, emoji: '👺',
    },
    cave_troll: {
      id: 'cave_troll', name: 'Cave Troll', floor: 1, type: 'normal',
      hp: 120, wordSpeed: 20, wordInterval: 3200, attackInterval: 6000, attackDmg: 18,
      wordTiers: [1, 2], loot: { gold: 25 }, phases: [],
      color: '#b2bec3', bodyColor: '#636e72', eyeColor: '#fdcb6e',
      size: 28, emoji: '👹',
    },
    cursed_tome: {
      id: 'cursed_tome', name: 'Cursed Tome', floor: 1, type: 'elite',
      hp: 90, wordSpeed: 30, wordInterval: 2400, attackInterval: 5500, attackDmg: 12,
      wordTiers: [1, 2], loot: { gold: 45 }, phases: [],
      color: '#a29bfe', bodyColor: '#6c5ce7', eyeColor: '#fd79a8',
      size: 22, emoji: '📜',
    },
    goblin_king: {
      id: 'goblin_king', name: 'Goblin King', floor: 1, type: 'boss',
      hp: 200, wordSpeed: 30, wordInterval: 2000, attackInterval: 5000, attackDmg: 15,
      wordTiers: [0, 1, 2], loot: { gold: 80 },
      phases: [{ hpThreshold: 0.5, speedMult: 1.4, intervalMult: 0.7, announce: 'ENRAGED!' }],
      color: '#fdcb6e', bodyColor: '#e17055', eyeColor: '#d63031',
      size: 34, emoji: '👑',
    },
    dire_rat: {
      id: 'dire_rat', name: 'Dire Rat', floor: 1, type: 'normal',
      hp: 40, wordSpeed: 32, wordInterval: 1900, attackInterval: 9500, attackDmg: 6,
      wordTiers: [0, 1], loot: { gold: 10 }, phases: [],
      color: '#b2bec3', bodyColor: '#636e72', eyeColor: '#e74c3c',
      size: 14, emoji: '🐀',
    },
    goblin_shaman: {
      id: 'goblin_shaman', name: 'Goblin Shaman', floor: 1, type: 'normal',
      hp: 70, wordSpeed: 22, wordInterval: 2800, attackInterval: 7500, attackDmg: 11,
      wordTiers: [1, 2], loot: { gold: 18 }, phases: [],
      color: '#a29bfe', bodyColor: '#6c5ce7', eyeColor: '#55efc4',
      size: 18, emoji: '🧙',
    },

    // ── Floor 2 ──
    shadow_archer: {
      id: 'shadow_archer', name: 'Shadow Archer', floor: 2, type: 'normal',
      hp: 100, wordSpeed: 36, wordInterval: 2000, attackInterval: 7000, attackDmg: 14,
      wordTiers: [1, 2], loot: { gold: 30 }, phases: [],
      color: '#636e72', bodyColor: '#2d3436', eyeColor: '#74b9ff',
      size: 20, emoji: '🏹',
    },
    void_wraith: {
      id: 'void_wraith', name: 'Void Wraith', floor: 2, type: 'normal',
      hp: 80, wordSpeed: 33, wordInterval: 2400, attackInterval: 6500, attackDmg: 12,
      wordTiers: [1, 2], loot: { gold: 30 }, phases: [], special: 'invisible',
      color: '#6c5ce7', bodyColor: '#4a0080', eyeColor: '#dfe6e9',
      size: 22, emoji: '👻',
    },
    bone_oracle: {
      id: 'bone_oracle', name: 'Bone Oracle', floor: 2, type: 'elite',
      hp: 140, wordSpeed: 28, wordInterval: 2600, attackInterval: 4500, attackDmg: 20,
      wordTiers: [2, 3], loot: { gold: 60 }, phases: [],
      color: '#dfe6e9', bodyColor: '#b2bec3', eyeColor: '#00cec9',
      size: 24, emoji: '💀',
    },
    lich_lord: {
      id: 'lich_lord', name: 'Lich Lord', floor: 2, type: 'boss',
      hp: 300, wordSpeed: 34, wordInterval: 2100, attackInterval: 4500, attackDmg: 22,
      wordTiers: [1, 2, 3], loot: { gold: 110 },
      phases: [
        { hpThreshold: 0.66, speedMult: 1.2,  intervalMult: 0.85, announce: 'CURSED FORM!' },
        { hpThreshold: 0.33, speedMult: 1.45, intervalMult: 0.65, announce: 'UNDEATH RISES!' },
      ],
      color: '#a29bfe', bodyColor: '#341f97', eyeColor: '#00cec9',
      size: 36, emoji: '🧟',
    },
    plague_knight: {
      id: 'plague_knight', name: 'Plague Knight', floor: 2, type: 'normal',
      hp: 115, wordSpeed: 28, wordInterval: 2500, attackInterval: 7000, attackDmg: 17,
      wordTiers: [1, 2], loot: { gold: 33 }, phases: [],
      color: '#55efc4', bodyColor: '#00b894', eyeColor: '#fdcb6e',
      size: 22, emoji: '⚗️',
    },
    spectral_wolf: {
      id: 'spectral_wolf', name: 'Spectral Wolf', floor: 2, type: 'normal',
      hp: 75, wordSpeed: 40, wordInterval: 2100, attackInterval: 7500, attackDmg: 12,
      wordTiers: [1, 2], loot: { gold: 28 }, phases: [],
      color: '#dfe6e9', bodyColor: '#b2bec3', eyeColor: '#74b9ff',
      size: 18, emoji: '🐺',
    },

    // ── Floor 3 ──
    storm_knight: {
      id: 'storm_knight', name: 'Storm Knight', floor: 3, type: 'normal',
      hp: 160, wordSpeed: 40, wordInterval: 2200, attackInterval: 5500, attackDmg: 20,
      wordTiers: [2, 3], loot: { gold: 45 }, phases: [],
      color: '#74b9ff', bodyColor: '#0984e3', eyeColor: '#fdcb6e',
      size: 24, emoji: '⚔️',
    },
    dread_sorcerer: {
      id: 'dread_sorcerer', name: 'Dread Sorcerer', floor: 3, type: 'normal',
      hp: 130, wordSpeed: 42, wordInterval: 2000, attackInterval: 5000, attackDmg: 18,
      wordTiers: [2, 3], loot: { gold: 45 }, phases: [], special: 'scramble',
      color: '#e17055', bodyColor: '#c0392b', eyeColor: '#a29bfe',
      size: 22, emoji: '🔮',
    },
    tyrant_prime: {
      id: 'tyrant_prime', name: 'TYRANT PRIME', floor: 3, type: 'boss',
      hp: 500, wordSpeed: 50, wordInterval: 1700, attackInterval: 3800, attackDmg: 28,
      wordTiers: [2, 3], loot: { gold: 200 },
      phases: [
        { hpThreshold: 0.66, speedMult: 1.25, intervalMult: 0.82, announce: 'OVERCLOCK!' },
        { hpThreshold: 0.33, speedMult: 1.55, intervalMult: 0.60, announce: 'ANNIHILATE!!' },
      ],
      color: '#fd79a8', bodyColor: '#6d214f', eyeColor: '#ffd700',
      size: 40, emoji: '👾',
    },
    iron_golem: {
      id: 'iron_golem', name: 'Iron Golem', floor: 3, type: 'normal',
      hp: 210, wordSpeed: 30, wordInterval: 2900, attackInterval: 5800, attackDmg: 26,
      wordTiers: [2, 3], loot: { gold: 50 }, phases: [],
      color: '#b2bec3', bodyColor: '#636e72', eyeColor: '#ffd700',
      size: 28, emoji: '🤖',
    },
  },

  // ── Upgrade pool ─────────────────────────────────────────────────────────────
  upgrades: [
    // Passives
    { id:'iron_skin',   name:'IRON SKIN',    type:'passive', rarity:'common',
      desc:'+20 max HP and heal 10 now',         effect:{ maxHpBonus:20, healNow:10 } },
    { id:'quick_step',  name:'QUICK STEP',   type:'passive', rarity:'common',
      desc:'Enemy words move 15% slower',         effect:{ wordSpeedMult:0.85 } },
    { id:'sharp_mind',  name:'SHARP MIND',   type:'passive', rarity:'common',
      desc:'+0.3 damage multiplier',              effect:{ dmgMult:0.3 } },
    { id:'regen_ring',  name:'REGEN RING',   type:'passive', rarity:'uncommon',
      desc:'Heal 12 HP when entering each room',  effect:{ regenPerRoom:12 } },
    { id:'berserker',   name:'BERSERKER',    type:'passive', rarity:'rare',
      desc:'Below 30% HP: +0.75 damage mult',     effect:{ berserk:true } },
    { id:'vampiric',    name:'VAMPIRIC',     type:'passive', rarity:'uncommon',
      desc:'Heal 2 HP per word destroyed',         effect:{ vampiric:true } },
    { id:'longshot',    name:'LONGSHOT',     type:'passive', rarity:'rare',
      desc:'Words ≥8 chars deal triple damage',   effect:{ longshot:true } },
    { id:'deathless',   name:'DEATHLESS',    type:'passive', rarity:'epic',
      desc:'Survive one killing blow this run',   effect:{ deathless:true } },
    // Spells
    { id:'sp_freeze',   name:'FREEZE',       type:'spell',   rarity:'uncommon',
      desc:'Stop all words for 3s  (CD: 12s)',    spell:'freeze', cd:12000 },
    { id:'sp_shield',   name:'SHIELD',       type:'spell',   rarity:'uncommon',
      desc:'Absorb 30 damage  (CD: 15s)',          spell:'shield', cd:15000 },
    { id:'sp_nova',     name:'NOVA',         type:'spell',   rarity:'rare',
      desc:'Destroy every word + 15 dmg/word  (CD: 20s)', spell:'nova', cd:20000 },
    { id:'sp_haste',    name:'HASTE',        type:'spell',   rarity:'uncommon',
      desc:'Words slow 40% for 5s  (CD: 18s)',    spell:'haste', cd:18000 },
    { id:'sp_drain',    name:'DRAIN',        type:'spell',   rarity:'rare',
      desc:'Steal 20 HP from enemy  (CD: 16s)',   spell:'drain', cd:16000 },
    { id:'sp_blast',    name:'BLAST',        type:'spell',   rarity:'rare',
      desc:'80 flat damage instantly  (CD: 22s)', spell:'blast', cd:22000 },
    // Deck
    { id:'dk_purge',    name:'PURGE',        type:'deck',    rarity:'uncommon',
      desc:'Remove long words (10+ chars) from pool', effect:{ purge:true } },
    { id:'dk_inject',   name:'INJECT',       type:'deck',    rarity:'common',
      desc:'Add short power words to the pool',  effect:{ inject:true } },
    { id:'dk_chaos',    name:'CHAOS',        type:'deck',    rarity:'rare',
      desc:'2× word speed — 2× your damage output', effect:{ chaos:true } },
  ],

  // ── Attack words per floor ──────────────────────────────────────────────────
  attackWords: {
    1: ['slash','bash','claw','bite','smash','crush','gore','rend','maul','strike','hack'],
    2: ['shatter','impale','lacerate','mutilate','ravage','sever','pierce','cleave'],
    3: ['annihilate','eradicate','decimate','devastate','obliterate','pulverize'],
  },

  // ── Map templates (floor structure) ─────────────────────────────────────────
  // Each floor: one entry, two branches (2-3 rooms each), one boss
  floorEnemies: {
    1: { normal: ['goblin_scout','cave_troll','dire_rat','goblin_shaman'], elite: ['cursed_tome'], boss: 'goblin_king' },
    2: { normal: ['shadow_archer','void_wraith','plague_knight','spectral_wolf'], elite: ['bone_oracle'], boss: 'lich_lord' },
    3: { normal: ['storm_knight','dread_sorcerer','iron_golem'], elite: ['dread_sorcerer'], boss: 'tyrant_prime' },
  },

  // ── Power words for deck manipulation ───────────────────────────────────────
  powerWords: ['zap','bash','cut','hit','jab','rip','ace','axe','key','aim'],

  rarityColor: { common:'#b2bec3', uncommon:'#74b9ff', rare:'#ffd700', epic:'#fd79a8' },
};

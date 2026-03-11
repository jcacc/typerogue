'use strict';
const express = require('express');
const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');

const SECRET = process.env.LEADERBOARD_SECRET || '';
if (!SECRET) { console.error('LEADERBOARD_SECRET env var not set — submissions will be rejected'); }

function verifySignature(body) {
  const { sig, name, score, class: cls, difficulty, floor, outcome, mode, challenge_date } = body;
  if (!sig) return false;
  const md = mode || 'classic';
  const cd = challenge_date || '';
  const msg = `${(name||'').trim().toUpperCase()}:${score}:${cls}:${difficulty}:${floor}:${outcome}:${md}:${cd}`;
  const expected = crypto.createHmac('sha256', SECRET).update(msg).digest('hex');
  console.log(`sig check | msg="${msg}" | expected=${expected} | got=${sig}`);
  try {
    const a = Buffer.from(sig, 'hex'), b = Buffer.from(expected, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch { return false; }
}

const PORT = 3002;
const DB_PATH = path.join(__dirname, 'scores.db');

// ── DB setup ──────────────────────────────────────────────────────────────────
const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT    NOT NULL,
    score          INTEGER NOT NULL,
    class          TEXT    NOT NULL,
    difficulty     TEXT    NOT NULL,
    floor          INTEGER NOT NULL,
    outcome        TEXT    NOT NULL,
    dmg            INTEGER NOT NULL,
    words          INTEGER NOT NULL,
    accuracy       REAL    NOT NULL,
    submitted_at   TEXT    NOT NULL,
    mode           TEXT    NOT NULL DEFAULT 'classic',
    challenge_date TEXT    NOT NULL DEFAULT ''
  );
`);
// Safe migrations for existing DBs
try { db.exec(`ALTER TABLE scores ADD COLUMN mode TEXT NOT NULL DEFAULT 'classic'`); } catch {}
try { db.exec(`ALTER TABLE scores ADD COLUMN challenge_date TEXT NOT NULL DEFAULT ''`); } catch {}

const getTop = db.prepare(`
  SELECT name, score, class, difficulty, floor, outcome, dmg, words, accuracy, submitted_at
  FROM scores WHERE mode = 'classic' ORDER BY score DESC LIMIT 20
`);
const getDailyTop = db.prepare(`
  SELECT name, score, class, difficulty, floor, outcome, dmg, words, accuracy, submitted_at
  FROM scores WHERE mode = 'daily' AND challenge_date = ? ORDER BY score DESC LIMIT 20
`);
const insertScore = db.prepare(`
  INSERT INTO scores (name, score, class, difficulty, floor, outcome, dmg, words, accuracy, submitted_at, mode, challenge_date)
  VALUES (@name, @score, @class, @difficulty, @floor, @outcome, @dmg, @words, @accuracy, @submitted_at, @mode, @challenge_date)
`);
const getRank = db.prepare(`SELECT COUNT(*) AS rank FROM scores WHERE score > ? AND mode = 'classic'`);
const getDailyRank = db.prepare(`SELECT COUNT(*) AS rank FROM scores WHERE score > ? AND mode = 'daily' AND challenge_date = ?`);

// ── Rate limiting ─────────────────────────────────────────────────────────────
const lastSubmit = new Map();     // ip → timestamp (classic, 1/min)
const dailySubmitMap = new Map(); // 'ip:date' → true (daily, 1/day)
const RATE_MS = 60_000;

// ── App ───────────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/leaderboard', (req, res) => {
  const mode = req.query.mode || 'classic';
  const date = req.query.date || '';
  if (mode === 'daily' && date) {
    res.json(getDailyTop.all(date));
  } else {
    res.json(getTop.all());
  }
});

app.post('/leaderboard', (req, res) => {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress;
  const now = Date.now();
  const { name, score, class: cls, difficulty, floor, outcome, dmg, words, accuracy } = req.body;
  const mode = req.body.mode || 'classic';
  const challenge_date = req.body.challenge_date || '';

  // Rate limiting
  if (mode === 'daily') {
    const key = `${ip}:${challenge_date}`;
    if (dailySubmitMap.has(key))
      return res.status(429).json({ error: 'Already submitted a score for this daily challenge.' });
  } else {
    if (lastSubmit.has(ip) && now - lastSubmit.get(ip) < RATE_MS)
      return res.status(429).json({ error: 'Too many submissions. Try again in a minute.' });
  }

  if (!name || typeof name !== 'string' || !name.trim() || name.length > 20)
    return res.status(400).json({ error: 'Invalid name.' });
  if (!Number.isInteger(score) || score < 0 || score > 999_999)
    return res.status(400).json({ error: 'Invalid score.' });
  if (!['warrior', 'rogue', 'mage', 'ranger', 'necromancer'].includes(cls))
    return res.status(400).json({ error: 'Invalid class.' });
  if (!['Beginner', 'Normal', 'Hard'].includes(difficulty))
    return res.status(400).json({ error: 'Invalid difficulty.' });
  if (!Number.isInteger(floor) || floor < 1 || floor > 3)
    return res.status(400).json({ error: 'Invalid floor.' });
  if (!['victory', 'defeat'].includes(outcome))
    return res.status(400).json({ error: 'Invalid outcome.' });
  if (outcome === 'victory' && floor !== 3)
    return res.status(400).json({ error: 'Invalid floor for victory.' });
  if (!['classic', 'daily'].includes(mode))
    return res.status(400).json({ error: 'Invalid mode.' });
  if (mode === 'daily' && !/^\d{4}-\d{2}-\d{2}$/.test(challenge_date))
    return res.status(400).json({ error: 'Invalid challenge_date.' });
  if (!verifySignature(req.body))
    return res.status(403).json({ error: 'Invalid signature.' });

  if (mode === 'daily') {
    dailySubmitMap.set(`${ip}:${challenge_date}`, true);
  } else {
    lastSubmit.set(ip, now);
  }

  insertScore.run({
    name: name.trim().toUpperCase().slice(0, 20),
    score,
    class: cls,
    difficulty,
    floor,
    outcome,
    dmg: dmg || 0,
    words: words || 0,
    accuracy: Math.round((accuracy || 0) * 10) / 10,
    submitted_at: new Date().toISOString().slice(0, 10),
    mode,
    challenge_date,
  });

  const rank = mode === 'daily'
    ? getDailyRank.get(score, challenge_date).rank + 1
    : getRank.get(score).rank + 1;
  res.json({ rank });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`leaderboard API listening on 127.0.0.1:${PORT}`);
});

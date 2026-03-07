'use strict';
const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const PORT = 3002;
const DB_PATH = path.join(__dirname, 'scores.db');

// ── DB setup ──────────────────────────────────────────────────────────────────
const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    score        INTEGER NOT NULL,
    class        TEXT    NOT NULL,
    difficulty   TEXT    NOT NULL,
    floor        INTEGER NOT NULL,
    outcome      TEXT    NOT NULL,
    dmg          INTEGER NOT NULL,
    words        INTEGER NOT NULL,
    accuracy     REAL    NOT NULL,
    submitted_at TEXT    NOT NULL
  );
`);

const getTop = db.prepare(`
  SELECT name, score, class, difficulty, floor, outcome, dmg, words, accuracy, submitted_at
  FROM scores ORDER BY score DESC LIMIT 20
`);
const insertScore = db.prepare(`
  INSERT INTO scores (name, score, class, difficulty, floor, outcome, dmg, words, accuracy, submitted_at)
  VALUES (@name, @score, @class, @difficulty, @floor, @outcome, @dmg, @words, @accuracy, @submitted_at)
`);
const getRank = db.prepare(`SELECT COUNT(*) AS rank FROM scores WHERE score > ?`);

// ── Rate limiting (in-memory, per IP, 1 submit/minute) ───────────────────────
const lastSubmit = new Map();
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
  res.json(getTop.all());
});

app.post('/leaderboard', (req, res) => {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress;
  const now = Date.now();
  if (lastSubmit.has(ip) && now - lastSubmit.get(ip) < RATE_MS)
    return res.status(429).json({ error: 'Too many submissions. Try again in a minute.' });

  const { name, score, class: cls, difficulty, floor, outcome, dmg, words, accuracy } = req.body;

  if (!name || typeof name !== 'string' || !name.trim() || name.length > 20)
    return res.status(400).json({ error: 'Invalid name.' });
  if (!Number.isInteger(score) || score < 0 || score > 9_999_999)
    return res.status(400).json({ error: 'Invalid score.' });
  if (!['warrior', 'rogue', 'mage'].includes(cls))
    return res.status(400).json({ error: 'Invalid class.' });
  if (!['Beginner', 'Normal', 'Hard'].includes(difficulty))
    return res.status(400).json({ error: 'Invalid difficulty.' });
  if (!Number.isInteger(floor) || floor < 1 || floor > 3)
    return res.status(400).json({ error: 'Invalid floor.' });
  if (!['victory', 'defeat'].includes(outcome))
    return res.status(400).json({ error: 'Invalid outcome.' });

  lastSubmit.set(ip, now);

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
  });

  const rank = getRank.get(score).rank + 1;
  res.json({ rank });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`leaderboard API listening on 127.0.0.1:${PORT}`);
});

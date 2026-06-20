import { Router } from 'express';
import { getDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const DEFAULT_STATE = {
  theme: 'dental',
  numberingSystem: 'FDI',
  selectedTooth: null,
  layout: '2x2',
  activeStudyUID: null,
  hangingProtocolId: 'dental2x2',
};

const ALLOWED_KEYS = Object.keys(DEFAULT_STATE);

router.get('/', (req, res) => {
  const db = getDb();
  const state = db.data.viewerStates[req.user.id];
  return res.json({ state: state || { ...DEFAULT_STATE } });
});

router.put('/', async (req, res) => {
  const db = getDb();
  const incoming = req.body || {};

  const current = db.data.viewerStates[req.user.id] || { ...DEFAULT_STATE };
  const next = { ...current };
  for (const key of ALLOWED_KEYS) {
    if (key in incoming) next[key] = incoming[key];
  }
  next.updatedAt = new Date().toISOString();

  db.data.viewerStates[req.user.id] = next;
  await db.write();

  return res.json({ state: next });
});

export default router;

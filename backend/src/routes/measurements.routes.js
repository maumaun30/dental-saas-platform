import { Router } from 'express';
import { nanoid } from 'nanoid';
import { getDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

function sanitize(m, userId) {
  return {
    id: m.id || nanoid(),
    userId,
    studyUID: String(m.studyUID || 'unknown-study'),
    presetId: m.presetId || null,
    label: String(m.label || 'Measurement'),
    value: typeof m.value === 'number' ? m.value : Number(m.value) || 0,
    unit: m.unit || '',
    tooth: m.tooth ?? null,
    numberingSystem: m.numberingSystem || null,
    toolName: m.toolName || null,
    annotationUID: m.annotationUID || null,
    data: m.data ?? null,
    createdAt: m.createdAt || new Date().toISOString(),
  };
}

router.get('/', (req, res) => {
  const db = getDb();
  const { studyUID } = req.query;
  let items = db.data.measurements.filter((m) => m.userId === req.user.id);
  if (studyUID) items = items.filter((m) => m.studyUID === studyUID);
  return res.json({ measurements: items });
});

router.post('/', async (req, res) => {
  const db = getDb();
  const measurement = sanitize(req.body || {}, req.user.id);
  db.data.measurements.push(measurement);
  await db.write();
  return res.status(201).json({ measurement });
});

router.put('/', async (req, res) => {
  const db = getDb();
  const { studyUID, measurements = [] } = req.body || {};
  if (!studyUID) return res.status(400).json({ error: 'studyUID is required.' });

  db.data.measurements = db.data.measurements.filter(
    (m) => !(m.userId === req.user.id && m.studyUID === studyUID),
  );
  const saved = measurements.map((m) => sanitize({ ...m, studyUID }, req.user.id));
  db.data.measurements.push(...saved);
  await db.write();

  return res.json({ measurements: saved });
});

router.delete('/:id', async (req, res) => {
  const db = getDb();
  const before = db.data.measurements.length;
  db.data.measurements = db.data.measurements.filter(
    (m) => !(m.id === req.params.id && m.userId === req.user.id),
  );
  if (db.data.measurements.length === before) {
    return res.status(404).json({ error: 'Measurement not found.' });
  }
  await db.write();
  return res.status(204).end();
});

export default router;

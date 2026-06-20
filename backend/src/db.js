import fs from 'node:fs';
import path from 'node:path';
import { JSONFilePreset } from 'lowdb/node';
import bcrypt from 'bcryptjs';
import { config } from './config.js';

const defaultData = { users: [], viewerStates: {}, measurements: [] };

let db;

export async function initDb() {
  fs.mkdirSync(path.dirname(config.dbFile), { recursive: true });

  db = await JSONFilePreset(config.dbFile, defaultData);

  db.data.users ||= [];
  db.data.viewerStates ||= {};
  db.data.measurements ||= [];

  if (config.seedDemoUser && !db.data.users.some((u) => u.email === config.demoUser.email)) {
    const { email, password, name, practiceName } = config.demoUser;
    db.data.users.push({
      id: 'demo-user',
      email,
      name,
      practiceName,
      passwordHash: bcrypt.hashSync(password, 10),
      createdAt: new Date().toISOString(),
    });
  }

  await db.write();
  return db;
}

export function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

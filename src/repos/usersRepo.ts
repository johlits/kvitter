import { db } from '../db/sqlite';
import { User } from '../types';

export function listUsers(): User[] {
  const stmt = db.prepare('SELECT id, handle, displayName, createdAt FROM users ORDER BY createdAt ASC');
  return stmt.all() as User[];
}

export function getUser(id: string): User | undefined {
  const stmt = db.prepare('SELECT id, handle, displayName, createdAt FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

export function getUserByHandle(handle: string): User | undefined {
  const stmt = db.prepare('SELECT id, handle, displayName, createdAt FROM users WHERE lower(handle) = lower(?)');
  return stmt.get(handle) as User | undefined;
}

export function createUser(user: User): User {
  const stmt = db.prepare('INSERT INTO users (id, handle, displayName, createdAt) VALUES (?, ?, ?, ?)');
  stmt.run(user.id, user.handle, user.displayName, user.createdAt);
  return user;
}

export function updateUser(id: string, updates: Partial<Pick<User, 'displayName'>>): User | undefined {
  const existing = getUser(id);
  if (!existing) return undefined;
  const displayName = updates.displayName ?? existing.displayName;
  const stmt = db.prepare('UPDATE users SET displayName = ? WHERE id = ?');
  stmt.run(displayName, id);
  return { ...existing, displayName };
}

export function deleteUser(id: string): boolean {
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  const res = stmt.run(id);
  return res.changes > 0;
}

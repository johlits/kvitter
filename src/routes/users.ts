import { Router } from 'express';
import { User } from '../types';
import { randomUUID } from 'crypto';
import { listUsers, getUser, getUserByHandle, createUser, updateUser, deleteUser } from '../repos/usersRepo';

const router = Router();

router.get('/', (_req, res) => {
  res.json(listUsers());
});

router.post('/', (req, res) => {
  const { handle, displayName } = req.body || {};
  if (!handle || !displayName) {
    return res.status(400).json({ error: 'handle and displayName are required' });
  }
  if (getUserByHandle(String(handle))) return res.status(409).json({ error: 'handle already exists' });
  const user: User = {
    id: randomUUID(),
    handle,
    displayName,
    createdAt: new Date().toISOString(),
  };
  res.status(201).json(createUser(user));
});

router.get('/:id', (req, res) => {
  const user = getUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'user not found' });
  res.json(user);
});

router.patch('/:id', (req, res) => {
  const { displayName } = req.body || {};
  const updated = updateUser(req.params.id, { displayName });
  if (!updated) return res.status(404).json({ error: 'user not found' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const ok = deleteUser(req.params.id);
  if (!ok) return res.status(404).json({ error: 'user not found' });
  res.status(204).send();
});

export default router;

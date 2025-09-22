import { Router } from 'express';
import { Tweet } from '../types';
import { randomUUID } from 'crypto';
import { listTweets, getTweet, createTweet, deleteTweet } from '../repos/tweetsRepo';

const router = Router();

router.get('/', (_req, res) => {
  res.json(listTweets());
});

router.post('/', (req, res) => {
  const { userId, body } = req.body || {};
  if (!userId || !body) {
    return res.status(400).json({ error: 'userId and body are required' });
  }
  const tweet: Tweet = {
    id: randomUUID(),
    userId,
    body: String(body).slice(0, 280),
    createdAt: new Date().toISOString(),
  };
  res.status(201).json(createTweet(tweet));
});

router.get('/:id', (req, res) => {
  const tweet = getTweet(req.params.id);
  if (!tweet) return res.status(404).json({ error: 'tweet not found' });
  res.json(tweet);
});

router.delete('/:id', (req, res) => {
  const ok = deleteTweet(req.params.id);
  if (!ok) return res.status(404).json({ error: 'tweet not found' });
  res.status(204).send();
});

export default router;

import { db } from '../db/sqlite';
import { Tweet } from '../types';

export function listTweets(): Tweet[] {
  const stmt = db.prepare('SELECT id, userId, body, createdAt FROM tweets ORDER BY createdAt DESC');
  return stmt.all() as Tweet[];
}

export function getTweet(id: string): Tweet | undefined {
  const stmt = db.prepare('SELECT id, userId, body, createdAt FROM tweets WHERE id = ?');
  return stmt.get(id) as Tweet | undefined;
}

export function createTweet(tweet: Tweet): Tweet {
  const stmt = db.prepare('INSERT INTO tweets (id, userId, body, createdAt) VALUES (?, ?, ?, ?)');
  stmt.run(tweet.id, tweet.userId, tweet.body, tweet.createdAt);
  return tweet;
}

export function deleteTweet(id: string): boolean {
  const stmt = db.prepare('DELETE FROM tweets WHERE id = ?');
  const res = stmt.run(id);
  return res.changes > 0;
}

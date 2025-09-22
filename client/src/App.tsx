import React, { useEffect, useMemo, useState } from 'react';
import './app.css';

type User = {
  id: string;
  handle: string;
  displayName: string;
  createdAt: string;
};

type Tweet = {
  id: string;
  userId: string;
  body: string;
  createdAt: string;
};

const api = {
  async listUsers(): Promise<User[]> {
    const r = await fetch('/api/users');
    return r.json();
  },
  async createUser(handle: string, displayName: string): Promise<User> {
    const r = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle, displayName })
    });
    if (!r.ok) throw new Error('Failed to create user');
    return r.json();
  },
  async listTweets(): Promise<Tweet[]> {
    const r = await fetch('/api/tweets');
    return r.json();
  },
  async postTweet(userId: string, body: string): Promise<Tweet> {
    const r = await fetch('/api/tweets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, body })
    });
    if (!r.ok) throw new Error('Failed to post tweet');
    return r.json();
  }
};

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [newHandle, setNewHandle] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [composer, setComposer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [u, t] = await Promise.all([api.listUsers(), api.listTweets()]);
        setUsers(u);
        setTweets(t);
        if (u.length) setSelectedUserId(u[0].id);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId) || null, [users, selectedUserId]);

  async function onCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newHandle || !newDisplayName) return;
    try {
      const user = await api.createUser(newHandle, newDisplayName);
      const next = [...users, user];
      setUsers(next);
      setSelectedUserId(user.id);
      setNewHandle('');
      setNewDisplayName('');
    } catch (e: any) {
      alert(e?.message || 'Failed to create user');
    }
  }

  async function onTweet(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !composer.trim()) return;
    try {
      const tw = await api.postTweet(selectedUser.id, composer.trim());
      setTweets([tw, ...tweets]);
      setComposer('');
    } catch (e: any) {
      alert(e?.message || 'Failed to post tweet');
    }
  }

  if (loading) return <div className="container">Loading…</div>;
  if (error) return <div className="container error">{error}</div>;

  return (
    <div className="container">
      <header>
        <h1>Kvitter</h1>
        <div className="subtitle">A tiny Twitter clone on Azure + SQLite</div>
      </header>

      <section className="controls">
        <div className="user-select">
          <label>Active user</label>
          <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.displayName} ({u.handle})</option>
            ))}
          </select>
        </div>

        <form className="create-user" onSubmit={onCreateUser}>
          <input placeholder="Handle (e.g. @alice)" value={newHandle} onChange={e => setNewHandle(e.target.value)} />
          <input placeholder="Display name" value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} />
          <button type="submit">Create user</button>
        </form>
      </section>

      <section className="composer">
        <form onSubmit={onTweet}>
          <textarea maxLength={280} placeholder={selectedUser ? `What's happening, ${selectedUser.displayName}?` : 'Select a user first'} value={composer} onChange={e => setComposer(e.target.value)} />
          <div className="composer-actions">
            <span>{composer.length}/280</span>
            <button type="submit" disabled={!selectedUser || composer.length === 0}>Tweet</button>
          </div>
        </form>
      </section>

      <section className="timeline">
        {tweets.length === 0 && <div className="empty">No tweets yet. Be the first to post!</div>}
        {tweets.map(t => {
          const u = users.find(x => x.id === t.userId);
          return (
            <article key={t.id} className="tweet">
              <div className="avatar">{(u?.displayName || '?')[0]?.toUpperCase()}</div>
              <div className="tweet-body">
                <div className="tweet-meta">
                  <span className="name">{u?.displayName || 'Unknown'}</span>
                  <span className="handle">{u?.handle || ''}</span>
                  <span className="time">{new Date(t.createdAt).toLocaleString()}</span>
                </div>
                <div className="tweet-text">{t.body}</div>
              </div>
            </article>
          );
        })}
      </section>

      <footer>
        <a href="/">API</a> • <a href="/version">Version</a> • <a href="/health/db">DB Health</a>
      </footer>
    </div>
  );
}

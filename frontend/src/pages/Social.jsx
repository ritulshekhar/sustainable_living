import { useState, useEffect } from 'react';
import { getSocialStats, getLeaderboard, getMostImproved, addFriend } from '../api';
import './Social.css';

const AVATAR_COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6',
  '#06b6d4', '#ef4444', '#84cc16',
];

function Avatar({ initial, index, size = 40 }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div className="avatar" style={{
      width: size, height: size,
      background: `${color}22`,
      border: `2px solid ${color}44`,
      color,
      fontSize: size * 0.4,
    }}>
      {initial}
    </div>
  );
}

function RankBadge({ rank }) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  if (medals[rank]) return <span style={{ fontSize: '1.4rem' }}>{medals[rank]}</span>;
  return <span className="rank-number">#{rank}</span>;
}

function AddFriendModal({ onClose, onAdd }) {
  const [username, setUsername] = useState('');
  const [msg, setMsg] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await onAdd(username);
    setMsg(res);
  };
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>👥 Add a Friend</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Friend's Username</label>
            <input className="form-input" required value={username}
              placeholder="Enter username..."
              onChange={(e) => setUsername(e.target.value)} />
          </div>
          {msg && (
            <div className={`alert ${msg.success ? 'alert-success' : 'alert-error'}`}>
              <span>{msg.success ? '✅' : '⚠️'}</span>
              <span>{msg.message}</span>
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Send Request</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Social() {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [mostImproved, setMostImproved] = useState([]);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [loading, setLoading] = useState(true);
  const [showAddFriend, setShowAddFriend] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [statsRes, lbRes, miRes] = await Promise.all([
          getSocialStats(1),
          getLeaderboard(1),
          getMostImproved(),
        ]);
        setStats(statsRes.data);
        setLeaderboard(lbRes.data);
        setMostImproved(miRes.data);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const handleAddFriend = async (username) => {
    try {
      const res = await addFriend(username, 1);
      return res.data;
    } catch {
      return { success: false, message: 'Failed to add friend.' };
    }
  };

  if (loading) return <div className="page"><div className="loading-center"><div className="spinner" /></div></div>;

  const displayData = activeTab === 'leaderboard' ? leaderboard : mostImproved;

  return (
    <div className="page">
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1>👥 Social Leaderboard</h1>
            <p>See how you compare with friends and track your progress.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddFriend(true)}>
            + Add Friend
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>👥</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats?.friends_count ?? 0}</div>
          <div className="stat-label">Friends</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>🏆</div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>#{stats?.your_rank ?? '-'}</div>
          <div className="stat-label">Your Rank</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>📈</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{stats?.better_than_percent ?? 0}%</div>
          <div className="stat-label">Better Than</div>
        </div>
      </div>

      {/* ── Leaderboard / Compare Tabs ── */}
      <div className="card">
        <div className="section-header">
          <h2 className="section-title">Rankings</h2>
          <div className="tab-bar">
            <button className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}>🏆 Leaderboard</button>
            <button className={`tab-btn ${activeTab === 'most_improved' ? 'active' : ''}`}
              onClick={() => setActiveTab('most_improved')}>📈 Most Improved</button>
          </div>
        </div>

        <div className="leaderboard-list">
          {displayData.map((entry, i) => (
            <div key={entry.rank} className={`leaderboard-row ${entry.is_you ? 'is-you' : ''}`}>
              <div className="lb-rank"><RankBadge rank={entry.rank} /></div>
              <Avatar initial={entry.avatar_initial} index={i} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {entry.username}
                  {entry.is_you && <span className="badge badge-green">You</span>}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Daily average
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{entry.total_co2} kg</div>
                <div style={{
                  fontSize: '0.78rem',
                  color: entry.change_percent < 0 ? 'var(--accent)' : 'var(--red)',
                  marginTop: 2,
                }}>
                  {entry.change_percent < 0 ? '▼' : '▲'} {Math.abs(entry.change_percent)}%
                </div>
              </div>
            </div>
          ))}

          {displayData.length === 0 && (
            <div className="empty-state">
              <div className="icon">👥</div>
              <h3>No data yet</h3>
              <p>Add friends to see comparisons.</p>
            </div>
          )}
        </div>
      </div>

      {showAddFriend && (
        <AddFriendModal onClose={() => setShowAddFriend(false)} onAdd={handleAddFriend} />
      )}
    </div>
  );
}

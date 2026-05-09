import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getProfile, addProfileGoal } from '../api';
import './Profile.css';

const GOAL_CATEGORIES = ['transportation', 'energy', 'food', 'shopping'];

function GoalModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: '', description: '', target_reduction: 20, category: 'transportation' });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>🎯 Add New Goal</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Goal Title *</label>
            <input className="form-input" required value={form.title}
              placeholder="e.g. Use public transit more"
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" value={form.description}
              placeholder="Optional description"
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Reduction Target: <strong>{form.target_reduction}%</strong></label>
            <input type="range" min={5} max={100} step={5} className="form-range"
              value={form.target_reduction}
              onChange={(e) => setForm({ ...form, target_reduction: parseInt(e.target.value) })} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {GOAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3" style={{ marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Save Goal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getProfile(1);
      setProfile(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { loadProfile(); }, []);

  const handleAddGoal = async (goal) => {
    try {
      await addProfileGoal(goal, 1);
      setShowGoalModal(false);
      loadProfile();
    } catch {}
  };

  if (loading) return <div className="page"><div className="loading-center"><div className="spinner" /></div></div>;
  if (!profile) return (
    <div className="page">
      <div className="empty-state">
        <div className="icon">👤</div>
        <h3>Profile not found</h3>
        <p>Register a user first or start the backend server.</p>
      </div>
    </div>
  );

  const memberDate = new Date(profile.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const earnedBadges = profile.badges?.filter((b) => b.earned) ?? [];

  return (
    <div className="page">
      {/* ── User Header ── */}
      <div className="profile-header card">
        <div className="profile-avatar">
          {profile.username?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{profile.username}</h1>
          <p className="profile-email">{profile.email}</p>
          <div className="profile-meta">
            <span>🗓️ Member since {memberDate}</span>
            <span className="meta-dot">·</span>
            <span>👥 {profile.friends_count} friends</span>
            <span className="meta-dot">·</span>
            <span>🏅 {earnedBadges.length} badges earned</span>
          </div>
        </div>
        <div className="profile-co2">
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Total CO₂ Tracked</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
            {profile.total_co2_saved.toFixed(1)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kg CO₂e</div>
        </div>
      </div>

      {/* ── Emission History Chart ── */}
      <div className="card" style={{ marginTop: 24, marginBottom: 24 }}>
        <h2 className="section-title" style={{ marginBottom: 20 }}>📈 Emission History (Last 7 Days)</h2>
        {profile.emission_history?.some((d) => d.total > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={profile.emission_history} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: 8, fontSize: '0.8rem' }} />
              <Line type="monotone" dataKey="total" name="Total CO₂e" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 5, fill: 'var(--accent)' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <div className="icon">📈</div>
            <h3>No history yet</h3>
            <p>Log activities to see your emission trend.</p>
          </div>
        )}
      </div>

      <div className="profile-bottom">
        {/* ── Goals ── */}
        <div className="card">
          <div className="section-header">
            <h2 className="section-title">🎯 Active Goals</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowGoalModal(true)}>+ Add New Goal</button>
          </div>
          {profile.goals?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {profile.goals.map((g) => {
                const pct = Math.min((g.current_progress / g.target_reduction) * 100, 100);
                return (
                  <div key={g.id} className="goal-item">
                    <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{g.title}</div>
                        {g.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{g.description}</div>}
                      </div>
                      <span className="badge badge-green">{g.category}</span>
                    </div>
                    <div className="flex justify-between" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                      <span>{g.current_progress}% done</span>
                      <span>Target: {g.target_reduction}%</span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="icon">🎯</div>
              <h3>No goals yet</h3>
              <p>Add a goal to start tracking progress.</p>
              <button className="btn btn-secondary" onClick={() => setShowGoalModal(true)}>+ Add First Goal</button>
            </div>
          )}
        </div>

        {/* ── Badges ── */}
        <div className="card">
          <h2 className="section-title" style={{ marginBottom: 20 }}>🏅 Achievements</h2>
          <div className="badges-grid">
            {profile.badges?.map((b) => (
              <div key={b.id} className={`badge-item ${b.earned ? 'earned' : 'locked'}`} title={b.description}>
                <div className="badge-icon">{b.icon}</div>
                <div className="badge-name">{b.name}</div>
                {!b.earned && <div className="badge-lock">🔒</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showGoalModal && <GoalModal onClose={() => setShowGoalModal(false)} onSave={handleAddGoal} />}
    </div>
  );
}

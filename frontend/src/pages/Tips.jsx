import { useState, useEffect } from 'react';
import { getTips, addGoal } from '../api';
import './Tips.css';

const CATEGORIES = [
  { key: 'all', label: '🌿 All' },
  { key: 'transportation', label: '🚗 Transportation' },
  { key: 'home_energy', label: '⚡ Home Energy' },
  { key: 'food', label: '🍽️ Food & Diet' },
  { key: 'shopping', label: '🛍️ Shopping' },
];

const DIFFICULTY_COLORS = {
  Easy: 'var(--accent)',
  Medium: 'var(--amber)',
  Hard: 'var(--red)',
};

function TipCard({ tip, onAddGoal }) {
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    await onAddGoal({
      title: tip.title,
      description: tip.description,
      target_reduction: 20,
      category: tip.category === 'home_energy' ? 'energy' : tip.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="tip-card">
      <div className="tip-icon">{tip.icon}</div>
      <div className="tip-content">
        <div className="tip-header">
          <h3 className="tip-title">{tip.title}</h3>
          <span className="badge" style={{
            background: `${DIFFICULTY_COLORS[tip.difficulty]}22`,
            color: DIFFICULTY_COLORS[tip.difficulty],
            border: `1px solid ${DIFFICULTY_COLORS[tip.difficulty]}44`,
          }}>
            {tip.difficulty}
          </span>
        </div>
        <p className="tip-description">{tip.description}</p>
        <div className="tip-footer">
          <span className="tip-impact">💚 {tip.estimated_impact}</span>
          <button
            className={`btn btn-sm ${added ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleAdd}
          >
            {added ? '✅ Added as Goal!' : '+ Add as Goal'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Tips() {
  const [tips, setTips] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getTips(category);
        setTips(res.data);
      } catch {}
      finally { setLoading(false); }
    })();
  }, [category]);

  const handleAddGoal = async (goal) => {
    try {
      await addGoal(goal, 1);
      setNotification(`"${goal.title}" added as a goal!`);
      setTimeout(() => setNotification(null), 3000);
    } catch {}
  };

  const totalImpact = tips.reduce((acc, t) => {
    const match = t.estimated_impact.match(/[\d.]+/);
    return acc + (match ? parseFloat(match[0]) : 0);
  }, 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1>💡 Sustainability Tips</h1>
        <p>Actionable tips to reduce your carbon footprint. Add them as personal goals.</p>
      </div>

      {notification && (
        <div className="alert alert-success" style={{ marginBottom: 16 }}>
          <span>✅</span>
          <span>{notification}</span>
        </div>
      )}

      <div className="tips-layout">
        <div className="tips-main">
          {/* Category Filter */}
          <div className="category-tabs">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                className={`category-tab ${category === c.key ? 'active' : ''}`}
                onClick={() => setCategory(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <div className="tips-grid">
              {tips.map((tip) => (
                <TipCard key={tip.id} tip={tip} onAddGoal={handleAddGoal} />
              ))}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="tips-sidebar">
          <div className="card">
            <h2 className="section-title" style={{ marginBottom: 16 }}>📊 Impact Summary</h2>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)', textAlign: 'center', padding: '16px 0' }}>
              {totalImpact.toFixed(1)}+
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              kg CO₂e potential savings from these tips
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              <div className="tips-sidebar-stat">
                <span>🌿 Tips shown</span>
                <strong>{tips.length}</strong>
              </div>
              <div className="tips-sidebar-stat">
                <span>🟢 Easy tips</span>
                <strong>{tips.filter((t) => t.difficulty === 'Easy').length}</strong>
              </div>
              <div className="tips-sidebar-stat">
                <span>🟡 Medium tips</span>
                <strong>{tips.filter((t) => t.difficulty === 'Medium').length}</strong>
              </div>
              <div className="tips-sidebar-stat">
                <span>🔴 Hard tips</span>
                <strong>{tips.filter((t) => t.difficulty === 'Hard').length}</strong>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 12, color: 'var(--accent)' }}>💡 Did you know?</h3>
            <p style={{ fontSize: '0.85rem' }}>
              Switching to a plant-based diet just one day per week can save over <strong style={{ color: 'var(--text-primary)' }}>348 kg CO₂</strong> per year — equivalent to driving 900 miles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

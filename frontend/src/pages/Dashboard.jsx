import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getDashboardSummary, getDashboardChart, addGoal, deleteGoal } from '../api';
import './Dashboard.css';

const PERIODS = ['daily', 'weekly', 'monthly', 'yearly'];
const PERIOD_LABELS = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };

const COLORS = {
  transport: '#22c55e',
  energy: '#3b82f6',
  food: '#f59e0b',
  shopping: '#ec4899',
};

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
          <h2>Add New Goal</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Goal Title *</label>
            <input className="form-input" required value={form.title}
              placeholder="e.g. Reduce car usage by 20%"
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" value={form.description}
              placeholder="Optional description"
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Target Reduction: <strong>{form.target_reduction}%</strong></label>
            <input type="range" min={5} max={100} step={5} className="form-range" value={form.target_reduction}
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

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem' }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span>{p.name}</span><span>{p.value} kg</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, chartRes] = await Promise.all([
        getDashboardSummary(1),
        getDashboardChart(1, period),
      ]);
      setSummary(sumRes.data);
      setChartData(chartRes.data);
    } catch {
      // backend may not be running yet — show empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [period]);

  const handleAddGoal = async (goal) => {
    try {
      await addGoal(goal, 1);
      setShowGoalModal(false);
      loadData();
    } catch {}
  };

  const handleDeleteGoal = async (id) => {
    try {
      await deleteGoal(id);
      loadData();
    } catch {}
  };

  if (loading) return <div className="page"><div className="loading-center"><div className="spinner" /></div></div>;

  const stats = [
    { label: 'Today', value: summary?.total_co2_today ?? 0, unit: 'kg CO₂e', color: 'var(--accent)', icon: '📅' },
    { label: 'This Week', value: summary?.total_co2_week ?? 0, unit: 'kg CO₂e', color: 'var(--blue)', icon: '📆' },
    { label: 'This Month', value: summary?.total_co2_month ?? 0, unit: 'kg CO₂e', color: 'var(--amber)', icon: '🗓️' },
    { label: 'All Time', value: summary?.total_co2_alltime ?? 0, unit: 'kg CO₂e', color: 'var(--pink)', icon: '🌍' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>📊 Dashboard</h1>
        <p>Your sustainability overview at a glance.</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value.toFixed(1)}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.unit}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Emissions Chart ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-header">
          <h2 className="section-title">Emissions Over Time</h2>
          <div className="tab-bar">
            {PERIODS.map((p) => (
              <button key={p} className={`tab-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
              <Line type="monotone" dataKey="transport" name="Transportation" stroke={COLORS.transport} strokeWidth={2} dot={{ r: 4, fill: COLORS.transport }} />
              <Line type="monotone" dataKey="energy" name="Energy" stroke={COLORS.energy} strokeWidth={2} dot={{ r: 4, fill: COLORS.energy }} />
              <Line type="monotone" dataKey="food" name="Food" stroke={COLORS.food} strokeWidth={2} dot={{ r: 4, fill: COLORS.food }} />
              <Line type="monotone" dataKey="shopping" name="Shopping" stroke={COLORS.shopping} strokeWidth={2} dot={{ r: 4, fill: COLORS.shopping }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">
            <div className="icon">📊</div>
            <h3>No data yet</h3>
            <p>Log your first activity to see your emissions chart.</p>
          </div>
        )}
      </div>

      <div className="dashboard-bottom">
        {/* ── Category Breakdown ── */}
        <div className="card">
          <h2 className="section-title" style={{ marginBottom: 20 }}>Emissions by Category</h2>
          {(summary?.category_breakdown?.some((c) => c.co2 > 0)) ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={summary.category_breakdown} dataKey="co2" nameKey="category"
                    cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                    {summary.category_breakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} kg CO₂e`]} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="category-legend">
                {summary.category_breakdown.map((c) => (
                  <div key={c.category} className="legend-row">
                    <div className="flex items-center gap-2">
                      <span className="legend-dot" style={{ background: c.color }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.category}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {c.co2} kg <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({c.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="icon">🥧</div>
              <h3>No data yet</h3>
              <p>Log activities to see the breakdown.</p>
            </div>
          )}
        </div>

        {/* ── Goals ── */}
        <div className="card">
          <div className="section-header">
            <h2 className="section-title">🎯 Goals</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowGoalModal(true)}>+ Add Goal</button>
          </div>
          {summary?.goals?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {summary.goals.map((g) => {
                const pct = Math.min((g.current_progress / g.target_reduction) * 100, 100);
                return (
                  <div key={g.id} className="goal-card">
                    <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{g.title}</div>
                        {g.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{g.description}</div>}
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="badge badge-green">{g.category}</span>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteGoal(g.id)}>✕</button>
                      </div>
                    </div>
                    <div className="flex justify-between" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                      <span>Progress: {g.current_progress}%</span>
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
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div className="icon">🎯</div>
              <h3>No goals yet</h3>
              <p>Set a sustainability goal to track your progress.</p>
              <button className="btn btn-secondary" onClick={() => setShowGoalModal(true)}>+ Add First Goal</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      {summary?.recent_activities?.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>🕒 Recent Activity</h2>
          <div className="recent-list">
            {summary.recent_activities.map((a) => (
              <div key={a.id} className="recent-row">
                <div className="recent-icon">🌿</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                    {new Date(a.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    🚗 {a.miles_car} mi · ⚡ {a.electricity_kwh} kWh · 🍽️ {a.diet_type}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.95rem' }}>
                  {a.total_co2?.toFixed(1)} kg
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showGoalModal && <GoalModal onClose={() => setShowGoalModal(false)} onSave={handleAddGoal} />}
    </div>
  );
}

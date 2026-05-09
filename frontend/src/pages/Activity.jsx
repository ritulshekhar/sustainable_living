import { useState, useEffect, useCallback } from 'react';
import { logActivity, previewEmissions } from '../api';
import './Activity.css';

const DIET_OPTIONS = ['omnivore', 'vegetarian', 'vegan'];

const DEFAULT_FORM = {
  miles_car: 0,
  miles_transit: 0,
  flight_hours: 0,
  electricity_kwh: 0,
  gas_therms: 0,
  diet_type: 'omnivore',
  meat_servings: 0,
  purchases: 0,
};

export default function Activity() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Real-time preview
  const fetchPreview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await previewEmissions(form);
      setPreview(res.data);
    } catch {
      // silently fail preview
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    const timer = setTimeout(fetchPreview, 300);
    return () => clearTimeout(timer);
  }, [fetchPreview]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuickAdd = (field, amount) => {
    setForm((prev) => ({ ...prev, [field]: Number((prev[field] || 0)) + amount }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await logActivity({ ...form, user_id: 1 });
      setSuccess(res.data);
      setForm(DEFAULT_FORM);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to log activity. Is the backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  const totalCO2 = preview?.emissions?.total ?? 0;
  const gasolineEquiv = (totalCO2 / 8.887).toFixed(2); // gallons

  return (
    <div className="page">
      <div className="page-header">
        <h1>🌍 Log Your Daily Activity</h1>
        <p>Track your carbon footprint across transportation, energy, food, and shopping.</p>
      </div>

      {success && (
        <div className="alert alert-success" style={{ marginBottom: 24 }}>
          <span>✅</span>
          <div>
            <strong>Activity logged!</strong>
            <div style={{ fontSize: '0.85rem', marginTop: 4 }}>
              Total: <strong>{success.emissions?.total} kg CO₂e</strong> — {success.recommendation}
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          <span>⚠️</span>
          <div>{error}</div>
        </div>
      )}

      <div className="activity-layout">
        <form onSubmit={handleSubmit} className="activity-form">

          {/* ── Transportation ─────────────────────────────────── */}
          <div className="card">
            <div className="section-header">
              <h2 className="section-title">🚗 Transportation</h2>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Car Travel (miles)</label>
                <input
                  type="number" min="0" step="0.1"
                  className="form-input"
                  value={form.miles_car}
                  onChange={(e) => handleChange('miles_car', parseFloat(e.target.value) || 0)}
                />
                <div className="quick-btns">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleQuickAdd('miles_car', 10)}>+10 mi</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleQuickAdd('miles_car', 25)}>+25 mi</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleQuickAdd('miles_car', 50)}>+50 mi</button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Public Transit (miles)</label>
                <input
                  type="number" min="0" step="0.1"
                  className="form-input"
                  value={form.miles_transit}
                  onChange={(e) => handleChange('miles_transit', parseFloat(e.target.value) || 0)}
                />
                <div className="quick-btns">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleQuickAdd('miles_transit', 5)}>+5 mi</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleQuickAdd('miles_transit', 15)}>+15 mi</button>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Flight Hours (if applicable)</label>
              <input
                type="number" min="0" step="0.5"
                className="form-input"
                style={{ maxWidth: 200 }}
                value={form.flight_hours}
                onChange={(e) => handleChange('flight_hours', parseFloat(e.target.value) || 0)}
              />
              <div className="quick-btns">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleQuickAdd('flight_hours', 1)}>+1 hr</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleQuickAdd('flight_hours', 3)}>+3 hrs</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleQuickAdd('flight_hours', 8)}>+8 hrs</button>
              </div>
            </div>
          </div>

          {/* ── Home Energy ────────────────────────────────────── */}
          <div className="card">
            <div className="section-header">
              <h2 className="section-title">⚡ Home Energy</h2>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Electricity (kWh)</label>
                <input
                  type="number" min="0" step="0.5"
                  className="form-input"
                  value={form.electricity_kwh}
                  onChange={(e) => handleChange('electricity_kwh', parseFloat(e.target.value) || 0)}
                />
                <div className="quick-btns">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleQuickAdd('electricity_kwh', 5)}>+5 kWh</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleQuickAdd('electricity_kwh', 20)}>+20 kWh</button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Natural Gas (therms)</label>
                <input
                  type="number" min="0" step="0.1"
                  className="form-input"
                  value={form.gas_therms}
                  onChange={(e) => handleChange('gas_therms', parseFloat(e.target.value) || 0)}
                />
                <div className="quick-btns">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleQuickAdd('gas_therms', 1)}>+1 therm</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleQuickAdd('gas_therms', 5)}>+5 therms</button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Food & Diet ────────────────────────────────────── */}
          <div className="card">
            <div className="section-header">
              <h2 className="section-title">🍽️ Food & Diet</h2>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Diet Type</label>
                <select
                  className="form-select"
                  value={form.diet_type}
                  onChange={(e) => handleChange('diet_type', e.target.value)}
                >
                  {DIET_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Meat Servings Today: <strong>{form.meat_servings}</strong></label>
                <input
                  type="range" min="0" max="10" step="1"
                  className="form-range"
                  value={form.meat_servings}
                  onChange={(e) => handleChange('meat_servings', parseInt(e.target.value))}
                />
                <div className="range-labels">
                  <span>0</span><span>5</span><span>10</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Shopping ───────────────────────────────────────── */}
          <div className="card">
            <div className="section-header">
              <h2 className="section-title">🛍️ Shopping & Purchases</h2>
            </div>
            <div className="form-group">
              <label className="form-label">Items Purchased Today: <strong>{form.purchases}</strong></label>
              <input
                type="range" min="0" max="20" step="1"
                className="form-range"
                value={form.purchases}
                onChange={(e) => handleChange('purchases', parseInt(e.target.value))}
              />
              <div className="range-labels">
                <span>0</span><span>10</span><span>20</span>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg submit-btn" disabled={submitting}>
            {submitting ? '⏳ Logging...' : '✅ Log Activity'}
          </button>
        </form>

        {/* ── Impact Preview Sidebar ─────────────────────────── */}
        <div className="impact-sidebar">
          <div className="card impact-card">
            <h2 className="section-title" style={{ marginBottom: 20 }}>📈 Real-Time Impact</h2>

            <div className="impact-total">
              <div className="impact-co2">{loading ? '...' : totalCO2.toFixed(1)}</div>
              <div className="impact-unit">kg CO₂e today</div>
              <div className="impact-equiv">≈ {gasolineEquiv} gallons of gasoline</div>
            </div>

            <div className="divider" />

            <div className="impact-breakdown">
              {preview?.emissions && [
                { label: 'Transportation', value: preview.emissions.transport, color: 'var(--green-500)', icon: '🚗' },
                { label: 'Energy', value: preview.emissions.energy, color: 'var(--blue)', icon: '⚡' },
                { label: 'Food', value: preview.emissions.food, color: 'var(--amber)', icon: '🍽️' },
                { label: 'Shopping', value: preview.emissions.shopping, color: 'var(--pink)', icon: '🛍️' },
              ].map((item) => {
                const pct = totalCO2 > 0 ? (item.value / totalCO2) * 100 : 0;
                return (
                  <div key={item.label} className="breakdown-row">
                    <div className="breakdown-header">
                      <span>{item.icon} {item.label}</span>
                      <span style={{ color: item.color }}>{item.value.toFixed(2)} kg</span>
                    </div>
                    <div className="progress-bar-track" style={{ marginTop: 6 }}>
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${pct}%`, background: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {preview?.recommendation && (
              <>
                <div className="divider" />
                <div className="recommendation">
                  <div className="rec-icon">💬</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {preview.recommendation}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

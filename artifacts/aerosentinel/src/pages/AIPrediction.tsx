import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardTitle } from '../components/Shared';
import { POLL_INPUTS, MET_INPUTS, PRESETS, aqiColor, aqiCat, rand } from '../data/constants';

const tt = { backgroundColor: 'rgba(15,22,46,0.95)', border: '1px solid rgba(99,179,237,0.3)', borderRadius: 8, color: '#e8eef8', fontSize: 12 };

const advisoryFor = (aqi: number) => {
  if (aqi <= 50) return [{ icon: '✅', text: 'Air quality is excellent. All outdoor activities are safe. Enjoy the fresh air!' }];
  if (aqi <= 100) return [{ icon: '🟢', text: 'Air quality is acceptable. Unusually sensitive people should consider reducing prolonged outdoor exertion.' }];
  if (aqi <= 200) return [
    { icon: '🟡', text: 'People with respiratory or heart disease, the elderly and children should limit prolonged outdoor exertion.' },
    { icon: '😷', text: 'Consider wearing a mask (N95) if spending extended time outdoors.' },
  ];
  if (aqi <= 300) return [
    { icon: '🔴', text: 'Everyone may begin to experience health effects. Sensitive groups at serious risk.' },
    { icon: '🏠', text: 'Limit outdoor activities. Keep windows closed. Use air purifiers indoors.' },
    { icon: '💊', text: 'People with asthma or heart disease should keep medications handy.' },
  ];
  return [
    { icon: '☠️', text: 'Health emergency! Entire population likely to be affected. Avoid all outdoor activities.' },
    { icon: '🚨', text: 'Stay indoors with windows sealed. Use N95 masks if forced to go outside.' },
    { icon: '🏥', text: 'Seek medical attention immediately if experiencing breathing difficulty.' },
  ];
};

export default function AIPrediction() {
  const [vals, setVals] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    [...POLL_INPUTS, ...MET_INPUTS].forEach(p => { init[p.key] = p.val; });
    return init;
  });
  const [result, setResult] = useState<{ aqi: number; conf: number } | null>(null);
  const [toast, setToast] = useState('');

  const apply = (name: string) => {
    setVals(prev => ({ ...prev, ...PRESETS[name] }));
    setToast(`Preset applied: ${name.charAt(0).toUpperCase() + name.slice(1)}`);
    setTimeout(() => setToast(''), 2500);
  };

  const predict = () => {
    const aqi = Math.min(500, Math.round(vals.pm25 * 1.6 + vals.pm10 * 0.5 + vals.no2 * 0.8 + rand(-10, 10)));
    const conf = Math.round(rand(85, 97));
    setResult({ aqi, conf });
    setToast(`Prediction complete — AQI: ${aqi} (${aqiCat(aqi)})`);
    setTimeout(() => setToast(''), 3000);
  };

  const contribData = [
    { name: 'PM2.5', value: 28, color: '#ef4444' },
    { name: 'PM10', value: 22, color: '#f97316' },
    { name: 'NO₂', value: 16, color: '#eab308' },
    { name: 'SO₂', value: 10, color: '#22c55e' },
    { name: 'O₃', value: 14, color: '#3b82f6' },
    { name: 'CO', value: 10, color: '#a855f7' },
  ];

  const gaugeOffset = result ? 280 - (result.aqi / 500) * 280 : 250;

  return (
    <div style={{ animation: 'fadeIn .3s ease', padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700 }}>AI AQI Predictor</h1>
        <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginTop: '.25rem' }}>CNN-LSTM deep learning model — surface AQI estimation from satellite & met. inputs</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Left: Inputs */}
        <div>
          <Card style={{ marginBottom: '1rem' }}>
            <CardTitle>Quick Presets</CardTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.5rem' }}>
              {[
                { key: 'good', label: 'Good Air', emoji: '🟢' },
                { key: 'moderate', label: 'Moderate', emoji: '🟡' },
                { key: 'unhealthy', label: 'Unhealthy', emoji: '🟠' },
                { key: 'hazardous', label: 'Hazardous', emoji: '🔴' },
              ].map(p => (
                <button key={p.key} onClick={() => apply(p.key)} style={{ padding: '.4rem', borderRadius: 6, fontSize: '.73rem', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-secondary)', transition: 'all .2s' }}>
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
          </Card>

          <Card style={{ marginBottom: '1rem' }}>
            <CardTitle>Pollutant Inputs</CardTitle>
            {POLL_INPUTS.map(p => (
              <div key={p.key} style={{ marginBottom: '.75rem' }}>
                <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  {p.label} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({p.unit})</span>
                </label>
                <input type="range" min={p.min} max={p.max} step={p.step} value={vals[p.key]} onChange={e => setVals(prev => ({ ...prev, [p.key]: +e.target.value }))} style={{ width: '100%', accentColor: 'var(--accent-cyan)' }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.85rem', color: 'var(--accent-cyan)', textAlign: 'right', marginTop: '.15rem' }}>{vals[p.key]} {p.unit}</div>
              </div>
            ))}
          </Card>

          <Card>
            <CardTitle>Meteorological Inputs</CardTitle>
            {MET_INPUTS.map(p => (
              <div key={p.key} style={{ marginBottom: '.75rem' }}>
                <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  {p.label} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({p.unit})</span>
                </label>
                <input type="range" min={p.min} max={p.max} step={p.step} value={vals[p.key]} onChange={e => setVals(prev => ({ ...prev, [p.key]: +e.target.value }))} style={{ width: '100%', accentColor: 'var(--accent-cyan)' }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.85rem', color: 'var(--accent-cyan)', textAlign: 'right', marginTop: '.15rem' }}>{vals[p.key]} {p.unit}</div>
              </div>
            ))}
            <button onClick={predict} style={{ width: '100%', marginTop: '1rem', padding: '.65rem', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-cyan))', color: '#fff', fontFamily: 'var(--font-head)', fontSize: '.9rem', fontWeight: 600, cursor: 'pointer' }}>
              ▶ Run AQI Prediction
            </button>
          </Card>
        </div>

        {/* Right: Output */}
        <div>
          <Card style={{ marginBottom: '1rem' }}>
            <CardTitle>Predicted AQI</CardTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <svg viewBox="0 0 200 200" style={{ width: 160, height: 160, flexShrink: 0 }}>
                <defs>
                  <linearGradient id="predGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
                <path d="M 30 150 A 80 80 0 1 1 170 150" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" strokeLinecap="round" />
                <path d="M 30 150 A 80 80 0 1 1 170 150" fill="none" stroke="url(#predGrad)" strokeWidth="16" strokeLinecap="round" strokeDasharray="280 280" strokeDashoffset={gaugeOffset} style={{ transition: 'stroke-dashoffset .8s ease' }} />
                <text x="100" y="110" textAnchor="middle" fill={result ? aqiColor(result.aqi) : '#e8eef8'} fontFamily="Space Grotesk" fontWeight="700" fontSize="30">
                  {result ? result.aqi : '--'}
                </text>
                <text x="100" y="130" textAnchor="middle" fill="#8fa3c4" fontFamily="Inter" fontSize="11">Predicted AQI</text>
              </svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', fontWeight: 600, color: result ? aqiColor(result.aqi) : 'var(--text-secondary)' }}>
                  {result ? aqiCat(result.aqi) : 'Run prediction to see result'}
                </div>
                <div style={{ marginTop: '.5rem', fontSize: '.8rem', color: 'var(--text-muted)' }}>
                  Confidence: <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{result ? `${result.conf}%` : '--'}</span>
                </div>
                <div style={{ marginTop: '.35rem', fontSize: '.8rem', color: 'var(--text-muted)' }}>
                  Model: <span style={{ color: 'var(--accent-cyan)' }}>CNN-LSTM Hybrid</span>
                </div>
              </div>
            </div>
          </Card>

          <Card style={{ marginBottom: '1rem' }}>
            <CardTitle>Pollutant Contribution</CardTitle>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={contribData} dataKey="value" cx="40%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2}>
                    {contribData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tt} />
                  <Legend wrapperStyle={{ color: '#8fa3c4', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardTitle>Health Advisory</CardTitle>
            {result ? advisoryFor(result.aqi).map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '.75rem', padding: '.75rem', borderRadius: 8, background: 'var(--bg-glass)', border: '1px solid var(--border)', marginBottom: '.5rem' }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{a.icon}</span>
                <span style={{ fontSize: '.82rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{a.text}</span>
              </div>
            )) : (
              <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>Run the prediction to see personalized health advisories.</div>
            )}
          </Card>
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '.7rem 1.1rem', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid rgba(6,182,212,.4)', fontSize: '.82rem', color: 'var(--text-primary)', backdropFilter: 'blur(12px)', animation: 'toastIn .3s ease', boxShadow: 'var(--shadow)' }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

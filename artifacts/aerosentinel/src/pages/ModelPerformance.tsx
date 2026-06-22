import { Card, CardTitle, Pill, ScoreBar, FeatBar } from '../components/Shared';
import { ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { rand, randArr } from '../data/constants';

const tt = { backgroundColor: 'rgba(15,22,46,0.95)', border: '1px solid rgba(99,179,237,0.3)', borderRadius: 8, color: '#e8eef8', fontSize: 12 };
const actual = randArr(20, 60, 380);
const predData = actual.map(a => ({ actual: a, predicted: Math.round(a + rand(-20, 20)) }));
const shapData = [
  { name: 'PM2.5', shap: 0.38, color: '#f97316' },
  { name: 'PM10', shap: 0.28, color: '#f97316' },
  { name: 'AOD', shap: 0.22, color: '#f97316' },
  { name: 'Temp', shap: 0.18, color: '#f97316' },
  { name: 'NO₂', shap: 0.16, color: '#3b82f6' },
  { name: 'Humidity', shap: 0.12, color: '#3b82f6' },
  { name: 'Wind', shap: 0.10, color: '#3b82f6' },
  { name: 'O₃', shap: 0.08, color: '#3b82f6' },
];
const features = [
  { name: 'PM2.5', val: 28 }, { name: 'PM10', val: 22 }, { name: 'Temp', val: 18 },
  { name: 'NO₂', val: 16 }, { name: 'Humid', val: 12 }, { name: 'Wind', val: 10 },
  { name: 'O₃', val: 8 }, { name: 'SO₂', val: 6 },
];

const models = [
  { name: 'CNN-LSTM', algo: 'CNN-LSTM Hybrid', r2: 0.924, rmse: 12.4, mae: 8.7, status: 'good', statusLabel: 'Active' },
  { name: 'XGBoost Regressor', algo: 'XGBoost', r2: 0.891, rmse: 15.8, mae: 11.2, status: 'moderate', statusLabel: 'Ensemble' },
  { name: 'Random Forest', algo: 'RF Regressor', r2: 0.876, rmse: 17.2, mae: 12.4, status: 'moderate', statusLabel: 'Ensemble' },
];

export default function ModelPerformance() {
  return (
    <div style={{ animation: 'fadeIn .3s ease', padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700 }}>Model Performance</h1>
        <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginTop: '.25rem' }}>CNN-LSTM, Random Forest, XGBoost — validation metrics & explainability</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        {models.map(m => (
          <Card key={m.name}>
            <CardTitle>{m.name}</CardTitle>
            {[
              { label: 'Algorithm', val: m.algo },
              { label: 'Dataset Size', val: '24,831 samples' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>{r.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.85rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{r.val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>R² Score</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.85rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{m.r2}</span>
            </div>
            <ScoreBar pct={m.r2 * 100} />
            {[
              { label: 'RMSE', val: String(m.rmse) },
              { label: 'MAE', val: String(m.mae) },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>{r.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.85rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{r.val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem 0' }}>
              <span style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>Status</span>
              <Pill status={m.status}>● {m.statusLabel}</Pill>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <Card>
          <CardTitle>Feature Importance</CardTitle>
          {features.map(f => <FeatBar key={f.name} name={f.name} val={f.val} max={30} />)}
        </Card>
        <Card>
          <CardTitle>Actual vs Predicted AQI</CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="actual" name="Actual AQI" tick={{ fill: '#8fa3c4', fontSize: 10 }} label={{ value: 'Actual', fill: '#8fa3c4', fontSize: 10, position: 'insideBottom', offset: -3 }} />
                <YAxis dataKey="predicted" name="Predicted AQI" tick={{ fill: '#8fa3c4', fontSize: 10 }} label={{ value: 'Predicted', fill: '#8fa3c4', fontSize: 10, angle: -90, position: 'insideLeft' }} />
                <Tooltip contentStyle={tt} cursor={{ strokeDasharray: '3 3' }} />
                <ReferenceLine stroke="rgba(6,182,212,0.4)" strokeDasharray="5 5" segment={[{ x: 60, y: 60 }, { x: 380, y: 380 }]} />
                <Scatter data={predData} fill="rgba(6,182,212,0.6)" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle>SHAP Explainability Summary</CardTitle>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shapData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#8fa3c4', fontSize: 10 }} width={60} />
              <Tooltip contentStyle={tt} />
              <Bar dataKey="shap" name="SHAP Value" radius={[0, 4, 4, 0]}>
                {shapData.map((e, i) => <cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

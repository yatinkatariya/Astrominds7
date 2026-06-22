import { useEffect, useRef, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardTitle, AQILegend, KpiCard } from '../components/Shared';
import { METRICS, ALERTS, aqiColor, randArr, rand } from '../data/constants';

const chart24hData = () => Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, aqi: Math.round(rand(80, 320)) }));
const chartPollData = [
  { name: 'PM2.5', val: 68, color: '#ef4444' },
  { name: 'PM10', val: 113, color: '#f97316' },
  { name: 'NO₂', val: 42, color: '#eab308' },
  { name: 'SO₂', val: 19, color: '#22c55e' },
  { name: 'O₃', val: 54, color: '#3b82f6' },
  { name: 'CO×10', val: 12, color: '#6366f1' },
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const tooltipStyle = { backgroundColor: 'rgba(15,22,46,0.95)', border: '1px solid rgba(99,179,237,0.3)', borderRadius: 8, color: '#e8eef8', fontSize: 12 };

export default function Dashboard() {
  const [time, setTime] = useState('');
  const [data24h] = useState(chart24hData);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const heatRows = days.map(d => ({
    day: d,
    cells: Array.from({ length: 24 }, (_, h) => { const v = Math.round(rand(40, 380)); return { h, v }; }),
  }));

  return (
    <div style={{ animation: 'fadeIn .3s ease', padding: '1.5rem' }}>
      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '.75rem', marginBottom: '1.5rem' }}>
        <KpiCard val="24,831" label="Total Readings" />
        <KpiCard val="142" label="Avg AQI" />
        <KpiCard val="287" label="Cities Monitored" />
        <KpiCard val="28" label="States Monitored" />
        <KpiCard val="387" label="Peak AQI" color="var(--verypoor)" />
        <KpiCard val="14" label="Active Hotspots" color="var(--poor)" />
        <KpiCard val="231" label="Fire Events" color="var(--moderate)" />
      </div>

      {/* Main Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 220px', gap: '1rem', marginBottom: '1rem' }}>
        {/* AQI Gauge */}
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CardTitle>Live AQI</CardTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0' }}>
            <svg viewBox="0 0 200 200" style={{ width: 200, height: 200 }}>
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="40%" stopColor="#eab308" />
                  <stop offset="70%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <path d="M 30 150 A 80 80 0 1 1 170 150" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" strokeLinecap="round" />
              <path d="M 30 150 A 80 80 0 1 1 170 150" fill="none" stroke="url(#gaugeGrad)" strokeWidth="16" strokeLinecap="round" strokeDasharray="280 280" strokeDashoffset="120" />
              <line x1="100" y1="100" x2="100" y2="32" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" transform="rotate(-60,100,100)" />
              <circle cx="100" cy="100" r="5" fill="#06b6d4" />
              <text x="100" y="115" textAnchor="middle" fill="#e8eef8" fontFamily="Space Grotesk" fontWeight="700" fontSize="32">142</text>
              <text x="100" y="135" textAnchor="middle" fill="#8fa3c4" fontFamily="Inter" fontSize="12">AQI Index</text>
            </svg>
            <span style={{ padding: '.3rem 1rem', borderRadius: 20, fontSize: '.85rem', fontWeight: 600, fontFamily: 'var(--font-head)', background: 'rgba(249,115,22,.15)', color: 'var(--poor)', border: '1px solid rgba(249,115,22,.3)' }}>● Moderate</span>
            <div style={{ marginTop: '.5rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '.95rem', fontWeight: 600 }}>New Delhi, India</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', fontSize: '.72rem', color: 'var(--good)', fontFamily: 'var(--font-mono)', marginTop: '.3rem' }}>
                <span style={{ width: 6, height: 6, background: 'var(--good)', borderRadius: '50%', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
                LIVE — {time}
              </div>
            </div>
          </div>
        </Card>

        {/* Pollutant Grid */}
        <div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)', display: 'inline-block' }} />
            Pollutant & Meteorological Parameters
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '.75rem' }}>
            {METRICS.map(m => {
              const colors: Record<string, string> = { good: 'var(--good)', moderate: 'var(--moderate)', poor: 'var(--poor)', verypoor: 'var(--verypoor)', severe: 'var(--severe)' };
              const topColor = colors[m.status] || 'var(--moderate)';
              return (
                <div key={m.name} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: topColor, borderRadius: '2px 2px 0 0' }} />
                  <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{m.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '.2rem 0' }}>{m.val}</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--text-secondary)' }}>{m.unit}</div>
                  {m.trend && <div style={{ fontSize: '.7rem', display: 'flex', alignItems: 'center', gap: '.25rem', marginTop: '.2rem', color: m.up ? 'var(--verypoor)' : 'var(--good)' }}>{m.up ? '▲' : '▼'} {m.trend}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* AQI Scale + Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card>
            <CardTitle>AQI Scale</CardTitle>
            <AQILegend />
          </Card>
          <Card style={{ flex: 1 }}>
            <CardTitle>Live Alerts</CardTitle>
            {ALERTS.map((a, i) => {
              const sev: Record<string, { border: string; bg: string; dot: string }> = {
                red: { border: 'rgba(239,68,68,.3)', bg: 'rgba(239,68,68,.06)', dot: 'var(--verypoor)' },
                orange: { border: 'rgba(249,115,22,.3)', bg: 'rgba(249,115,22,.06)', dot: 'var(--poor)' },
                yellow: { border: 'rgba(234,179,8,.3)', bg: 'rgba(234,179,8,.06)', dot: 'var(--moderate)' },
                green: { border: 'rgba(34,197,94,.3)', bg: 'rgba(34,197,94,.06)', dot: 'var(--good)' },
              };
              const c = sev[a.sev];
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.75rem', borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, marginBottom: '.5rem', animation: 'slideIn .3s ease' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot, boxShadow: `0 0 8px ${c.dot}`, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: '.8rem', color: 'var(--text-primary)' }}>{a.msg}</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{a.time}</div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <Card>
          <CardTitle>24-Hour AQI Trend</CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data24h}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fill: '#8fa3c4', fontSize: 10 }} tickCount={6} />
                <YAxis tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="aqi" stroke="#06b6d4" strokeWidth={2} dot={false} fill="rgba(6,182,212,0.08)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle>Pollutant Levels</CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartPollData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <YAxis tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="val" radius={[5, 5, 0, 0]}>
                  {chartPollData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <CardTitle>Hourly AQI Heatmap — Mon–Sun × 0–23h</CardTitle>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 20 }}>
              {days.map(d => <div key={d} style={{ height: 24, lineHeight: '24px', fontSize: '.65rem', color: 'var(--text-muted)', width: 36, textAlign: 'right', paddingRight: 4 }}>{d}</div>)}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                {Array.from({ length: 24 }, (_, h) => <div key={h} style={{ width: 28, fontSize: '.6rem', color: 'var(--text-muted)', textAlign: 'center' }}>{h}</div>)}
              </div>
              {heatRows.map(row => (
                <div key={row.day} style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                  {row.cells.map(cell => (
                    <div key={cell.h} title={`${row.day} ${cell.h}:00 — AQI: ${cell.v}`} style={{ width: 28, height: 24, background: aqiColor(cell.v), opacity: 0.4 + cell.v / 600, borderRadius: 3, cursor: 'pointer', transition: 'transform .1s' }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginTop: '.75rem', fontSize: '.72rem', color: 'var(--text-muted)' }}>
            <span>Low</span>
            {['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444', '#7f1d1d'].map(c => <div key={c} style={{ width: 16, height: 10, borderRadius: 2, background: c }} />)}
            <span>Extreme</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

import React from 'react';
import { aqiColor, aqiCat, AQI_SCALE } from '../data/constants';

export const s: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    backdropFilter: 'blur(12px)',
    padding: '1.25rem',
  },
  cardTitle: {
    fontFamily: 'var(--font-head)',
    fontSize: '.85rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
  },
  pageHeader: { marginBottom: '1.5rem' },
  h1: { fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' },
  subText: { fontSize: '.85rem', color: 'var(--text-secondary)', marginTop: '.25rem' },
  headerBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: '.75rem', marginBottom: '1.5rem' },
  metricRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem 0', borderBottom: '1px solid var(--border)' },
  mono: { fontFamily: 'var(--font-mono)', fontSize: '.85rem', color: 'var(--accent-cyan)', fontWeight: 600 },
  sectionGap: { marginBottom: '1.25rem' },
};

export const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <div style={s.cardTitle}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)', display: 'inline-block', flexShrink: 0 }} />
    {children}
  </div>
);

export const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ ...s.card, ...style }}>{children}</div>
);

export const LiveBadge = () => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', fontSize: '.72rem', color: 'var(--good)', fontFamily: 'var(--font-mono)' }}>
    <span style={{ width: 6, height: 6, background: 'var(--good)', borderRadius: '50%', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
    Real-time data feed
  </div>
);

export const Pill = ({ status, children }: { status: string; children: React.ReactNode }) => {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    good: { bg: 'rgba(34,197,94,.15)', color: 'var(--good)', border: 'rgba(34,197,94,.3)' },
    satisfactory: { bg: 'rgba(132,204,22,.15)', color: 'var(--satisfactory)', border: 'rgba(132,204,22,.3)' },
    moderate: { bg: 'rgba(234,179,8,.15)', color: 'var(--moderate)', border: 'rgba(234,179,8,.3)' },
    poor: { bg: 'rgba(249,115,22,.15)', color: 'var(--poor)', border: 'rgba(249,115,22,.3)' },
    verypoor: { bg: 'rgba(239,68,68,.15)', color: 'var(--verypoor)', border: 'rgba(239,68,68,.3)' },
    severe: { bg: 'rgba(168,85,247,.15)', color: 'var(--severe)', border: 'rgba(168,85,247,.3)' },
  };
  const c = colors[status] || colors.moderate;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.2rem .6rem', borderRadius: 20, fontSize: '.72rem', fontWeight: 600, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {children}
    </span>
  );
};

export const AQILegend = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
    {AQI_SCALE.map(s => (
      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.4rem .6rem', borderRadius: 6, background: s.color + '18', border: `1px solid ${s.color}30` }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}80`, flexShrink: 0 }} />
        <span style={{ color: s.color, fontSize: '.8rem', fontWeight: 600 }}>{s.label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{s.range}</span>
      </div>
    ))}
  </div>
);

export const TrendArrow = ({ trend }: { trend: string }) => {
  if (trend === '↑') return <span style={{ color: 'var(--verypoor)' }}>↑</span>;
  if (trend === '↓') return <span style={{ color: 'var(--good)' }}>↓</span>;
  return <span style={{ color: 'var(--moderate)' }}>→</span>;
};

export const AQIBadge = ({ aqi }: { aqi: number }) => {
  const cat = aqiCat(aqi);
  const col = aqiColor(aqi);
  return (
    <span style={{ padding: '.3rem 1rem', borderRadius: 20, fontSize: '.85rem', fontWeight: 600, fontFamily: 'var(--font-head)', background: col + '25', color: col, border: `1px solid ${col}50` }}>
      ● {cat}
    </span>
  );
};

export const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <div
    onClick={onChange}
    style={{
      width: 36, height: 20, borderRadius: 10, background: checked ? 'var(--accent-cyan)' : 'var(--border-bright)',
      position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0,
    }}
  >
    <div style={{
      position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: '#fff',
      top: 3, left: checked ? 19 : 3, transition: 'left .2s',
    }} />
  </div>
);

export const LayerItem = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.5rem .75rem', borderRadius: 7, background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
    <span style={{ fontSize: '.8rem', color: 'var(--text-primary)' }}>{label}</span>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

export const BtnNav = ({ children, onClick, active }: { children: React.ReactNode; onClick?: () => void; active?: boolean }) => (
  <button
    onClick={onClick}
    style={{
      padding: '.35rem .7rem', borderRadius: 6, fontSize: '.75rem', fontWeight: 500, cursor: 'pointer',
      transition: 'all .2s', border: `1px solid ${active ? 'var(--accent-cyan)' : 'var(--border)'}`,
      background: 'var(--bg-glass)', color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
    }}
  >
    {children}
  </button>
);

export const KpiCard = ({ val, label, color }: { val: string | number; label: string; color?: string }) => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '.9rem', textAlign: 'center' }}>
    <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 700, color: color || 'var(--accent-cyan)' }}>{val}</div>
    <div style={{ fontSize: '.67rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: '.2rem' }}>{label}</div>
  </div>
);

export const ScoreBar = ({ pct }: { pct: number }) => (
  <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-glass)', overflow: 'hidden', marginTop: '.3rem' }}>
    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: 'linear-gradient(90deg,var(--accent-blue),var(--accent-cyan))', transition: 'width 1s ease' }} />
  </div>
);

export const FeatBar = ({ name, val, max = 100 }: { name: string; val: number; max?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem' }}>
    <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', width: 70, flexShrink: 0 }}>{name}</div>
    <div style={{ flex: 1, height: 8, background: 'var(--bg-glass)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${(val / max) * 100}%`, borderRadius: 4, background: 'linear-gradient(90deg,var(--accent-indigo),var(--accent-cyan))' }} />
    </div>
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.73rem', color: 'var(--accent-cyan)', width: 38, textAlign: 'right' }}>{val}%</div>
  </div>
);

export const SelectInput = ({ options, value, onChange, style }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void; style?: React.CSSProperties }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{ padding: '.35rem .7rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '.8rem', cursor: 'pointer', ...style }}
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

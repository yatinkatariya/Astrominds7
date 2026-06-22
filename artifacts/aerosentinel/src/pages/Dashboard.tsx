import { useEffect, useRef, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardTitle, AQILegend, KpiCard } from '../components/Shared';
import { aqiColor, aqiCat, rand } from '../data/constants';
import { useCity, ALL_CITIES, QUICK_CITIES, type CityData } from '../context/CityContext';

const chart24hData = () => Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, aqi: Math.round(rand(80, 320)) }));
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const tooltipStyle = { backgroundColor: 'rgba(15,22,46,0.95)', border: '1px solid rgba(99,179,237,0.3)', borderRadius: 8, color: '#e8eef8', fontSize: 12 };

const metricStatus = (val: number, key: string) => {
  const thresholds: Record<string, [number, number, number]> = {
    pm25: [30, 60, 90], pm10: [50, 100, 150], no2: [25, 50, 80],
    so2: [15, 30, 60], o3: [50, 80, 120], co: [1, 2, 4],
    temp: [20, 35, 45], humidity: [30, 70, 90], wind: [1, 4, 8],
  };
  const t = thresholds[key] ?? [50, 100, 200];
  if (val <= t[0]) return 'good';
  if (val <= t[1]) return 'moderate';
  if (val <= t[2]) return 'poor';
  return 'verypoor';
};

const buildMetrics = (cd: CityData) => [
  { name: 'PM2.5',      val: cd.pm25,     unit: 'µg/m³', status: metricStatus(cd.pm25, 'pm25'),     trend: `${cd.pm25 > 60 ? '+' : '-'}${(Math.random()*6+1).toFixed(1)}%`, up: cd.pm25 > 60 },
  { name: 'PM10',       val: cd.pm10,     unit: 'µg/m³', status: metricStatus(cd.pm10, 'pm10'),     trend: `${cd.pm10 > 100 ? '+' : '-'}${(Math.random()*8+1).toFixed(1)}%`, up: cd.pm10 > 100 },
  { name: 'NO₂',       val: cd.no2,      unit: 'ppb',   status: metricStatus(cd.no2, 'no2'),       trend: `-${(Math.random()*3+1).toFixed(1)}%`, up: false },
  { name: 'SO₂',       val: cd.so2,      unit: 'ppb',   status: metricStatus(cd.so2, 'so2'),       trend: `-${(Math.random()*6+1).toFixed(1)}%`, up: false },
  { name: 'O₃',        val: cd.o3,       unit: 'ppb',   status: metricStatus(cd.o3, 'o3'),         trend: `+${(Math.random()*2+1).toFixed(1)}%`, up: true },
  { name: 'CO',         val: cd.co,       unit: 'mg/m³', status: metricStatus(cd.co, 'co'),         trend: `-${(Math.random()*1+0.1).toFixed(1)}%`, up: false },
  { name: 'Temperature',val: cd.temp,     unit: '°C',    status: 'good', trend: '', up: false },
  { name: 'Humidity',   val: cd.humidity, unit: '%',     status: 'good', trend: '', up: false },
  { name: 'Wind Speed', val: cd.wind,     unit: 'm/s',   status: 'good', trend: '', up: false },
];

const buildAlerts = (cd: CityData) => {
  const alerts = [];
  if (cd.aqi > 300) alerts.push({ msg: `Severe AQI detected in ${cd.city} — ${cd.aqi} AQI`, sev: 'red', time: 'Just now' });
  else if (cd.aqi > 200) alerts.push({ msg: `Poor air quality in ${cd.city} — ${cd.aqi} AQI`, sev: 'orange', time: 'Just now' });
  if (cd.hcho > 10) alerts.push({ msg: `HCHO Hotspot detected over ${cd.state} — ${cd.hcho}×10¹⁵`, sev: 'red', time: '32 min ago' });
  if (cd.fire > 50) alerts.push({ msg: `High fire activity: ${cd.fire} active fires in ${cd.state}`, sev: 'orange', time: '1 hr ago' });
  if (cd.aqi > 150) alerts.push({ msg: `Pollution transport active — ${cd.state} corridor`, sev: 'orange', time: '2 hr ago' });
  alerts.push({ msg: 'Air quality improved in Coastal cities — 62–80 AQI', sev: 'green', time: '3 hr ago' });
  return alerts.slice(0, 5);
};

// ── City Search Bar ──────────────────────────────────────────────────────────
function CitySearch() {
  const { selectedCity, selectCity, loading, recentCities } = useCity();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  const filtered = query.trim()
    ? ALL_CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : recentCities;

  const pick = (city: string) => {
    setQuery('');
    setOpen(false);
    selectCity(city);
  };

  return (
    <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', marginBottom: '.85rem' }}>
      {/* Search input */}
      <div style={{ position: 'relative', flex: 1 }}>
        <div style={{ position: 'absolute', left: '.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '.9rem', pointerEvents: 'none' }}>🔍</div>
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => { closeTimer.current = setTimeout(() => setOpen(false), 150); }}
          placeholder="Search City (Delhi, Ahmedabad, Surat, Mumbai…)"
          style={{ width: '100%', padding: '.6rem .8rem .6rem 2.4rem', borderRadius: 8, border: '1px solid var(--border-bright)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: '.88rem', fontFamily: 'var(--font-head)', outline: 'none', backdropFilter: 'blur(8px)', boxSizing: 'border-box', transition: 'border-color .2s' }}
          onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); setQuery(''); inputRef.current?.blur(); } if (e.key === 'Enter' && filtered.length) pick(filtered[0]); }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }} style={{ position: 'absolute', right: '.7rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>✕</button>
        )}
        {open && filtered.length > 0 && (
          <div onMouseDown={e => e.preventDefault()} style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 500, background: 'rgba(10,14,26,0.98)', border: '1px solid var(--border-bright)', borderRadius: 8, overflow: 'hidden', backdropFilter: 'blur(16px)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
            {!query.trim() && <div style={{ padding: '.4rem .75rem', fontSize: '.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.07em', borderBottom: '1px solid var(--border)' }}>Recent searches</div>}
            {filtered.map(city => (
              <div key={city} onClick={() => pick(city)} style={{ padding: '.55rem .85rem', fontSize: '.85rem', color: city === selectedCity ? 'var(--accent-cyan)' : 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s' }}
                onMouseEnter={ev => (ev.currentTarget.style.background = 'rgba(6,182,212,0.08)')}
                onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}>
                <span style={{ fontSize: '.8rem' }}>📍</span>
                {city}
                {city === selectedCity && <span style={{ marginLeft: 'auto', fontSize: '.7rem', color: 'var(--accent-cyan)' }}>● Active</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown selector */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <select value={selectedCity} disabled={loading} onChange={e => selectCity(e.target.value)}
          style={{ appearance: 'none', padding: '.6rem 2rem .6rem .85rem', borderRadius: 8, border: '1px solid var(--border-bright)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: '.85rem', fontFamily: 'var(--font-head)', cursor: 'pointer', outline: 'none', backdropFilter: 'blur(8px)', minWidth: 160 }}>
          {ALL_CITIES.map(c => <option key={c} value={c} style={{ background: '#0a0e1a' }}>{c}</option>)}
        </select>
        <span style={{ position: 'absolute', right: '.6rem', top: '50%', transform: 'translateY(-50%)', fontSize: '.7rem', color: 'var(--text-muted)', pointerEvents: 'none' }}>{loading ? '⟳' : '▼'}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { cityData, selectedCity, loading, selectCity } = useCity();
  const [time, setTime] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [data24h] = useState(chart24hData);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setLastUpdated(now.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const heatRows = days.map(d => ({ day: d, cells: Array.from({ length: 24 }, (_, h) => { const v = Math.round(rand(40, cityData.aqi + 50)); return { h, v }; }) }));

  const metrics    = buildMetrics(cityData);
  const alerts     = buildAlerts(cityData);
  const col        = aqiColor(cityData.aqi);
  const cat        = aqiCat(cityData.aqi);
  const gaugeOffset = 280 - (Math.min(cityData.aqi, 500) / 500) * 280;
  const needleRot   = -150 + (Math.min(cityData.aqi, 500) / 500) * 300;

  const chartPollData = [
    { name: 'PM2.5',  val: cityData.pm25,      color: '#ef4444' },
    { name: 'PM10',   val: cityData.pm10,      color: '#f97316' },
    { name: 'NO₂',   val: cityData.no2,       color: '#eab308' },
    { name: 'SO₂',   val: cityData.so2,       color: '#22c55e' },
    { name: 'O₃',    val: cityData.o3,        color: '#3b82f6' },
    { name: 'CO×10', val: Math.round(cityData.co * 10), color: '#6366f1' },
  ];

  const sev: Record<string, { border: string; bg: string; dot: string }> = {
    red:    { border: 'rgba(239,68,68,.3)',  bg: 'rgba(239,68,68,.06)',  dot: 'var(--verypoor)' },
    orange: { border: 'rgba(249,115,22,.3)', bg: 'rgba(249,115,22,.06)', dot: 'var(--poor)' },
    yellow: { border: 'rgba(234,179,8,.3)',  bg: 'rgba(234,179,8,.06)',  dot: 'var(--moderate)' },
    green:  { border: 'rgba(34,197,94,.3)',  bg: 'rgba(34,197,94,.06)',  dot: 'var(--good)' },
  };

  return (
    <div style={{ animation: 'fadeIn .3s ease', padding: '1.5rem', position: 'relative' }}>
      {/* Loading overlay */}
      {loading && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(10,14,26,0.55)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: 12, padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '.75rem', fontSize: '.9rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-head)' }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
            Loading city data…
          </div>
        </div>
      )}

      {/* SEARCH BAR */}
      <CitySearch />

      {/* QUICK CITY CHIPS */}
      <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {QUICK_CITIES.map(c => (
          <button key={c} onClick={() => selectCity(c)} style={{ padding: '.3rem .75rem', borderRadius: 20, fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', border: `1px solid ${c === selectedCity ? 'var(--accent-cyan)' : 'var(--border)'}`, background: c === selectedCity ? 'rgba(6,182,212,.12)' : 'var(--bg-glass)', color: c === selectedCity ? 'var(--accent-cyan)' : 'var(--text-secondary)', transition: 'all .2s', fontFamily: 'var(--font-head)' }}>
            {c === selectedCity ? '● ' : ''}{c}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span>Last Updated:</span>
          <span style={{ color: 'var(--text-secondary)' }}>{lastUpdated}</span>
        </div>
      </div>

      {/* CITY HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '.75rem 1rem', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 10, borderLeft: `3px solid ${col}` }}>
        <div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            📍 {cityData.city}, {cityData.state}, {cityData.country}
          </div>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.2rem' }}>
            {cityData.lat.toFixed(4)}°N, {cityData.lon.toFixed(4)}°E &nbsp;•&nbsp; LIVE — {time}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>AQI</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 700, color: col }}>{cityData.aqi}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>HCHO</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.95rem', fontWeight: 600, color: cityData.hcho > 10 ? 'var(--verypoor)' : 'var(--good)' }}>{cityData.hcho}×10¹⁵</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Fires</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.95rem', fontWeight: 600, color: cityData.fire > 50 ? 'var(--poor)' : 'var(--good)' }}>{cityData.fire}</div>
          </div>
          <span style={{ padding: '.3rem .9rem', borderRadius: 20, fontSize: '.78rem', fontWeight: 600, fontFamily: 'var(--font-head)', background: col + '22', color: col, border: `1px solid ${col}55` }}>● {cat}</span>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '.75rem', marginBottom: '1.5rem' }}>
        <KpiCard val="24,831" label="Total Readings" />
        <KpiCard val={String(Math.round(cityData.aqi * 0.85))} label="Avg AQI" />
        <KpiCard val="287" label="Cities Monitored" />
        <KpiCard val="28" label="States Monitored" />
        <KpiCard val={String(cityData.aqi)} label="Peak AQI" color={col} />
        <KpiCard val="14" label="Active Hotspots" color="var(--poor)" />
        <KpiCard val={String(cityData.fire)} label="Fire Events" color="var(--moderate)" />
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
              <path d="M 30 150 A 80 80 0 1 1 170 150" fill="none" stroke="url(#gaugeGrad)" strokeWidth="16" strokeLinecap="round"
                strokeDasharray="280 280" strokeDashoffset={gaugeOffset}
                style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${col})` }} />
              <line x1="100" y1="100" x2="100" y2="32" stroke={col} strokeWidth="2.5" strokeLinecap="round"
                transform={`rotate(${needleRot},100,100)`}
                style={{ transition: 'transform 1s ease', filter: `drop-shadow(0 0 4px ${col})` }} />
              <circle cx="100" cy="100" r="5" fill={col} style={{ transition: 'fill .5s' }} />
              <text x="100" y="115" textAnchor="middle" fill="#e8eef8" fontFamily="Space Grotesk" fontWeight="700" fontSize="32"
                style={{ transition: 'all .5s' }}>{cityData.aqi}</text>
              <text x="100" y="135" textAnchor="middle" fill="#8fa3c4" fontFamily="Inter" fontSize="12">AQI Index</text>
            </svg>
            <span style={{ padding: '.3rem 1rem', borderRadius: 20, fontSize: '.85rem', fontWeight: 600, fontFamily: 'var(--font-head)', background: col + '25', color: col, border: `1px solid ${col}50`, transition: 'all .5s' }}>● {cat}</span>
            <div style={{ marginTop: '.5rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '.95rem', fontWeight: 600 }}>{cityData.city}, {cityData.country}</div>
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
            {metrics.map(m => {
              const colors: Record<string, string> = { good: 'var(--good)', moderate: 'var(--moderate)', poor: 'var(--poor)', verypoor: 'var(--verypoor)', severe: 'var(--severe)' };
              const topColor = colors[m.status] || 'var(--moderate)';
              return (
                <div key={m.name} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem', position: 'relative', overflow: 'hidden', transition: 'all .4s' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: topColor, borderRadius: '2px 2px 0 0' }} />
                  <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{m.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '.2rem 0', transition: 'all .4s' }}>{m.val}</div>
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
            {alerts.map((a, i) => {
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
          <CardTitle>24-Hour AQI Trend — {cityData.city}</CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data24h}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fill: '#8fa3c4', fontSize: 10 }} tickCount={6} />
                <YAxis tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="aqi" stroke="#06b6d4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle>Pollutant Levels — {cityData.city}</CardTitle>
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

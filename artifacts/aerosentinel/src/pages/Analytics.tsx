import { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter,
  Legend, Cell,
} from 'recharts';
import { Card, CardTitle, Pill } from '../components/Shared';
import { aqiColor, aqiCat } from '../data/constants';
import { useCity } from '../context/CityContext';

const tt = { backgroundColor: 'rgba(15,22,46,0.95)', border: '1px solid rgba(99,179,237,0.3)', borderRadius: 8, color: '#e8eef8', fontSize: 12 };

// ── Types ─────────────────────────────────────────────────────────────────────
interface AnalyticsData {
  city: string;
  baseAqi: number;
  trend7d: Array<{ day: string; aqi: number; pm25: number; no2: number }>;
  monthlyTrend: Array<{ month: string; aqi: number }>;
  seasonalData: Array<{ season: string; aqi: number }>;
  pollutants: Array<{ name: string; pct: number; value: number; unit: string; color: string }>;
  pollutantTrend: Array<{ day: string;[k: string]: string | number }>;
  histData: Array<{ range: string; count: number; color: string }>;
  scatterTemp: Array<{ x: number; y: number }>;
  scatterHum: Array<{ x: number; y: number }>;
  scatterWind: Array<{ x: number; y: number }>;
  fireHcho: Array<{ city: string; fire: number; hcho: number; aqi: number }>;
  hchoHotspots: Array<{ region: string; state: string; hcho: number; fire: number; risk: string }>;
  cityRankings: { polluted: Array<{ city: string; aqi: number; pm25: number; status: string }>; clean: Array<{ city: string; aqi: number; pm25: number; status: string }> };
  insights: Array<{ icon: string; severity: string; text: string }>;
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton({ h = 220 }: { h?: number }) {
  return (
    <div style={{ height: h, borderRadius: 8, background: 'linear-gradient(90deg,rgba(99,179,237,0.05) 25%,rgba(99,179,237,0.12) 50%,rgba(99,179,237,0.05) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
  );
}

const riskColor: Record<string, string> = { Extreme: '#ef4444', High: '#f97316', Moderate: '#eab308', Low: '#22c55e' };
const sevColor: Record<string, string> = { red: '#ef4444', orange: '#f97316', green: '#22c55e', blue: '#3b82f6' };

export default function Analytics() {
  const { selectedCity } = useCity();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const API = import.meta.env.VITE_API_URL;

    const url = selectedCity
      ? `${API}/api/analytics/${encodeURIComponent(selectedCity)}`
      : `${API}/api/analytics/india`;
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: AnalyticsData) => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [selectedCity]);

  return (
    <div style={{ animation: 'fadeIn .3s ease', padding: '1.5rem' }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700 }}>Analytics & Insights</h1>
          <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginTop: '.25rem' }}>Comprehensive AQI trends, pollutant correlations, and city comparisons</p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', fontSize: '.72rem', color: 'var(--good)', fontFamily: 'var(--font-mono)' }}>
          <span style={{ width: 6, height: 6, background: 'var(--good)', borderRadius: '50%', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
          {loading ? 'Loading...' : `Live — ${data?.city ?? 'All India'}`}
        </div>
      </div>

      {/* ── City focus banner ────────────────────────────────────────────── */}
      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.75rem', marginBottom: '1.25rem', padding: '.85rem 1rem', background: 'var(--bg-glass)', border: '1px solid rgba(6,182,212,0.25)', borderLeft: '3px solid #06b6d4', borderRadius: 10 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.2rem' }}>📍 Focus</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{data.city}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.2rem' }}>Base AQI</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: aqiColor(data.baseAqi) }}>{data.baseAqi}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.2rem' }}>Category</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '.88rem', fontWeight: 700, color: aqiColor(data.baseAqi) }}>{aqiCat(data.baseAqi)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.2rem' }}>Data Source</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem', color: '#06b6d4' }}>CPCB · ERA5 · TROPOMI</div>
          </div>
        </div>
      )}

      {/* ── Error state ──────────────────────────────────────────────────── */}
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, marginBottom: '1.25rem', color: '#ef4444', fontSize: '.85rem' }}>
          ⚠ Failed to load analytics: {error}
        </div>
      )}

      {/* ══ SECTION 1 — AQI TREND ANALYSIS ═══════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <Card>
          <CardTitle>7-Day AQI Trend</CardTitle>
          {loading ? <Skeleton /> : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.trend7d ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                  <Tooltip contentStyle={tt} />
                  <Legend wrapperStyle={{ color: '#8fa3c4', fontSize: 11 }} />
                  <Line type="monotone" dataKey="aqi" name="AQI" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="pm25" name="PM2.5" stroke="#f97316" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="no2" name="NO₂" stroke="#eab308" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <CardTitle>Monthly AQI Trend</CardTitle>
          {loading ? <Skeleton /> : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyTrend ?? []}>
                  <defs>
                    <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                  <Tooltip contentStyle={tt} />
                  <Area type="monotone" dataKey="aqi" stroke="#06b6d4" strokeWidth={2} fill="url(#aqiGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* ══ SECTION 2 — POLLUTANT ANALYSIS ═══════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <Card>
          <CardTitle>Pollutant Comparison (Multi-line)</CardTitle>
          {loading ? <Skeleton /> : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.pollutantTrend ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                  <Tooltip contentStyle={tt} />
                  <Legend wrapperStyle={{ color: '#8fa3c4', fontSize: 11 }} />
                  <Line type="monotone" dataKey="PM2.5" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="NO₂" stroke="#eab308" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="O₃" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="SO₂" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <CardTitle>Pollutant Contribution (%)</CardTitle>
          {loading ? <Skeleton /> : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.pollutants ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: '#8fa3c4', fontSize: 10 }} tickFormatter={v => `${v}%`} domain={[0, 50]} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#8fa3c4', fontSize: 11 }} width={44} />
                  <Tooltip contentStyle={tt} formatter={(v: number, _n: string, props: { payload?: { unit?: string; value?: number } }) => [`${v}% (${props.payload?.value} ${props.payload?.unit})`, 'Contribution']} />
                  <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                    {(data?.pollutants ?? []).map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* ══ SECTION 3 — WEATHER IMPACT ANALYSIS ══════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <Card>
          <CardTitle>AQI vs Temperature</CardTitle>
          {loading ? <Skeleton /> : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="x" name="Temp (°C)" tick={{ fill: '#8fa3c4', fontSize: 10 }} label={{ value: 'Temp (°C)', fill: '#8fa3c4', fontSize: 9, position: 'insideBottom', offset: -3 }} />
                  <YAxis dataKey="y" name="AQI" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                  <Tooltip contentStyle={tt} cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={data?.scatterTemp ?? []} fill="rgba(249,115,22,0.6)" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <CardTitle>AQI vs Humidity</CardTitle>
          {loading ? <Skeleton /> : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="x" name="Humidity (%)" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                  <YAxis dataKey="y" name="AQI" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                  <Tooltip contentStyle={tt} cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={data?.scatterHum ?? []} fill="rgba(59,130,246,0.6)" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <CardTitle>AQI vs Wind Speed</CardTitle>
          {loading ? <Skeleton /> : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="x" name="Wind (m/s)" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                  <YAxis dataKey="y" name="AQI" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                  <Tooltip contentStyle={tt} cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={data?.scatterWind ?? []} fill="rgba(6,182,212,0.6)" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* ══ SECTION 4 — ISRO FIRE & HCHO ANALYSIS ════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <Card>
          <CardTitle>Fire Count vs HCHO (Sentinel-5P)</CardTitle>
          {loading ? <Skeleton /> : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="fire" name="Fire Count" tick={{ fill: '#8fa3c4', fontSize: 10 }} label={{ value: 'Fire Count', fill: '#8fa3c4', fontSize: 9, position: 'insideBottom', offset: -3 }} />
                  <YAxis dataKey="hcho" name="HCHO×10¹⁵" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                  <Tooltip contentStyle={tt} cursor={{ strokeDasharray: '3 3' }}
                    formatter={(v: number, name: string) => [name === 'HCHO×10¹⁵' ? `${v}×10¹⁵` : v, name]}
                    labelFormatter={() => ''} />
                  <Scatter data={(data?.fireHcho ?? []).map(d => ({ fire: d.fire, hcho: d.hcho, name: d.city }))} fill="rgba(249,115,22,0.7)" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <CardTitle>Fire Count vs AQI (MODIS/VIIRS)</CardTitle>
          {loading ? <Skeleton /> : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="fire" name="Fire Count" tick={{ fill: '#8fa3c4', fontSize: 10 }} label={{ value: 'Fire Count', fill: '#8fa3c4', fontSize: 9, position: 'insideBottom', offset: -3 }} />
                  <YAxis dataKey="aqi" name="AQI" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                  <Tooltip contentStyle={tt} cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={(data?.fireHcho ?? []).map(d => ({ fire: d.fire, aqi: d.aqi, name: d.city }))} fill="rgba(239,68,68,0.7)" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* ══ SECTION 5 — HCHO HOTSPOT TABLE ═══════════════════════════════ */}
      <Card style={{ marginBottom: '1.25rem' }}>
        <CardTitle>🛰️ HCHO Hotspot Analysis — Top 10 Regions (Sentinel-5P TROPOMI)</CardTitle>
        {loading ? <Skeleton h={200} /> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
            <thead>
              <tr>
                {['#', 'Region', 'State', 'HCHO (×10¹⁵ mol/cm²)', 'Fire Count', 'Risk Level'].map(h => (
                  <th key={h} style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)', padding: '.55rem .75rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.hchoHotspots ?? []).map((r, i) => (
                <tr key={r.region} style={{ borderBottom: '1px solid rgba(99,179,237,0.06)' }}>
                  <td style={{ padding: '.55rem .75rem', color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td style={{ padding: '.55rem .75rem', color: 'var(--text-primary)', fontWeight: 600 }}>{r.region}</td>
                  <td style={{ padding: '.55rem .75rem', color: 'var(--text-secondary)' }}>{r.state}</td>
                  <td style={{ padding: '.55rem .75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: r.hcho > 14 ? '#ef4444' : r.hcho > 10 ? '#f97316' : r.hcho > 7 ? '#eab308' : '#22c55e' }}>{r.hcho}</td>
                  <td style={{ padding: '.55rem .75rem', fontFamily: 'var(--font-mono)', color: r.fire > 100 ? '#ef4444' : r.fire > 50 ? '#f97316' : '#8fa3c4' }}>{r.fire}</td>
                  <td style={{ padding: '.55rem .75rem' }}>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, padding: '.2rem .55rem', borderRadius: 4, background: `${riskColor[r.risk]}22`, color: riskColor[r.risk], border: `1px solid ${riskColor[r.risk]}44` }}>{r.risk}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* ══ SECTION 6 — CITY RANKINGS ════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <Card>
          <CardTitle>Top Polluted Cities</CardTitle>
          {loading ? <Skeleton /> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
              <thead>
                <tr>{['#', 'City', 'AQI', 'Status', 'PM2.5'].map(h => <th key={h} style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)', padding: '.6rem .75rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {(data?.cityRankings.polluted ?? []).map((c, i) => (
                  <tr key={c.city} style={{ borderBottom: '1px solid rgba(99,179,237,0.06)' }}>
                    <td style={{ padding: '.5rem .75rem', color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td style={{ padding: '.5rem .75rem', color: 'var(--text-primary)' }}>{c.city}</td>
                    <td style={{ padding: '.5rem .75rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: aqiColor(c.aqi) }}>{c.aqi}</td>
                    <td style={{ padding: '.5rem .75rem' }}><Pill status="">{aqiCat(c.aqi)}</Pill></td>
                    <td style={{ padding: '.5rem .75rem', color: 'var(--text-primary)' }}>{c.pm25}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card>
          <CardTitle>Top Clean Cities</CardTitle>
          {loading ? <Skeleton /> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
              <thead>
                <tr>{['#', 'City', 'AQI', 'Status', 'PM2.5'].map(h => <th key={h} style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)', padding: '.6rem .75rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {(data?.cityRankings.clean ?? []).map((c, i) => (
                  <tr key={c.city} style={{ borderBottom: '1px solid rgba(99,179,237,0.06)' }}>
                    <td style={{ padding: '.5rem .75rem', color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td style={{ padding: '.5rem .75rem', color: 'var(--text-primary)' }}>{c.city}</td>
                    <td style={{ padding: '.5rem .75rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: aqiColor(c.aqi) }}>{c.aqi}</td>
                    <td style={{ padding: '.5rem .75rem' }}><Pill status="">{aqiCat(c.aqi)}</Pill></td>
                    <td style={{ padding: '.5rem .75rem', color: 'var(--text-primary)' }}>{c.pm25}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* ══ SECTION 7 — SEASONAL AQI ══════════════════════════════════════ */}
      <Card style={{ marginBottom: '1.25rem' }}>
        <CardTitle>Seasonal AQI Analysis</CardTitle>
        {loading ? <Skeleton h={260} /> : (
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.seasonalData ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="season" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <YAxis tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Bar dataKey="aqi" name="AQI" radius={[4, 4, 0, 0]}>
                  {(data?.seasonalData ?? []).map((e, i) => (
                    <Cell key={i} fill={aqiColor(e.aqi)} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* ══ SECTION 8 — AI INSIGHTS ENGINE ════════════════════════════════ */}
      <Card>
        <CardTitle>🤖 AI Insights Engine — Auto-generated from CPCB + ISRO Data</CardTitle>
        {loading ? <Skeleton h={140} /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '.65rem', marginTop: '.25rem' }}>
            {(data?.insights ?? []).map((ins, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '.65rem', padding: '.65rem .85rem', background: `${sevColor[ins.severity] ?? '#06b6d4'}11`, border: `1px solid ${sevColor[ins.severity] ?? '#06b6d4'}33`, borderLeft: `3px solid ${sevColor[ins.severity] ?? '#06b6d4'}`, borderRadius: 8 }}>
                <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>{ins.icon}</span>
                <span style={{ fontSize: '.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{ins.text}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

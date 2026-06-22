import { useState, useRef } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { Card, CardTitle, Pill } from '../components/Shared';
import { aqiColor, aqiCat, aqiCatClass, POLL_INPUTS, MET_INPUTS, PRESETS, rand } from '../data/constants';

const tt = { backgroundColor: 'rgba(15,22,46,0.95)', border: '1px solid rgba(99,179,237,0.3)', borderRadius: 8, color: '#e8eef8', fontSize: 12 };

const CITIES = ['Delhi', 'Ghaziabad', 'Mumbai', 'Ahmedabad', 'Surat', 'Pune', 'Lucknow', 'Chandigarh', 'Kolkata', 'Chennai', 'Bengaluru', 'Hyderabad'];

const advisoryFor = (aqi: number) => {
  if (aqi <= 50)  return [{ icon: '✅', title: 'Safe Outdoors', text: 'Air quality is excellent. All outdoor activities are safe. Great day for a run!' }];
  if (aqi <= 100) return [{ icon: '🟢', title: 'Acceptable', text: 'Air quality is acceptable. Unusually sensitive people should consider reducing prolonged outdoor exertion.' }];
  if (aqi <= 200) return [
    { icon: '🟡', title: 'Sensitive Groups', text: 'People with respiratory or heart disease, elderly and children should limit prolonged outdoor exertion.' },
    { icon: '😷', title: 'Mask Recommended', text: 'Consider wearing a mask (N95) if spending extended time outdoors.' },
  ];
  if (aqi <= 300) return [
    { icon: '🔴', title: 'Unhealthy', text: 'Everyone may begin to experience health effects. Sensitive groups at serious risk.' },
    { icon: '🏠', title: 'Stay Indoors', text: 'Limit outdoor activities. Keep windows closed. Use air purifiers indoors.' },
    { icon: '💊', title: 'Medications Ready', text: 'People with asthma or heart conditions should keep medications handy.' },
  ];
  return [
    { icon: '☠️', title: 'Health Emergency', text: 'Entire population likely to be affected. Avoid all outdoor activities immediately.' },
    { icon: '🚨', title: 'Seal Indoors', text: 'Stay indoors with windows sealed. Use N95 masks if forced to go outside.' },
    { icon: '🏥', title: 'Seek Medical Help', text: 'Seek medical attention if experiencing breathing difficulty or chest pain.' },
  ];
};

const Gauge = ({ aqi, loading }: { aqi: number | null; loading: boolean }) => {
  const col = aqi != null ? aqiColor(aqi) : '#4a6080';
  const cat = aqi != null ? aqiCat(aqi) : '—';
  const dashOffset = aqi != null ? 280 - (Math.min(aqi, 500) / 500) * 280 : 280;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg viewBox="0 0 200 200" style={{ width: 180, height: 180 }}>
        <defs>
          <linearGradient id="gGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="40%" stopColor="#eab308" />
            <stop offset="70%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <path d="M 30 150 A 80 80 0 1 1 170 150" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" strokeLinecap="round" />
        <path d="M 30 150 A 80 80 0 1 1 170 150" fill="none" stroke="url(#gGrad)" strokeWidth="16" strokeLinecap="round"
          strokeDasharray="280 280" strokeDashoffset={loading ? 280 : dashOffset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)', filter: aqi != null ? `drop-shadow(0 0 8px ${col})` : 'none' }} />
        {/* Needle */}
        {aqi != null && (
          <line x1="100" y1="100" x2="100" y2="32" stroke={col} strokeWidth="2.5" strokeLinecap="round"
            transform={`rotate(${-150 + (aqi / 500) * 300},100,100)`}
            style={{ transition: 'transform 1.2s cubic-bezier(.4,0,.2,1)' }} />
        )}
        <circle cx="100" cy="100" r="6" fill={aqi != null ? col : '#4a6080'} style={{ transition: 'fill 0.5s' }} />
        <text x="100" y="112" textAnchor="middle" fill={col} fontFamily="Space Grotesk" fontWeight="700" fontSize="28"
          style={{ transition: 'fill 0.5s' }}>
          {loading ? '···' : (aqi != null ? aqi : '—')}
        </text>
        <text x="100" y="132" textAnchor="middle" fill="#8fa3c4" fontFamily="Inter" fontSize="11">AQI Index</text>
      </svg>
      <span style={{ padding: '.3rem 1rem', borderRadius: 20, fontSize: '.85rem', fontWeight: 600, fontFamily: 'var(--font-head)', background: col + '25', color: col, border: `1px solid ${col}50`, transition: 'all 0.5s' }}>
        ● {cat}
      </span>
    </div>
  );
};

type PredResult = {
  city: string;
  aqi: number;
  category: string;
  confidence: number;
  features: Record<string, number>;
  contributions: Array<{ feature: string; pct: number; value: number; unit: string }>;
  forecast_24h: Array<{ time: string; aqi: number; cat: string }>;
  forecast_3d:  Array<{ time: string; aqi: number; cat: string }>;
  forecast_7d:  Array<{ time: string; aqi: number; cat: string }>;
};

export default function AIPrediction() {
  const [mode, setMode] = useState<'city' | 'manual'>('city');
  const [city, setCity] = useState('Delhi');
  const [sliders, setSliders] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    [...POLL_INPUTS, ...MET_INPUTS].forEach(p => { init[p.key] = p.val; });
    return init;
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredResult | null>(null);
  const [toast, setToast] = useState('');
  const [forecastRange, setForecastRange] = useState<'24h' | '3d' | '7d'>('24h');
  const [whatIfSliders, setWhatIfSliders] = useState<Record<string, number>>({});
  const [whatIfResult, setWhatIfResult] = useState<number | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const showToast = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3000);
  };

  const runPredict = async () => {
    setLoading(true);
    try {
      const body = mode === 'city'
        ? { city }
        : {
            features: {
              pm25: sliders.pm25, pm10: sliders.pm10, no2: sliders.no2,
              so2: sliders.so2, o3: sliders.o3, co: sliders.co,
              temp: sliders.temp, humidity: sliders.hum, wind_speed: sliders.wind,
              aod: 0.4, fire_count: 20, hcho: 5.0,
            },
          };

      const resp = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data: PredResult = await resp.json();
      setResult(data);
      setWhatIfSliders({ pm25: data.features.pm25 ?? sliders.pm25, pm10: data.features.pm10 ?? sliders.pm10 });
      showToast(`✓ Prediction complete — AQI: ${data.aqi} (${data.category})`);
    } catch {
      showToast('⚠ Could not reach API — showing simulated result');
      const aqi = Math.round(mode === 'city' ? rand(120, 380) : (sliders.pm25 * 1.6 + sliders.pm10 * 0.5));
      const mock: PredResult = {
        city: mode === 'city' ? city : 'Custom',
        aqi, category: aqiCat(aqi), confidence: 92,
        features: { pm25: sliders.pm25, pm10: sliders.pm10, no2: sliders.no2, so2: sliders.so2, o3: sliders.o3, co: sliders.co, temp: sliders.temp, humidity: sliders.hum, wind_speed: sliders.wind, aod: 0.4, fire_count: 20, hcho: 5 },
        contributions: [
          { feature: 'PM2.5', pct: 38, value: sliders.pm25, unit: 'µg/m³' },
          { feature: 'PM10',  pct: 22, value: sliders.pm10, unit: 'µg/m³' },
          { feature: 'AOD',   pct: 14, value: 0.4, unit: '' },
          { feature: 'Temp',  pct: 10, value: sliders.temp, unit: '°C' },
          { feature: 'NO₂',  pct: 8,  value: sliders.no2, unit: 'ppb' },
          { feature: 'Weather', pct: 8, value: sliders.hum, unit: '%RH' },
        ],
        forecast_24h: Array.from({ length: 24 }, (_, i) => ({ time: `${String(i).padStart(2,'0')}:00`, aqi: Math.round(aqi + rand(-40,40)), cat: 'Moderate' })),
        forecast_3d:  Array.from({ length: 72 }, (_, i) => ({ time: `Day ${Math.floor(i/24)+1} ${String(i%24).padStart(2,'0')}:00`, aqi: Math.round(aqi + rand(-50,50)), cat: 'Poor' })),
        forecast_7d:  Array.from({ length: 7 }, (_, i) => ({ time: `Day ${i+1}`, aqi: Math.round(aqi + rand(-60,60)), cat: 'Moderate' })),
      };
      setResult(mock);
      setWhatIfSliders({ pm25: sliders.pm25, pm10: sliders.pm10 });
    } finally {
      setLoading(false);
    }
  };

  const runWhatIf = () => {
    if (!result) return;
    const delta_pm25 = (whatIfSliders.pm25 ?? result.features.pm25) - result.features.pm25;
    const delta_pm10 = (whatIfSliders.pm10 ?? result.features.pm10) - result.features.pm10;
    const newAQI = Math.round(Math.max(10, result.aqi + delta_pm25 * 1.58 + delta_pm10 * 0.48));
    setWhatIfResult(newAQI);
  };

  const forecastData = result
    ? (forecastRange === '24h' ? result.forecast_24h
     : forecastRange === '3d'  ? result.forecast_3d.filter((_,i) => i % 6 === 0)
     : result.forecast_7d)
    : [];

  return (
    <div style={{ animation: 'fadeIn .3s ease', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700 }}>AI Prediction Center</h1>
          <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginTop: '.25rem' }}>XGBoost Regressor — satellite & meteorological feature fusion</p>
        </div>
        <div style={{ display: 'flex', gap: '.4rem' }}>
          {(['city', 'manual'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ padding: '.4rem .9rem', borderRadius: 6, fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', border: `1px solid ${mode === m ? 'var(--accent-cyan)' : 'var(--border)'}`, background: mode === m ? 'rgba(6,182,212,.12)' : 'transparent', color: mode === m ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>
              {m === 'city' ? '🏙 City Mode' : '🎛 Manual Mode'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* SECTION 1 & 2 — Input Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'city' ? (
            <Card>
              <CardTitle>🏙 City Selection</CardTitle>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.4rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Select City</label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  style={{ width: '100%', padding: '.6rem .8rem', borderRadius: 8, border: '1px solid var(--border-bright)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '.92rem', fontFamily: 'var(--font-head)', outline: 'none', cursor: 'pointer' }}
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 8, padding: '.75rem', marginBottom: '1rem', fontSize: '.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                The model loads the latest CPCB + satellite data for <b style={{ color: 'var(--text-primary)' }}>{city}</b> and runs XGBoost inference. Confidence is derived from ensemble uncertainty estimation.
              </div>
              <button onClick={runPredict} disabled={loading} style={{ width: '100%', padding: '.65rem', borderRadius: 8, border: 'none', background: loading ? 'rgba(6,182,212,0.3)' : 'linear-gradient(135deg,var(--accent-blue),var(--accent-cyan))', color: '#fff', fontFamily: 'var(--font-head)', fontSize: '.9rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .2s' }}>
                {loading ? '⟳ Running model…' : '▶ Predict AQI for ' + city}
              </button>
            </Card>
          ) : (
            <Card>
              <CardTitle>🎛 Manual Simulation</CardTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem 1rem', marginBottom: '.75rem' }}>
                {[...POLL_INPUTS, ...MET_INPUTS].map(p => (
                  <div key={p.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.73rem', color: 'var(--text-muted)', marginBottom: '.2rem' }}>
                      <span style={{ fontWeight: 600 }}>{p.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{sliders[p.key]} {p.unit}</span>
                    </div>
                    <input type="range" min={p.min} max={p.max} step={p.step} value={sliders[p.key]}
                      onChange={e => setSliders(prev => ({ ...prev, [p.key]: +e.target.value }))}
                      style={{ width: '100%', accentColor: 'var(--accent-cyan)', height: 4 }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.4rem', marginBottom: '.75rem' }}>
                {Object.keys(PRESETS).map(k => (
                  <button key={k} onClick={() => setSliders(prev => ({ ...prev, ...PRESETS[k] }))}
                    style={{ padding: '.3rem', borderRadius: 6, fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-secondary)' }}>
                    {k.charAt(0).toUpperCase() + k.slice(1)}
                  </button>
                ))}
              </div>
              <button onClick={runPredict} disabled={loading} style={{ width: '100%', padding: '.65rem', borderRadius: 8, border: 'none', background: loading ? 'rgba(6,182,212,0.3)' : 'linear-gradient(135deg,var(--accent-blue),var(--accent-cyan))', color: '#fff', fontFamily: 'var(--font-head)', fontSize: '.9rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? '⟳ Running simulation…' : '▶ Run Simulation'}
              </button>
            </Card>
          )}

          {/* SECTION 5 — What-if Simulator */}
          <Card>
            <CardTitle>🔬 What-If Simulator</CardTitle>
            {result ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '.75rem' }}>
                  {['pm25', 'pm10'].map(key => {
                    const p = POLL_INPUTS.find(x => x.key === key)!;
                    return (
                      <div key={key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.73rem', color: 'var(--text-muted)', marginBottom: '.2rem' }}>
                          <span style={{ fontWeight: 600 }}>{p.label}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{whatIfSliders[key] ?? result.features[key]} {p.unit}</span>
                        </div>
                        <input type="range" min={p.min} max={p.max} step={p.step} value={whatIfSliders[key] ?? result.features[key]}
                          onChange={e => setWhatIfSliders(prev => ({ ...prev, [key]: +e.target.value }))}
                          style={{ width: '100%', accentColor: '#f97316', height: 4 }} />
                      </div>
                    );
                  })}
                </div>
                <button onClick={runWhatIf} style={{ width: '100%', padding: '.5rem', borderRadius: 8, border: '1px solid var(--border-bright)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontFamily: 'var(--font-head)', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer', marginBottom: '.75rem' }}>
                  Recalculate →
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>Current AQI</div>
                    <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', fontWeight: 700, color: aqiColor(result.aqi) }}>{result.aqi}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>What-If AQI</div>
                    <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', fontWeight: 700, color: whatIfResult != null ? aqiColor(whatIfResult) : 'var(--text-muted)' }}>
                      {whatIfResult ?? '—'}
                    </div>
                  </div>
                </div>
                {whatIfResult != null && whatIfResult < result.aqi && (
                  <div style={{ marginTop: '.75rem', padding: '.75rem', borderRadius: 8, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.25)', fontSize: '.82rem', color: 'var(--good)', textAlign: 'center' }}>
                    ↓ {Math.round(((result.aqi - whatIfResult) / result.aqi) * 100)}% AQI reduction •&nbsp;
                    ↓ {Math.round(((result.aqi - whatIfResult) / result.aqi) * 80)}% health risk reduction
                  </div>
                )}
                {whatIfResult != null && whatIfResult > result.aqi && (
                  <div style={{ marginTop: '.75rem', padding: '.75rem', borderRadius: 8, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', fontSize: '.82rem', color: 'var(--verypoor)', textAlign: 'center' }}>
                    ↑ {Math.round(((whatIfResult - result.aqi) / result.aqi) * 100)}% AQI increase vs baseline
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.85rem' }}>Run a prediction first to enable the what-if simulator.</div>
            )}
          </Card>
        </div>

        {/* SECTION 3 & 4 — Gauge + AI Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '1.5rem' }}>
            <CardTitle>📡 Predicted AQI</CardTitle>
            <Gauge aqi={result?.aqi ?? null} loading={loading} />
            {result && (
              <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.5rem', width: '100%' }}>
                <div style={{ textAlign: 'center', padding: '.6rem', background: 'var(--bg-glass)', borderRadius: 7, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', marginBottom: '.2rem' }}>Confidence</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.95rem', color: 'var(--good)', fontWeight: 600 }}>{result.confidence}%</div>
                </div>
                <div style={{ textAlign: 'center', padding: '.6rem', background: 'var(--bg-glass)', borderRadius: 7, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', marginBottom: '.2rem' }}>Model</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>XGBoost</div>
                </div>
                <div style={{ textAlign: 'center', padding: '.6rem', background: 'var(--bg-glass)', borderRadius: 7, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', marginBottom: '.2rem' }}>Location</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>{result.city}</div>
                </div>
              </div>
            )}
          </Card>

          {/* SECTION 4 — Explainable AI */}
          <Card>
            <CardTitle>🧠 AI Insights — Why This AQI?</CardTitle>
            {result ? (
              <>
                <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem', padding: '.75rem', background: 'var(--bg-glass)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  {result.aqi > 200 ? (
                    <>The AQI of <b style={{ color: aqiColor(result.aqi) }}>{result.aqi}</b> is primarily driven by high particulate matter and nitrogen dioxide concentrations. Active fire events in neighboring regions are transporting smoke-laden air masses over <b style={{ color: 'var(--text-primary)' }}>{result.city}</b>.</>
                  ) : result.aqi > 100 ? (
                    <>Moderate AQI of <b style={{ color: aqiColor(result.aqi) }}>{result.aqi}</b>. Anthropogenic emissions from traffic and industry are the dominant drivers. Meteorological conditions are providing partial dispersion.</>
                  ) : (
                    <>Good air quality (AQI: <b style={{ color: aqiColor(result.aqi) }}>{result.aqi}</b>). High wind speeds and low particulate concentrations are maintaining favorable conditions over {result.city}.</>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                  {result.contributions.map(c => (
                    <div key={c.feature} style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                      <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', width: 72, flexShrink: 0 }}>{c.feature}</div>
                      <div style={{ flex: 1, height: 8, background: 'var(--bg-glass)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${c.pct}%`, borderRadius: 4, background: c.pct > 25 ? 'linear-gradient(90deg,#ef4444,#f97316)' : c.pct > 12 ? 'linear-gradient(90deg,#f97316,#eab308)' : 'linear-gradient(90deg,#3b82f6,#06b6d4)', transition: 'width 1s ease' }} />
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.73rem', color: 'var(--accent-cyan)', width: 34, textAlign: 'right' }}>{c.pct}%</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.85rem' }}>Run a prediction to see SHAP-based feature explanations.</div>
            )}
          </Card>

          {/* SECTION 7 — Health Advisory */}
          <Card>
            <CardTitle>🏥 Health Advisory Engine</CardTitle>
            {result ? advisoryFor(result.aqi).map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '.75rem', padding: '.7rem', borderRadius: 8, background: 'var(--bg-glass)', border: '1px solid var(--border)', marginBottom: '.5rem', animation: 'slideIn .3s ease' }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '.2rem' }}>{a.title}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.text}</div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.85rem' }}>Health recommendations will appear after prediction.</div>
            )}
          </Card>
        </div>
      </div>

      {/* SECTION 6 — AQI Forecasting */}
      <Card style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <CardTitle>📈 AQI Forecast</CardTitle>
          <div style={{ display: 'flex', gap: '.4rem' }}>
            {(['24h', '3d', '7d'] as const).map(r => (
              <button key={r} onClick={() => setForecastRange(r)} style={{ padding: '.3rem .7rem', borderRadius: 6, fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', border: `1px solid ${forecastRange === r ? 'var(--accent-cyan)' : 'var(--border)'}`, background: forecastRange === r ? 'rgba(6,182,212,.12)' : 'transparent', color: forecastRange === r ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>{r}</button>
            ))}
          </div>
        </div>
        {result ? (
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fill: '#8fa3c4', fontSize: 9 }} tickCount={8} />
                <YAxis tick={{ fill: '#8fa3c4', fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={tt} />
                <ReferenceLine y={200} stroke="#f97316" strokeDasharray="5 5" label={{ value: 'Poor', fill: '#f97316', fontSize: 10 }} />
                <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="5 5" label={{ value: 'Good', fill: '#22c55e', fontSize: 10 }} />
                <Area type="monotone" dataKey="aqi" name="Predicted AQI" stroke="#3b82f6" fill="url(#fg)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '.85rem' }}>
            Run a prediction to see the forecast chart.
          </div>
        )}
      </Card>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '.7rem 1.1rem', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', fontSize: '.82rem', color: 'var(--text-primary)', backdropFilter: 'blur(12px)', animation: 'toastIn .3s ease', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

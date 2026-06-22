import { useEffect, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Card, CardTitle, BtnNav, TrendArrow, Pill } from '../components/Shared';
import { HCHO_HOTSPOTS, INDIA_LOCATIONS, aqiColor, aqiCat, rand } from '../data/constants';
import { useCity } from '../context/CityContext';

const tt = { backgroundColor: 'rgba(15,22,46,0.95)', border: '1px solid rgba(99,179,237,0.3)', borderRadius: 8, color: '#e8eef8', fontSize: 12 };
const days7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hchoTs = days7.map((d, i) => ({ day: d, hcho: [8.2, 10.4, 14.2, 16.8, 18.4, 15.2, 12.6][i], threshold: 10 }));
const fireHcho = Array.from({ length: 20 }, () => ({ fires: Math.round(rand(20, 200)), hcho: parseFloat(rand(4, 18).toFixed(1)) }));

export default function HCHOHotspots() {
  const { cityData } = useCity();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [filter, setFilter] = useState('daily');

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    import('leaflet').then(L => {
      const map = L.map(mapRef.current!, { zoomControl: true, attributionControl: false });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 18 }).addTo(map);
      map.setView([23, 78], 5);

      HCHO_HOTSPOTS.forEach(h => {
        const loc = INDIA_LOCATIONS.find(l => l.state.toLowerCase().includes(h.state.toLowerCase())) || { lat: 22, lon: 78 };
        const lat = loc.lat + (Math.random() - 0.5) * 2;
        const lon = loc.lon + (Math.random() - 0.5) * 2;
        const col = h.hcho > 14 ? '#ef4444' : h.hcho > 10 ? '#f97316' : h.hcho > 7 ? '#eab308' : '#22c55e';
        L.circleMarker([lat, lon], { radius: h.hcho * 3, fillColor: col, color: col, weight: 1, opacity: 0.8, fillOpacity: 0.35 })
          .addTo(map)
          .bindPopup(`<div style="font-family:Inter,sans-serif;color:#e8eef8;"><b>${h.region}</b><br>HCHO: ${h.hcho}×10¹⁵<br>Fires: ${h.fire}<br>AQI: <span style="color:${aqiColor(h.aqi)}">${h.aqi}</span></div>`);
      });

      mapInstance.current = map;
    });
    return () => { mapInstance.current?.remove(); mapInstance.current = null; };
  }, []);

  return (
    <div style={{ animation: 'fadeIn .3s ease', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700 }}>HCHO Hotspot Analytics</h1>
          <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginTop: '.25rem' }}>Sentinel-5P TROPOMI formaldehyde column density — biomass burning detection</p>
        </div>
        <div style={{ display: 'flex', gap: '.4rem' }}>
          {(['daily', 'weekly', 'monthly', 'seasonal'] as const).map(f => (
            <BtnNav key={f} active={filter === f} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</BtnNav>
          ))}
        </div>
      </div>

      {/* City Focus Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.75rem', marginBottom: '1.5rem', padding: '.85rem 1rem', background: 'var(--bg-glass)', border: '1px solid rgba(249,115,22,0.25)', borderLeft: '3px solid #f97316', borderRadius: 10 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.2rem' }}>📍 Selected City</div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cityData.city}</div>
          <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>{cityData.state}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.2rem' }}>HCHO Column</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: cityData.hcho > 14 ? '#ef4444' : cityData.hcho > 10 ? '#f97316' : cityData.hcho > 7 ? '#eab308' : '#22c55e' }}>{cityData.hcho}×10¹⁵</div>
          <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>mol/cm²</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.2rem' }}>Fire Count</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: cityData.fire > 100 ? '#ef4444' : cityData.fire > 50 ? '#f97316' : '#22c55e' }}>{cityData.fire}</div>
          <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>active fires</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.2rem' }}>Risk Level</div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '.95rem', fontWeight: 700, color: cityData.hcho > 14 ? '#ef4444' : cityData.hcho > 10 ? '#f97316' : '#22c55e' }}>
            {cityData.hcho > 14 ? 'Extreme' : cityData.hcho > 10 ? 'High' : cityData.hcho > 7 ? 'Moderate' : 'Low'}
          </div>
          <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>HCHO exposure</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem', marginBottom: '1rem' }}>
        <div ref={mapRef} style={{ height: 450, borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <Card>
            <CardTitle>HCHO Scale</CardTitle>
            <div style={{ height: 120, background: 'linear-gradient(to top,#22c55e,#eab308,#f97316,#ef4444)', borderRadius: 6 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '.3rem', fontSize: '.7rem', color: 'var(--text-muted)' }}>
              <span>Low</span><span>High</span>
            </div>
          </Card>
          <Card>
            <CardTitle>HCHO Statistics</CardTitle>
            {[
              { label: 'Max HCHO', val: '18.4 ×10¹⁵' },
              { label: 'Avg HCHO', val: '6.2 ×10¹⁵' },
              { label: 'Hotspot Count', val: '14' },
              { label: 'Burning Season', val: 'Oct–Nov' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>{r.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.85rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{r.val}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <Card>
          <CardTitle>HCHO Time Series</CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hchoTs}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <YAxis tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Line type="monotone" dataKey="hcho" name="HCHO ×10¹⁵" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="threshold" name="Threshold" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle>Fire Count vs HCHO</CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="fires" name="Fire Count" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <YAxis dataKey="hcho" name="HCHO" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={tt} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={fireHcho} fill="rgba(239,68,68,0.6)" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle>Top HCHO Hotspot Regions</CardTitle>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
          <thead>
            <tr>{['#', 'Region', 'State', 'HCHO Value (×10¹⁵)', 'Fire Count', 'AQI', 'Trend', 'Status'].map(h => (
              <th key={h} style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)', padding: '.6rem .75rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {HCHO_HOTSPOTS.map((h, i) => (
              <tr key={h.region} style={{ borderBottom: '1px solid rgba(99,179,237,0.06)' }}>
                <td style={{ padding: '.6rem .75rem', color: 'var(--text-muted)' }}>{i + 1}</td>
                <td style={{ padding: '.6rem .75rem', color: 'var(--text-primary)' }}>{h.region}</td>
                <td style={{ padding: '.6rem .75rem', color: 'var(--text-secondary)' }}>{h.state}</td>
                <td style={{ padding: '.6rem .75rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: aqiColor(h.aqi) }}>{h.hcho}</td>
                <td style={{ padding: '.6rem .75rem', color: 'var(--text-primary)' }}>{h.fire}</td>
                <td style={{ padding: '.6rem .75rem', fontFamily: 'var(--font-mono)', color: aqiColor(h.aqi) }}>{h.aqi}</td>
                <td style={{ padding: '.6rem .75rem', fontSize: '1rem' }}><TrendArrow trend={h.trend} /></td>
                <td style={{ padding: '.6rem .75rem' }}><Pill status={h.aqi > 300 ? 'verypoor' : h.aqi > 200 ? 'poor' : 'moderate'}>{aqiCat(h.aqi)}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

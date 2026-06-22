import { useEffect, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Card, CardTitle, KpiCard, TrendArrow } from '../components/Shared';
import { STATE_FIRES, rand, randArr } from '../data/constants';

const tt = { backgroundColor: 'rgba(15,22,46,0.95)', border: '1px solid rgba(99,179,237,0.3)', borderRadius: 8, color: '#e8eef8', fontSize: 12 };
const days30 = Array.from({ length: 30 }, (_, i) => ({ day: String(i + 1), count: Math.round(rand(10, 120)) }));
const fireAQI = Array.from({ length: 25 }, () => ({ fires: Math.round(rand(10, 200)), aqi: Math.round(rand(80, 380)) }));
const monthlyFire = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => ({ month: m, fires: [12,18,34,42,28,14,8,6,24,68,84,42][i] }));

export default function FireAnalysis() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    import('leaflet').then(L => {
      const map = L.map(mapRef.current!, { zoomControl: true, attributionControl: false });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 18 }).addTo(map);
      map.setView([26, 78], 5);

      const firePoints: [number, number][] = [
        [31.6, 74.8], [30.7, 75.2], [30.2, 76.4], [29.8, 77.1],
        [26.8, 80.9], [22.6, 88.4], [26.1, 91.7], [27.2, 94.2],
        [21.2, 81.4], [20.3, 85.8],
      ];

      firePoints.forEach(([lat, lon]) => {
        L.circleMarker([lat + (Math.random() - 0.5), lon + (Math.random() - 0.5)], {
          radius: 7, fillColor: '#ef4444', color: '#f97316', weight: 2, opacity: 1, fillOpacity: 0.8,
        }).addTo(map).bindPopup(`<div style="font-family:Inter,sans-serif;color:#e8eef8;"><b>Active Fire</b><br>FRP: ${Math.round(rand(50, 500))} MW<br>Confidence: ${Math.round(rand(70, 99))}%</div>`);
      });

      mapInstance.current = map;
    });
    return () => { mapInstance.current?.remove(); mapInstance.current = null; };
  }, []);

  return (
    <div style={{ animation: 'fadeIn .3s ease', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700 }}>Fire Activity Analysis</h1>
          <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginTop: '.25rem' }}>MODIS/VIIRS active fire detection — biomass burning & crop residue events</p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', fontSize: '.72rem', color: 'var(--good)', fontFamily: 'var(--font-mono)' }}>
          <span style={{ width: 6, height: 6, background: 'var(--good)', borderRadius: '50%', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
          FIRMS data stream
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.75rem', marginBottom: '1.25rem' }}>
        <KpiCard val="231" label="Active Fire Points" color="var(--verypoor)" />
        <KpiCard val="48" label="Today's Fires" color="var(--poor)" />
        <KpiCard val="Punjab" label="Top Fire State" color="var(--moderate)" />
        <KpiCard val="↓ 12%" label="vs Yesterday" color="var(--good)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '1rem', marginBottom: '1.25rem' }}>
        <div ref={mapRef} style={{ height: 420, borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }} />
        <Card>
          <CardTitle>State-wise Fire Count</CardTitle>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
            <thead>
              <tr>{['State', 'Fires', 'Trend'].map(h => <th key={h} style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)', padding: '.6rem .75rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {STATE_FIRES.map(s => (
                <tr key={s.state} style={{ borderBottom: '1px solid rgba(99,179,237,0.06)' }}>
                  <td style={{ padding: '.6rem .75rem', color: 'var(--text-primary)' }}>{s.state}</td>
                  <td style={{ padding: '.6rem .75rem', fontFamily: 'var(--font-mono)', color: 'var(--poor)' }}>{s.fires}</td>
                  <td style={{ padding: '.6rem .75rem' }}><TrendArrow trend={s.trend} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <Card>
          <CardTitle>Daily Fire Count (30 days)</CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days30}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#8fa3c4', fontSize: 9 }} tickCount={10} />
                <YAxis tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Bar dataKey="count" fill="rgba(239,68,68,0.7)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle>Fire Count vs AQI</CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="fires" name="Fire Count" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <YAxis dataKey="aqi" name="AQI" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={tt} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={fireAQI} fill="rgba(249,115,22,0.6)" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle>Monthly Fire Trends</CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFire}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#8fa3c4', fontSize: 9 }} />
                <YAxis tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Bar dataKey="fires" fill="rgba(239,68,68,0.7)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

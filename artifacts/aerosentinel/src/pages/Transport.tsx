import { useEffect, useRef } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardTitle, SelectInput } from '../components/Shared';
import { rand } from '../data/constants';

const tt = { backgroundColor: 'rgba(15,22,46,0.95)', border: '1px solid rgba(99,179,237,0.3)', borderRadius: 8, color: '#e8eef8', fontSize: 12 };
const windData = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, speed: parseFloat(rand(1, 8).toFixed(1)) }));
const plumeData = [
  { region: 'Punjab', pm25: 182 }, { region: 'Haryana', pm25: 142 },
  { region: 'NCR', pm25: 112 }, { region: 'Delhi', pm25: 68 },
];
const pieData = [
  { name: 'Local Emission', value: 42, color: '#ef4444' },
  { name: 'Transported', value: 38, color: '#f97316' },
  { name: 'Secondary', value: 20, color: '#eab308' },
];

export default function Transport() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    import('leaflet').then(L => {
      const map = L.map(mapRef.current!, { zoomControl: true, attributionControl: false });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 18 }).addTo(map);
      map.setView([29, 76], 6);

      const routes: [number, number, number, number, string][] = [
        [31.6, 74.8, 28.6, 77.2, 'Punjab → Delhi'],
        [30.0, 76.0, 28.6, 77.2, 'Haryana → Delhi'],
      ];

      routes.forEach(([la1, lo1, la2, lo2, label]) => {
        L.polyline([[la1, lo1], [la2, lo2]], { color: '#f97316', weight: 3, opacity: 0.7, dashArray: '8 4' }).addTo(map);
        L.circleMarker([la1, lo1], { radius: 8, fillColor: '#ef4444', color: '#fff', weight: 2, fillOpacity: 1 })
          .addTo(map).bindPopup(`<div style="font-family:Inter,sans-serif;color:#e8eef8;">Source: ${label.split('→')[0].trim()}</div>`);
        L.circleMarker([la2, lo2], { radius: 8, fillColor: '#eab308', color: '#fff', weight: 2, fillOpacity: 1 })
          .addTo(map).bindPopup(`<div style="font-family:Inter,sans-serif;color:#e8eef8;">Receptor: ${label.split('→')[1].trim()}</div>`);
      });

      mapInstance.current = map;
    });
    return () => { mapInstance.current?.remove(); mapInstance.current = null; };
  }, []);

  return (
    <div style={{ animation: 'fadeIn .3s ease', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700 }}>Pollution Transport Analysis</h1>
          <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginTop: '.25rem' }}>ERA5 wind fields — source-to-receptor pathway modelling</p>
        </div>
        <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '.78rem', color: 'var(--text-secondary)' }}>Pathway:</span>
          <SelectInput
            value="Punjab → Delhi"
            onChange={() => {}}
            options={[
              { value: 'Punjab → Delhi', label: 'Punjab → Delhi' },
              { value: 'Haryana → NCR', label: 'Haryana → NCR' },
              { value: 'UP → Bihar', label: 'UP → Bihar' },
              { value: 'Jharkhand → Odisha', label: 'Jharkhand → Odisha' },
            ]}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '1rem', marginBottom: '1.25rem' }}>
        <div ref={mapRef} style={{ height: 450, borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <Card>
            <CardTitle>Wind Parameters</CardTitle>
            {[
              { label: 'Wind Speed', val: '4.2 m/s' },
              { label: 'Direction', val: 'NW → SE' },
              { label: 'BL Height', val: '820 m' },
              { label: 'Plume Reach', val: '~380 km' },
              { label: 'Transport Time', val: '~25 hrs' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>{r.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.85rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{r.val}</span>
              </div>
            ))}
          </Card>
          <Card>
            <CardTitle>Source Contribution</CardTitle>
            <div style={{ height: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tt} />
                  <Legend wrapperStyle={{ color: '#8fa3c4', fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Card>
          <CardTitle>Wind Speed Time Series</CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={windData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" tick={{ fill: '#8fa3c4', fontSize: 9 }} tickCount={6} />
                <YAxis tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Line type="monotone" dataKey="speed" name="Wind Speed (m/s)" stroke="#06b6d4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle>Pollution Plume Trajectory</CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={plumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="region" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <YAxis tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Area type="monotone" dataKey="pm25" name="PM2.5 Conc." stroke="#f97316" fill="rgba(249,115,22,0.1)" strokeWidth={2} dot={{ r: 5, fill: '#f97316' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardTitle, Pill } from '../components/Shared';

const EXPORTS = [
  { icon: '📊', label: 'Export CSV', desc: 'All pollutant readings, AQI data', key: 'csv' },
  { icon: '📑', label: 'Export Excel', desc: 'Multi-sheet analytics workbook', key: 'xlsx' },
  { icon: '📈', label: 'Export Charts', desc: 'All dashboard charts as PNG', key: 'charts' },
  { icon: '🗺️', label: 'Export Maps', desc: 'India AQI, HCHO, fire maps', key: 'maps' },
  { icon: '📝', label: 'Analytics Report', desc: 'Full PDF report — coming soon', key: 'pdf' },
  { icon: '🔥', label: 'HCHO Hotspot Data', desc: 'Hotspot regions with fire counts', key: 'hcho' },
];

const generateCSV = () => {
  const header = 'City,AQI,PM2.5,PM10,NO2,SO2,O3,CO,Temp,Humidity,Wind,Status\n';
  const rows = [
    'New Delhi,387,182,312,42,19,54,1.24,32,61,3.8,Severe',
    'Mumbai,72,28,52,18,8,34,0.8,28,78,6.2,Satisfactory',
    'Kolkata,184,78,142,38,14,48,1.1,30,72,4.1,Poor',
    'Chennai,68,24,48,16,7,32,0.7,34,80,5.8,Satisfactory',
    'Bengaluru,84,32,64,22,10,38,0.9,26,65,5.2,Satisfactory',
  ].join('\n');
  return header + rows;
};

export default function Export() {
  const [toast, setToast] = useState('');

  const doExport = (key: string) => {
    if (key === 'csv') {
      const csv = generateCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'aerosentinel_aqi_data.csv';
      a.click();
      URL.revokeObjectURL(url);
      setToast('CSV exported successfully!');
    } else {
      setToast(`${EXPORTS.find(e => e.key === key)?.label} — download initiated`);
    }
    setTimeout(() => setToast(''), 2500);
  };

  return (
    <div style={{ animation: 'fadeIn .3s ease', padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700 }}>Export Center</h1>
        <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginTop: '.25rem' }}>Download data, charts, maps, and full analytics reports</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
        {EXPORTS.map(e => (
          <div
            key={e.key}
            onClick={() => doExport(e.key)}
            style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem', textAlign: 'center', cursor: 'pointer', transition: 'all .2s' }}
            onMouseEnter={ev => {
              (ev.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent-cyan)';
              (ev.currentTarget as HTMLDivElement).style.background = 'rgba(6,182,212,0.05)';
              (ev.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={ev => {
              (ev.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
              (ev.currentTarget as HTMLDivElement).style.background = 'var(--bg-glass)';
              (ev.currentTarget as HTMLDivElement).style.transform = 'none';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>{e.icon}</div>
            <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{e.label}</div>
            <div style={{ fontSize: '.73rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>{e.desc}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardTitle>Data Pipeline Status</CardTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {[
            { label: 'INSAT-3D AOD Feed', status: 'good', badge: 'Live' },
            { label: 'Sentinel-5P TROPOMI', status: 'good', badge: 'Live' },
            { label: 'CPCB Ground Stations', status: 'good', badge: '287 Active' },
            { label: 'MODIS/VIIRS Fire Feed', status: 'good', badge: 'Live' },
            { label: 'ERA5 Reanalysis', status: 'moderate', badge: '6hr Lag' },
            { label: 'CNN-LSTM Model', status: 'good', badge: 'Serving' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem 0', borderBottom: '1px solid var(--border)', fontSize: '.82rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
              <Pill status={r.status}>● {r.badge}</Pill>
            </div>
          ))}
        </div>
      </Card>

      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '.7rem 1.1rem', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid rgba(34,197,94,.4)', fontSize: '.82rem', color: 'var(--text-primary)', backdropFilter: 'blur(12px)', animation: 'toastIn .3s ease', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

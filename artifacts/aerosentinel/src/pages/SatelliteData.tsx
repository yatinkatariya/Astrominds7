import { useState } from 'react';
import { Card, CardTitle, LayerItem } from '../components/Shared';

const LAYERS = [
  { key: 'insat', label: 'INSAT-3D AOD', color: '#3b82f6', desc: 'Aerosol Optical Depth from INSAT-3D geostationary satellite. Coverage: Indian subcontinent at 4km resolution.' },
  { key: 'no2', label: 'S5P NO₂', color: '#ef4444', desc: 'Tropospheric NO₂ column from Sentinel-5P TROPOMI. Daily global coverage at 3.5×5.5km resolution.' },
  { key: 'so2', label: 'S5P SO₂', color: '#eab308', desc: 'SO₂ vertical column from TROPOMI. Key indicator of volcanic and anthropogenic emissions.' },
  { key: 'co', label: 'S5P CO', color: '#f97316', desc: 'Carbon monoxide total column. Tracer for biomass burning and incomplete combustion.' },
  { key: 'o3', label: 'S5P O₃', color: '#22c55e', desc: 'Ozone total column. Critical for understanding photochemical smog formation.' },
  { key: 'hcho', label: 'S5P HCHO', color: '#a855f7', desc: 'Formaldehyde column from TROPOMI. Proxy for VOC emissions and fire activity.' },
  { key: 'fire', label: 'Fire Count', color: '#ef4444', desc: 'MODIS/VIIRS active fire detection. Daily updated fire radiative power and location.' },
  { key: 'wind', label: 'Wind Field', color: '#06b6d4', desc: 'ERA5 reanalysis wind vectors at 925 hPa. 6-hourly updates at 0.25° resolution.' },
];

export default function SatelliteData() {
  const [checked, setChecked] = useState<Record<string, boolean>>({ insat: true });
  const [opacity, setOpacity] = useState(70);
  const [activeLayer, setActiveLayer] = useState<string | null>('insat');

  const toggle = (key: string) => {
    setChecked(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (next[key]) setActiveLayer(key);
      else if (activeLayer === key) setActiveLayer(null);
      return next;
    });
  };

  const active = LAYERS.find(l => l.key === activeLayer);

  return (
    <div style={{ animation: 'fadeIn .3s ease', padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700 }}>Satellite Data Explorer</h1>
        <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginTop: '.25rem' }}>INSAT-3D AOD, Sentinel-5P, MODIS/VIIRS layer visualizations</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <Card>
            <CardTitle>Satellite Layers</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              {LAYERS.map(l => <LayerItem key={l.key} label={l.label} checked={!!checked[l.key]} onChange={() => toggle(l.key)} />)}
            </div>
          </Card>
          <Card>
            <CardTitle>Layer Opacity</CardTitle>
            <input type="range" min={10} max={100} value={opacity} onChange={e => setOpacity(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent-cyan)' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem', color: 'var(--accent-cyan)', textAlign: 'center', marginTop: '.3rem' }}>{opacity}%</div>
          </Card>
          <Card>
            <CardTitle>Time Filter</CardTitle>
            <input type="date" defaultValue="2024-11-15" style={{ width: '100%', padding: '.35rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '.8rem' }} />
            <div style={{ marginTop: '.5rem' }}>
              <input type="range" min={0} max={23} defaultValue={12} style={{ width: '100%', accentColor: 'var(--accent-cyan)' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem', color: 'var(--accent-cyan)', textAlign: 'center' }}>12:00 UTC</div>
            </div>
          </Card>
        </div>

        <div>
          <div style={{ height: 520, borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            {active ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '.75rem' }}>🛰️</div>
                <div style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: active.color, boxShadow: `0 0 12px ${active.color}`, marginBottom: '.75rem' }} />
                <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.3rem', fontWeight: 700, color: active.color, marginBottom: '.5rem' }}>{active.label}</div>
                <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', maxWidth: 420, lineHeight: 1.6, marginBottom: '1.5rem' }}>{active.desc}</p>

                {/* Simulated color-scale visualization */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: 300, height: 20, borderRadius: 4, background: `linear-gradient(to right, #22c55e, #eab308, #f97316, ${active.color})`, opacity: opacity / 100 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: 300, fontSize: '.7rem', color: 'var(--text-muted)' }}>
                    <span>Low</span><span>Medium</span><span>High</span>
                  </div>
                </div>

                <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', opacity: 0.7 }}>
                  Connect to Google Earth Engine / MOSDAC API for live tile visualization
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {['MOSDAC API', 'Google Earth Engine', 'Copernicus Hub'].map(src => (
                    <a key={src} href="#" style={{ padding: '.3rem .75rem', borderRadius: 6, border: '1px solid var(--border)', fontSize: '.75rem', color: 'var(--accent-cyan)', textDecoration: 'none', background: 'var(--bg-glass)' }}>{src}</a>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem' }}>🛰️</div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', marginTop: '.5rem' }}>Satellite Layer Viewer</div>
                <div style={{ fontSize: '.8rem', marginTop: '.3rem' }}>Select a layer from the panel to visualize</div>
                <div style={{ marginTop: '1rem', fontSize: '.75rem', opacity: .6 }}>Connect to Google Earth Engine / MOSDAC API for live data</div>
              </div>
            )}
          </div>

          {/* Data sources */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            {[
              { title: 'INSAT-3D', src: 'MOSDAC', url: 'https://www.mosdac.gov.in/insat-3d-data-products', desc: 'AOD, LST, OLR' },
              { title: 'Sentinel-5P', src: 'Copernicus', url: 'https://developers.google.com/earth-engine/datasets/catalog/sentinel-5p/', desc: 'NO₂, SO₂, CO, O₃, HCHO' },
              { title: 'MODIS/VIIRS', src: 'FIRMS', url: 'https://firms.modaps.eosdis.nasa.gov/', desc: 'Active fire counts, FRP' },
            ].map(s => (
              <div key={s.title} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem' }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: '.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '.25rem' }}>{s.title}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--accent-cyan)', marginBottom: '.25rem' }}>{s.src}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '.5rem', fontSize: '.72rem', color: 'var(--accent-cyan)', textDecoration: 'none', borderBottom: '1px solid rgba(6,182,212,.3)' }}>Data Portal →</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

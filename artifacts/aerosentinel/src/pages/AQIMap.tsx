import { useEffect, useRef, useState } from 'react';
import { Card, CardTitle, AQILegend, LayerItem } from '../components/Shared';
import { INDIA_LOCATIONS, aqiColor, aqiCat } from '../data/constants';

export default function AQIMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [layers, setLayers] = useState({ aqi: true, pm25: false, no2: false, fire: false, wind: false });
  const [histVal, setHistVal] = useState(12);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    import('leaflet').then(L => {
      const map = L.map(mapRef.current!, { zoomControl: true, attributionControl: false });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CartoDB', maxZoom: 18,
      }).addTo(map);
      map.setView([20.5937, 78.9629], 5);

      INDIA_LOCATIONS.forEach(loc => {
        const col = aqiColor(loc.aqi);
        const outer = L.circleMarker([loc.lat, loc.lon], { radius: 16, fillColor: col, color: col, weight: 2, opacity: 0.9, fillOpacity: 0.35 }).addTo(map);
        const inner = L.circleMarker([loc.lat, loc.lon], { radius: 6, fillColor: col, color: '#fff', weight: 1.5, opacity: 1, fillOpacity: 1 }).addTo(map);
        const popup = `<div style="font-family:Inter,sans-serif;min-width:160px;"><div style="font-family:'Space Grotesk',sans-serif;font-size:.95rem;font-weight:600;color:#e8eef8;margin-bottom:.3rem;">${loc.name}</div><div style="color:#8fa3c4;font-size:.77rem;margin-bottom:.3rem;">${loc.state}</div><div style="font-family:'JetBrains Mono',monospace;font-size:1.6rem;font-weight:700;color:${col};">${loc.aqi}</div><div style="font-size:.77rem;color:#8fa3c4;">Category: <b style="color:${col};">${aqiCat(loc.aqi)}</b></div><div style="font-size:.77rem;color:#8fa3c4;">PM2.5: ${loc.pm25} µg/m³</div><div style="font-size:.77rem;color:#8fa3c4;">PM10: ${loc.pm10} µg/m³</div><div style="font-size:.77rem;color:#8fa3c4;">Temp: ${loc.temp}°C</div></div>`;
        outer.bindPopup(popup);
        inner.bindPopup(popup);
      });

      mapInstance.current = map;
    });
    return () => { mapInstance.current?.remove(); mapInstance.current = null; };
  }, []);

  const toggle = (key: keyof typeof layers) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div style={{ animation: 'fadeIn .3s ease', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700 }}>India AQI Map</h1>
          <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginTop: '.25rem' }}>State & district-level air quality visualization with historical playback</p>
        </div>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input placeholder="Search city..." style={{ padding: '.35rem .7rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '.8rem', outline: 'none' }} />
          <select style={{ padding: '.35rem .7rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '.8rem' }}>
            <option>All Categories</option>
            <option>Good</option>
            <option>Moderate</option>
            <option>Poor</option>
            <option>Very Poor</option>
            <option>Severe</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '1rem' }}>
        <div>
          <div ref={mapRef} style={{ height: 500, borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }} />
          <div style={{ marginTop: '.75rem', display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Historical playback:</span>
            <input type="range" min={0} max={23} value={histVal} onChange={e => setHistVal(+e.target.value)} style={{ flex: 1, accentColor: 'var(--accent-cyan)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem', color: 'var(--accent-cyan)' }}>{String(histVal).padStart(2, '0')}:00</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <Card>
            <CardTitle>Layer Controls</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              <LayerItem label="AQI Layer" checked={layers.aqi} onChange={() => toggle('aqi')} />
              <LayerItem label="PM2.5 Layer" checked={layers.pm25} onChange={() => toggle('pm25')} />
              <LayerItem label="NO₂ Layer" checked={layers.no2} onChange={() => toggle('no2')} />
              <LayerItem label="Fire Layer" checked={layers.fire} onChange={() => toggle('fire')} />
              <LayerItem label="Wind Layer" checked={layers.wind} onChange={() => toggle('wind')} />
            </div>
          </Card>
          <Card>
            <CardTitle>AQI Legend</CardTitle>
            <AQILegend />
          </Card>
        </div>
      </div>
    </div>
  );
}

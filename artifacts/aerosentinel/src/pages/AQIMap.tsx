import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardTitle, AQILegend, LayerItem } from '../components/Shared';
import { aqiColor, aqiCat, aqiCatClass } from '../data/constants';
import { useCity, CITY_DB, type CityData } from '../context/CityContext';

// ── Historical Delhi data from master_dataset.csv ────────────────────────────
const DELHI_HIST = [
  { date: 'Nov 01', aqi: 374, pm25: 178, fire: 138, hcho: 17.8 },
  { date: 'Nov 02', aqi: 380, pm25: 182, fire: 142, hcho: 18.1 },
  { date: 'Nov 03', aqi: 387, pm25: 186, fire: 142, hcho: 18.4 },
  { date: 'Nov 04', aqi: 364, pm25: 174, fire: 132, hcho: 17.2 },
  { date: 'Nov 05', aqi: 348, pm25: 168, fire: 124, hcho: 16.8 },
  { date: 'Nov 06', aqi: 358, pm25: 172, fire: 128, hcho: 17.0 },
  { date: 'Nov 07', aqi: 376, pm25: 179, fire: 138, hcho: 17.9 },
  { date: 'Nov 08', aqi: 384, pm25: 185, fire: 140, hcho: 18.3 },
  { date: 'Nov 09', aqi: 366, pm25: 175, fire: 134, hcho: 17.4 },
  { date: 'Nov 10', aqi: 354, pm25: 171, fire: 126, hcho: 16.9 },
];
const HIST_DATES = DELHI_HIST.map(d => d.date);

// ── Layer colour scales ───────────────────────────────────────────────────────
type LayerKey = 'aqi' | 'pm25' | 'no2' | 'fire' | 'wind' | 'hcho';

function layerColor(city: CityData, layer: LayerKey, histAqi?: number): string {
  switch (layer) {
    case 'aqi':  return aqiColor(histAqi ?? city.aqi);
    case 'pm25': { const v = city.pm25; return v<=30?'#22c55e':v<=60?'#84cc16':v<=90?'#eab308':v<=150?'#f97316':v<=250?'#ef4444':'#a855f7'; }
    case 'no2':  { const v = city.no2;  return v<=15?'#22c55e':v<=30?'#84cc16':v<=50?'#eab308':v<=80?'#f97316':v<=120?'#ef4444':'#a855f7'; }
    case 'fire': { const v = city.fire; return v<=5?'#22c55e':v<=20?'#84cc16':v<=50?'#eab308':v<=100?'#f97316':v<=150?'#ef4444':'#a855f7'; }
    case 'wind': { const v = city.wind; return v>=6?'#22c55e':v>=4?'#84cc16':v>=3?'#eab308':v>=2?'#f97316':'#ef4444'; }
    case 'hcho': { const v = city.hcho; return v<=3?'#22c55e':v<=6?'#84cc16':v<=9?'#eab308':v<=12?'#f97316':v<=15?'#ef4444':'#a855f7'; }
  }
}

function layerValue(city: CityData, layer: LayerKey, histAqi?: number): string {
  switch (layer) {
    case 'aqi':  return `${histAqi ?? city.aqi}`;
    case 'pm25': return `${city.pm25} µg/m³`;
    case 'no2':  return `${city.no2} ppb`;
    case 'fire': return `${city.fire} fires`;
    case 'wind': return `${city.wind} m/s`;
    case 'hcho': return `${city.hcho}×10¹⁵`;
  }
}

// ── Rich popup HTML ───────────────────────────────────────────────────────────
function buildPopup(name: string, city: CityData, hist?: typeof DELHI_HIST[0]): string {
  const aqi = hist?.aqi ?? city.aqi;
  const pm25 = hist?.pm25 ?? city.pm25;
  const col = aqiColor(aqi);
  const row = (label: string, val: string) =>
    `<div style="display:flex;justify-content:space-between;padding:.18rem 0;border-bottom:1px solid rgba(99,179,237,0.08);">
       <span style="color:#8fa3c4;font-size:.72rem;">${label}</span>
       <span style="color:#e8eef8;font-size:.72rem;font-family:'JetBrains Mono',monospace;font-weight:600;">${val}</span>
     </div>`;
  return `<div style="font-family:Inter,sans-serif;min-width:210px;padding:2px 0;">
    <div style="font-family:'Space Grotesk',sans-serif;font-size:1rem;font-weight:700;color:#e8eef8;margin-bottom:2px;">${name}</div>
    <div style="color:#8fa3c4;font-size:.72rem;margin-bottom:.55rem;">${city.state} · India</div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:1.7rem;font-weight:700;color:${col};line-height:1;">${aqi}</div>
    <div style="font-size:.73rem;color:${col};font-weight:700;margin-bottom:.65rem;">${aqiCat(aqi)}</div>
    ${row('PM2.5', `${pm25} µg/m³`)}
    ${row('PM10',  `${city.pm10} µg/m³`)}
    ${row('NO₂',   `${city.no2} ppb`)}
    ${row('SO₂',   `${city.so2} ppb`)}
    ${row('O₃',    `${city.o3} ppb`)}
    ${row('CO',    `${city.co} mg/m³`)}
    ${row('Temp',  `${city.temp}°C`)}
    ${row('Humidity', `${city.humidity}%`)}
    ${row('Wind',  `${city.wind} m/s`)}
    ${row('HCHO',  `${city.hcho}×10¹⁵`)}
    ${row('Fire Count', `${hist?.fire ?? city.fire}`)}
    <div style="margin-top:.5rem;font-size:.67rem;color:#4a5568;">Last updated: ${hist?.date ?? 'Nov 10, 2024'}</div>
  </div>`;
}

// ── Sorted city lists ─────────────────────────────────────────────────────────
const ALL_CITY_ENTRIES = Object.entries(CITY_DB);
const TOP_POLLUTED = [...ALL_CITY_ENTRIES].sort((a,b) => b[1].aqi - a[1].aqi).slice(0, 6);
const TOP_CLEAN    = [...ALL_CITY_ENTRIES].sort((a,b) => a[1].aqi - b[1].aqi).slice(0, 6);

// ── Map Insights ──────────────────────────────────────────────────────────────
function genInsights(sel: string | null) {
  const city = sel ? CITY_DB[sel] : null;
  const insights = [];
  if (city) {
    if (city.aqi > 300) insights.push({ c: '#ef4444', t: `${sel} AQI at ${city.aqi} — severe health risk. Avoid outdoor activity.` });
    else if (city.aqi > 150) insights.push({ c: '#f97316', t: `${sel} AQI: ${city.aqi} (${aqiCat(city.aqi)}). Sensitive groups should take precautions.` });
    else insights.push({ c: '#22c55e', t: `${sel} AQI: ${city.aqi} — ${aqiCat(city.aqi)}. Conditions are relatively safe.` });
    if (city.fire > 80) insights.push({ c: '#f97316', t: `${city.fire} active fires in ${city.state} — biomass burning elevating HCHO.` });
    if (city.hcho > 10) insights.push({ c: '#ef4444', t: `Sentinel-5P detects extreme HCHO (${city.hcho}×10¹⁵) — crop burning signature.` });
  } else {
    insights.push({ c: '#ef4444', t: 'Delhi–Ghaziabad corridor: AQI >350. Severe biomass burning event.' });
    insights.push({ c: '#f97316', t: 'Punjab shows 142 active fires. HCHO at 18.4×10¹⁵ — record levels.' });
    insights.push({ c: '#22c55e', t: 'Southern India (Chennai, Bengaluru) remains in satisfactory range.' });
  }
  insights.push({ c: '#3b82f6', t: 'Wind speed <3 m/s across northern plains — stagnation trapping pollutants.' });
  return insights.slice(0, 4);
}

const LAYER_META: Record<LayerKey, { label: string; unit: string }> = {
  aqi:  { label: 'AQI Layer',   unit: 'AQI Index' },
  pm25: { label: 'PM2.5 Layer', unit: 'µg/m³' },
  no2:  { label: 'NO₂ Layer',   unit: 'ppb' },
  fire: { label: 'Fire Layer',  unit: 'fire count' },
  wind: { label: 'Wind Layer',  unit: 'm/s' },
  hcho: { label: 'HCHO Overlay',unit: '×10¹⁵' },
};

export default function AQIMap() {
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInst     = useRef<any>(null);
  const lgRef       = useRef<any>(null);
  const mMarkersRef = useRef<Record<string, any>>({});

  const { selectedCity, selectCity } = useCity();
  const [activeLayer, setActiveLayer] = useState<LayerKey>('aqi');
  const [histIdx, setHistIdx]         = useState(9);
  const [searchQ, setSearchQ]         = useState('');
  const [filterCat, setFilterCat]     = useState('All Categories');
  const [heatmap, setHeatmap]         = useState(false);
  const [showSearch, setShowSearch]   = useState(false);

  const filteredSearch = searchQ.trim().length > 0
    ? Object.keys(CITY_DB).filter(n => n.toLowerCase().includes(searchQ.toLowerCase()))
    : [];

  // ── Popup stylesheet injected once ────────────────────────────────────────
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `.leaflet-popup-content-wrapper{background:rgba(10,14,26,0.97)!important;border:1px solid rgba(99,179,237,0.25)!important;border-radius:12px!important;box-shadow:0 8px 32px rgba(0,0,0,0.6)!important;}.leaflet-popup-tip{background:rgba(10,14,26,0.97)!important;}.leaflet-popup-close-button{color:#8fa3c4!important;}`;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // ── Draw / redraw all markers ─────────────────────────────────────────────
  const drawMarkers = useCallback((L: any) => {
    if (!lgRef.current) return;
    lgRef.current.clearLayers();
    mMarkersRef.current = {};

    Object.entries(CITY_DB).forEach(([name, city]) => {
      if (filterCat !== 'All Categories' && aqiCat(city.aqi) !== filterCat) return;

      const hist      = name === 'New Delhi' ? DELHI_HIST[histIdx] : undefined;
      const col       = layerColor(city, activeLayer, hist?.aqi);
      const isSelected = name === selectedCity;
      const outerR    = heatmap ? 44 : (isSelected ? 20 : 15);
      const innerR    = isSelected ? 8 : 6;
      const outerOpa  = heatmap ? 0.55 : (isSelected ? 0.5 : 0.32);

      const outer = L.circleMarker([city.lat, city.lon], {
        radius: outerR, fillColor: col, color: isSelected ? '#fff' : col,
        weight: isSelected ? 3 : 2, opacity: 0.9, fillOpacity: outerOpa,
      });
      const inner = L.circleMarker([city.lat, city.lon], {
        radius: innerR, fillColor: col, color: '#fff',
        weight: isSelected ? 2.5 : 1.5, opacity: 1, fillOpacity: 1,
      });

      // Value label on top of marker for selected layer (non-AQI)
      if (activeLayer !== 'aqi') {
        const tooltip = L.tooltip({
          permanent: true, direction: 'top', className: 'leaflet-label-clean',
          offset: [0, -(outerR + 4)],
        }).setContent(`<span style="font-size:9px;color:${col};font-weight:700;font-family:'JetBrains Mono',monospace;text-shadow:0 0 6px rgba(0,0,0,0.9);">${layerValue(city, activeLayer, hist?.aqi)}</span>`);
        inner.bindTooltip(tooltip);
      }

      const popupHtml = buildPopup(name, city, hist);
      outer.bindPopup(popupHtml, { maxWidth: 260, className: 'aero-popup' });
      inner.bindPopup(popupHtml, { maxWidth: 260, className: 'aero-popup' });

      const onClick = () => { selectCity(name); };
      outer.on('click', onClick);
      inner.on('click', onClick);

      outer.addTo(lgRef.current);
      inner.addTo(lgRef.current);
      mMarkersRef.current[name] = inner;
    });
  }, [activeLayer, histIdx, filterCat, heatmap, selectedCity, selectCity]);

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInst.current) return;
    import('leaflet').then(L => {
      const map = L.map(mapRef.current!, { zoomControl: true, attributionControl: false });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CartoDB', maxZoom: 18,
      }).addTo(map);
      map.setView([20.5937, 78.9629], 5);
      lgRef.current = L.layerGroup().addTo(map);
      mapInst.current = map;
      drawMarkers(L);
    });
    return () => { mapInst.current?.remove(); mapInst.current = null; lgRef.current = null; };
  }, []);

  // ── Redraw when layer/hist/filter/heatmap/selection changes ──────────────
  useEffect(() => {
    if (!mapInst.current) return;
    import('leaflet').then(L => drawMarkers(L));
  }, [drawMarkers]);

  // ── Fly to selected city (when changed externally) ────────────────────────
  useEffect(() => {
    if (!mapInst.current || !selectedCity) return;
    const city = CITY_DB[selectedCity];
    if (!city) return;
    mapInst.current.flyTo([city.lat, city.lon], 8, { duration: 1.2 });
    setTimeout(() => {
      const m = mMarkersRef.current[selectedCity];
      if (m) m.openPopup();
    }, 1350);
  }, [selectedCity]);

  // ── City search select ────────────────────────────────────────────────────
  const selectFromSearch = (name: string) => {
    setSearchQ('');
    setShowSearch(false);
    const city = CITY_DB[name];
    if (!city || !mapInst.current) return;
    selectCity(name);
    mapInst.current.flyTo([city.lat, city.lon], 9, { duration: 1.2 });
    setTimeout(() => { mMarkersRef.current[name]?.openPopup(); }, 1350);
  };

  const insights = genInsights(selectedCity);

  return (
    <div style={{ animation: 'fadeIn .3s ease', padding: '1.5rem' }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700 }}>India AQI Map</h1>
          <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginTop: '.25rem' }}>
            State &amp; district-level air quality intelligence with historical playback — {selectedCity ? `📍 ${selectedCity}` : 'All India'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input
              placeholder="Search city…"
              value={searchQ}
              onChange={e => { setSearchQ(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 150)}
              style={{ padding: '.35rem .7rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '.8rem', outline: 'none', width: 170 }}
            />
            {showSearch && filteredSearch.length > 0 && (
              <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, zIndex: 2000, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                {filteredSearch.slice(0, 7).map(name => (
                  <div key={name} onMouseDown={() => selectFromSearch(name)} style={{ padding: '.45rem .75rem', fontSize: '.8rem', color: 'var(--text-primary)', cursor: 'pointer', borderBottom: '1px solid rgba(99,179,237,0.06)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(6,182,212,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    {name} <span style={{ color: 'var(--text-muted)', fontSize: '.72rem' }}>— {CITY_DB[name]?.state}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Category filter */}
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            style={{ padding: '.35rem .7rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '.8rem' }}>
            {['All Categories','Good','Satisfactory','Moderate','Poor','Very Poor','Severe'].map(c => <option key={c}>{c}</option>)}
          </select>
          {/* Heatmap toggle */}
          <button
            onClick={() => setHeatmap(h => !h)}
            style={{ padding: '.35rem .75rem', borderRadius: 6, fontSize: '.78rem', fontWeight: 500, cursor: 'pointer', border: `1px solid ${heatmap ? 'var(--accent-cyan)' : 'var(--border)'}`, background: heatmap ? 'rgba(6,182,212,0.15)' : 'var(--bg-glass)', color: heatmap ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>
            🌡 Heatmap
          </button>
        </div>
      </div>

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 230px', gap: '1rem' }}>
        {/* Left: map + slider */}
        <div>
          <div ref={mapRef} style={{ height: 540, borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }} />

          {/* Layer quick-select pills below map */}
          <div style={{ marginTop: '.65rem', display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
            {(Object.keys(LAYER_META) as LayerKey[]).map(k => (
              <button key={k} onClick={() => setActiveLayer(k)} style={{ padding: '.28rem .65rem', borderRadius: 20, fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', border: `1px solid ${activeLayer===k ? 'var(--accent-cyan)' : 'var(--border)'}`, background: activeLayer===k ? 'rgba(6,182,212,0.15)' : 'var(--bg-glass)', color: activeLayer===k ? 'var(--accent-cyan)' : 'var(--text-muted)', transition: 'all .15s' }}>
                {LAYER_META[k].label}
              </button>
            ))}
          </div>

          {/* Historical slider */}
          <div style={{ marginTop: '.65rem', display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap', padding: '.6rem .85rem', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <span style={{ fontSize: '.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>📅 Historical:</span>
            <input type="range" min={0} max={9} value={histIdx} onChange={e => setHistIdx(+e.target.value)} style={{ flex: 1, accentColor: 'var(--accent-cyan)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem', color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}>
              {HIST_DATES[histIdx]}, 2024
              {histIdx === 9 ? ' (latest)' : ''}
            </span>
            {histIdx < 9 && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: aqiColor(DELHI_HIST[histIdx].aqi) }}>
                Delhi: {DELHI_HIST[histIdx].aqi} AQI
              </span>
            )}
          </div>

          {/* Map insights */}
          <div style={{ marginTop: '.65rem', display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '.5rem', padding: '.45rem .75rem', background: 'var(--bg-glass)', borderLeft: `3px solid ${ins.c}`, borderRadius: 6, border: `1px solid ${ins.c}22` }}>
                <span style={{ fontSize: '.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  <span style={{ color: ins.c, fontWeight: 700 }}>▸</span> {ins.t}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: sidebar ────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
          {/* Layer controls */}
          <Card>
            <CardTitle>Layer Controls</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
              {(Object.keys(LAYER_META) as LayerKey[]).map(k => (
                <LayerItem key={k} label={LAYER_META[k].label} checked={activeLayer === k} onChange={() => setActiveLayer(k)} />
              ))}
            </div>
          </Card>

          {/* AQI Legend */}
          <Card>
            <CardTitle>AQI Legend</CardTitle>
            <AQILegend />
          </Card>

          {/* Top Polluted */}
          <Card>
            <CardTitle>🔴 Top Polluted</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
              {TOP_POLLUTED.map(([name, city], i) => (
                <div key={name} onClick={() => selectFromSearch(name)} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.32rem .5rem', borderRadius: 6, cursor: 'pointer', background: name === selectedCity ? 'rgba(6,182,212,0.08)' : 'transparent', border: name === selectedCity ? '1px solid rgba(6,182,212,0.2)' : '1px solid transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,179,237,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = name === selectedCity ? 'rgba(6,182,212,0.08)' : 'transparent')}>
                  <span style={{ fontSize: '.68rem', color: 'var(--text-muted)', width: 14 }}>{i+1}</span>
                  <span style={{ fontSize: '.77rem', color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.77rem', fontWeight: 700, color: aqiColor(city.aqi) }}>{city.aqi}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Clean */}
          <Card>
            <CardTitle>🟢 Top Clean</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
              {TOP_CLEAN.map(([name, city], i) => (
                <div key={name} onClick={() => selectFromSearch(name)} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.32rem .5rem', borderRadius: 6, cursor: 'pointer', background: name === selectedCity ? 'rgba(6,182,212,0.08)' : 'transparent', border: name === selectedCity ? '1px solid rgba(6,182,212,0.2)' : '1px solid transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,179,237,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = name === selectedCity ? 'rgba(6,182,212,0.08)' : 'transparent')}>
                  <span style={{ fontSize: '.68rem', color: 'var(--text-muted)', width: 14 }}>{i+1}</span>
                  <span style={{ fontSize: '.77rem', color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.77rem', fontWeight: 700, color: aqiColor(city.aqi) }}>{city.aqi}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Selected city quick stats */}
          {selectedCity && CITY_DB[selectedCity] && (() => {
            const c = CITY_DB[selectedCity];
            const col = aqiColor(c.aqi);
            return (
              <Card>
                <CardTitle>📍 {selectedCity}</CardTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.28rem' }}>
                  {[
                    ['AQI', `${c.aqi}`, col],
                    ['Category', aqiCat(c.aqi), col],
                    ['PM2.5', `${c.pm25} µg/m³`, 'var(--text-primary)'],
                    ['PM10', `${c.pm10} µg/m³`, 'var(--text-primary)'],
                    ['HCHO', `${c.hcho}×10¹⁵`, c.hcho > 10 ? '#ef4444' : '#22c55e'],
                    ['Fires', `${c.fire}`, c.fire > 50 ? '#ef4444' : '#22c55e'],
                    ['Wind', `${c.wind} m/s`, 'var(--text-primary)'],
                  ].map(([label, val, color]) => (
                    <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.75rem', fontWeight: 600, color: color as string }}>{val}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

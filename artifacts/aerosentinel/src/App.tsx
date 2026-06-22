import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import AQIMap from './pages/AQIMap';
import HCHOHotspots from './pages/HCHOHotspots';
import FireAnalysis from './pages/FireAnalysis';
import Transport from './pages/Transport';
import SatelliteData from './pages/SatelliteData';
import AIPrediction from './pages/AIPrediction';
import ModelPerformance from './pages/ModelPerformance';
import Export from './pages/Export';

type Tab = 'dashboard' | 'analytics' | 'aqimap' | 'hcho' | 'fire' | 'transport' | 'satellite' | 'predict' | 'model' | 'export';

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'aqimap', label: 'India AQI Map' },
  { id: 'hcho', label: 'HCHO Hotspots' },
  { id: 'fire', label: 'Fire Analysis' },
  { id: 'transport', label: 'Transport' },
  { id: 'satellite', label: 'Satellite Data' },
  { id: 'predict', label: 'AI Predict' },
  { id: 'model', label: 'Model Perf.' },
  { id: 'export', label: 'Export' },
];

export default function App() {
  const [active, setActive] = useState<Tab>('dashboard');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const pages: Record<Tab, JSX.Element> = {
    dashboard: <Dashboard />,
    analytics: <Analytics />,
    aqimap: <AQIMap />,
    hcho: <HCHOHotspots />,
    fire: <FireAnalysis />,
    transport: <Transport />,
    satellite: <SatelliteData />,
    predict: <AIPrediction />,
    model: <ModelPerformance />,
    export: <Export />,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'rgba(10,14,26,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)', padding: '0 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem', height: 60,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', fontFamily: 'var(--font-head)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-cyan))', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem' }}>🛰️</div>
          <div>AeroSentinel <span style={{ color: 'var(--accent-cyan)' }}>ISRO</span></div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '.15rem', flex: 1, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              style={{
                padding: '.4rem .7rem', borderRadius: 6, fontSize: '.78rem', fontWeight: 500, cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all .2s', border: 'none',
                color: active === t.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                background: active === t.id ? 'rgba(6,182,212,0.12)' : 'transparent',
                outline: active === t.id ? '1px solid rgba(6,182,212,0.25)' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexShrink: 0 }}>
          <button
            onClick={() => { setActive('dashboard'); showToast('Dashboard reset'); }}
            style={{ padding: '.35rem .7rem', borderRadius: 6, fontSize: '.75rem', fontWeight: 500, cursor: 'pointer', transition: 'all .2s', border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-secondary)' }}
          >↺ Reset</button>
          <button
            onClick={() => showToast('Data refreshed')}
            style={{ padding: '.35rem .7rem', borderRadius: 6, fontSize: '.75rem', fontWeight: 500, cursor: 'pointer', transition: 'all .2s', border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-secondary)' }}
          >⟳ Refresh</button>
          <div
            style={{ position: 'relative', width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-secondary)', fontSize: '.9rem' }}
            onClick={() => { setActive('dashboard'); }}
          >
            🔔
            <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, background: 'var(--verypoor)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ paddingTop: 60, position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 60px)' }}>
        {pages[active]}
      </main>

      {/* Global Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
          padding: '.7rem 1.1rem', borderRadius: 8, background: 'var(--bg-secondary)',
          border: '1px solid var(--border-bright)', fontSize: '.82rem', color: 'var(--text-primary)',
          backdropFilter: 'blur(12px)', animation: 'toastIn .3s ease', boxShadow: 'var(--shadow)',
          display: 'flex', alignItems: 'center', gap: '.5rem', minWidth: 220,
        }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { CityProvider } from './context/CityContext';

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

type Tab =
  | 'dashboard'
  | 'analytics'
  | 'aqimap'
  | 'hcho'
  | 'fire'
  | 'transport'
  | 'satellite'
  | 'predict'
  | 'model'
  | 'export';

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

  // ✅ FIX: NO JSX.Element typing (avoids red error)
  const pages = {
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
    <CityProvider>
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

        {/* NAVBAR */}
        <nav style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(10,14,26,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          height: 60,
        }}>

          {/* LOGO */}
          <div style={{
            fontWeight: 700,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '.5rem'
          }}>
            🛰️ AeroSentinel <span style={{ color: 'cyan' }}>ISRO</span>
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', flex: 1, gap: '.2rem', overflowX: 'auto' }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                style={{
                  padding: '.4rem .7rem',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '.78rem',
                  background: active === t.id ? 'rgba(6,182,212,0.2)' : 'transparent',
                  color: active === t.id ? 'cyan' : '#aaa',
                  whiteSpace: 'nowrap'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>

            {/* 🔥 TELEGRAM BUTTON */}
            <button
              onClick={() =>window.open("https://t.me/astromine7_bot?start=website", "_blank")}
              style={{
                padding: '.4rem .8rem',
                borderRadius: 6,
                fontSize: '.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid #229ED9',
                background: '#229ED9',
                color: 'white'
              }}
            >
              🤖 Telegram Bot
            </button>

            {/* RESET */}
            <button
              onClick={() => { setActive('dashboard'); showToast('Dashboard reset'); }}
              style={{
                padding: '.35rem .7rem',
                borderRadius: 6,
                fontSize: '.75rem',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: '#ccc',
                cursor: 'pointer'
              }}
            >
              ↺ Reset
            </button>

            {/* REFRESH */}
            <button
              onClick={() => showToast('Data refreshed')}
              style={{
                padding: '.35rem .7rem',
                borderRadius: 6,
                fontSize: '.75rem',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: '#ccc',
                cursor: 'pointer'
              }}
            >
              ⟳ Refresh
            </button>

            {/* NOTIFICATION */}
            <div style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border)',
              borderRadius: 6,
              cursor: 'pointer'
            }}>
              🔔
            </div>

          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main style={{ paddingTop: 60 }}>
          {pages[active as keyof typeof pages]}
        </main>

        {/* TOAST */}
        {toast && (
          <div style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            background: '#111',
            color: '#fff',
            padding: '.7rem 1rem',
            borderRadius: 8,
            fontSize: '.8rem'
          }}>
            ✓ {toast}
          </div>
        )}

      </div>
    </CityProvider>
  );
}
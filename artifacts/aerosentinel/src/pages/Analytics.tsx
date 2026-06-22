import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Legend } from 'recharts';
import { Card, CardTitle, LiveBadge, Pill } from '../components/Shared';
import { POLLUTED_CITIES, CLEAN_CITIES, aqiColor, aqiCat, aqiCatClass, randArr, rand } from '../data/constants';

const tt = { backgroundColor: 'rgba(15,22,46,0.95)', border: '1px solid rgba(99,179,237,0.3)', borderRadius: 8, color: '#e8eef8', fontSize: 12 };

const labels7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const data7d = labels7.map(d => ({ day: d, Delhi: Math.round(rand(120, 380)), Mumbai: Math.round(rand(40, 100)), Kolkata: Math.round(rand(100, 220)) }));
const dataMonthly = months.map(m => ({ month: m, aqi: Math.round(rand(60, 320)) }));
const dataMulti = labels7.map(d => ({ day: d, 'PM2.5': Math.round(rand(40, 180)), 'NO₂': Math.round(rand(20, 80)), 'O₃': Math.round(rand(30, 70)), 'SO₂': Math.round(rand(10, 40)) }));
const histData = [
  { range: '0–50', count: 12, color: '#22c55e' }, { range: '51–100', count: 28, color: '#84cc16' },
  { range: '101–150', count: 45, color: '#84cc16' }, { range: '151–200', count: 38, color: '#eab308' },
  { range: '201–250', count: 22, color: '#eab308' }, { range: '251–300', count: 18, color: '#f97316' },
  { range: '301–350', count: 14, color: '#ef4444' }, { range: '351–400', count: 9, color: '#ef4444' },
  { range: '400+', count: 4, color: '#a855f7' },
];
const scatterTemp = Array.from({ length: 30 }, () => ({ x: Math.round(rand(20, 45)), y: Math.round(rand(50, 380)) }));
const scatterHum = Array.from({ length: 30 }, () => ({ x: Math.round(rand(30, 90)), y: Math.round(rand(50, 380)) }));
const scatterWind = Array.from({ length: 30 }, () => ({ x: parseFloat(rand(0.5, 8).toFixed(1)), y: Math.round(rand(50, 380)) }));
const seasonData = [
  { season: 'Winter (DJF)', Delhi: 312, Mumbai: 68, Kolkata: 182 },
  { season: 'Pre-monsoon (MAM)', Delhi: 168, Mumbai: 82, Kolkata: 142 },
  { season: 'Monsoon (JJA)', Delhi: 84, Mumbai: 54, Kolkata: 68 },
  { season: 'Post-monsoon (SON)', Delhi: 248, Mumbai: 72, Kolkata: 184 },
];

export default function Analytics() {
  return (
    <div style={{ animation: 'fadeIn .3s ease', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700 }}>Analytics & Insights</h1>
          <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginTop: '.25rem' }}>Comprehensive AQI trends, pollutant correlations, and city comparisons</p>
        </div>
        <LiveBadge />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <Card>
          <CardTitle>7-Day AQI Trend</CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data7d}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <YAxis tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Legend wrapperStyle={{ color: '#8fa3c4', fontSize: 11 }} />
                <Line type="monotone" dataKey="Delhi" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Mumbai" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Kolkata" stroke="#eab308" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle>Monthly AQI Trend</CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <YAxis tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Line type="monotone" dataKey="aqi" stroke="#06b6d4" strokeWidth={2} dot={false} fill="rgba(6,182,212,0.08)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <Card>
          <CardTitle>Pollutant Comparison (Multi-line)</CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataMulti}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <YAxis tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Legend wrapperStyle={{ color: '#8fa3c4', fontSize: 11 }} />
                <Line type="monotone" dataKey="PM2.5" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="NO₂" stroke="#eab308" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="O₃" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="SO₂" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle>AQI Distribution Histogram</CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="range" tick={{ fill: '#8fa3c4', fontSize: 9 }} />
                <YAxis tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {histData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <Card>
          <CardTitle>AQI vs Temperature</CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="x" name="Temp (°C)" tick={{ fill: '#8fa3c4', fontSize: 10 }} label={{ value: 'Temp (°C)', fill: '#8fa3c4', fontSize: 10, position: 'insideBottom', offset: -3 }} />
                <YAxis dataKey="y" name="AQI" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={tt} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={scatterTemp} fill="rgba(249,115,22,0.6)" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle>AQI vs Humidity</CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="x" name="Humidity (%)" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <YAxis dataKey="y" name="AQI" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={tt} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={scatterHum} fill="rgba(59,130,246,0.6)" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle>AQI vs Wind Speed</CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="x" name="Wind (m/s)" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <YAxis dataKey="y" name="AQI" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={tt} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={scatterWind} fill="rgba(6,182,212,0.6)" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <Card>
          <CardTitle>Top 10 Most Polluted Cities</CardTitle>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
            <thead>
              <tr>{['#', 'City', 'AQI', 'Status', 'PM2.5'].map(h => <th key={h} style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)', padding: '.6rem .75rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {POLLUTED_CITIES.map((c, i) => (
                <tr key={c.city} style={{ borderBottom: '1px solid rgba(99,179,237,0.06)' }}>
                  <td style={{ padding: '.6rem .75rem', color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td style={{ padding: '.6rem .75rem', color: 'var(--text-primary)' }}>{c.city}</td>
                  <td style={{ padding: '.6rem .75rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: aqiColor(c.aqi) }}>{c.aqi}</td>
                  <td style={{ padding: '.6rem .75rem' }}><Pill status={c.status}>{aqiCat(c.aqi)}</Pill></td>
                  <td style={{ padding: '.6rem .75rem', color: 'var(--text-primary)' }}>{c.pm25}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <CardTitle>Top 10 Cleanest Cities</CardTitle>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
            <thead>
              <tr>{['#', 'City', 'AQI', 'Status', 'PM2.5'].map(h => <th key={h} style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)', padding: '.6rem .75rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {CLEAN_CITIES.map((c, i) => (
                <tr key={c.city} style={{ borderBottom: '1px solid rgba(99,179,237,0.06)' }}>
                  <td style={{ padding: '.6rem .75rem', color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td style={{ padding: '.6rem .75rem', color: 'var(--text-primary)' }}>{c.city}</td>
                  <td style={{ padding: '.6rem .75rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: aqiColor(c.aqi) }}>{c.aqi}</td>
                  <td style={{ padding: '.6rem .75rem' }}><Pill status={c.status}>{aqiCat(c.aqi)}</Pill></td>
                  <td style={{ padding: '.6rem .75rem', color: 'var(--text-primary)' }}>{c.pm25}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card>
        <CardTitle>Seasonal AQI Analysis</CardTitle>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={seasonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="season" tick={{ fill: '#8fa3c4', fontSize: 10 }} />
              <YAxis tick={{ fill: '#8fa3c4', fontSize: 10 }} />
              <Tooltip contentStyle={tt} />
              <Legend wrapperStyle={{ color: '#8fa3c4', fontSize: 11 }} />
              <Bar dataKey="Delhi" fill="rgba(239,68,68,0.7)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Mumbai" fill="rgba(34,197,94,0.7)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Kolkata" fill="rgba(234,179,8,0.7)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

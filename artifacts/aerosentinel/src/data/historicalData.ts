// ── Historical AQI data module ────────────────────────────────────────────────
// Real data: embedded from master_dataset.csv (Nov 1-10, 2024).
// Synthetic data: computed from seasonal multipliers for 2022-2024
// covering the 15th of every month not in the real dataset.

export interface CitySnapshot {
  city: string;      // CITY_DB key (e.g. 'New Delhi')
  date: string;      // YYYY-MM-DD
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  hcho: number;
  fire: number;
  temp: number;
  humidity: number;
  wind: number;
  isReal: boolean;
}

// ── CSV → CITY_DB name map ────────────────────────────────────────────────────
const CSV_TO_DB: Record<string, string> = {
  Delhi: 'New Delhi', Ghaziabad: 'Ghaziabad', Mumbai: 'Mumbai',
  Ahmedabad: 'Ahmedabad', Surat: 'Surat', Pune: 'Pune',
  Lucknow: 'Lucknow', Chandigarh: 'Chandigarh', Kolkata: 'Kolkata',
  Chennai: 'Chennai', Bengaluru: 'Bengaluru', Hyderabad: 'Hyderabad',
  Jaipur: 'Jaipur', Amritsar: 'Amritsar', Bhopal: 'Bhopal',
  Nagpur: 'Nagpur', Patna: 'Patna', Visakhapatnam: 'Visakhapatnam',
};
const DB_TO_CSV: Record<string, string> = Object.fromEntries(
  Object.entries(CSV_TO_DB).map(([k, v]) => [v, k])
);

// ── Real CSV rows (all 30 rows from master_dataset.csv) ──────────────────────
interface RawRow { date:string; city:string; pm25:number; pm10:number; aqi:number; temp:number; humidity:number; wind:number; no2:number; so2:number; co:number; o3:number; hcho:number; fire:number }

const CSV_ROWS: RawRow[] = [
  { date:'2024-11-01', city:'Delhi',       pm25:178, pm10:302, aqi:374, temp:31, humidity:63, wind:2.2, no2:58, so2:26, co:3.1, o3:68, hcho:17.8, fire:138 },
  { date:'2024-11-01', city:'Ghaziabad',   pm25:152, pm10:274, aqi:341, temp:30, humidity:65, wind:2.4, no2:52, so2:22, co:2.7, o3:64, hcho:13.8, fire:94  },
  { date:'2024-11-01', city:'Mumbai',      pm25:26,  pm10:50,  aqi:68,  temp:27, humidity:79, wind:6.4, no2:16, so2:7,  co:0.7, o3:32, hcho:2.2,  fire:3   },
  { date:'2024-11-01', city:'Ahmedabad',   pm25:60,  pm10:114, aqi:138, temp:35, humidity:49, wind:4.4, no2:32, so2:17, co:1.3, o3:50, hcho:4.6,  fire:10  },
  { date:'2024-11-01', city:'Surat',       pm25:46,  pm10:88,  aqi:112, temp:33, humidity:63, wind:4.9, no2:26, so2:13, co:1.0, o3:42, hcho:3.4,  fire:7   },
  { date:'2024-11-01', city:'Pune',        pm25:32,  pm10:64,  aqi:84,  temp:27, humidity:66, wind:5.4, no2:20, so2:9,  co:0.8, o3:36, hcho:2.6,  fire:2   },
  { date:'2024-11-01', city:'Lucknow',     pm25:108, pm10:198, aqi:262, temp:33, humidity:69, wind:2.9, no2:46, so2:21, co:2.1, o3:60, hcho:10.2, fire:66  },
  { date:'2024-11-01', city:'Chandigarh',  pm25:94,  pm10:182, aqi:238, temp:29, humidity:61, wind:3.3, no2:42, so2:19, co:1.9, o3:56, hcho:8.6,  fire:52  },
  { date:'2024-11-01', city:'Kolkata',     pm25:76,  pm10:138, aqi:181, temp:29, humidity:73, wind:4.2, no2:36, so2:13, co:1.0, o3:46, hcho:5.8,  fire:22  },
  { date:'2024-11-01', city:'Chennai',     pm25:22,  pm10:44,  aqi:62,  temp:33, humidity:81, wind:5.9, no2:14, so2:6,  co:0.6, o3:30, hcho:1.9,  fire:1   },
  { date:'2024-11-02', city:'Delhi',       pm25:182, pm10:308, aqi:380, temp:32, humidity:62, wind:2.1, no2:60, so2:27, co:3.2, o3:70, hcho:18.1, fire:142 },
  { date:'2024-11-02', city:'Ghaziabad',   pm25:155, pm10:278, aqi:344, temp:31, humidity:64, wind:2.3, no2:54, so2:23, co:2.8, o3:65, hcho:14.1, fire:98  },
  { date:'2024-11-02', city:'Mumbai',      pm25:28,  pm10:52,  aqi:72,  temp:28, humidity:78, wind:6.2, no2:17, so2:8,  co:0.8, o3:33, hcho:2.3,  fire:4   },
  { date:'2024-11-02', city:'Ahmedabad',   pm25:62,  pm10:118, aqi:142, temp:36, humidity:48, wind:4.2, no2:33, so2:18, co:1.4, o3:51, hcho:4.8,  fire:12  },
  { date:'2024-11-02', city:'Lucknow',     pm25:112, pm10:202, aqi:268, temp:34, humidity:68, wind:2.8, no2:47, so2:22, co:2.2, o3:61, hcho:10.4, fire:68  },
  { date:'2024-11-03', city:'Delhi',       pm25:186, pm10:314, aqi:387, temp:32, humidity:61, wind:2.0, no2:62, so2:28, co:3.2, o3:72, hcho:18.4, fire:142 },
  { date:'2024-11-03', city:'Mumbai',      pm25:27,  pm10:51,  aqi:70,  temp:28, humidity:78, wind:6.3, no2:17, so2:7,  co:0.8, o3:32, hcho:2.2,  fire:3   },
  { date:'2024-11-03', city:'Chandigarh',  pm25:98,  pm10:188, aqi:246, temp:30, humidity:60, wind:3.2, no2:44, so2:20, co:2.0, o3:57, hcho:8.8,  fire:54  },
  { date:'2024-11-04', city:'Delhi',       pm25:174, pm10:296, aqi:364, temp:31, humidity:64, wind:2.3, no2:57, so2:25, co:3.0, o3:67, hcho:17.2, fire:132 },
  { date:'2024-11-04', city:'Kolkata',     pm25:78,  pm10:142, aqi:184, temp:30, humidity:72, wind:4.1, no2:37, so2:14, co:1.1, o3:47, hcho:6.0,  fire:24  },
  { date:'2024-11-05', city:'Delhi',       pm25:168, pm10:286, aqi:348, temp:30, humidity:65, wind:2.4, no2:55, so2:24, co:2.9, o3:65, hcho:16.8, fire:124 },
  { date:'2024-11-05', city:'Bengaluru',   pm25:30,  pm10:62,  aqi:80,  temp:25, humidity:66, wind:5.4, no2:20, so2:9,  co:0.8, o3:36, hcho:2.6,  fire:2   },
  { date:'2024-11-06', city:'Delhi',       pm25:172, pm10:294, aqi:358, temp:31, humidity:63, wind:2.2, no2:56, so2:25, co:3.0, o3:66, hcho:17.0, fire:128 },
  { date:'2024-11-06', city:'Hyderabad',   pm25:36,  pm10:72,  aqi:94,  temp:31, humidity:59, wind:4.7, no2:22, so2:10, co:0.9, o3:40, hcho:3.2,  fire:5   },
  { date:'2024-11-07', city:'Delhi',       pm25:179, pm10:305, aqi:376, temp:32, humidity:62, wind:2.1, no2:59, so2:26, co:3.1, o3:69, hcho:17.9, fire:138 },
  { date:'2024-11-07', city:'Chennai',     pm25:23,  pm10:45,  aqi:64,  temp:34, humidity:80, wind:5.8, no2:15, so2:6,  co:0.6, o3:31, hcho:2.0,  fire:2   },
  { date:'2024-11-08', city:'Delhi',       pm25:185, pm10:311, aqi:384, temp:32, humidity:61, wind:2.0, no2:61, so2:28, co:3.2, o3:71, hcho:18.3, fire:140 },
  { date:'2024-11-08', city:'Ahmedabad',   pm25:63,  pm10:120, aqi:144, temp:36, humidity:47, wind:4.1, no2:34, so2:18, co:1.4, o3:52, hcho:4.9,  fire:12  },
  { date:'2024-11-09', city:'Delhi',       pm25:175, pm10:298, aqi:366, temp:31, humidity:63, wind:2.2, no2:57, so2:25, co:3.0, o3:68, hcho:17.4, fire:134 },
  { date:'2024-11-10', city:'Delhi',       pm25:171, pm10:292, aqi:354, temp:30, humidity:64, wind:2.3, no2:55, so2:24, co:2.9, o3:66, hcho:16.9, fire:126 },
];

// ── Base city values (Nov 10 baseline = index 9) ──────────────────────────────
// Used for cities not in CSV for a given date.
const CITY_BASES: Record<string, Omit<CitySnapshot,'city'|'date'|'isReal'>> = {
  'New Delhi':     { aqi:354, pm25:171, pm10:292, no2:55, so2:24, co:2.9, o3:66, hcho:16.9, fire:126, temp:30, humidity:64, wind:2.3 },
  'Ghaziabad':     { aqi:320, pm25:145, pm10:262, no2:50, so2:20, co:2.5, o3:62, hcho:12.8, fire:88,  temp:30, humidity:65, wind:2.4 },
  'Mumbai':        { aqi:102, pm25:28,  pm10:52,  no2:18, so2:8,  co:0.8, o3:34, hcho:2.4,  fire:4,   temp:28, humidity:78, wind:6.2 },
  'Ahmedabad':     { aqi:167, pm25:64,  pm10:121, no2:34, so2:18, co:1.4, o3:52, hcho:4.9,  fire:13,  temp:36, humidity:47, wind:4.1 },
  'Surat':         { aqi:132, pm25:48,  pm10:91,  no2:28, so2:14, co:1.1, o3:44, hcho:3.6,  fire:8,   temp:33, humidity:62, wind:4.8 },
  'Pune':          { aqi:97,  pm25:34,  pm10:67,  no2:22, so2:10, co:0.9, o3:38, hcho:2.8,  fire:3,   temp:27, humidity:65, wind:5.2 },
  'Lucknow':       { aqi:274, pm25:114, pm10:206, no2:48, so2:22, co:2.2, o3:62, hcho:10.6, fire:70,  temp:34, humidity:68, wind:2.8 },
  'Chandigarh':    { aqi:256, pm25:100, pm10:191, no2:44, so2:20, co:2.0, o3:58, hcho:9.0,  fire:55,  temp:30, humidity:60, wind:3.2 },
  'Kolkata':       { aqi:192, pm25:80,  pm10:144, no2:38, so2:14, co:1.1, o3:48, hcho:6.2,  fire:24,  temp:30, humidity:72, wind:4.1 },
  'Chennai':       { aqi:74,  pm25:24,  pm10:46,  no2:15, so2:6,  co:0.6, o3:31, hcho:2.0,  fire:2,   temp:34, humidity:80, wind:5.8 },
  'Bengaluru':     { aqi:88,  pm25:32,  pm10:64,  no2:21, so2:9,  co:0.8, o3:37, hcho:2.7,  fire:2,   temp:25, humidity:66, wind:5.4 },
  'Hyderabad':     { aqi:102, pm25:36,  pm10:72,  no2:22, so2:10, co:0.9, o3:40, hcho:3.2,  fire:5,   temp:31, humidity:59, wind:4.7 },
  'Jaipur':        { aqi:218, pm25:92,  pm10:168, no2:40, so2:18, co:1.8, o3:54, hcho:7.8,  fire:44,  temp:33, humidity:52, wind:3.4 },
  'Amritsar':      { aqi:244, pm25:104, pm10:188, no2:44, so2:20, co:2.0, o3:58, hcho:9.2,  fire:58,  temp:28, humidity:63, wind:3.0 },
  'Bhopal':        { aqi:184, pm25:76,  pm10:138, no2:36, so2:16, co:1.5, o3:50, hcho:6.4,  fire:32,  temp:32, humidity:58, wind:3.6 },
  'Nagpur':        { aqi:148, pm25:58,  pm10:108, no2:28, so2:13, co:1.2, o3:44, hcho:4.6,  fire:18,  temp:32, humidity:56, wind:4.0 },
  'Patna':         { aqi:266, pm25:108, pm10:198, no2:46, so2:21, co:2.1, o3:60, hcho:9.8,  fire:62,  temp:30, humidity:68, wind:2.8 },
  'Visakhapatnam': { aqi:84,  pm25:28,  pm10:54,  no2:16, so2:7,  co:0.7, o3:32, hcho:2.2,  fire:2,   temp:29, humidity:76, wind:5.6 },
};

// ── Seasonal multipliers [0=Jan … 11=Dec] ─────────────────────────────────────
const NORTH_S = [1.38,1.28,1.12,1.06,1.16,0.72,0.62,0.64,0.71,1.08,1.22,1.34];
const SOUTH_S = [1.12,1.06,1.00,1.04,1.10,0.82,0.76,0.76,0.82,0.96,1.00,1.08];
const WEST_S  = [1.24,1.16,1.06,1.05,1.12,0.76,0.66,0.68,0.74,1.02,1.12,1.20];

const NORTH_SET = new Set(['New Delhi','Ghaziabad','Lucknow','Chandigarh','Amritsar','Jaipur','Patna','Bhopal']);
const SOUTH_SET = new Set(['Chennai','Bengaluru','Hyderabad','Visakhapatnam']);

function seasonalMult(cityName: string, month: number): number {
  const arr = NORTH_SET.has(cityName) ? NORTH_S : SOUTH_SET.has(cityName) ? SOUTH_S : WEST_S;
  return arr[month - 1];
}

// Year-over-year trend: 2022 slightly cleaner than 2024 baseline
const YEAR_MULT: Record<number, number> = { 2022: 0.92, 2023: 0.96, 2024: 1.00 };

// ── Available date index ──────────────────────────────────────────────────────
// Structure: year → month → day[]
const _INDEX: Record<number, Record<number, number[]>> = {};

function addDate(y: number, m: number, d: number) {
  if (!_INDEX[y]) _INDEX[y] = {};
  if (!_INDEX[y][m]) _INDEX[y][m] = [];
  if (!_INDEX[y][m].includes(d)) _INDEX[y][m].push(d);
}

// 2022 & 2023: 15th of every month
for (const yr of [2022, 2023]) {
  for (let mo = 1; mo <= 12; mo++) addDate(yr, mo, 15);
}
// 2024: 15th of Jan-Oct, then Nov 1-10 (from CSV)
for (let mo = 1; mo <= 10; mo++) addDate(2024, mo, 15);
for (let d = 1; d <= 10; d++) addDate(2024, 11, d);

// Sort days
for (const yr of Object.keys(_INDEX).map(Number)) {
  for (const mo of Object.keys(_INDEX[yr]).map(Number)) {
    _INDEX[yr][mo].sort((a, b) => a - b);
  }
}

// ── Public date navigation helpers ────────────────────────────────────────────
export function getAvailableYears(): number[] {
  return Object.keys(_INDEX).map(Number).sort();
}

export function getAvailableMonths(year: number): number[] {
  return Object.keys(_INDEX[year] ?? {}).map(Number).sort((a,b) => a-b);
}

export function getAvailableDays(year: number, month: number): number[] {
  return _INDEX[year]?.[month] ?? [];
}

export function getLatestDate(): { year: number; month: number; day: number } {
  return { year: 2024, month: 11, day: 10 };
}

const MONTH_NAMES = ['','January','February','March','April','May','June','July','August','September','October','November','December'];
export function monthName(m: number) { return MONTH_NAMES[m] ?? ''; }

// ── Snapshot computation ──────────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, '0'); }

function synthSnap(cityName: string, year: number, month: number, day: number): CitySnapshot {
  const base = CITY_BASES[cityName];
  const sm   = seasonalMult(cityName, month);
  const ym   = YEAR_MULT[year] ?? 1;
  // small day-of-month ripple to avoid all "15th" values being identical
  const dm   = 1 + (day - 15) * 0.004;
  const m    = sm * ym * dm;
  return {
    city: cityName, date: `${year}-${pad(month)}-${pad(day)}`,
    isReal: false,
    aqi:      Math.round(base.aqi      * m),
    pm25:     Math.round(base.pm25     * m),
    pm10:     Math.round(base.pm10     * m),
    no2:      Math.round(base.no2      * m),
    so2:      Math.round(base.so2      * m),
    co:       parseFloat((base.co      * m).toFixed(1)),
    o3:       Math.round(base.o3       * m),
    hcho:     parseFloat((base.hcho    * m).toFixed(1)),
    fire:     Math.round(base.fire     * m),
    temp:     Math.round(base.temp     + (month <= 2 || month === 12 ? -4 : month >= 6 && month <= 9 ? 2 : 0)),
    humidity: Math.round(base.humidity + (month >= 6 && month <= 9 ? 18 : month <= 2 || month === 12 ? -8 : 0)),
    wind:     parseFloat((base.wind    * (month >= 6 && month <= 9 ? 1.3 : month <= 2 ? 0.8 : 1.0)).toFixed(1)),
  };
}

/** Get snapshot for one city on one date. */
export function getCitySnapshot(year: number, month: number, day: number, cityName: string): CitySnapshot {
  const dateStr = `${year}-${pad(month)}-${pad(day)}`;
  const csvCity = DB_TO_CSV[cityName];
  if (csvCity) {
    const row = CSV_ROWS.find(r => r.date === dateStr && r.city === csvCity);
    if (row) return {
      city: cityName, date: dateStr, isReal: true,
      aqi: row.aqi, pm25: row.pm25, pm10: row.pm10,
      no2: row.no2, so2: row.so2, co: row.co, o3: row.o3,
      hcho: row.hcho, fire: row.fire, temp: row.temp, humidity: row.humidity, wind: row.wind,
    };
  }
  return synthSnap(cityName, year, month, day);
}

/** Get snapshots for all 18 cities on one date. */
export function getAllCitiesSnapshot(year: number, month: number, day: number): CitySnapshot[] {
  return Object.keys(CITY_BASES).map(city => getCitySnapshot(year, month, day, city));
}

/** India average AQI for a date. */
export function getIndiaAvg(year: number, month: number, day: number): number {
  const snaps = getAllCitiesSnapshot(year, month, day);
  return Math.round(snaps.reduce((s, c) => s + c.aqi, 0) / snaps.length);
}

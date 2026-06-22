export const AQI_SCALE = [
  { label: 'Good', range: '0–50', color: '#22c55e' },
  { label: 'Satisfactory', range: '51–100', color: '#84cc16' },
  { label: 'Moderate', range: '101–200', color: '#eab308' },
  { label: 'Poor', range: '201–300', color: '#f97316' },
  { label: 'Very Poor', range: '301–400', color: '#ef4444' },
  { label: 'Severe', range: '401+', color: '#a855f7' },
];

export const aqiColor = (v: number) =>
  v <= 50 ? '#22c55e' : v <= 100 ? '#84cc16' : v <= 200 ? '#eab308' : v <= 300 ? '#f97316' : v <= 400 ? '#ef4444' : '#a855f7';

export const aqiCat = (v: number) =>
  v <= 50 ? 'Good' : v <= 100 ? 'Satisfactory' : v <= 200 ? 'Moderate' : v <= 300 ? 'Poor' : v <= 400 ? 'Very Poor' : 'Severe';

export const aqiCatClass = (v: number) =>
  v <= 50 ? 'good' : v <= 100 ? 'satisfactory' : v <= 200 ? 'moderate' : v <= 300 ? 'poor' : v <= 400 ? 'verypoor' : 'severe';

export const rand = (a: number, b: number) => Math.random() * (b - a) + a;
export const randArr = (n: number, a: number, b: number) =>
  Array.from({ length: n }, () => Math.round(rand(a, b)));

export const METRICS = [
  { name: 'PM2.5', val: 68.4, unit: 'µg/m³', status: 'poor', trend: '+4.2%', up: true },
  { name: 'PM10', val: 112.7, unit: 'µg/m³', status: 'verypoor', trend: '+8.1%', up: true },
  { name: 'NO₂', val: 42.3, unit: 'ppb', status: 'moderate', trend: '-2.1%', up: false },
  { name: 'SO₂', val: 18.6, unit: 'ppb', status: 'good', trend: '-5.4%', up: false },
  { name: 'O₃', val: 54.2, unit: 'ppb', status: 'moderate', trend: '+1.8%', up: true },
  { name: 'CO', val: 1.24, unit: 'mg/m³', status: 'good', trend: '-0.3%', up: false },
  { name: 'Temperature', val: 32.4, unit: '°C', status: 'good', trend: '', up: false },
  { name: 'Humidity', val: 61, unit: '%', status: 'good', trend: '', up: false },
  { name: 'Wind Speed', val: 3.8, unit: 'm/s', status: 'good', trend: '', up: false },
];

export const ALERTS = [
  { msg: 'Very Poor AQI detected in Delhi NCR — 387 AQI', sev: 'red', time: '10 min ago' },
  { msg: 'HCHO Hotspot detected over Punjab — 16.2×10¹⁵', sev: 'red', time: '32 min ago' },
  { msg: 'Extreme fire activity: 48 active fires in Haryana', sev: 'orange', time: '1 hr ago' },
  { msg: 'Pollution transport: Punjab → Delhi corridor active', sev: 'orange', time: '2 hr ago' },
  { msg: 'Air quality improved in Mumbai — 62 AQI', sev: 'green', time: '3 hr ago' },
];

export const HCHO_HOTSPOTS = [
  { region: 'Amritsar', state: 'Punjab', hcho: 18.4, fire: 142, aqi: 387, trend: '↑' },
  { region: 'Ludhiana', state: 'Punjab', hcho: 16.2, fire: 118, aqi: 342, trend: '↑' },
  { region: 'Karnal', state: 'Haryana', hcho: 15.8, fire: 97, aqi: 318, trend: '↑' },
  { region: 'Panipat', state: 'Haryana', hcho: 14.4, fire: 84, aqi: 298, trend: '→' },
  { region: 'Bareilly', state: 'UP', hcho: 12.1, fire: 67, aqi: 252, trend: '↓' },
  { region: 'Jorhat', state: 'Assam', hcho: 11.8, fire: 203, aqi: 189, trend: '↑' },
  { region: 'Dibrugarh', state: 'Assam', hcho: 10.4, fire: 178, aqi: 174, trend: '↑' },
  { region: 'Raipur', state: 'Chhattisgarh', hcho: 9.2, fire: 89, aqi: 156, trend: '→' },
];

export const STATE_FIRES = [
  { state: 'Punjab', fires: 142, trend: '↑' },
  { state: 'Haryana', fires: 97, trend: '↑' },
  { state: 'UP', fires: 67, trend: '→' },
  { state: 'Assam', fires: 203, trend: '↑' },
  { state: 'Chhattisgarh', fires: 89, trend: '↓' },
  { state: 'Odisha', fires: 74, trend: '↓' },
  { state: 'MP', fires: 61, trend: '→' },
  { state: 'Jharkhand', fires: 48, trend: '↑' },
];

export const POLLUTED_CITIES = [
  { city: 'Delhi', aqi: 387, status: 'severe', pm25: 182 },
  { city: 'Ghaziabad', aqi: 342, status: 'verypoor', pm25: 156 },
  { city: 'Faridabad', aqi: 318, status: 'verypoor', pm25: 142 },
  { city: 'Noida', aqi: 304, status: 'verypoor', pm25: 138 },
  { city: 'Gurugram', aqi: 298, status: 'poor', pm25: 124 },
  { city: 'Kanpur', aqi: 287, status: 'poor', pm25: 118 },
  { city: 'Lucknow', aqi: 274, status: 'poor', pm25: 112 },
  { city: 'Agra', aqi: 262, status: 'poor', pm25: 104 },
  { city: 'Patna', aqi: 248, status: 'poor', pm25: 98 },
  { city: 'Varanasi', aqi: 234, status: 'poor', pm25: 92 },
];

export const CLEAN_CITIES = [
  { city: 'Port Blair', aqi: 28, status: 'good', pm25: 8 },
  { city: 'Shillong', aqi: 32, status: 'good', pm25: 10 },
  { city: 'Mizoram', aqi: 38, status: 'good', pm25: 12 },
  { city: 'Gangtok', aqi: 41, status: 'good', pm25: 14 },
  { city: 'Mysuru', aqi: 48, status: 'good', pm25: 16 },
  { city: 'Coimbatore', aqi: 52, status: 'satisfactory', pm25: 18 },
  { city: 'Thiruvananthapuram', aqi: 56, status: 'satisfactory', pm25: 20 },
  { city: 'Mangaluru', aqi: 61, status: 'satisfactory', pm25: 22 },
  { city: 'Visakhapatnam', aqi: 67, status: 'satisfactory', pm25: 24 },
  { city: 'Bhubaneswar', aqi: 72, status: 'satisfactory', pm25: 26 },
];

export const INDIA_LOCATIONS = [
  { name: 'New Delhi', state: 'Delhi', lat: 28.6139, lon: 77.2090, aqi: 387, cat: 'severe', pm25: 182, pm10: 312, temp: 32 },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, aqi: 72, cat: 'satisfactory', pm25: 28, pm10: 52, temp: 28 },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, aqi: 68, cat: 'satisfactory', pm25: 24, pm10: 48, temp: 34 },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, aqi: 184, cat: 'poor', pm25: 78, pm10: 142, temp: 30 },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, aqi: 84, cat: 'satisfactory', pm25: 32, pm10: 64, temp: 26 },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, aqi: 96, cat: 'satisfactory', pm25: 38, pm10: 74, temp: 32 },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714, aqi: 142, cat: 'moderate', pm25: 62, pm10: 118, temp: 36 },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, aqi: 88, cat: 'satisfactory', pm25: 34, pm10: 68, temp: 28 },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, aqi: 164, cat: 'moderate', pm25: 72, pm10: 138, temp: 38 },
  { name: 'Lucknow', state: 'UP', lat: 26.8467, lon: 80.9462, aqi: 274, cat: 'poor', pm25: 112, pm10: 204, temp: 34 },
  { name: 'Chandigarh', state: 'Punjab', lat: 30.7333, lon: 76.7794, aqi: 246, cat: 'poor', pm25: 98, pm10: 188, temp: 30 },
  { name: 'Amritsar', state: 'Punjab', lat: 31.6340, lon: 74.8723, aqi: 342, cat: 'verypoor', pm25: 156, pm10: 288, temp: 28 },
];

export const POLL_INPUTS = [
  { key: 'pm25', label: 'PM2.5', min: 0, max: 500, val: 68, unit: 'µg/m³', step: 1 },
  { key: 'pm10', label: 'PM10', min: 0, max: 600, val: 113, unit: 'µg/m³', step: 1 },
  { key: 'no2', label: 'NO₂', min: 0, max: 200, val: 42, unit: 'ppb', step: 1 },
  { key: 'so2', label: 'SO₂', min: 0, max: 100, val: 19, unit: 'ppb', step: 1 },
  { key: 'o3', label: 'O₃', min: 0, max: 200, val: 54, unit: 'ppb', step: 1 },
  { key: 'co', label: 'CO', min: 0, max: 10, val: 1.2, unit: 'mg/m³', step: 0.1 },
];

export const MET_INPUTS = [
  { key: 'temp', label: 'Temperature', min: -10, max: 50, val: 32, unit: '°C', step: 1 },
  { key: 'hum', label: 'Humidity', min: 0, max: 100, val: 61, unit: '%', step: 1 },
  { key: 'wind', label: 'Wind Speed', min: 0, max: 20, val: 3.8, unit: 'm/s', step: 0.1 },
];

export const PRESETS: Record<string, Record<string, number>> = {
  good: { pm25: 15, pm10: 30, no2: 15, so2: 5, o3: 30, co: 0.5, temp: 25, hum: 45, wind: 5 },
  moderate: { pm25: 65, pm10: 110, no2: 40, so2: 18, o3: 55, co: 1.2, temp: 32, hum: 60, wind: 3.5 },
  unhealthy: { pm25: 140, pm10: 240, no2: 80, so2: 40, o3: 90, co: 3.0, temp: 35, hum: 70, wind: 1.5 },
  hazardous: { pm25: 280, pm10: 420, no2: 150, so2: 80, o3: 140, co: 6.0, temp: 38, hum: 80, wind: 0.5 },
};

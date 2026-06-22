import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type CityData = {
  city: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  o3: number;
  co: number;
  temp: number;
  humidity: number;
  wind: number;
  hcho: number;
  fire: number;
};

export const CITY_DB: Record<string, CityData> = {
  'New Delhi':    { city: 'New Delhi',    state: 'Delhi',         country: 'India', lat: 28.6139, lon: 77.2090, aqi: 387, pm25: 182, pm10: 312, no2: 68, so2: 28, o3: 72,  co: 3.2, temp: 32, humidity: 62, wind: 2.1, hcho: 18.4, fire: 142 },
  'Mumbai':       { city: 'Mumbai',       state: 'Maharashtra',   country: 'India', lat: 19.0760, lon: 72.8777, aqi: 72,  pm25: 28,  pm10: 52,  no2: 18, so2: 8,  o3: 38,  co: 0.8, temp: 28, humidity: 78, wind: 5.2, hcho: 2.1,  fire: 3   },
  'Ahmedabad':    { city: 'Ahmedabad',    state: 'Gujarat',       country: 'India', lat: 23.0225, lon: 72.5714, aqi: 142, pm25: 62,  pm10: 118, no2: 34, so2: 18, o3: 52,  co: 1.4, temp: 36, humidity: 48, wind: 4.2, hcho: 4.8,  fire: 12  },
  'Surat':        { city: 'Surat',        state: 'Gujarat',       country: 'India', lat: 21.1702, lon: 72.8311, aqi: 108, pm25: 48,  pm10: 92,  no2: 28, so2: 14, o3: 44,  co: 1.1, temp: 34, humidity: 62, wind: 4.8, hcho: 3.6,  fire: 8   },
  'Pune':         { city: 'Pune',         state: 'Maharashtra',   country: 'India', lat: 18.5204, lon: 73.8567, aqi: 88,  pm25: 34,  pm10: 68,  no2: 22, so2: 10, o3: 38,  co: 0.9, temp: 28, humidity: 65, wind: 5.2, hcho: 2.8,  fire: 3   },
  'Chandigarh':   { city: 'Chandigarh',   state: 'Punjab',        country: 'India', lat: 30.7333, lon: 76.7794, aqi: 246, pm25: 98,  pm10: 188, no2: 44, so2: 20, o3: 58,  co: 2.0, temp: 30, humidity: 60, wind: 3.2, hcho: 8.8,  fire: 54  },
  'Jaipur':       { city: 'Jaipur',       state: 'Rajasthan',     country: 'India', lat: 26.9124, lon: 75.7873, aqi: 164, pm25: 72,  pm10: 138, no2: 38, so2: 16, o3: 54,  co: 1.6, temp: 38, humidity: 42, wind: 3.8, hcho: 5.2,  fire: 22  },
  'Lucknow':      { city: 'Lucknow',      state: 'Uttar Pradesh', country: 'India', lat: 26.8467, lon: 80.9462, aqi: 274, pm25: 112, pm10: 204, no2: 48, so2: 22, o3: 62,  co: 2.2, temp: 34, humidity: 68, wind: 2.8, hcho: 10.4, fire: 68  },
  'Bengaluru':    { city: 'Bengaluru',    state: 'Karnataka',     country: 'India', lat: 12.9716, lon: 77.5946, aqi: 84,  pm25: 32,  pm10: 64,  no2: 22, so2: 10, o3: 38,  co: 0.9, temp: 26, humidity: 65, wind: 5.2, hcho: 2.8,  fire: 3   },
  'Hyderabad':    { city: 'Hyderabad',    state: 'Telangana',     country: 'India', lat: 17.3850, lon: 78.4867, aqi: 96,  pm25: 38,  pm10: 74,  no2: 24, so2: 11, o3: 42,  co: 1.0, temp: 32, humidity: 58, wind: 4.6, hcho: 3.4,  fire: 6   },
  'Kolkata':      { city: 'Kolkata',      state: 'West Bengal',   country: 'India', lat: 22.5726, lon: 88.3639, aqi: 184, pm25: 78,  pm10: 142, no2: 38, so2: 14, o3: 48,  co: 1.1, temp: 30, humidity: 72, wind: 4.1, hcho: 6.2,  fire: 24  },
  'Chennai':      { city: 'Chennai',      state: 'Tamil Nadu',    country: 'India', lat: 13.0827, lon: 80.2707, aqi: 68,  pm25: 24,  pm10: 48,  no2: 16, so2: 7,  o3: 32,  co: 0.7, temp: 34, humidity: 80, wind: 5.8, hcho: 2.1,  fire: 2   },
  'Ghaziabad':    { city: 'Ghaziabad',    state: 'Uttar Pradesh', country: 'India', lat: 28.6692, lon: 77.4538, aqi: 342, pm25: 156, pm10: 280, no2: 54, so2: 24, o3: 68,  co: 2.8, temp: 31, humidity: 64, wind: 2.4, hcho: 14.2, fire: 98  },
  'Amritsar':     { city: 'Amritsar',     state: 'Punjab',        country: 'India', lat: 31.6340, lon: 74.8723, aqi: 342, pm25: 156, pm10: 288, no2: 58, so2: 26, o3: 70,  co: 3.0, temp: 28, humidity: 66, wind: 2.2, hcho: 16.2, fire: 118 },
  'Bhopal':       { city: 'Bhopal',       state: 'Madhya Pradesh',country: 'India', lat: 23.2599, lon: 77.4126, aqi: 138, pm25: 58,  pm10: 112, no2: 32, so2: 14, o3: 48,  co: 1.3, temp: 34, humidity: 54, wind: 3.6, hcho: 4.4,  fire: 28  },
  'Nagpur':       { city: 'Nagpur',       state: 'Maharashtra',   country: 'India', lat: 21.1458, lon: 79.0882, aqi: 118, pm25: 52,  pm10: 98,  no2: 28, so2: 12, o3: 44,  co: 1.2, temp: 36, humidity: 52, wind: 4.0, hcho: 3.8,  fire: 14  },
  'Patna':        { city: 'Patna',        state: 'Bihar',         country: 'India', lat: 25.5941, lon: 85.1376, aqi: 248, pm25: 98,  pm10: 182, no2: 42, so2: 18, o3: 56,  co: 1.9, temp: 33, humidity: 70, wind: 2.6, hcho: 9.2,  fire: 44  },
  'Visakhapatnam':{ city: 'Visakhapatnam',state: 'Andhra Pradesh',country: 'India', lat: 17.6868, lon: 83.2185, aqi: 67,  pm25: 22,  pm10: 44,  no2: 14, so2: 6,  o3: 30,  co: 0.6, temp: 32, humidity: 76, wind: 6.2, hcho: 1.8,  fire: 1   },
};

export const ALL_CITIES = Object.keys(CITY_DB);

export const QUICK_CITIES = ['New Delhi', 'Mumbai', 'Ahmedabad', 'Surat', 'Bengaluru', 'Kolkata'];

type CityContextType = {
  selectedCity: string;
  cityData: CityData;
  loading: boolean;
  recentCities: string[];
  selectCity: (name: string) => void;
};

const CityContext = createContext<CityContextType | null>(null);

export function CityProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCity] = useState('New Delhi');
  const [loading, setLoading] = useState(false);
  const [recentCities, setRecentCities] = useState<string[]>(['New Delhi']);

  const selectCity = useCallback((name: string) => {
    if (!CITY_DB[name] || name === selectedCity) return;
    setLoading(true);
    setTimeout(() => {
      setSelectedCity(name);
      setRecentCities(prev => [name, ...prev.filter(c => c !== name)].slice(0, 5));
      setLoading(false);
    }, 420);
  }, [selectedCity]);

  const cityData = CITY_DB[selectedCity] ?? CITY_DB['New Delhi'];

  return (
    <CityContext.Provider value={{ selectedCity, cityData, loading, recentCities, selectCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error('useCity must be used inside CityProvider');
  return ctx;
}

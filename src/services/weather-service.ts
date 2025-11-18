// Weather Service for GreenBlu.ai
// Fetches weather data from OpenWeatherMap API
// Note: Google WeatherNext API will be integrated when publicly available

import type { WeatherData } from '../types';

export interface WeatherServiceConfig {
  apiKey: string;
  units: 'metric' | 'imperial';
  cacheMinutes: number;
}

export interface DetailedWeather extends WeatherData {
  feels_like: number;
  wind_speed: number;
  clouds: number;
  visibility: number;
  uv_index?: number;
  sunrise: number;
  sunset: number;
  description: string;
  icon: string;
}

export interface WeatherForecast {
  hourly: Array<{
    timestamp: number;
    temperature: number;
    condition: string;
    humidity: number;
    pressure: number;
  }>;
  daily: Array<{
    date: string;
    temp_min: number;
    temp_max: number;
    condition: string;
    humidity: number;
    pressure: number;
  }>;
}

/**
 * Weather Service
 * Fetches current weather and forecasts from OpenWeatherMap
 */
export class WeatherService {
  private config: WeatherServiceConfig;
  private cache: {
    current: { data: DetailedWeather | null; timestamp: number };
    forecast: { data: WeatherForecast | null; timestamp: number };
  };

  constructor(config?: Partial<WeatherServiceConfig>) {
    this.config = {
      apiKey: '', // Will be set by user in settings
      units: 'metric',
      cacheMinutes: 30,
      ...config
    };

    this.cache = {
      current: { data: null, timestamp: 0 },
      forecast: { data: null, timestamp: 0 }
    };
  }

  /**
   * Set API key
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.clearCache();
  }

  /**
   * Check if API key is configured
   */
  hasApiKey(): boolean {
    return this.config.apiKey.length > 0;
  }

  /**
   * Clear weather cache
   */
  clearCache(): void {
    this.cache = {
      current: { data: null, timestamp: 0 },
      forecast: { data: null, timestamp: 0 }
    };
  }

  /**
   * Get user's current location
   */
  async getLocation(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Get current weather
   */
  async getCurrentWeather(lat?: number, lon?: number): Promise<DetailedWeather> {
    // Check cache
    const cacheAge = Date.now() - this.cache.current.timestamp;
    if (this.cache.current.data && cacheAge < this.config.cacheMinutes * 60 * 1000) {
      return this.cache.current.data;
    }

    // Get location if not provided
    if (lat === undefined || lon === undefined) {
      const location = await this.getLocation();
      lat = location.lat;
      lon = location.lon;
    }

    // Check if API key is available
    if (!this.hasApiKey()) {
      // Return mock data if no API key
      return this.getMockWeather();
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${this.config.units}&appid=${this.config.apiKey}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      const weather: DetailedWeather = {
        temperature: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        condition: this.mapCondition(data.weather[0].main),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        pressure: data.main.pressure,
        humidity: data.main.humidity,
        wind_speed: data.wind.speed,
        clouds: data.clouds.all,
        visibility: data.visibility,
        sunrise: data.sys.sunrise * 1000,
        sunset: data.sys.sunset * 1000
      };

      // Update cache
      this.cache.current = {
        data: weather,
        timestamp: Date.now()
      };

      // Store in chrome.storage for other components
      await chrome.storage.local.set({ current_weather: weather });

      return weather;
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      return this.getMockWeather();
    }
  }

  /**
   * Get weather forecast (hourly + daily)
   */
  async getForecast(lat?: number, lon?: number): Promise<WeatherForecast> {
    // Check cache
    const cacheAge = Date.now() - this.cache.forecast.timestamp;
    if (this.cache.forecast.data && cacheAge < this.config.cacheMinutes * 60 * 1000) {
      return this.cache.forecast.data;
    }

    // Get location if not provided
    if (lat === undefined || lon === undefined) {
      const location = await this.getLocation();
      lat = location.lat;
      lon = location.lon;
    }

    // Check if API key is available
    if (!this.hasApiKey()) {
      return this.getMockForecast();
    }

    try {
      // Using One Call API for both hourly and daily
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${this.config.units}&appid=${this.config.apiKey}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }

      const data = await response.json();

      // Process hourly (next 24 hours)
      const hourly = data.list.slice(0, 8).map((item: any) => ({
        timestamp: item.dt * 1000,
        temperature: Math.round(item.main.temp),
        condition: this.mapCondition(item.weather[0].main),
        humidity: item.main.humidity,
        pressure: item.main.pressure
      }));

      // Process daily (aggregate by day)
      const dailyMap = new Map<string, any>();
      data.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0];
        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            date,
            temps: [],
            conditions: [],
            humidity: [],
            pressure: []
          });
        }
        const day = dailyMap.get(date);
        day.temps.push(item.main.temp);
        day.conditions.push(item.weather[0].main);
        day.humidity.push(item.main.humidity);
        day.pressure.push(item.main.pressure);
      });

      const daily = Array.from(dailyMap.values()).slice(0, 5).map((day: any) => ({
        date: day.date,
        temp_min: Math.round(Math.min(...day.temps)),
        temp_max: Math.round(Math.max(...day.temps)),
        condition: this.mapCondition(this.getMostCommon(day.conditions)),
        humidity: Math.round(day.humidity.reduce((a: number, b: number) => a + b, 0) / day.humidity.length),
        pressure: Math.round(day.pressure.reduce((a: number, b: number) => a + b, 0) / day.pressure.length)
      }));

      const forecast: WeatherForecast = { hourly, daily };

      // Update cache
      this.cache.forecast = {
        data: forecast,
        timestamp: Date.now()
      };

      return forecast;
    } catch (error) {
      console.error('Failed to fetch forecast:', error);
      return this.getMockForecast();
    }
  }

  /**
   * Get weather impact on mood (for AI predictions)
   */
  getWeatherMoodImpact(weather: WeatherData): {
    valenceImpact: number;
    arousalImpact: number;
    dominanceImpact: number;
    factors: string[];
  } {
    let valenceImpact = 0;
    let arousalImpact = 0;
    let dominanceImpact = 0;
    const factors: string[] = [];

    // Temperature impact
    const temp = weather.temperature;
    if (temp >= 18 && temp <= 25) {
      valenceImpact += 0.1;
      factors.push('Comfortable temperature');
    } else if (temp < 10 || temp > 30) {
      valenceImpact -= 0.1;
      arousalImpact -= 0.05;
      factors.push('Extreme temperature');
    }

    // Condition impact
    switch (weather.condition) {
      case 'sunny':
        valenceImpact += 0.15;
        arousalImpact += 0.1;
        dominanceImpact += 0.05;
        factors.push('Sunny weather boosts mood');
        break;
      case 'partly-cloudy':
        valenceImpact += 0.05;
        factors.push('Partly cloudy - mild positive');
        break;
      case 'cloudy':
        valenceImpact -= 0.05;
        factors.push('Overcast skies');
        break;
      case 'rainy':
        valenceImpact -= 0.1;
        arousalImpact -= 0.1;
        factors.push('Rain may lower mood');
        break;
      case 'snowy':
        valenceImpact -= 0.05;
        arousalImpact -= 0.15;
        factors.push('Snow reduces activity');
        break;
      case 'stormy':
        valenceImpact -= 0.15;
        arousalImpact -= 0.1;
        dominanceImpact -= 0.1;
        factors.push('Stormy weather negative impact');
        break;
    }

    // Pressure impact (low pressure often correlates with fatigue)
    if (weather.pressure < 1000) {
      arousalImpact -= 0.1;
      factors.push('Low pressure - may cause fatigue');
    } else if (weather.pressure > 1020) {
      arousalImpact += 0.05;
      factors.push('High pressure - stable energy');
    }

    // Humidity impact
    if (weather.humidity !== undefined && weather.humidity > 80) {
      arousalImpact -= 0.05;
      factors.push('High humidity - reduced comfort');
    } else if (weather.humidity !== undefined && weather.humidity < 30) {
      factors.push('Low humidity - may need hydration');
    }

    return {
      valenceImpact: Math.max(-0.3, Math.min(0.3, valenceImpact)),
      arousalImpact: Math.max(-0.3, Math.min(0.3, arousalImpact)),
      dominanceImpact: Math.max(-0.3, Math.min(0.3, dominanceImpact)),
      factors
    };
  }

  /**
   * Map OpenWeatherMap condition to our simplified conditions
   */
  private mapCondition(owmCondition: string): WeatherData['condition'] {
    const mapping: Record<string, WeatherData['condition']> = {
      'Clear': 'sunny',
      'Clouds': 'cloudy',
      'Few clouds': 'partly-cloudy',
      'Scattered clouds': 'partly-cloudy',
      'Broken clouds': 'cloudy',
      'Overcast clouds': 'cloudy',
      'Rain': 'rainy',
      'Drizzle': 'rainy',
      'Thunderstorm': 'stormy',
      'Snow': 'snowy',
      'Mist': 'cloudy',
      'Fog': 'cloudy',
      'Haze': 'cloudy'
    };

    return mapping[owmCondition] || 'partly-cloudy';
  }

  /**
   * Get most common element in array
   */
  private getMostCommon(arr: string[]): string {
    const counts = arr.reduce((acc: Record<string, number>, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  /**
   * Get mock weather (fallback when no API key)
   */
  private getMockWeather(): DetailedWeather {
    return {
      temperature: 22,
      feels_like: 21,
      condition: 'partly-cloudy',
      description: 'Scattered clouds',
      icon: '03d',
      pressure: 1013,
      humidity: 65,
      wind_speed: 3.5,
      clouds: 40,
      visibility: 10000,
      sunrise: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
      sunset: Date.now() + 6 * 60 * 60 * 1000  // 6 hours from now
    };
  }

  /**
   * Get mock forecast (fallback when no API key)
   */
  private getMockForecast(): WeatherForecast {
    const now = Date.now();

    return {
      hourly: Array.from({ length: 8 }, (_, i) => ({
        timestamp: now + (i + 1) * 3 * 60 * 60 * 1000,
        temperature: 20 + Math.floor(Math.random() * 5),
        condition: ['sunny', 'partly-cloudy', 'cloudy'][Math.floor(Math.random() * 3)],
        humidity: 50 + Math.floor(Math.random() * 30),
        pressure: 1010 + Math.floor(Math.random() * 10)
      })),
      daily: Array.from({ length: 5 }, (_, i) => {
        const date = new Date(now + i * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString().split('T')[0],
          temp_min: 15 + Math.floor(Math.random() * 5),
          temp_max: 22 + Math.floor(Math.random() * 5),
          condition: ['sunny', 'partly-cloudy', 'cloudy', 'rainy'][Math.floor(Math.random() * 4)],
          humidity: 50 + Math.floor(Math.random() * 30),
          pressure: 1010 + Math.floor(Math.random() * 10)
        };
      })
    };
  }
}

// Export singleton
export const weatherService = new WeatherService();

/**
 * Initialize weather service from settings
 */
export async function initializeWeatherService(): Promise<void> {
  try {
    const result = await chrome.storage.local.get('weather_api_key');
    if (result.weather_api_key) {
      weatherService.setApiKey(result.weather_api_key);
    }
  } catch (error) {
    console.error('Failed to initialize weather service:', error);
  }
}

// =====================================================
// WEATHER SERVICE
// =====================================================
import { weatherConfig } from '../config/weather'

export interface WeatherData {
  coord: {
    lon: number
    lat: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  wind: {
    speed: number
    deg: number
    gust?: number
  }
  clouds: {
    all: number
  }
  rain?: {
    '1h'?: number
    '3h'?: number
  }
  name: string
}

export const weatherService = {
  // Get weather by coordinates
  getWeatherByCoordinates: async (
    latitude: number,
    longitude: number
  ): Promise<WeatherData> => {
    try {
      const url = `${weatherConfig.baseUrl}/latlon?latitude=${latitude}&longitude=${longitude}&lang=PT_BR`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': weatherConfig.apiKey,
          'x-rapidapi-host': weatherConfig.apiHost,
        },
      })

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching weather:', error)
      throw error
    }
  },

  // Convert Kelvin to Celsius
  kelvinToCelsius: (kelvin: number): number => {
    return Math.round(kelvin - 273.15)
  },

  // Convert m/s to km/h
  msToKmh: (ms: number): number => {
    return Math.round(ms * 3.6)
  },
}

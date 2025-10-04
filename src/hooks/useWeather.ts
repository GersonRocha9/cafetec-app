// =====================================================
// WEATHER HOOKS
// =====================================================
import { useQuery } from '@tanstack/react-query'
import { weatherService } from '../services'

// Get weather by coordinates
export const useWeather = (latitude?: number, longitude?: number) => {
  return useQuery({
    queryKey: ['weather', latitude, longitude],
    queryFn: () =>
      weatherService.getWeatherByCoordinates(latitude!, longitude!),
    enabled: !!latitude && !!longitude,
    staleTime: 1000 * 60 * 30, // 30 minutes - dados de clima não mudam tão rápido
    gcTime: 1000 * 60 * 60, // 1 hour
  })
}

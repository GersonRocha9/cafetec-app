import { useState, useEffect } from 'react'
import * as Location from 'expo-location'
import { Alert } from 'react-native'
import { useProperty } from '../contexts/PropertyContext'

interface LocationCoords {
  latitude: number
  longitude: number
}

interface UseUserLocationReturn {
  location: LocationCoords | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook para obter localização do usuário para previsão do tempo
 *
 * Prioridade:
 * 1. Usa coordenadas da propriedade selecionada (se houver)
 * 2. Pede permissão e usa GPS/rede do dispositivo
 * 3. Fallback para localização padrão (São Paulo, BR)
 */
export function useUserLocation(): UseUserLocationReturn {
  const { selectedProperty } = useProperty()
  const [location, setLocation] = useState<LocationCoords | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getDeviceLocation = async (): Promise<LocationCoords | null> => {
    try {
      // Verifica se já tem permissão
      const { status: existingStatus } =
        await Location.getForegroundPermissionsAsync()

      let finalStatus = existingStatus

      // Se não tem permissão, solicita
      if (existingStatus !== 'granted') {
        const { status } = await Location.requestForegroundPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permissão negada',
          'Para obter a previsão do tempo da sua região, permita o acesso à localização.'
        )
        return null
      }

      // Tenta primeiro a última localização conhecida (mais rápido)
      const lastKnown = await Location.getLastKnownPositionAsync({
        maxAge: 300000, // 5 minutos
        requiredAccuracy: 1000, // 1km de precisão é suficiente para clima
      })

      if (lastKnown) {
        return {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
        }
      }

      // Se não houver última localização, busca atual
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Balanceado entre precisão e velocidade
      })

      return {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      }
    } catch (err) {
      console.error('Erro ao obter localização do dispositivo:', err)
      return null
    }
  }

  const fetchLocation = async () => {
    setLoading(true)
    setError(null)

    try {
      // PRIORIDADE 1: Usar coordenadas da propriedade selecionada
      if (
        selectedProperty?.latitude &&
        selectedProperty?.longitude &&
        selectedProperty.latitude !== 0 &&
        selectedProperty.longitude !== 0
      ) {
        setLocation({
          latitude: selectedProperty.latitude,
          longitude: selectedProperty.longitude,
        })
        setLoading(false)
        return
      }

      // PRIORIDADE 2: Usar geolocalização do dispositivo
      const deviceLocation = await getDeviceLocation()

      if (deviceLocation) {
        setLocation(deviceLocation)
        setLoading(false)
        return
      }

      // FALLBACK: Localização padrão (São Paulo, BR - centro cafeeiro)
      // Você pode mudar para outra cidade se preferir
      setLocation({
        latitude: -23.5505,
        longitude: -46.6333,
      })
      setError(
        'Usando localização padrão. Configure a localização da propriedade para maior precisão.'
      )
    } catch (err) {
      console.error('Erro ao buscar localização:', err)
      setError('Não foi possível obter sua localização')
      // Fallback mesmo em erro
      setLocation({
        latitude: -23.5505,
        longitude: -46.6333,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocation()
    // Re-buscar quando a propriedade mudar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProperty?.id])

  return {
    location,
    loading,
    error,
    refetch: fetchLocation,
  }
}

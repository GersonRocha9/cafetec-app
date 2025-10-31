// =====================================================
// PROPERTY CONTEXT
// =====================================================
// Gerencia a propriedade selecionada globalmente no app

import AsyncStorage from '@react-native-async-storage/async-storage'
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { Property } from '../services'

const SELECTED_PROPERTY_KEY = '@cafetec:selected_property'

interface PropertyContextData {
  selectedProperty: Property | null
  setSelectedProperty: (property: Property | null) => void
  loading: boolean
}

const PropertyContext = createContext<PropertyContextData>(
  {} as PropertyContextData
)

interface PropertyProviderProps {
  children: ReactNode
}

export function PropertyProvider({ children }: PropertyProviderProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  )
  const [loading, setLoading] = useState(true)

  // Carregar propriedade selecionada do AsyncStorage
  useEffect(() => {
    const loadSelectedProperty = async () => {
      try {
        const stored = await AsyncStorage.getItem(SELECTED_PROPERTY_KEY)
        if (stored) {
          setSelectedProperty(JSON.parse(stored))
        }
      } catch (error) {
        console.error('Error loading selected property:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSelectedProperty()
  }, [])

  // Persistir propriedade selecionada no AsyncStorage
  const handleSetSelectedProperty = async (property: Property | null) => {
    try {
      if (property) {
        await AsyncStorage.setItem(
          SELECTED_PROPERTY_KEY,
          JSON.stringify(property)
        )
      } else {
        await AsyncStorage.removeItem(SELECTED_PROPERTY_KEY)
      }
      setSelectedProperty(property)
    } catch (error) {
      console.error('Error saving selected property:', error)
      // Mesmo com erro, atualiza o estado
      setSelectedProperty(property)
    }
  }

  return (
    <PropertyContext.Provider
      value={{
        selectedProperty,
        setSelectedProperty: handleSetSelectedProperty,
        loading,
      }}
    >
      {children}
    </PropertyContext.Provider>
  )
}

export function useProperty() {
  const context = useContext(PropertyContext)
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider')
  }
  return context
}

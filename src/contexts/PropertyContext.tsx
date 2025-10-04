// =====================================================
// PROPERTY CONTEXT
// =====================================================
// Gerencia a propriedade selecionada globalmente no app

import React, { createContext, ReactNode, useContext, useState } from 'react'
import type { Property } from '../services'

interface PropertyContextData {
  selectedProperty: Property | null
  setSelectedProperty: (property: Property | null) => void
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

  return (
    <PropertyContext.Provider
      value={{
        selectedProperty,
        setSelectedProperty,
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


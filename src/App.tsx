import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { PropertyProvider } from './contexts/PropertyContext'
import { RootNavigator } from './navigation/RootNavigator'
import { QueryProvider } from './providers/QueryProvider'

export function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <PropertyProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </PropertyProvider>
      </AuthProvider>
    </QueryProvider>
  )
}

import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider } from './contexts/AuthContext'
import { PropertyProvider } from './contexts/PropertyContext'
import { RootNavigator } from './navigation/RootNavigator'
import { QueryProvider } from './providers/QueryProvider'

SplashScreen.preventAutoHideAsync()

export function App() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync()
    }
  }, [loaded, error])

  if (!loaded && !error) {
    return null
  }

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

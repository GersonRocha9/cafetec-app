// =====================================================
// LOADING STATE COMPONENT
// =====================================================
import React from 'react'
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'

interface LoadingStateProps {
  message?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Carregando...' 
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8B4513" />
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
})


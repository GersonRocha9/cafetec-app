// =====================================================
// LOADING STATE COMPONENT
// =====================================================
import React from 'react'
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'
import { colors, spacing } from '../constants/theme'

interface LoadingStateProps {
  message?: string
  size?: 'small' | 'large'
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Carregando...',
  size = 'large',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.loaderContainer}>
        <ActivityIndicator size={size} color={colors.primary.main} />
        <Text style={styles.icon}>☕</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.submessage}>Preparando seus dados...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loaderContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    position: 'absolute',
    fontSize: 32,
  },
  message: {
    marginTop: spacing.base,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  submessage: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
})

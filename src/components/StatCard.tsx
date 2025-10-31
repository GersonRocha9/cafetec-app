// =====================================================
// STAT CARD COMPONENT
// =====================================================
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native'
import { colors, shadows, borderRadius, spacing } from '../constants/theme'

interface StatCardProps {
  label: string
  value: string | number
  icon?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'gradient' | 'outlined'
  gradientColors?: string[]
  valueColor?: string
  style?: ViewStyle
  onPress?: () => void
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  variant = 'default',
  gradientColors,
  valueColor,
  style,
  onPress,
}) => {
  const content = (
    <>
      <View style={styles.header}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text
          style={[styles.label, variant === 'gradient' && styles.labelGradient]}
        >
          {label}
        </Text>
      </View>
      <View style={styles.valueContainer}>
        <Text
          style={[
            styles.value,
            variant === 'gradient' && styles.valueGradient,
            valueColor && { color: valueColor },
          ]}
        >
          {value}
        </Text>
        {trend && (
          <View
            style={[
              styles.trendBadge,
              trend.isPositive ? styles.trendPositive : styles.trendNegative,
            ]}
          >
            <Text style={styles.trendIcon}>{trend.isPositive ? '↑' : '↓'}</Text>
            <Text style={styles.trendValue}>{Math.abs(trend.value)}%</Text>
          </View>
        )}
      </View>
    </>
  )

  const cardStyles = [
    styles.card,
    variant === 'outlined' && styles.outlined,
    variant !== 'gradient' && styles.elevated,
    style,
  ]

  // Gradient variant disabled until app rebuild - using solid color from valueColor prop
  if (variant === 'gradient') {
    const Component = onPress ? TouchableOpacity : View
    const bgColor = valueColor || colors.primary.main
    return (
      <Component
        style={[cardStyles, { backgroundColor: bgColor }]}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        {content}
      </Component>
    )
  }

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    )
  }

  return <View style={cardStyles}>{content}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    minWidth: 140,
  },
  elevated: {
    ...shadows.base,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.neutral.medium,
  },
  gradient: {
    padding: spacing.base,
    borderRadius: borderRadius.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  labelGradient: {
    color: colors.text.inverse,
    opacity: 0.9,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  valueGradient: {
    color: colors.text.inverse,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  trendPositive: {
    backgroundColor: `${colors.success}20`,
  },
  trendNegative: {
    backgroundColor: `${colors.error}20`,
  },
  trendIcon: {
    fontSize: 12,
    fontWeight: '700',
  },
  trendValue: {
    fontSize: 11,
    fontWeight: '600',
  },
})

// =====================================================
// STATUS BADGE COMPONENT
// =====================================================
import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { colors, borderRadius } from '../constants/theme'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'
type BadgeSize = 'sm' | 'md' | 'lg'

interface StatusBadgeProps {
  label: string
  variant?: BadgeVariant
  size?: BadgeSize
  icon?: string
  customColor?: string
  style?: ViewStyle
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  icon,
  customColor,
  style,
}) => {
  const backgroundColor = customColor
    ? `${customColor}15`
    : variantColors[variant].background
  const textColor = customColor || variantColors[variant].text
  const dotColor = customColor || variantColors[variant].dot

  return (
    <View style={[styles.badge, { backgroundColor }, sizeStyles[size], style]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.label, { color: textColor }, sizeLabelStyles[size]]}>
        {label}
      </Text>
    </View>
  )
}

const variantColors = {
  success: {
    background: `${colors.success}15`,
    text: colors.success,
    dot: colors.success,
  },
  warning: {
    background: `${colors.warning}15`,
    text: colors.warning,
    dot: colors.warning,
  },
  error: {
    background: `${colors.error}15`,
    text: colors.error,
    dot: colors.error,
  },
  info: {
    background: `${colors.info}15`,
    text: colors.info,
    dot: colors.info,
  },
  neutral: {
    background: colors.neutral.light,
    text: colors.text.secondary,
    dot: colors.neutral.dark,
  },
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
  },
  icon: {
    fontSize: 14,
    marginRight: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  label: {
    fontWeight: '600',
  },
})

const sizeStyles = {
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  md: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  lg: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
}

const sizeLabelStyles = {
  sm: {
    fontSize: 11,
  },
  md: {
    fontSize: 12,
  },
  lg: {
    fontSize: 14,
  },
}

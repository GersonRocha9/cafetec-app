// =====================================================
// BUTTON COMPONENT
// =====================================================
import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { colors, shadows, borderRadius, spacing } from '../constants/theme'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: string
  iconPosition?: 'left' | 'right'
  loading?: boolean
  disabled?: boolean
  gradientColors?: string[]
  style?: ViewStyle
  textStyle?: TextStyle
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  gradientColors,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading

  const content = (
    <>
      {loading && (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost'
              ? colors.primary.main
              : colors.text.inverse
          }
          style={styles.loader}
        />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <Text style={styles.icon}>{icon}</Text>
      )}
      <Text
        style={[
          styles.label,
          variantTextStyles[variant],
          sizeTextStyles[size],
          isDisabled && styles.disabledText,
          textStyle,
        ]}
      >
        {label}
      </Text>
      {!loading && icon && iconPosition === 'right' && (
        <Text style={styles.icon}>{icon}</Text>
      )}
    </>
  )

  // Gradient variant disabled until app rebuild - using primary color instead
  if (variant === 'gradient' && !isDisabled) {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          variantStyles.primary,
          sizeStyles[size],
          styles.elevated,
          style,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={isDisabled}
      >
        {content}
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyles[variant],
        sizeStyles[size],
        variant !== 'ghost' && variant !== 'outline' && styles.elevated,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
    >
      {content}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.base,
    gap: spacing.xs,
  },
  elevated: {
    ...shadows.base,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
  },
  label: {
    fontWeight: '600',
  },
  icon: {
    fontSize: 18,
  },
  loader: {
    marginRight: spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
})

const variantStyles = {
  primary: {
    backgroundColor: colors.primary.main,
  },
  secondary: {
    backgroundColor: colors.secondary.main,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary.main,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  gradient: {
    backgroundColor: 'transparent',
  },
}

const variantTextStyles = {
  primary: {
    color: colors.text.inverse,
  },
  secondary: {
    color: colors.text.inverse,
  },
  outline: {
    color: colors.primary.main,
  },
  ghost: {
    color: colors.primary.main,
  },
  gradient: {
    color: colors.text.inverse,
  },
}

const sizeStyles = {
  sm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  md: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  lg: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
  },
}

const sizeLabelStyles = {
  sm: {
    fontSize: 13,
  },
  md: {
    fontSize: 15,
  },
  lg: {
    fontSize: 17,
  },
}

const sizeTextStyles = {
  sm: sizeLabelStyles.sm,
  md: sizeLabelStyles.md,
  lg: sizeLabelStyles.lg,
}

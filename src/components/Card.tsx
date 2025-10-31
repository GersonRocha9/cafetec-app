// =====================================================
// CARD COMPONENT
// =====================================================
import React, { ReactNode } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native'
import { colors, shadows, borderRadius, spacing } from '../constants/theme'

interface CardProps {
  children: ReactNode
  style?: ViewStyle
  onPress?: () => void
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient'
  gradientColors?: string[]
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  gradientColors,
}) => {
  const cardStyles = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    style,
  ]

  // Gradient variant disabled until app rebuild
  // if (variant === 'gradient' && gradientColors) {
  //   const CardComponent = onPress ? TouchableOpacity : View
  //   return (
  //     <CardComponent
  //       style={[styles.card, styles.elevated, style]}
  //       onPress={onPress}
  //       activeOpacity={onPress ? 0.7 : 1}
  //     >
  //       {children}
  //     </CardComponent>
  //   )
  // }

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    )
  }

  return <View style={cardStyles}>{children}</View>
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  icon?: string
  action?: ReactNode
  variant?: 'default' | 'gradient'
  gradientColors?: string[]
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  icon,
  action,
  variant = 'default',
  gradientColors,
}) => {
  // Gradient variant disabled until app rebuild
  const useGradientStyle = variant === 'gradient' && gradientColors

  if (useGradientStyle) {
    return (
      <View
        style={[
          styles.gradientHeader,
          { backgroundColor: colors.primary.main },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            {icon && <Text style={styles.headerIconGradient}>{icon}</Text>}
            <View>
              <Text style={styles.headerTitleGradient}>{title}</Text>
              {subtitle && (
                <Text style={styles.headerSubtitleGradient}>{subtitle}</Text>
              )}
            </View>
          </View>
          {action}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.header}>
      <View style={styles.headerTextContainer}>
        {icon && <Text style={styles.headerIcon}>{icon}</Text>}
        <View>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {action}
    </View>
  )
}

interface CardContentProps {
  children: ReactNode
  style?: ViewStyle
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  style,
}) => {
  return <View style={[styles.content, style]}>{children}</View>
}

interface CardFooterProps {
  children: ReactNode
  style?: ViewStyle
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => {
  return <View style={[styles.footer, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  elevated: {
    ...shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.neutral.medium,
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.light,
  },
  gradientHeader: {
    padding: spacing.base,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerIconGradient: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerTitleGradient: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  headerSubtitleGradient: {
    fontSize: 13,
    color: colors.text.inverse,
    opacity: 0.9,
    marginTop: 2,
  },
  content: {
    padding: spacing.base,
  },
  footer: {
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.light,
  },
})

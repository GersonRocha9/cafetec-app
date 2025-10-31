import { zodResolver } from '@hookform/resolvers/zod'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { z } from 'zod'
import { useAuth } from '../../contexts/AuthContext'
import { AuthStackParamList } from '../../types/navigation'
import { colors, spacing, borderRadius, shadows } from '../../constants/theme'

const loginSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth()
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password)
      // Navigation is handled automatically by RootNavigator when isAuthenticated changes
    } catch (error) {
      // Error is already handled in AuthContext with Alert
      console.error('Login error:', error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header com Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>☕</Text>
            </View>
            <Text style={styles.title}>Cafetec</Text>
            <Text style={styles.subtitle}>
              Gestão Inteligente para Produtores de Café
            </Text>
          </View>

          {/* Card de Login */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Entrar na sua conta</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-mail</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <View
                      style={[
                        styles.inputWrapper,
                        errors.email && styles.inputWrapperError,
                      ]}
                    >
                      <Text style={styles.inputIcon}>📧</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="seu@email.com"
                        placeholderTextColor={colors.text.hint}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isSubmitting}
                      />
                    </View>
                    {errors.email && (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorIcon}>⚠️</Text>
                        <Text style={styles.errorText}>
                          {errors.email.message}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <View
                      style={[
                        styles.inputWrapper,
                        errors.password && styles.inputWrapperError,
                      ]}
                    >
                      <Text style={styles.inputIcon}>🔒</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Digite sua senha"
                        placeholderTextColor={colors.text.hint}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry
                        editable={!isSubmitting}
                      />
                    </View>
                    {errors.password && (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorIcon}>⚠️</Text>
                        <Text style={styles.errorText}>
                          {errors.password.message}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                isSubmitting && styles.buttonDisabled,
                shadows.base,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.text.inverse} size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Entrar</Text>
                  <Text style={styles.buttonIcon}>→</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer com link para cadastro */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Ainda não tem uma conta?</Text>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('SignUp')}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>Cadastre-se gratuitamente</Text>
            </TouchableOpacity>
          </View>

          {/* Informações adicionais */}
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>✅</Text>
              <Text style={styles.infoText}>
                Gestão completa da sua produção
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>✅</Text>
              <Text style={styles.infoText}>Controle financeiro integrado</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>✅</Text>
              <Text style={styles.infoText}>
                Dados meteorológicos em tempo real
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    marginTop: spacing.lg,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.base,
    ...shadows.lg,
  },
  logoIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.neutral.medium,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  errorIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.base,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.base,
    gap: spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: 17,
    fontWeight: '700',
  },
  buttonIcon: {
    color: colors.text.inverse,
    fontSize: 20,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  linkButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  linkText: {
    fontSize: 15,
    color: colors.primary.main,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: `${colors.primary.light}10`,
    borderRadius: borderRadius.base,
    padding: spacing.base,
    gap: spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 13,
    color: colors.text.secondary,
    flex: 1,
  },
})

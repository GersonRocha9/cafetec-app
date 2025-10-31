import { zodResolver } from '@hookform/resolvers/zod'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { z } from 'zod'
import { useAuth } from '../../contexts/AuthContext'
import { AuthStackParamList } from '../../types/navigation'
import { colors, spacing, borderRadius, shadows } from '../../constants/theme'

// Schema de validação completo
const signUpSchema = z
  .object({
    // Dados Pessoais
    name: z
      .string({ required_error: 'Nome é obrigatório' })
      .min(3, 'Nome deve ter no mínimo 3 caracteres'),
    phone: z
      .string({ required_error: 'Telefone é obrigatório' })
      .min(10, 'Telefone inválido'),
    email: z
      .string({ required_error: 'E-mail é obrigatório' })
      .email('E-mail inválido'),
    password: z
      .string({ required_error: 'Senha é obrigatória' })
      .min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
    // Endereço
    cep: z
      .string({ required_error: 'CEP é obrigatório' })
      .min(8, 'CEP inválido'),
    street: z
      .string({ required_error: 'Rua é obrigatória' })
      .min(3, 'Rua inválida'),
    number: z
      .string({ required_error: 'Número é obrigatório' })
      .min(1, 'Número obrigatório'),
    complement: z.string().optional(),
    state: z
      .string({ required_error: 'UF é obrigatória' })
      .length(2, 'UF inválida'),
    city: z
      .string({ required_error: 'Cidade é obrigatória' })
      .min(3, 'Cidade inválida'),
    // Perfil do Produtor
    producerProfile: z
      .string({ required_error: 'Perfil é obrigatório' })
      .min(1, 'Selecione um perfil'),
    mainActivity: z
      .string({ required_error: 'Atividade é obrigatória' })
      .min(3, 'Atividade obrigatória'),
    cultivationArea: z
      .string({ required_error: 'Área é obrigatória' })
      .min(1, 'Área obrigatória'),
    hasInternet: z.boolean(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type SignUpFormData = z.infer<typeof signUpSchema>

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>

const PRODUCER_PROFILES = [
  'Pequeno Produtor',
  'Médio Produtor',
  'Grande Produtor',
  'Cooperado',
  'Arrendatário',
]

export function SignUpScreen({ navigation }: Props) {
  const { signUp } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    trigger,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      state: '',
      city: '',
      producerProfile: '',
      mainActivity: '',
      cultivationArea: '',
      hasInternet: false,
    },
  })

  const searchCEP = async (cep: string) => {
    try {
      const cleanCEP = cep.replace(/\D/g, '')
      if (cleanCEP.length === 8) {
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanCEP}/json/`
        )
        const data = await response.json()

        if (!data.erro) {
          setValue('street', data.logradouro || '')
          setValue('city', data.localidade || '')
          setValue('state', data.uf || '')
          setValue('complement', data.complemento || '')
        }
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    }
  }

  const handleNext = async () => {
    let fieldsToValidate: (keyof SignUpFormData)[] = []

    if (currentStep === 1) {
      fieldsToValidate = [
        'name',
        'phone',
        'email',
        'password',
        'confirmPassword',
      ]
    } else if (currentStep === 2) {
      fieldsToValidate = ['cep', 'street', 'number', 'state', 'city']
    }

    const isValid = await trigger(fieldsToValidate)

    if (isValid) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const profileData = {
        name: data.name,
        phone: data.phone,
        cep: data.cep,
        street: data.street,
        number: data.number,
        complement: data.complement || null,
        state: data.state,
        city: data.city,
        producer_profile: data.producerProfile,
        main_activity: data.mainActivity,
        cultivation_area: parseFloat(data.cultivationArea),
        has_internet: data.hasInternet,
      }

      await signUp(data.email, data.password, profileData)
    } catch (error) {
      console.error('Sign up error:', error)
    }
  }

  const renderInput = (
    name: keyof SignUpFormData,
    label: string,
    placeholder: string,
    icon: string,
    options?: {
      keyboardType?: any
      autoCapitalize?: any
      secureTextEntry?: boolean
      onChangeText?: (text: string) => void
    }
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <View
              style={[
                styles.inputWrapper,
                errors[name] && styles.inputWrapperError,
              ]}
            >
              <Text style={styles.inputIcon}>{icon}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={colors.text.hint}
                value={value as string}
                onChangeText={options?.onChangeText || onChange}
                onBlur={onBlur}
                keyboardType={options?.keyboardType}
                autoCapitalize={options?.autoCapitalize || 'none'}
                secureTextEntry={options?.secureTextEntry}
                editable={!isSubmitting}
              />
            </View>
            {errors[name] && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>
                  {errors[name]?.message as string}
                </Text>
              </View>
            )}
          </View>
        )}
      />
    </View>
  )

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressSteps}>
        {[1, 2, 3].map(step => (
          <View
            key={step}
            style={[
              styles.progressStep,
              step <= currentStep && styles.progressStepActive,
            ]}
          >
            <Text
              style={[
                styles.progressStepText,
                step <= currentStep && styles.progressStepTextActive,
              ]}
            >
              {step}
            </Text>
          </View>
        ))}
      </View>
      <Text style={styles.progressText}>Etapa {currentStep} de 3</Text>
    </View>
  )

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepIcon}>👤</Text>
        <View>
          <Text style={styles.stepTitle}>Dados Pessoais</Text>
          <Text style={styles.stepSubtitle}>Suas informações básicas</Text>
        </View>
      </View>

      {renderInput('name', 'Nome Completo *', 'Digite seu nome', '👤', {
        autoCapitalize: 'words',
      })}
      {renderInput('phone', 'Telefone *', '(00) 00000-0000', '📱', {
        keyboardType: 'phone-pad',
      })}
      {renderInput('email', 'E-mail *', 'seu@email.com', '📧', {
        keyboardType: 'email-address',
      })}
      {renderInput('password', 'Senha *', 'Mínimo 6 caracteres', '🔒', {
        secureTextEntry: true,
      })}
      {renderInput(
        'confirmPassword',
        'Confirmar Senha *',
        'Digite a senha novamente',
        '🔒',
        {
          secureTextEntry: true,
        }
      )}
    </View>
  )

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepIcon}>📍</Text>
        <View>
          <Text style={styles.stepTitle}>Endereço</Text>
          <Text style={styles.stepSubtitle}>Localização da propriedade</Text>
        </View>
      </View>

      {renderInput('cep', 'CEP *', '00000-000', '📮', {
        keyboardType: 'numeric',
        onChangeText: text => {
          setValue('cep', text)
          if (text.replace(/\D/g, '').length === 8) {
            searchCEP(text)
          }
        },
      })}
      {renderInput('street', 'Rua *', 'Nome da rua', '🏠')}

      <View style={styles.row}>
        <View style={styles.halfInput}>
          {renderInput('number', 'Número *', '123', '🔢', {
            keyboardType: 'numeric',
          })}
        </View>
        <View style={styles.halfInput}>
          {renderInput('state', 'UF *', 'SP', '🗺️')}
        </View>
      </View>

      {renderInput('city', 'Cidade *', 'Nome da cidade', '🏙️')}
      {renderInput('complement', 'Complemento', 'Apartamento, bloco', '📝')}
    </View>
  )

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepIcon}>👨‍🌾</Text>
        <View>
          <Text style={styles.stepTitle}>Perfil de Produtor</Text>
          <Text style={styles.stepSubtitle}>Informações da produção</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tipo de Produtor *</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowProfileDropdown(!showProfileDropdown)}
        >
          <Text style={styles.inputIcon}>👨‍🌾</Text>
          <Controller
            control={control}
            name="producerProfile"
            render={({ field: { value } }) => (
              <Text
                style={[styles.selectText, !value && styles.selectPlaceholder]}
              >
                {value || 'Selecione seu perfil'}
              </Text>
            )}
          />
          <Text style={styles.selectArrow}>
            {showProfileDropdown ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {showProfileDropdown && (
          <View style={styles.dropdown}>
            {PRODUCER_PROFILES.map(profile => (
              <TouchableOpacity
                key={profile}
                style={styles.dropdownItem}
                onPress={() => {
                  setValue('producerProfile', profile)
                  setShowProfileDropdown(false)
                }}
              >
                <Text style={styles.dropdownText}>{profile}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {errors.producerProfile && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>
              {errors.producerProfile.message}
            </Text>
          </View>
        )}
      </View>

      {renderInput(
        'mainActivity',
        'Atividade Principal *',
        'Ex: Cafeicultura',
        '🌱'
      )}
      {renderInput('cultivationArea', 'Área de Cultivo (ha) *', '0.0', '📏', {
        keyboardType: 'decimal-pad',
      })}

      <View style={styles.switchContainer}>
        <View style={styles.switchLabelContainer}>
          <Text style={styles.switchIcon}>📶</Text>
          <View>
            <Text style={styles.switchLabel}>Acesso à Internet</Text>
            <Text style={styles.switchSubtext}>
              Acesso diário à internet na propriedade
            </Text>
          </View>
        </View>
        <Controller
          control={control}
          name="hasInternet"
          render={({ field: { value, onChange } }) => (
            <Switch
              value={value}
              onValueChange={onChange}
              trackColor={{
                false: colors.neutral.dark,
                true: colors.success,
              }}
              thumbColor={colors.background.secondary}
            />
          )}
        />
      </View>
    </View>
  )

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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                currentStep === 1 ? navigation.goBack() : handleBack()
              }
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>☕</Text>
            </View>
            <Text style={styles.title}>Criar Conta</Text>
          </View>

          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Steps */}
          <View style={styles.card}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            {currentStep < 3 ? (
              <TouchableOpacity
                style={[styles.nextButton, shadows.base]}
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>Continuar</Text>
                <Text style={styles.nextButtonIcon}>→</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.submitButton,
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
                    <Text style={styles.submitButtonText}>
                      Criar Minha Conta
                    </Text>
                    <Text style={styles.submitButtonIcon}>✓</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem uma conta?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={isSubmitting}
            >
              <Text style={styles.footerLink}>Fazer login</Text>
            </TouchableOpacity>
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
    paddingBottom: spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: spacing.md,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    ...shadows.sm,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.base,
  },
  logoIcon: {
    fontSize: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary.main,
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  progressStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: colors.primary.main,
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.hint,
  },
  progressStepTextActive: {
    color: colors.text.inverse,
  },
  progressText: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.base,
    ...shadows.md,
  },
  stepContainer: {
    gap: spacing.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.base,
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.light,
  },
  stepIcon: {
    fontSize: 32,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  stepSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  inputContainer: {
    marginBottom: spacing.sm,
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
    height: 50,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  errorIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  errorText: {
    color: colors.error,
    fontSize: 11,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.neutral.medium,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  selectText: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
  },
  selectPlaceholder: {
    color: colors.text.hint,
  },
  selectArrow: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  dropdown: {
    marginTop: spacing.xs,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.neutral.medium,
    ...shadows.base,
  },
  dropdownItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.light,
  },
  dropdownText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: `${colors.primary.light}10`,
    padding: spacing.base,
    borderRadius: borderRadius.base,
    marginTop: spacing.sm,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  switchIcon: {
    fontSize: 20,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  switchSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  navigationButtons: {
    marginBottom: spacing.base,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.base,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  nextButtonText: {
    color: colors.text.inverse,
    fontSize: 17,
    fontWeight: '700',
  },
  nextButtonIcon: {
    color: colors.text.inverse,
    fontSize: 20,
    fontWeight: '700',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: colors.success,
    borderRadius: borderRadius.base,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.text.inverse,
    fontSize: 17,
    fontWeight: '700',
  },
  submitButtonIcon: {
    color: colors.text.inverse,
    fontSize: 20,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.base,
  },
  footerText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  footerLink: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '600',
  },
})

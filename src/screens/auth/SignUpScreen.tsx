import { zodResolver } from '@hookform/resolvers/zod'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { z } from 'zod'
import { useAuth } from '../../contexts/AuthContext'
import { AuthStackParamList } from '../../types/navigation'

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
  .refine((data) => data.password === data.confirmPassword, {
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
    watch,
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
      // Prepare profile data
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
      // Navigation is handled automatically by RootNavigator when isAuthenticated changes
      // Success alert is shown in AuthContext
    } catch (error) {
      // Error is already handled in AuthContext with Alert
      console.error('Sign up error:', error)
    }
  }

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(currentStep / 3) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.progressText}>Etapa {currentStep} de 3</Text>
    </View>
  )

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>📝 Dados Pessoais</Text>
      <Text style={styles.stepSubtitle}>
        Vamos começar com suas informações básicas
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nome Completo *</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Digite seu nome completo"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isSubmitting}
            />
          )}
        />
        {errors.name && (
          <Text style={styles.errorText}>{errors.name.message}</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Telefone *</Text>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="(00) 00000-0000"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="phone-pad"
              editable={!isSubmitting}
            />
          )}
        />
        {errors.phone && (
          <Text style={styles.errorText}>{errors.phone.message}</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>E-mail *</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="seu@email.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isSubmitting}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email.message}</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Senha *</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Mínimo 6 caracteres"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              // secureTextEntry
              editable={!isSubmitting}
            />
          )}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password.message}</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirmar Senha *</Text>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && styles.inputError,
              ]}
              placeholder="Digite a senha novamente"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              // secureTextEntry
              editable={!isSubmitting}
            />
          )}
        />
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
        )}
      </View>
    </View>
  )

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>📍 Endereço</Text>
      <Text style={styles.stepSubtitle}>Onde fica sua propriedade?</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>CEP *</Text>
        <Controller
          control={control}
          name="cep"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.cep && styles.inputError]}
              placeholder="00000-000"
              value={value}
              onChangeText={(text) => {
                onChange(text)
                if (text.replace(/\D/g, '').length === 8) {
                  searchCEP(text)
                }
              }}
              onBlur={onBlur}
              keyboardType="numeric"
              editable={!isSubmitting}
            />
          )}
        />
        {errors.cep && (
          <Text style={styles.errorText}>{errors.cep.message}</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Rua *</Text>
        <Controller
          control={control}
          name="street"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.street && styles.inputError]}
              placeholder="Nome da rua"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isSubmitting}
            />
          )}
        />
        {errors.street && (
          <Text style={styles.errorText}>{errors.street.message}</Text>
        )}
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.inputSmall]}>
          <Text style={styles.label}>Número *</Text>
          <Controller
            control={control}
            name="number"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.number && styles.inputError]}
                placeholder="123"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
                editable={!isSubmitting}
              />
            )}
          />
          {errors.number && (
            <Text style={styles.errorText}>{errors.number.message}</Text>
          )}
        </View>

        <View style={[styles.inputContainer, styles.inputLarge]}>
          <Text style={styles.label}>Complemento</Text>
          <Controller
            control={control}
            name="complement"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Apto, bloco..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isSubmitting}
              />
            )}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.inputSmall]}>
          <Text style={styles.label}>UF *</Text>
          <Controller
            control={control}
            name="state"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.state && styles.inputError]}
                placeholder="SP"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                maxLength={2}
                autoCapitalize="characters"
                editable={!isSubmitting}
              />
            )}
          />
          {errors.state && (
            <Text style={styles.errorText}>{errors.state.message}</Text>
          )}
        </View>

        <View style={[styles.inputContainer, styles.inputLarge]}>
          <Text style={styles.label}>Cidade *</Text>
          <Controller
            control={control}
            name="city"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.city && styles.inputError]}
                placeholder="Nome da cidade"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isSubmitting}
              />
            )}
          />
          {errors.city && (
            <Text style={styles.errorText}>{errors.city.message}</Text>
          )}
        </View>
      </View>
    </View>
  )

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>👨‍🌾 Perfil do Produtor</Text>
      <Text style={styles.stepSubtitle}>Conte-nos sobre sua produção</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Perfil de Produtor *</Text>
        <Controller
          control={control}
          name="producerProfile"
          render={({ field: { onChange, value } }) => (
            <>
              <TouchableOpacity
                style={[
                  styles.input,
                  styles.dropdown,
                  errors.producerProfile && styles.inputError,
                ]}
                onPress={() => setShowProfileDropdown(!showProfileDropdown)}
                disabled={isSubmitting}
              >
                <Text
                  style={
                    value ? styles.dropdownText : styles.dropdownPlaceholder
                  }
                >
                  {value || 'Selecione seu perfil'}
                </Text>
                <Text style={styles.dropdownIcon}>
                  {showProfileDropdown ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
              {showProfileDropdown && (
                <View style={styles.dropdownList}>
                  {PRODUCER_PROFILES.map((profile) => (
                    <TouchableOpacity
                      key={profile}
                      style={styles.dropdownItem}
                      onPress={() => {
                        onChange(profile)
                        setShowProfileDropdown(false)
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{profile}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        />
        {errors.producerProfile && (
          <Text style={styles.errorText}>{errors.producerProfile.message}</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Atividade Agrícola Principal *</Text>
        <Controller
          control={control}
          name="mainActivity"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.mainActivity && styles.inputError]}
              placeholder="Ex: Cultivo de Café"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isSubmitting}
            />
          )}
        />
        {errors.mainActivity && (
          <Text style={styles.errorText}>{errors.mainActivity.message}</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Área de Cultivo (hectares) *</Text>
        <Controller
          control={control}
          name="cultivationArea"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                errors.cultivationArea && styles.inputError,
              ]}
              placeholder="Ex: 50"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="decimal-pad"
              editable={!isSubmitting}
            />
          )}
        />
        {errors.cultivationArea && (
          <Text style={styles.errorText}>{errors.cultivationArea.message}</Text>
        )}
      </View>

      <View style={styles.switchContainer}>
        <View style={styles.switchLabel}>
          <Text style={styles.label}>Tem acesso à internet diariamente?</Text>
          <Text style={styles.switchHint}>
            Isso nos ajuda a melhorar sua experiência
          </Text>
        </View>
        <Controller
          control={control}
          name="hasInternet"
          render={({ field: { onChange, value } }) => (
            <Switch
              value={value}
              onValueChange={onChange}
              trackColor={{ false: '#ddd', true: '#6B4226' }}
              thumbColor="#fff"
              disabled={isSubmitting}
            />
          )}
        />
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Cafetec</Text>
          <Text style={styles.headerSubtitle}>Cadastro de Produtor</Text>
        </View>

        {renderProgressBar()}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleBack}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonSecondaryText}>Voltar</Text>
            </TouchableOpacity>
          )}

          {currentStep < 3 ? (
            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonPrimary,
                currentStep === 1 && styles.buttonFull,
              ]}
              onPress={handleNext}
            >
              <Text style={styles.buttonPrimaryText}>Próximo</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonPrimary,
                isSubmitting && styles.buttonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonPrimaryText}>
                {isSubmitting ? 'Cadastrando...' : 'Finalizar Cadastro'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
          disabled={isSubmitting}
        >
          <Text style={styles.linkText}>Já tem uma conta? Entrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#6B4226',
    padding: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#f5f5f5',
  },
  progressContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B4226',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputSmall: {
    flex: 1,
  },
  inputLarge: {
    flex: 2,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  switchHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonFull: {
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: '#6B4226',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonDisabled: {
    backgroundColor: '#A0836B',
    opacity: 0.7,
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondaryText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#6B4226',
    fontSize: 14,
    fontWeight: '600',
  },
})

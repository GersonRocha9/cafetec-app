import { zodResolver } from '@hookform/resolvers/zod'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import { useProperty } from '../../contexts/PropertyContext'
import { useCreateAccount } from '../../hooks'
import { PropertyStackParamList } from '../../types/navigation'

// Categorias predefinidas
const EXPENSE_CATEGORIES = [
  'Insumos',
  'Fertilizantes',
  'Defensivos',
  'Manutenção',
  'Equipamentos',
  'Mão de Obra',
  'Transporte',
  'Energia',
  'Água',
  'Outros',
] as const

const INCOME_CATEGORIES = [
  'Venda de Café',
  'Venda de Produtos',
  'Serviços',
  'Outros',
] as const

const accountSchema = z.object({
  description: z
    .string({ required_error: 'Descrição é obrigatória' })
    .min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  value: z
    .string({ required_error: 'Valor é obrigatório' })
    .min(1, 'Valor é obrigatório')
    .regex(/^\d+([.,]\d{1,2})?$/, 'Valor inválido'),
  dueDate: z
    .string({ required_error: 'Data de vencimento é obrigatória' })
    .min(1, 'Data de vencimento é obrigatória'),
  category: z
    .string({ required_error: 'Categoria é obrigatória' })
    .min(2, 'Categoria é obrigatória'),
  notes: z.string().optional(),
})

type AccountFormData = z.infer<typeof accountSchema>

type Props = NativeStackScreenProps<PropertyStackParamList, 'AddAccount'>

export function AddAccountScreen({ navigation }: Props) {
  const { selectedProperty } = useProperty()
  const createAccountMutation = useCreateAccount()
  const [isReceivable, setIsReceivable] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  const categories = isReceivable ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      description: '',
      value: '',
      dueDate: '',
      category: '',
      notes: '',
    },
  })

  const onSubmit = async (data: AccountFormData) => {
    try {
      if (!selectedProperty) {
        Alert.alert('Erro', 'Nenhuma propriedade selecionada')
        return
      }

      // Converter valor para número
      const valueNumber = parseFloat(data.value.replace(',', '.'))

      // Converter data DD/MM/AAAA para YYYY-MM-DD
      const [day, month, year] = data.dueDate.split('/')
      const dateISO = `${year}-${month.padStart(2, '0')}-${day.padStart(
        2,
        '0'
      )}`

      await createAccountMutation.mutateAsync({
        property_id: selectedProperty.id,
        description: data.description,
        value: valueNumber,
        due_date: dateISO,
        category: data.category,
        notes: data.notes || null,
        type: isReceivable ? 'Recebível' : 'Pagável',
        status: 'Pendente', // Status padrão (ou deixe undefined para usar o default do banco)
      })

      Alert.alert(
        'Sucesso',
        `Conta ${
          isReceivable ? 'a receber' : 'a pagar'
        } adicionada com sucesso!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      )
    } catch (error) {
      console.error('Error saving account:', error)
      Alert.alert('Erro', 'Não foi possível salvar a conta. Tente novamente.')
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.content}>
          {/* Toggle tipo de conta */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Tipo de Conta</Text>
            <View style={styles.toggleRow}>
              <Text
                style={[
                  styles.toggleText,
                  !isReceivable && styles.toggleTextActive,
                ]}
              >
                A Pagar
              </Text>
              <Switch
                value={isReceivable}
                onValueChange={setIsReceivable}
                trackColor={{ false: '#EF4444', true: '#22C55E' }}
                thumbColor="#fff"
              />
              <Text
                style={[
                  styles.toggleText,
                  isReceivable && styles.toggleTextActive,
                ]}
              >
                A Receber
              </Text>
            </View>
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Descrição *</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.description && styles.inputError,
                    ]}
                    placeholder="Ex: Pagamento de fertilizante"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!isSubmitting}
                  />
                )}
              />
              {errors.description && (
                <Text style={styles.errorText}>
                  {errors.description.message}
                </Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Valor (R$) *</Text>
              <Controller
                control={control}
                name="value"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.value && styles.inputError]}
                    placeholder="0,00"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="decimal-pad"
                    editable={!isSubmitting}
                  />
                )}
              />
              {errors.value && (
                <Text style={styles.errorText}>{errors.value.message}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Data de Vencimento *</Text>
              <Controller
                control={control}
                name="dueDate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.dueDate && styles.inputError]}
                    placeholder="DD/MM/AAAA"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    editable={!isSubmitting}
                  />
                )}
              />
              {errors.dueDate && (
                <Text style={styles.errorText}>{errors.dueDate.message}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Categoria *</Text>
              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.input,
                        styles.selectInput,
                        errors.category && styles.inputError,
                      ]}
                      onPress={() => setShowCategoryModal(true)}
                      disabled={isSubmitting}
                    >
                      <Text
                        style={[
                          styles.selectText,
                          !value && styles.selectPlaceholder,
                        ]}
                      >
                        {value || 'Selecione uma categoria'}
                      </Text>
                      <Text style={styles.selectArrow}>▼</Text>
                    </TouchableOpacity>

                    <Modal
                      visible={showCategoryModal}
                      transparent
                      animationType="fade"
                      onRequestClose={() => setShowCategoryModal(false)}
                    >
                      <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowCategoryModal(false)}
                      >
                        <View style={styles.modalContent}>
                          <Text style={styles.modalTitle}>
                            Selecione a Categoria
                          </Text>
                          <ScrollView style={styles.modalScroll}>
                            {categories.map(category => (
                              <TouchableOpacity
                                key={category}
                                style={[
                                  styles.modalOption,
                                  value === category &&
                                    styles.modalOptionSelected,
                                ]}
                                onPress={() => {
                                  onChange(category)
                                  setShowCategoryModal(false)
                                }}
                              >
                                <Text
                                  style={[
                                    styles.modalOptionText,
                                    value === category &&
                                      styles.modalOptionTextSelected,
                                  ]}
                                >
                                  {category}
                                </Text>
                                {value === category && (
                                  <Text style={styles.checkmark}>✓</Text>
                                )}
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      </TouchableOpacity>
                    </Modal>
                  </>
                )}
              />
              {errors.category && (
                <Text style={styles.errorText}>{errors.category.message}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Observações</Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Informações adicionais..."
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!isSubmitting}
                  />
                )}
              />
            </View>
          </View>

          {/* Botões */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => navigation.goBack()}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonSecondaryText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonPrimary,
                createAccountMutation.isPending && styles.buttonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={createAccountMutation.isPending}
            >
              {createAccountMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonPrimaryText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  toggleContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  toggleText: {
    fontSize: 16,
    color: '#999',
  },
  toggleTextActive: {
    color: '#333',
    fontWeight: '600',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
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
  textArea: {
    height: 100,
    paddingTop: 12,
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 15,
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  selectPlaceholder: {
    color: '#999',
  },
  selectArrow: {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#6B422615',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: '#6B4226',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#6B4226',
    fontWeight: 'bold',
  },
})

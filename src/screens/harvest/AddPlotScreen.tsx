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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { z } from 'zod'
import { useCreatePlot } from '../../hooks'
import { PropertyStackParamList } from '../../types/navigation'

// Status válidos do banco de dados
const PLOT_STATUS = [
  'Em Plantio',
  'Em Crescimento',
  'Pronto para Colheita',
  'Em Colheita',
  'Pós-Colheita',
  'Em Manutenção',
] as const

const plotSchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  area: z
    .string({ required_error: 'Área é obrigatória' })
    .min(1, 'Área é obrigatória')
    .regex(/^\d+([.,]\d{1,2})?$/, 'Área inválida'),
  soilType: z
    .string({ required_error: 'Tipo de solo é obrigatório' })
    .min(3, 'Tipo de solo deve ter no mínimo 3 caracteres'),
  plantCount: z
    .string({ required_error: 'Número de plantios é obrigatório' })
    .min(1, 'Número de plantios é obrigatório')
    .regex(/^\d+$/, 'Deve ser um número válido'),
  status: z.enum(PLOT_STATUS, {
    required_error: 'Status é obrigatório',
  }),
  description: z.string().optional(),
})

type PlotFormData = z.infer<typeof plotSchema>

type Props = NativeStackScreenProps<PropertyStackParamList, 'AddPlot'>

export function AddPlotScreen({ route, navigation }: Props) {
  const { coffeeId } = route.params
  const createPlotMutation = useCreatePlot()
  const [showStatusModal, setShowStatusModal] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PlotFormData>({
    resolver: zodResolver(plotSchema),
    defaultValues: {
      name: '',
      area: '',
      soilType: '',
      plantCount: '',
      status: 'Em Plantio',
      description: '',
    },
  })

  const onSubmit = async (data: PlotFormData) => {
    try {
      // Converter valores para números
      const areaValue = parseFloat(data.area.replace(',', '.'))
      const plantingsValue = parseInt(data.plantCount, 10)

      await createPlotMutation.mutateAsync({
        coffee_id: coffeeId,
        name: data.name,
        area: areaValue,
        soil_type: data.soilType,
        plantings: plantingsValue,
        description: data.description || null,
        status: data.status,
      })

      Alert.alert('Sucesso', 'Talhão cadastrado com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      console.error('Error saving plot:', error)
      Alert.alert(
        'Erro',
        'Não foi possível cadastrar o talhão. Tente novamente.'
      )
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome do Talhão *</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="Ex: Talhão A - Norte"
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
              <Text style={styles.label}>Área (hectares) *</Text>
              <Controller
                control={control}
                name="area"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.area && styles.inputError]}
                    placeholder="0,00"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="decimal-pad"
                    editable={!isSubmitting}
                  />
                )}
              />
              {errors.area && (
                <Text style={styles.errorText}>{errors.area.message}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tipo de Solo *</Text>
              <Controller
                control={control}
                name="soilType"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.soilType && styles.inputError]}
                    placeholder="Ex: Latosol Vermelho"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!isSubmitting}
                  />
                )}
              />
              {errors.soilType && (
                <Text style={styles.errorText}>{errors.soilType.message}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Número de Plantios *</Text>
              <Controller
                control={control}
                name="plantCount"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.plantCount && styles.inputError,
                    ]}
                    placeholder="0"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    editable={!isSubmitting}
                  />
                )}
              />
              {errors.plantCount && (
                <Text style={styles.errorText}>
                  {errors.plantCount.message}
                </Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Status *</Text>
              <Controller
                control={control}
                name="status"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TouchableOpacity
                      style={[styles.input, styles.selectInput]}
                      onPress={() => setShowStatusModal(true)}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.selectText}>{value}</Text>
                      <Text style={styles.selectArrow}>▼</Text>
                    </TouchableOpacity>

                    <Modal
                      visible={showStatusModal}
                      transparent
                      animationType="fade"
                      onRequestClose={() => setShowStatusModal(false)}
                    >
                      <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowStatusModal(false)}
                      >
                        <View style={styles.modalContent}>
                          <Text style={styles.modalTitle}>
                            Selecione o Status
                          </Text>
                          {PLOT_STATUS.map((status) => (
                            <TouchableOpacity
                              key={status}
                              style={[
                                styles.modalOption,
                                value === status && styles.modalOptionSelected,
                              ]}
                              onPress={() => {
                                onChange(status)
                                setShowStatusModal(false)
                              }}
                            >
                              <Text
                                style={[
                                  styles.modalOptionText,
                                  value === status &&
                                    styles.modalOptionTextSelected,
                                ]}
                              >
                                {status}
                              </Text>
                              {value === status && (
                                <Text style={styles.checkmark}>✓</Text>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </TouchableOpacity>
                    </Modal>
                  </>
                )}
              />
              {errors.status && (
                <Text style={styles.errorText}>{errors.status.message}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Descrição</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Informações adicionais sobre o talhão..."
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
                createPlotMutation.isPending && styles.buttonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={createPlotMutation.isPending}
            >
              {createPlotMutation.isPending ? (
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
  content: {
    padding: 20,
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
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
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

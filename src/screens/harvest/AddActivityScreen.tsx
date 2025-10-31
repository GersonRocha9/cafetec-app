import { zodResolver } from '@hookform/resolvers/zod'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { z } from 'zod'
import { useCreateActivity } from '../../hooks'
import { PropertyStackParamList } from '../../types/navigation'
import {
  applyDateMask,
  dateToISO,
  isNotFutureDate,
  isValidDate,
} from '../../utils/masks'

const activitySchema = z.object({
  type: z
    .string({ required_error: 'Tipo de atividade é obrigatório' })
    .min(3, 'Tipo deve ter no mínimo 3 caracteres')
    .max(100, 'Tipo muito longo (máximo 100 caracteres)'),
  date: z
    .string({ required_error: 'Data é obrigatória' })
    .refine(val => isValidDate(val), 'Data inválida (use DD/MM/AAAA)')
    .refine(val => isNotFutureDate(val), 'Atividade não pode ser no futuro'),
  responsible: z
    .string({ required_error: 'Responsável é obrigatório' })
    .min(3, 'Nome do responsável deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo (máximo 100 caracteres)'),
  notes: z
    .string()
    .max(500, 'Observações muito longas (máximo 500 caracteres)')
    .optional(),
})

type ActivityFormData = z.infer<typeof activitySchema>

type Props = NativeStackScreenProps<PropertyStackParamList, 'AddActivity'>

export function AddActivityScreen({ route, navigation }: Props) {
  const { plotId } = route.params
  const createActivityMutation = useCreateActivity()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: '',
      date: '',
      responsible: '',
      notes: '',
    },
  })

  const onSubmit = async (data: ActivityFormData) => {
    try {
      // Converter data DD/MM/AAAA para YYYY-MM-DD usando função utilitária
      const dateISO = dateToISO(data.date)

      await createActivityMutation.mutateAsync({
        plot_id: plotId,
        type: data.type.trim(),
        date: dateISO,
        responsible: data.responsible.trim(),
        notes: data.notes?.trim() || null,
      })

      Alert.alert('Sucesso', 'Atividade cadastrada com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      console.error('Error saving activity:', error)
      Alert.alert(
        'Erro',
        'Não foi possível cadastrar a atividade. Tente novamente.'
      )
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tipo de Atividade *</Text>
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.type && styles.inputError]}
                  placeholder="Ex: Adubação, Irrigação, Poda..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  maxLength={100}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.type && (
              <Text style={styles.errorText}>{errors.type.message}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Data *</Text>
            <Controller
              control={control}
              name="date"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.date && styles.inputError]}
                  placeholder="DD/MM/AAAA"
                  value={value}
                  onChangeText={text => onChange(applyDateMask(text))}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  maxLength={10}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.date && (
              <Text style={styles.errorText}>{errors.date.message}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Responsável *</Text>
            <Controller
              control={control}
              name="responsible"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    errors.responsible && styles.inputError,
                  ]}
                  placeholder="Nome do responsável"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  maxLength={100}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.responsible && (
              <Text style={styles.errorText}>{errors.responsible.message}</Text>
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
                  placeholder="Detalhes da atividade..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.notes && (
              <Text style={styles.errorText}>{errors.notes.message}</Text>
            )}
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
              createActivityMutation.isPending && styles.buttonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={createActivityMutation.isPending}
          >
            {createActivityMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonPrimaryText}>Salvar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
})

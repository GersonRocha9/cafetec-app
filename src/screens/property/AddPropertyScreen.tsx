import { zodResolver } from '@hookform/resolvers/zod'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as ImagePicker from 'expo-image-picker'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { z } from 'zod'
import { useAuth } from '../../contexts/AuthContext'
import { useCreateProperty } from '../../hooks'
import { storageService } from '../../services'
import { PropertyStackParamList } from '../../types/navigation'

// Schema de validação
const addPropertySchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  nickname: z.string().optional(),
  carNumber: z
    .string({ required_error: 'Número do CAR é obrigatório' })
    .min(1, 'Número do CAR é obrigatório'),
  cep: z.string({ required_error: 'CEP é obrigatório' }).min(8, 'CEP inválido'),
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
})

type AddPropertyFormData = z.infer<typeof addPropertySchema>

type Props = NativeStackScreenProps<PropertyStackParamList, 'AddProperty'>

export function AddPropertyScreen({ navigation }: Props) {
  const { user } = useAuth()
  const createPropertyMutation = useCreateProperty()

  const [imageUri, setImageUri] = useState<string | null>(null)
  const [coordinates, setCoordinates] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<AddPropertyFormData>({
    resolver: zodResolver(addPropertySchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      nickname: '',
      carNumber: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      state: '',
      city: '',
    },
  })

  const searchCEP = async (cep: string) => {
    try {
      const cleanCEP = cep.replace(/\D/g, '')
      if (cleanCEP.length === 8) {
        setIsGeocoding(true)
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanCEP}/json/`
        )
        const data = await response.json()

        if (!data.erro) {
          setValue('street', data.logradouro || '')
          setValue('city', data.localidade || '')
          setValue('state', data.uf || '')
          setValue('complement', data.complemento || '')

          // Geocode address to get coordinates automatically
          const address = `${data.logradouro}, ${data.localidade}, ${data.uf}, Brazil`
          const geocodeResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              address
            )}&limit=1`,
            {
              headers: {
                'User-Agent': 'CafeTecApp/1.0',
              },
            }
          )
          const geocodeData = await geocodeResponse.json()

          if (geocodeData.length > 0) {
            const { lat, lon } = geocodeData[0]
            const coords = {
              latitude: parseFloat(lat),
              longitude: parseFloat(lon),
            }
            setCoordinates(coords)
          } else {
            // Se não encontrar coordenadas exatas, tenta só com cidade e estado
            const fallbackAddress = `${data.localidade}, ${data.uf}, Brazil`
            const fallbackResponse = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                fallbackAddress
              )}&limit=1`,
              {
                headers: {
                  'User-Agent': 'CafeTecApp/1.0',
                },
              }
            )
            const fallbackData = await fallbackResponse.json()

            if (fallbackData.length > 0) {
              const { lat, lon } = fallbackData[0]
              const coords = {
                latitude: parseFloat(lat),
                longitude: parseFloat(lon),
              }
              setCoordinates(coords)
            }
          }
        } else {
          Alert.alert('Erro', 'CEP não encontrado')
        }
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      Alert.alert('Erro', 'Não foi possível buscar o CEP')
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })
    if (!result.canceled) {
      setImageUri(result.assets[0].uri)
    }
  }

  const onSubmit = async (data: AddPropertyFormData) => {
    try {
      if (!coordinates) {
        Alert.alert(
          'Atenção',
          'Não foi possível obter as coordenadas do endereço. Verifique se o CEP está correto.'
        )
        return
      }

      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado')
        return
      }

      let imageUrl: string | null = null

      // Upload image to Supabase Storage if selected
      if (imageUri) {
        try {
          // Generate unique file path: user_id/property_name_timestamp.jpg
          const timestamp = Date.now()
          const fileExtension = imageUri.split('.').pop() || 'jpg'
          const fileName = `${data.name
            .toLowerCase()
            .replace(/\s+/g, '_')}_${timestamp}.${fileExtension}`
          const filePath = `${user.id}/${fileName}`

          // Upload to 'properties' bucket
          imageUrl = await storageService.uploadImage(
            'properties',
            filePath,
            imageUri
          )
        } catch (uploadError) {
          console.error('Erro no upload da imagem:', uploadError)
          Alert.alert(
            'Atenção',
            'Não foi possível fazer upload da imagem, mas a propriedade será cadastrada sem foto. Deseja continuar?',
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => {} },
              {
                text: 'Continuar',
                onPress: async () => {
                  // Continue without image
                  await saveProperty(data, coordinates, null)
                },
              },
            ]
          )
          return
        }
      }

      // Save property with image URL
      await saveProperty(data, coordinates, imageUrl)
    } catch (error: any) {
      console.error('Error:', error)
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível cadastrar a propriedade'
      )
    }
  }

  const saveProperty = async (
    data: AddPropertyFormData,
    location: { latitude: number; longitude: number },
    imageUrl: string | null
  ) => {
    if (!user) return

    // Convert coordinates to PostGIS Point format (WKT)
    // Note: PostGIS expects POINT(longitude latitude) - longitude first!
    const locationWKT = `POINT(${location.longitude} ${location.latitude})`

    await createPropertyMutation.mutateAsync({
      user_id: user.id,
      name: data.name,
      nickname: data.nickname || null,
      car_number: data.carNumber,
      cep: data.cep,
      street: data.street,
      number: data.number,
      complement: data.complement || null,
      city: data.city,
      state: data.state,
      latitude: location.latitude,
      longitude: location.longitude,
      location: locationWKT as any, // PostGIS Point in WKT format
      image_url: imageUrl,
    })

    Alert.alert('Sucesso! 🎉', 'Propriedade cadastrada com sucesso!', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nova Propriedade</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Seção de Imagem */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📷 Imagem da Propriedade</Text>
          <TouchableOpacity
            style={styles.imagePickerContainer}
            onPress={handleSelectImage}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.propertyImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderIcon}>📷</Text>
                <Text style={styles.imagePlaceholderText}>
                  Toque para adicionar uma foto
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Seção de Dados Básicos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Dados da Propriedade</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome da Propriedade *</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Ex: Fazenda Santa Clara"
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
            <Text style={styles.label}>Apelido</Text>
            <Controller
              control={control}
              name="nickname"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Fazendinha"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isSubmitting}
                />
              )}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Número do Recibo CAR *</Text>
            <Controller
              control={control}
              name="carNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.carNumber && styles.inputError]}
                  placeholder="Ex: SP-1234567-ABCD1234EFGH5678"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.carNumber && (
              <Text style={styles.errorText}>{errors.carNumber.message}</Text>
            )}
            <Text style={styles.hint}>
              Cadastro Ambiental Rural - Identificação única da propriedade
            </Text>
          </View>
        </View>

        {/* Seção de Endereço */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Endereço</Text>

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
                  onChangeText={text => {
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
                    placeholder="Bloco, Km..."
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

        {/* Seção de Localização */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Localização</Text>
          <Text style={styles.hint}>
            As coordenadas são obtidas automaticamente baseadas no endereço
          </Text>

          {isGeocoding && (
            <View style={styles.geocodingCard}>
              <ActivityIndicator size="small" color="#6B4226" />
              <Text style={styles.geocodingText}>Buscando coordenadas...</Text>
            </View>
          )}

          {coordinates && !isGeocoding && (
            <View style={styles.coordinatesCard}>
              <Text style={styles.coordinatesTitle}>✅ Localização Obtida</Text>
              <View style={styles.coordinatesRow}>
                <Text style={styles.coordinatesLabel}>Latitude:</Text>
                <Text style={styles.coordinatesValue}>
                  {coordinates.latitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.coordinatesRow}>
                <Text style={styles.coordinatesLabel}>Longitude:</Text>
                <Text style={styles.coordinatesValue}>
                  {coordinates.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          )}

          {!coordinates && !isGeocoding && (
            <View style={styles.noCoordinatesCard}>
              <Text style={styles.noCoordinatesIcon}>⚠️</Text>
              <Text style={styles.noCoordinatesText}>
                Preencha o CEP para obter as coordenadas automaticamente
              </Text>
            </View>
          )}
        </View>

        {/* Botões de Ação */}
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
              (isSubmitting || createPropertyMutation.isPending) &&
                styles.buttonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || createPropertyMutation.isPending}
          >
            {createPropertyMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonPrimaryText}>
                {isSubmitting ? 'Salvando...' : 'Cadastrar Propriedade'}
              </Text>
            )}
          </TouchableOpacity>
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
  header: {
    backgroundColor: '#6B4226',
    padding: 20,
    paddingBottom: 25,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  imagePickerContainer: {
    marginBottom: 16,
  },
  propertyImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
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
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    marginLeft: 5,
    fontStyle: 'italic',
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
  geocodingCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  geocodingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  coordinatesCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#22C55E',
    marginTop: 12,
  },
  coordinatesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22C55E',
    marginBottom: 12,
  },
  coordinatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  coordinatesLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  coordinatesValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  noCoordinatesCard: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginTop: 12,
    alignItems: 'center',
  },
  noCoordinatesIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  noCoordinatesText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 20,
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
    textAlign: 'center',
  },
  buttonSecondaryText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
})

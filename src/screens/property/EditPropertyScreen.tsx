import { zodResolver } from '@hookform/resolvers/zod'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import React, { useEffect, useRef, useState } from 'react'
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
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import { z } from 'zod'
import { LoadingState } from '../../components'
import { useAuth } from '../../contexts/AuthContext'
import { useProperty as usePropertyHook, useUpdateProperty } from '../../hooks'
import { storageService } from '../../services'
import { PropertyStackParamList } from '../../types/navigation'

const propertySchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  nickname: z.string().optional(),
  car_number: z.string().optional(),
  cep: z
    .string({ required_error: 'CEP é obrigatório' })
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
})

type PropertyFormData = z.infer<typeof propertySchema>

type Props = NativeStackScreenProps<PropertyStackParamList, 'EditProperty'>

export function EditPropertyScreen({ navigation, route }: Props) {
  const { propertyId } = route.params
  const { user } = useAuth()
  const updatePropertyMutation = useUpdateProperty()
  const mapRef = useRef<MapView>(null)

  // Buscar dados da propriedade
  const {
    data: property,
    isLoading: loadingProperty,
    error: propertyError,
  } = usePropertyHook(propertyId)

  const [imageUri, setImageUri] = useState<string | null>(null)
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: -22.61195,
    longitude: -46.057384,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  })
  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: -22.61195,
    longitude: -46.057384,
  })

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: '',
      nickname: '',
      car_number: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      city: '',
      state: '',
    },
  })

  // Pré-preencher formulário quando carregar a propriedade
  useEffect(() => {
    if (property) {
      setValue('name', property.name)
      setValue('nickname', property.nickname || '')
      setValue('car_number', property.car_number || '')
      setValue('cep', property.cep || '')
      setValue('street', property.street || '')
      setValue('number', property.number || '')
      setValue('complement', property.complement || '')
      setValue('city', property.city || '')
      setValue('state', property.state || '')

      // Atualizar imagem
      if (property.image_url) {
        setImageUri(property.image_url)
      }

      // Atualizar localização no mapa
      if (property.latitude && property.longitude) {
        const coords = {
          latitude: property.latitude,
          longitude: property.longitude,
        }
        setMarkerCoordinate(coords)
        setMapRegion({
          ...coords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        })
      }
    }
  }, [property, setValue])

  const searchCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '')
    if (cleanCEP.length !== 8) return

    try {
      // Buscar endereço via ViaCEP
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const data = await response.json()

      if (data.erro) {
        Alert.alert('Erro', 'CEP não encontrado')
        return
      }

      setValue('street', data.logradouro)
      setValue('city', data.localidade)
      setValue('state', data.uf)

      // Geocoding usando Nominatim OpenStreetMap
      const address = `${data.logradouro}, ${data.localidade}, ${data.uf}, Brasil`
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      )
      const geocodeData = await geocodeResponse.json()

      if (geocodeData.length > 0) {
        const { lat, lon } = geocodeData[0]
        const newCoords = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        }

        setMarkerCoordinate(newCoords)
        setMapRegion({
          ...newCoords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        })

        // Animar mapa para nova região
        mapRef.current?.animateToRegion(
          {
            ...newCoords,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        )
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      Alert.alert('Erro', 'Não foi possível buscar o endereço')
    }
  }

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Negada',
        'Precisamos da permissão de localização para usar esta funcionalidade.'
      )
      return false
    }
    return true
  }

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission()
    if (!hasPermission) return

    try {
      const location = await Location.getCurrentPositionAsync({})
      const newCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }

      setMarkerCoordinate(newCoords)
      setMapRegion({
        ...newCoords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      })

      mapRef.current?.animateToRegion(
        {
          ...newCoords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      )
    } catch (error) {
      console.error('Erro ao obter localização:', error)
      Alert.alert('Erro', 'Não foi possível obter sua localização')
    }
  }

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (permissionResult.granted === false) {
      Alert.alert(
        'Permissão Negada',
        'Precisamos da permissão para acessar suas fotos.'
      )
      return
    }

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

  const onSubmit = async (data: PropertyFormData) => {
    try {
      if (!user?.id) {
        Alert.alert('Erro', 'Usuário não autenticado')
        return
      }

      // Upload de imagem (se houver nova imagem)
      let imageUrl = property?.image_url || null

      // Se houver uma nova imagem (URI local)
      if (imageUri && imageUri.startsWith('file://')) {
        try {
          const timestamp = Date.now()
          const filePath = `${user.id}/${data.name.replace(
            /\s+/g,
            '_'
          )}_${timestamp}.jpg`

          imageUrl = await storageService.uploadImage(
            'properties',
            filePath,
            imageUri
          )

          // Deletar imagem antiga se existir
          if (property?.image_url) {
            try {
              const oldFilePath = storageService.extractFilePathFromUrl(
                property.image_url
              )
              if (oldFilePath) {
                await storageService.deleteImage('properties', oldFilePath)
              }
            } catch (error) {
              console.error('⚠️ Não foi possível remover imagem antiga:', error)
            }
          }
        } catch (error) {
          console.error('❌ Erro ao fazer upload da imagem:', error)
          const continueWithoutImage = await new Promise<boolean>((resolve) => {
            Alert.alert(
              'Erro no Upload',
              'Não foi possível fazer upload da imagem. Deseja continuar sem atualizar a foto?',
              [
                {
                  text: 'Cancelar',
                  style: 'cancel',
                  onPress: () => resolve(false),
                },
                {
                  text: 'Continuar',
                  onPress: () => resolve(true),
                },
              ]
            )
          })

          if (!continueWithoutImage) return
          imageUrl = property?.image_url || null
        }
      }

      // Converter location para PostGIS format (WKT)
      const locationWKT = `POINT(${markerCoordinate.longitude} ${markerCoordinate.latitude})`

      await updatePropertyMutation.mutateAsync({
        propertyId,
        updates: {
          name: data.name,
          nickname: data.nickname || undefined,
          car_number: data.car_number || undefined,
          cep: data.cep || undefined,
          street: data.street || undefined,
          number: data.number || undefined,
          complement: data.complement || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
          latitude: markerCoordinate.latitude,
          longitude: markerCoordinate.longitude,
          location: locationWKT,
          image_url: imageUrl || undefined,
        },
      })

      Alert.alert('Sucesso', 'Propriedade atualizada com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      console.error('Error updating property:', error)
      Alert.alert(
        'Erro',
        'Não foi possível atualizar a propriedade. Tente novamente.'
      )
    }
  }

  if (loadingProperty) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState />
      </SafeAreaView>
    )
  }

  if (propertyError || !property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Erro ao carregar dados da propriedade
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>📝 Editar Propriedade</Text>

          {/* Imagem */}
          <View style={styles.imageSection}>
            <Text style={styles.label}>Foto da Propriedade</Text>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickImage}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>
                    📷 Alterar Foto
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Dados Básicos */}
          <View style={styles.form}>
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
                    placeholder="Ex: Fazenda do Zé"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!isSubmitting}
                  />
                )}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Número do CAR</Text>
              <Controller
                control={control}
                name="car_number"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: MG-1234567-ABCDEFGHIJKLMNOPQRSTUVWXYZ012345"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!isSubmitting}
                  />
                )}
              />
            </View>

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
                    onChangeText={onChange}
                    onBlur={(e) => {
                      onBlur()
                      searchCEP(value)
                    }}
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
              <Text style={styles.label}>Rua</Text>
              <Controller
                control={control}
                name="street"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Nome da rua"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!isSubmitting}
                  />
                )}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.label}>Número</Text>
                <Controller
                  control={control}
                  name="number"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      editable={!isSubmitting}
                    />
                  )}
                />
              </View>

              <View style={[styles.inputContainer, { flex: 2 }]}>
                <Text style={styles.label}>Complemento</Text>
                <Controller
                  control={control}
                  name="complement"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Apto, Bloco, etc"
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
              <View style={[styles.inputContainer, { flex: 2 }]}>
                <Text style={styles.label}>Cidade</Text>
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Nome da cidade"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      editable={!isSubmitting}
                    />
                  )}
                />
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.label}>UF</Text>
                <Controller
                  control={control}
                  name="state"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="UF"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      maxLength={2}
                      autoCapitalize="characters"
                      editable={!isSubmitting}
                    />
                  )}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>🗺️ Localização no Mapa</Text>
            <Text style={styles.mapHint}>
              Toque no mapa para ajustar a localização exata
            </Text>

            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                region={mapRegion}
                provider={PROVIDER_GOOGLE}
                onPress={(e) => {
                  const coords = e.nativeEvent.coordinate
                  setMarkerCoordinate(coords)
                }}
              >
                <Marker coordinate={markerCoordinate} />
              </MapView>
            </View>

            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
            >
              <Text style={styles.locationButtonText}>
                📍 Usar Minha Localização Atual
              </Text>
            </TouchableOpacity>
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
                updatePropertyMutation.isPending && styles.buttonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={updatePropertyMutation.isPending}
            >
              {updatePropertyMutation.isPending ? (
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
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
  imageSection: {
    marginBottom: 20,
  },
  imagePickerButton: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#666',
  },
  mapHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  map: {
    flex: 1,
  },
  locationButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#6B4226',
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})

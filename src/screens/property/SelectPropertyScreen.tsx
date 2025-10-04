import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItemInfo,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { EmptyState, ErrorState, LoadingState } from '../../components'
import { useAuth } from '../../contexts/AuthContext'
import { useProperty } from '../../contexts/PropertyContext'
import { useDeleteProperty, useProperties } from '../../hooks'
import type { Property } from '../../services'
import { storageService } from '../../services'
import { PropertyStackParamList } from '../../types/navigation'

type Props = NativeStackScreenProps<PropertyStackParamList, 'SelectProperty'>

export function SelectPropertyScreen({ navigation }: Props) {
  const { user } = useAuth()
  const { setSelectedProperty, selectedProperty } = useProperty()
  const deletePropertyMutation = useDeleteProperty()

  const {
    data: properties,
    isLoading,
    error,
    refetch,
  } = useProperties(user?.id)

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property)
    navigation.navigate('PropertyTabs', { screen: 'Home' })
  }

  const handleEditProperty = (property: Property, event: any) => {
    event.stopPropagation()
    navigation.navigate('EditProperty', { propertyId: property.id })
  }

  const handleDeleteProperty = async (property: Property, event: any) => {
    event.stopPropagation()

    Alert.alert(
      'Excluir Propriedade',
      `Tem certeza que deseja excluir "${property.name}"? Esta ação não pode ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // Deletar imagem do storage se existir
              if (property.image_url) {
                try {
                  const filePath = storageService.extractFilePathFromUrl(
                    property.image_url
                  )
                  if (filePath) {
                    await storageService.deleteImage('properties', filePath)
                  }
                } catch (error) {
                  console.error('⚠️ Erro ao remover imagem:', error)
                }
              }

              // Deletar propriedade (soft delete)
              await deletePropertyMutation.mutateAsync(property.id)

              // Se a propriedade deletada era a selecionada, limpar seleção
              if (selectedProperty?.id === property.id) {
                setSelectedProperty(null)
              }

              Alert.alert('Sucesso', 'Propriedade excluída com sucesso!')
            } catch (error) {
              console.error('Error deleting property:', error)
              Alert.alert(
                'Erro',
                'Não foi possível excluir a propriedade. Tente novamente.'
              )
            }
          },
        },
      ]
    )
  }

  const renderPropertyItem = ({ item }: ListRenderItemInfo<Property>) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => handleSelectProperty(item)}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.propertyImage} />
      ) : (
        <View style={styles.propertyImagePlaceholder}>
          <Text style={styles.propertyImageIcon}>🏡</Text>
        </View>
      )}
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyName}>{item.name}</Text>
        {item.nickname && (
          <Text style={styles.propertyNickname}>"{item.nickname}"</Text>
        )}
        <Text style={styles.propertyLocation}>
          📍 {item.city} - {item.state}
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={(e) => handleEditProperty(item, e)}
          >
            <Text style={styles.actionButtonText}>✏️ Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={(e) => handleDeleteProperty(item, e)}
          >
            <Text style={styles.actionButtonText}>🗑️ Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )

  // Loading state
  if (isLoading) {
    return <LoadingState message="Carregando propriedades..." />
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        message="Não foi possível carregar as propriedades"
        onRetry={refetch}
      />
    )
  }

  // Empty state
  if (!properties || properties.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="🏡"
          title="Nenhuma propriedade cadastrada"
          description="Comece cadastrando sua primeira propriedade rural para acessar todas as funcionalidades do app."
          actionLabel="Nova Propriedade"
          onAction={() => navigation.navigate('AddProperty')}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Minhas Propriedades</Text>
          <Text style={styles.subtitle}>
            Selecione uma propriedade para gerenciar
          </Text>
        </View>
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={renderPropertyItem}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddProperty')}
      >
        <Text style={styles.addButtonIcon}>+</Text>
        <Text style={styles.addButtonText}>Nova Propriedade</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B4226',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  propertyImagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyImageIcon: {
    fontSize: 64,
    opacity: 0.3,
  },
  propertyInfo: {
    padding: 16,
  },
  propertyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  propertyNickname: {
    fontSize: 16,
    color: '#8B4513',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    left: 20,
    backgroundColor: '#6B4226',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
})

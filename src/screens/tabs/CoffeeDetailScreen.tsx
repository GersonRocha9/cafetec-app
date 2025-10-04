import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useMemo, useState } from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { EmptyState, ErrorState, LoadingState } from '../../components'
import { useCoffee, usePlotsByCoffee } from '../../hooks'
import { PropertyStackParamList } from '../../types/navigation'

type Props = NativeStackScreenProps<PropertyStackParamList, 'CoffeeDetail'>

// Função helper para determinar cor do status
const getStatusColor = (status: string) => {
  const lowerStatus = status.toLowerCase()
  if (lowerStatus.includes('pronto') || lowerStatus.includes('colheita')) {
    return '#22C55E'
  } else if (lowerStatus.includes('desenvolvimento')) {
    return '#F59E0B'
  } else if (lowerStatus.includes('manutenção')) {
    return '#EF4444'
  }
  return '#999'
}

export function CoffeeDetailScreen({ route, navigation }: Props) {
  const { id } = route.params
  const [searchQuery, setSearchQuery] = useState('')

  // Buscar dados do café e seus talhões
  const {
    data: coffee,
    isLoading: coffeeLoading,
    error: coffeeError,
    refetch: refetchCoffee,
  } = useCoffee(id)

  const {
    data: plots = [],
    isLoading: plotsLoading,
    error: plotsError,
  } = usePlotsByCoffee(id)

  // Filtrar talhões pela busca
  const filteredPlots = useMemo(
    () =>
      plots.filter((plot) =>
        plot.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [plots, searchQuery]
  )

  const handleNavigateToPlot = (plotId: string) => {
    navigation.navigate('PlotDetail', { id: plotId })
  }

  // Loading state
  if (coffeeLoading || plotsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState />
      </SafeAreaView>
    )
  }

  // Error state
  if (coffeeError || plotsError) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          message="Erro ao carregar informações do café"
          onRetry={() => refetchCoffee()}
        />
      </SafeAreaView>
    )
  }

  // Empty state (coffee not found)
  if (!coffee) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="☕"
          title="Café não encontrado"
          description="Não foi possível encontrar as informações deste café"
          actionLabel="Voltar"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Imagem do Café */}
        {coffee.image_url ? (
          <Image source={{ uri: coffee.image_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderIcon}>☕</Text>
          </View>
        )}

        {/* Header com informações */}
        <View style={styles.infoCard}>
          <Text style={styles.coffeeName}>{coffee.name}</Text>
          {coffee.variety && (
            <Text style={styles.coffeeVariety}>{coffee.variety}</Text>
          )}
        </View>

        {/* Campo de pesquisa */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar talhões..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Listagem de Talhões */}
        <View style={styles.plotsSection}>
          <Text style={styles.sectionTitle}>
            🌱 Talhões ({filteredPlots.length})
          </Text>
          {filteredPlots.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text
                style={{ color: '#999', fontSize: 16, textAlign: 'center' }}
              >
                {searchQuery
                  ? 'Nenhum talhão encontrado com esse nome'
                  : 'Nenhum talhão cadastrado para este café ainda'}
              </Text>
            </View>
          ) : (
            filteredPlots.map((plot) => {
              const statusColor = getStatusColor(plot.status)
              return (
                <TouchableOpacity
                  key={plot.id}
                  style={styles.plotCard}
                  onPress={() => handleNavigateToPlot(plot.id)}
                >
                  <View style={styles.plotHeader}>
                    <View style={styles.plotInfo}>
                      <Text style={styles.plotName}>{plot.name}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: `${statusColor}15` },
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: statusColor },
                          ]}
                        />
                        <Text
                          style={[styles.statusText, { color: statusColor }]}
                        >
                          {plot.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.areaContainer}>
                      <Text style={styles.areaValue}>
                        {plot.area.toFixed(1)}
                      </Text>
                      <Text style={styles.areaLabel}>ha</Text>
                    </View>
                  </View>
                  <Text style={styles.viewDetailsText}>Ver detalhes →</Text>
                </TouchableOpacity>
              )
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddPlot', { coffeeId: id })}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#6B4226',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderIcon: {
    fontSize: 72,
    opacity: 0.3,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  coffeeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  coffeeVariety: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  plotsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  plotCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  plotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  plotInfo: {
    flex: 1,
  },
  plotName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  areaContainer: {
    alignItems: 'flex-end',
  },
  areaValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B4226',
  },
  areaLabel: {
    fontSize: 12,
    color: '#999',
  },
  viewDetailsText: {
    fontSize: 13,
    color: '#6B4226',
    fontWeight: '600',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6B4226',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
})

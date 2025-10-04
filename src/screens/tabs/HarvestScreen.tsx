import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { EmptyState, ErrorState, LoadingState } from '../../components'
import { useProperty } from '../../contexts/PropertyContext'
import { useCoffees, usePlotsByCoffee } from '../../hooks'
import {
  PropertyStackParamList,
  PropertyTabsParamList,
} from '../../types/navigation'

type Props = CompositeScreenProps<
  BottomTabScreenProps<PropertyTabsParamList, 'Harvest'>,
  NativeStackScreenProps<PropertyStackParamList>
>

// Componente auxiliar para cada card de café
function CoffeeCard({ coffee, onPress }: { coffee: any; onPress: () => void }) {
  const { data: plots = [] } = usePlotsByCoffee(coffee.id)

  // Calcular área total dos talhões
  const totalArea = plots.reduce((sum, plot) => sum + (plot.area || 0), 0)

  return (
    <TouchableOpacity style={styles.coffeeCard} onPress={onPress}>
      <View style={styles.coffeeHeader}>
        <View>
          <Text style={styles.coffeeName}>{coffee.name}</Text>
          <Text style={styles.coffeeVariety}>{coffee.variety || 'N/A'}</Text>
        </View>
        <View style={styles.areaContainer}>
          <Text style={styles.areaValue}>{totalArea.toFixed(1)}</Text>
          <Text style={styles.areaLabel}>hectares</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.plotsContainer}>
        <Text style={styles.plotsLabel}>🌱 Talhões ({plots.length})</Text>
        {plots.slice(0, 3).map((plot) => (
          <View key={plot.id} style={styles.plotItem}>
            <Text style={styles.plotBullet}>•</Text>
            <Text style={styles.plotName}>{plot.name}</Text>
          </View>
        ))}
        {plots.length > 3 && (
          <Text style={styles.plotName}>+ {plots.length - 3} outros</Text>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.viewDetailsText}>Ver detalhes →</Text>
      </View>
    </TouchableOpacity>
  )
}

export function HarvestScreen({ navigation }: Props) {
  const { selectedProperty } = useProperty()
  const {
    data: coffees = [],
    isLoading,
    error,
    refetch,
  } = useCoffees(selectedProperty?.id)

  const handleNavigateToCoffee = (coffeeId: string) => {
    navigation.navigate('CoffeeDetail', { id: coffeeId })
  }

  // Estados de loading/error/empty
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Colheita</Text>
          <Text style={styles.subtitle}>Gestão de Tipos de Café</Text>
        </View>
        <LoadingState />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Colheita</Text>
          <Text style={styles.subtitle}>Gestão de Tipos de Café</Text>
        </View>
        <ErrorState
          message="Erro ao carregar tipos de café"
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    )
  }

  if (coffees.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Colheita</Text>
          <Text style={styles.subtitle}>Gestão de Tipos de Café</Text>
        </View>
        <EmptyState
          icon="☕"
          title="Nenhum tipo de café cadastrado"
          description="Cadastre seu primeiro tipo de café para começar a gerenciar sua produção e talhões"
          actionLabel="Adicionar Café"
          onAction={() => navigation.navigate('AddCoffee')}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Colheita</Text>
          <Text style={styles.subtitle}>Gestão de Tipos de Café</Text>
        </View>

        {/* Cards de Cafés */}
        <View style={styles.content}>
          {coffees.map((coffee) => (
            <CoffeeCard
              key={coffee.id}
              coffee={coffee}
              onPress={() => handleNavigateToCoffee(coffee.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddCoffee')}
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
  header: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#6B4226',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#f5f5f5',
    opacity: 0.9,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  coffeeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  coffeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  coffeeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  coffeeVariety: {
    fontSize: 14,
    color: '#666',
  },
  areaContainer: {
    alignItems: 'flex-end',
  },
  areaValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B4226',
  },
  areaLabel: {
    fontSize: 12,
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 16,
  },
  plotsContainer: {
    marginBottom: 12,
  },
  plotsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  plotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  plotBullet: {
    fontSize: 16,
    color: '#6B4226',
    marginRight: 8,
  },
  plotName: {
    fontSize: 14,
    color: '#333',
  },
  cardFooter: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#6B4226',
    fontWeight: '600',
    textAlign: 'right',
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

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useCallback } from 'react'
import {
  RefreshControl,
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
import { colors, spacing, borderRadius, shadows } from '../../constants/theme'

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
        {plots.slice(0, 3).map(plot => (
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

  // Pull to refresh
  const [refreshing, setRefreshing] = React.useState(false)
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }, [refetch])

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Colheita</Text>
            <Text style={styles.subtitle}>Gestão de Tipos de Café</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddCoffee')}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Cards de Cafés */}
        <View style={styles.content}>
          {coffees.map(coffee => (
            <CoffeeCard
              key={coffee.id}
              coffee={coffee}
              onPress={() => handleNavigateToCoffee(coffee.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
    backgroundColor: colors.primary.main,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.inverse,
    opacity: 0.9,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.text.inverse}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 28,
    color: colors.text.inverse,
    fontWeight: '300',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.base,
  },
  coffeeCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  coffeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.base,
  },
  coffeeName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  coffeeVariety: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  areaContainer: {
    alignItems: 'flex-end',
    backgroundColor: `${colors.primary.light}15`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.base,
  },
  areaValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary.main,
  },
  areaLabel: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.light,
    marginBottom: spacing.base,
  },
  plotsContainer: {
    marginBottom: spacing.md,
  },
  plotsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  plotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  plotBullet: {
    fontSize: 16,
    color: colors.primary.main,
    marginRight: spacing.sm,
  },
  plotName: {
    fontSize: 14,
    color: colors.text.primary,
  },
  cardFooter: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightest,
  },
  viewDetailsText: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '600',
    textAlign: 'right',
  },
})

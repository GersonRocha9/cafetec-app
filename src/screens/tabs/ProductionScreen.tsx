import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useMemo, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { EmptyState, ErrorState, LoadingState } from '../../components'
import { useProperty } from '../../contexts/PropertyContext'
import { usePlotsByProperty, useProductionStats } from '../../hooks'
import {
  PropertyStackParamList,
  PropertyTabsParamList,
} from '../../types/navigation'

type Props = CompositeScreenProps<
  BottomTabScreenProps<PropertyTabsParamList, 'Production'>,
  NativeStackScreenProps<PropertyStackParamList>
>

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

export function ProductionScreen({ navigation }: Props) {
  const { selectedProperty } = useProperty()
  const [searchQuery, setSearchQuery] = useState('')
  const currentYear = new Date().getFullYear()

  // Buscar dados
  const {
    data: plots = [],
    isLoading: plotsLoading,
    error: plotsError,
    refetch: refetchPlots,
  } = usePlotsByProperty(selectedProperty?.id)

  const {
    data: productionStats,
    isLoading: statsLoading,
    error: statsError,
  } = useProductionStats(selectedProperty?.id, currentYear)

  // Filtrar talhões pela busca
  const filteredPlots = useMemo(
    () =>
      plots.filter((plot) =>
        plot.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [plots, searchQuery]
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const handleNavigateToPlot = (plotId: string) => {
    navigation.navigate('PlotDetail', { id: plotId })
  }

  // Calcular dados derivados
  const totalArea = plots.reduce((sum, plot) => sum + (plot.area || 0), 0)
  const actualProduction = productionStats?.actual_production || 0 // em sacas
  const totalCost = productionStats?.total_cost || 0

  // Calcular receita estimada (R$ 150/saca)
  const estimatedRevenue = actualProduction * 150

  // Calcular % lucro
  const profitPercentage =
    estimatedRevenue > 0
      ? ((estimatedRevenue - totalCost) / estimatedRevenue) * 100
      : 0

  // Produção por hectare
  const avgProductionPerHa = totalArea > 0 ? actualProduction / totalArea : 0

  // Estados de loading/error
  const isLoading = plotsLoading || statsLoading
  const hasError = plotsError || statsError

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Produção</Text>
          <Text style={styles.subtitle}>Visão Geral de Produção</Text>
        </View>
        <LoadingState />
      </SafeAreaView>
    )
  }

  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Produção</Text>
          <Text style={styles.subtitle}>Visão Geral de Produção</Text>
        </View>
        <ErrorState
          message="Erro ao carregar dados de produção"
          onRetry={() => refetchPlots()}
        />
      </SafeAreaView>
    )
  }

  if (plots.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Produção</Text>
          <Text style={styles.subtitle}>Visão Geral de Produção</Text>
        </View>
        <EmptyState
          icon="🌱"
          title="Nenhum talhão cadastrado"
          description="Para visualizar dados de produção, você precisa cadastrar tipos de café e seus talhões primeiro"
          actionLabel="Ir para Colheita"
          onAction={() => navigation.navigate('Harvest')}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Produção</Text>
          <Text style={styles.subtitle}>Visão Geral de Produção</Text>
        </View>

        {/* Card de Visão Geral */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Visão Geral</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Receita</Text>
              <Text style={[styles.overviewValue, styles.revenueColor]}>
                {formatCurrency(estimatedRevenue)}
              </Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Despesa</Text>
              <Text style={[styles.overviewValue, styles.expenseColor]}>
                {formatCurrency(totalCost)}
              </Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>% Lucro</Text>
              <Text style={[styles.overviewValue, styles.profitColor]}>
                {profitPercentage.toFixed(0)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Card de Dados da Propriedade */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Dados da Propriedade</Text>
          <View style={styles.propertyData}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Produção por Hectare</Text>
              <Text style={styles.dataValue}>
                {avgProductionPerHa.toFixed(1)} sacas/ha
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Total de Sacas</Text>
              <Text style={styles.dataValue}>
                {Math.round(actualProduction).toLocaleString('pt-BR')} sacas
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Área Total</Text>
              <Text style={styles.dataValue}>{totalArea.toFixed(1)} ha</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Gasto Total ({currentYear})</Text>
              <Text style={[styles.dataValue, styles.expenseColor]}>
                {formatCurrency(totalCost)}
              </Text>
            </View>
          </View>
        </View>

        {/* Campo de Pesquisa */}
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
            🌱 Talhões da Propriedade ({filteredPlots.length})
          </Text>
          {filteredPlots.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#999', fontSize: 16 }}>
                Nenhum talhão encontrado
              </Text>
            </View>
          ) : (
            filteredPlots.map((plot) => {
              const statusColor = getStatusColor(plot.status)
              // Estimar produção (30 sacas/ha como padrão)
              const estimatedProduction = Math.round((plot.area || 0) * 30)

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
                    <View style={styles.plotStats}>
                      <Text style={styles.plotStatsValue}>
                        {plot.area.toFixed(1)} ha
                      </Text>
                      <Text style={styles.plotStatsLabel}>
                        ~{estimatedProduction} sacas
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.viewDetailsText}>Ver detalhes →</Text>
                </TouchableOpacity>
              )
            })
          )}
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
    paddingBottom: 20,
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
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  // Visão Geral
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  overviewValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  overviewDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#e0e0e0',
  },
  revenueColor: {
    color: '#22C55E',
  },
  expenseColor: {
    color: '#EF4444',
  },
  profitColor: {
    color: '#3B82F6',
  },
  // Dados da Propriedade
  propertyData: {
    gap: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dataLabel: {
    fontSize: 15,
    color: '#666',
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  // Campo de Pesquisa
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
  // Listagem de Talhões
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
  plotStats: {
    alignItems: 'flex-end',
  },
  plotStatsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B4226',
  },
  plotStatsLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  viewDetailsText: {
    fontSize: 13,
    color: '#6B4226',
    fontWeight: '600',
    marginTop: 4,
  },
})

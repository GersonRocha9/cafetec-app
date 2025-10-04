import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LoadingState } from '../../components'
import { useProperty } from '../../contexts/PropertyContext'
import {
  useFinancialSummary,
  usePlotsByProperty,
  useProductionStats,
  useWeather,
} from '../../hooks'
import { weatherService } from '../../services'
import { PropertyTabsParamList } from '../../types/navigation'

type Props = BottomTabScreenProps<PropertyTabsParamList, 'Home'>

export function HomeScreen({ navigation }: Props) {
  const { selectedProperty } = useProperty()
  const currentYear = new Date().getFullYear()

  // Data de hoje
  const today = new Date()
  const dateString = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Buscar dados
  const { data: financialSummary, isLoading: financialLoading } =
    useFinancialSummary(selectedProperty?.id)

  const { data: productionStats, isLoading: productionLoading } =
    useProductionStats(selectedProperty?.id, currentYear)

  const { data: plots = [], isLoading: plotsLoading } = usePlotsByProperty(
    selectedProperty?.id
  )

  // Weather data from API
  const {
    data: weatherData,
    isLoading: weatherLoading,
    error: weatherError,
  } = useWeather(selectedProperty?.latitude, selectedProperty?.longitude)

  // Process weather data
  const temperature = weatherData
    ? weatherService.kelvinToCelsius(weatherData.main.temp)
    : null
  const condition = weatherData?.weather[0]?.description || 'Sem dados'
  const humidity = weatherData?.main.humidity || 0
  const wind = weatherData ? weatherService.msToKmh(weatherData.wind.speed) : 0
  const rainfall = weatherData?.rain?.['1h'] || weatherData?.rain?.['3h'] || 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Calcular dados derivados
  const balance = financialSummary?.balance || 0
  const toReceive = financialSummary?.to_receive || 0
  const toPay = financialSummary?.to_pay || 0

  const totalArea = productionStats?.total_area || 0
  const totalPlots = productionStats?.total_plots || 0
  const expectedProduction = productionStats?.expected_production || 0
  const actualProduction = productionStats?.actual_production || 0
  const productionPercentage = productionStats?.production_percentage || 0
  const totalCost = productionStats?.total_cost || 0

  // Estimar plantas (6.000 plantas/hectare é média para café)
  const estimatedPlants = Math.round(totalArea * 6000)

  // Produção por hectare
  const productionPerHectare =
    totalArea > 0 ? (actualProduction / totalArea).toFixed(1) : '0.0'

  // Loading state
  const isLoading = financialLoading || productionLoading || plotsLoading

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Início</Text>
          <Text style={styles.subtitle}>
            {dateString.charAt(0).toUpperCase() + dateString.slice(1)}
          </Text>
        </View>
        <LoadingState />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Início</Text>
          <Text style={styles.subtitle}>
            {dateString.charAt(0).toUpperCase() + dateString.slice(1)}
          </Text>
        </View>

        {/* Card de Resumo Financeiro */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Resumo Financeiro</Text>
          <View style={styles.cardContent}>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Saldo Atual</Text>
              <Text
                style={[
                  styles.financialValue,
                  balance >= 0 ? styles.balancePositive : styles.toPay,
                ]}
              >
                {formatCurrency(balance)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>A Receber</Text>
              <Text style={[styles.financialValue, styles.toReceive]}>
                {formatCurrency(toReceive)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>A Pagar</Text>
              <Text style={[styles.financialValue, styles.toPay]}>
                {formatCurrency(toPay)}
              </Text>
            </View>
          </View>
        </View>

        {/* Card de Resumo de Produção */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Resumo de Produção</Text>
          <View style={styles.cardContent}>
            <View style={styles.productionRow}>
              <Text style={styles.productionLabel}>
                Progresso da Safra {currentYear}
              </Text>
              <View style={styles.percentageContainer}>
                <Text style={styles.percentageValue}>
                  {productionPercentage.toFixed(0)}%
                </Text>
                <Text style={styles.percentageLabel}>do esperado</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.productionRow}>
              <Text style={styles.productionLabel}>Gasto Total</Text>
              <Text style={styles.productionValue}>
                {formatCurrency(totalCost)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.productionRow}>
              <Text style={styles.productionLabel}>Produção por Hectare</Text>
              <Text style={styles.productionValue}>
                {productionPerHectare} sacas/ha
              </Text>
            </View>
          </View>
        </View>

        {/* Card de Previsão do Tempo */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌤️ Previsão do Tempo</Text>
          {weatherLoading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#999' }}>Carregando clima...</Text>
            </View>
          ) : weatherError || !temperature ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#999', textAlign: 'center' }}>
                Não foi possível carregar os dados do clima
              </Text>
            </View>
          ) : (
            <View style={styles.weatherContainer}>
              <View style={styles.temperatureSection}>
                <Text style={styles.temperature}>{temperature}°C</Text>
                <Text style={styles.weatherCondition}>
                  {condition.charAt(0).toUpperCase() + condition.slice(1)}
                </Text>
              </View>
              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetailRow}>
                  <Text style={styles.weatherDetailLabel}>💧 Umidade</Text>
                  <Text style={styles.weatherDetailValue}>{humidity}%</Text>
                </View>
                <View style={styles.weatherDetailRow}>
                  <Text style={styles.weatherDetailLabel}>🌬️ Vento</Text>
                  <Text style={styles.weatherDetailValue}>{wind} km/h</Text>
                </View>
                <View style={styles.weatherDetailRow}>
                  <Text style={styles.weatherDetailLabel}>🌧️ Chuva</Text>
                  <Text style={styles.weatherDetailValue}>
                    {rainfall.toFixed(1)} mm
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Card de Estatísticas Rápidas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 Estatísticas da Propriedade</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalArea.toFixed(0)}</Text>
              <Text style={styles.statLabel}>hectares</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalPlots}</Text>
              <Text style={styles.statLabel}>talhões</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {estimatedPlants >= 1000
                  ? `${Math.round(estimatedPlants / 1000)}k`
                  : estimatedPlants}
              </Text>
              <Text style={styles.statLabel}>plantas*</Text>
            </View>
          </View>
          <Text
            style={{
              fontSize: 11,
              color: '#999',
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            * Estimativa baseada em 6.000 plantas/ha
          </Text>
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
  cardContent: {
    gap: 12,
  },
  // Estilos Financeiros
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  financialLabel: {
    fontSize: 16,
    color: '#666',
  },
  financialValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  balancePositive: {
    color: '#22C55E',
  },
  toReceive: {
    color: '#3B82F6',
  },
  toPay: {
    color: '#EF4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  // Estilos de Produção
  productionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  productionLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  productionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  percentageContainer: {
    alignItems: 'flex-end',
  },
  percentageValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B4226',
  },
  percentageLabel: {
    fontSize: 12,
    color: '#999',
  },
  // Estilos de Clima
  weatherContainer: {
    gap: 16,
  },
  temperatureSection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6B4226',
  },
  weatherCondition: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  weatherDetails: {
    gap: 12,
  },
  weatherDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  weatherDetailLabel: {
    fontSize: 15,
    color: '#666',
  },
  weatherDetailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  // Estilos de Estatísticas
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B4226',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
})

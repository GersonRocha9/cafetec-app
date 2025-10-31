import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import React, { useCallback } from 'react'
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LoadingState, Card, CardHeader, CardContent } from '../../components'
import { useProperty } from '../../contexts/PropertyContext'
import {
  useFinancialSummary,
  useProductionStats,
  useWeather,
} from '../../hooks'
import { weatherService } from '../../services'
import { PropertyTabsParamList } from '../../types/navigation'
import { colors, spacing } from '../../constants/theme'

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
  const {
    data: financialSummary,
    isLoading: financialLoading,
    refetch: refetchFinancial,
  } = useFinancialSummary(selectedProperty?.id)

  const {
    data: productionStats,
    isLoading: productionLoading,
    refetch: refetchProduction,
  } = useProductionStats(selectedProperty?.id, currentYear)

  // Weather data from API
  const {
    data: weatherData,
    isLoading: weatherLoading,
    error: weatherError,
    refetch: refetchWeather,
  } = useWeather(selectedProperty?.latitude, selectedProperty?.longitude)

  // Pull to refresh
  const [refreshing, setRefreshing] = React.useState(false)
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        refetchFinancial(),
        refetchProduction(),
        refetchWeather(),
      ])
    } finally {
      setRefreshing(false)
    }
  }, [refetchFinancial, refetchProduction, refetchWeather])

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
  const actualProduction = productionStats?.actual_production || 0
  const productionPercentage = productionStats?.production_percentage || 0
  const totalCost = productionStats?.total_cost || 0

  // Estimar plantas (6.000 plantas/hectare é média para café)
  const estimatedPlants = Math.round(totalArea * 6000)

  // Produção por hectare
  const productionPerHectare =
    totalArea > 0 ? (actualProduction / totalArea).toFixed(1) : '0.0'

  // Loading state
  const isLoading = financialLoading || productionLoading

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá! 👋</Text>
          <Text style={styles.propertyName}>{selectedProperty?.name}</Text>
        </View>
        <LoadingState />
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Olá! 👋</Text>
              <Text style={styles.propertyName}>{selectedProperty?.name}</Text>
              <Text style={styles.date}>
                {dateString.charAt(0).toUpperCase() + dateString.slice(1)}
              </Text>
            </View>
            <View style={styles.weatherWidget}>
              {temperature && (
                <>
                  <Text style={styles.weatherTemp}>{temperature}°C</Text>
                  <Text style={styles.weatherCondition}>
                    {condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Cards de Métricas Rápidas */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: balance >= 0 ? colors.success : colors.error,
              },
            ]}
          >
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statLabel}>Saldo Atual</Text>
            <Text style={styles.statValue}>{formatCurrency(balance)}</Text>
          </View>
          <View
            style={[styles.statCard, { backgroundColor: colors.accent.amber }]}
          >
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statLabel}>Safra {currentYear}</Text>
            <Text style={styles.statValue}>
              {productionPercentage.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Card de Resumo Financeiro */}
        <Card variant="elevated" style={styles.card}>
          <CardHeader title="Resumo Financeiro" icon="💰" />
          <CardContent>
            <View style={styles.financialGrid}>
              <View style={styles.financialItem}>
                <Text style={styles.financialLabel}>A Receber</Text>
                <Text style={[styles.financialValue, { color: colors.info }]}>
                  {formatCurrency(toReceive)}
                </Text>
              </View>
              <View style={styles.financialDivider} />
              <View style={styles.financialItem}>
                <Text style={styles.financialLabel}>A Pagar</Text>
                <Text style={[styles.financialValue, { color: colors.error }]}>
                  {formatCurrency(toPay)}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Card de Produção */}
        <Card variant="elevated" style={styles.card}>
          <CardHeader title="Indicadores de Produção" icon="🌱" />
          <CardContent>
            <View style={styles.productionRow}>
              <View style={styles.productionItem}>
                <Text style={styles.productionIcon}>📦</Text>
                <Text style={styles.productionValue}>
                  {Math.round(actualProduction)}
                </Text>
                <Text style={styles.productionLabel}>Sacas Produzidas</Text>
              </View>
              <View style={styles.productionItem}>
                <Text style={styles.productionIcon}>💵</Text>
                <Text style={styles.productionValue}>
                  {formatCurrency(totalCost)}
                </Text>
                <Text style={styles.productionLabel}>Custo Total</Text>
              </View>
              <View style={styles.productionItem}>
                <Text style={styles.productionIcon}>📈</Text>
                <Text style={styles.productionValue}>
                  {productionPerHectare}
                </Text>
                <Text style={styles.productionLabel}>Sacas/Hectare</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Card de Clima */}
        <Card variant="elevated" style={styles.card}>
          <CardHeader
            title="Condições Climáticas"
            icon="🌤️"
            subtitle="Dados atuais"
          />
          <CardContent>
            {weatherLoading ? (
              <Text style={styles.weatherLoading}>Carregando clima...</Text>
            ) : weatherError || !temperature ? (
              <Text style={styles.weatherError}>
                Não foi possível carregar os dados do clima
              </Text>
            ) : (
              <View style={styles.weatherGrid}>
                <View style={styles.weatherItem}>
                  <Text style={styles.weatherIcon}>💧</Text>
                  <Text style={styles.weatherValue}>{humidity}%</Text>
                  <Text style={styles.weatherLabel}>Umidade</Text>
                </View>
                <View style={styles.weatherItem}>
                  <Text style={styles.weatherIcon}>🌬️</Text>
                  <Text style={styles.weatherValue}>{wind} km/h</Text>
                  <Text style={styles.weatherLabel}>Vento</Text>
                </View>
                <View style={styles.weatherItem}>
                  <Text style={styles.weatherIcon}>🌧️</Text>
                  <Text style={styles.weatherValue}>
                    {rainfall.toFixed(1)} mm
                  </Text>
                  <Text style={styles.weatherLabel}>Chuva</Text>
                </View>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Card de Estatísticas da Propriedade */}
        <Card variant="elevated" style={styles.card}>
          <CardHeader title="Dados da Propriedade" icon="🏞️" />
          <CardContent>
            <View style={styles.propertyStats}>
              <View style={styles.propertyStatItem}>
                <View style={styles.propertyStatIcon}>
                  <Text style={styles.propertyStatEmoji}>🌾</Text>
                </View>
                <View style={styles.propertyStatContent}>
                  <Text style={styles.propertyStatValue}>
                    {totalArea.toFixed(0)} ha
                  </Text>
                  <Text style={styles.propertyStatLabel}>Área Total</Text>
                </View>
              </View>

              <View style={styles.propertyStatItem}>
                <View style={styles.propertyStatIcon}>
                  <Text style={styles.propertyStatEmoji}>📍</Text>
                </View>
                <View style={styles.propertyStatContent}>
                  <Text style={styles.propertyStatValue}>{totalPlots}</Text>
                  <Text style={styles.propertyStatLabel}>Talhões</Text>
                </View>
              </View>

              <View style={styles.propertyStatItem}>
                <View style={styles.propertyStatIcon}>
                  <Text style={styles.propertyStatEmoji}>🌱</Text>
                </View>
                <View style={styles.propertyStatContent}>
                  <Text style={styles.propertyStatValue}>
                    {estimatedPlants >= 1000
                      ? `${Math.round(estimatedPlants / 1000)}k`
                      : estimatedPlants}
                  </Text>
                  <Text style={styles.propertyStatLabel}>Plantas Est.*</Text>
                </View>
              </View>
            </View>
            <Text style={styles.footnote}>
              * Estimativa baseada em 6.000 plantas/ha
            </Text>
          </CardContent>
        </Card>
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
    paddingBottom: spacing['2xl'],
  },
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary.main,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: colors.text.inverse,
    opacity: 0.9,
  },
  propertyName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.inverse,
    marginTop: spacing.xs,
  },
  date: {
    fontSize: 13,
    color: colors.text.inverse,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  weatherWidget: {
    alignItems: 'flex-end',
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  weatherCondition: {
    fontSize: 12,
    color: colors.text.inverse,
    opacity: 0.9,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.base,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: spacing.base,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.inverse,
    opacity: 0.9,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.base,
  },
  financialGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  financialItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  financialDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.neutral.medium,
  },
  financialLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  financialValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  productionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  productionItem: {
    alignItems: 'center',
    flex: 1,
  },
  productionIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  productionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  productionLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  weatherLoading: {
    textAlign: 'center',
    color: colors.text.secondary,
    paddingVertical: spacing.lg,
  },
  weatherError: {
    textAlign: 'center',
    color: colors.text.secondary,
    paddingVertical: spacing.lg,
  },
  weatherGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weatherItem: {
    alignItems: 'center',
    flex: 1,
  },
  weatherIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  weatherLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  propertyStats: {
    gap: spacing.md,
  },
  propertyStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  propertyStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary.light}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyStatEmoji: {
    fontSize: 24,
  },
  propertyStatContent: {
    flex: 1,
  },
  propertyStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary.main,
  },
  propertyStatLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  footnote: {
    fontSize: 11,
    color: colors.text.hint,
    textAlign: 'center',
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
})

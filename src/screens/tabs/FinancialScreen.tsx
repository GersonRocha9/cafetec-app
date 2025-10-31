import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useCallback, useMemo } from 'react'
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  ErrorState,
  LoadingState,
  Card,
  CardHeader,
  CardContent,
} from '../../components'
import { useProperty } from '../../contexts/PropertyContext'
import {
  useAccounts,
  useFinancialSummary,
  useMarkAccountAsPaid,
  useTopClients,
} from '../../hooks'
import {
  PropertyStackParamList,
  PropertyTabsParamList,
} from '../../types/navigation'
import { colors, spacing, borderRadius, shadows } from '../../constants/theme'

type Props = CompositeScreenProps<
  BottomTabScreenProps<PropertyTabsParamList, 'Financial'>,
  NativeStackScreenProps<PropertyStackParamList>
>

export function FinancialScreen({ navigation }: Props) {
  const { selectedProperty } = useProperty()
  const markAsPaidMutation = useMarkAccountAsPaid()

  // Buscar dados
  const {
    data: financialSummary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useFinancialSummary(selectedProperty?.id)

  const {
    data: topClients = [],
    isLoading: clientsLoading,
    error: clientsError,
  } = useTopClients(selectedProperty?.id, 4)

  const {
    data: accounts = [],
    isLoading: accountsLoading,
    error: accountsError,
    refetch: refetchAccounts,
  } = useAccounts(selectedProperty?.id)

  // Pull to refresh
  const [refreshing, setRefreshing] = React.useState(false)
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([refetchSummary(), refetchAccounts()])
    } finally {
      setRefreshing(false)
    }
  }, [refetchSummary, refetchAccounts])

  // Contas recentes (últimas 5 contas pendentes, ordenadas por vencimento mais próximo)
  const recentAccounts = useMemo(() => {
    return accounts
      .filter(acc => acc.status === 'Pendente')
      .sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      )
      .slice(0, 5)
  }, [accounts])

  // Calcular categorias de gastos a partir das contas "Pagável"
  const expenseCategories = useMemo(() => {
    const payableAccounts = accounts.filter(acc => acc.type === 'Pagável')
    const categoryMap = new Map<string, number>()
    let total = 0

    payableAccounts.forEach(account => {
      const category = account.category || 'Outros'
      const value = Number(account.value) || 0
      categoryMap.set(category, (categoryMap.get(category) || 0) + value)
      total += value
    })

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [accounts])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  }

  const handleMarkAsPaid = (accountId: string, accountValue: number) => {
    Alert.alert('Marcar como Pago', 'Deseja marcar esta conta como paga?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Confirmar',
        onPress: async () => {
          try {
            await markAsPaidMutation.mutateAsync({
              accountId,
              paidValue: accountValue,
            })
            Alert.alert('Sucesso', 'Conta marcada como paga!')
          } catch (error) {
            console.error('Error marking as paid:', error)
            Alert.alert('Erro', 'Não foi possível marcar a conta como paga')
          }
        },
      },
    ])
  }

  // Estados de loading/error
  const isLoading = summaryLoading || clientsLoading || accountsLoading
  const hasError = summaryError || clientsError || accountsError

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Financeiro</Text>
          <Text style={styles.subtitle}>Visão Geral Financeira</Text>
        </View>
        <LoadingState />
      </SafeAreaView>
    )
  }

  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Financeiro</Text>
          <Text style={styles.subtitle}>Visão Geral Financeira</Text>
        </View>
        <ErrorState
          message="Erro ao carregar dados financeiros"
          onRetry={() => refetchSummary()}
        />
      </SafeAreaView>
    )
  }

  // Extrair valores do summary
  const balance = financialSummary?.balance || 0
  const toReceive = financialSummary?.to_receive || 0
  const toPay = financialSummary?.to_pay || 0

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
            <Text style={styles.title}>Financeiro</Text>
            <Text style={styles.subtitle}>Visão Geral Financeira</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddAccount')}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Cards de Resumo Rápido */}
        <View style={styles.summaryRow}>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: balance >= 0 ? colors.success : colors.error },
            ]}
          >
            <Text style={styles.summaryIcon}>💰</Text>
            <Text style={styles.summaryLabel}>Saldo</Text>
            <Text style={styles.summaryValue}>{formatCurrency(balance)}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.info }]}>
            <Text style={styles.summaryIcon}>📈</Text>
            <Text style={styles.summaryLabel}>A Receber</Text>
            <Text style={styles.summaryValue}>{formatCurrency(toReceive)}</Text>
          </View>
          <View
            style={[styles.summaryCard, { backgroundColor: colors.warning }]}
          >
            <Text style={styles.summaryIcon}>📉</Text>
            <Text style={styles.summaryLabel}>A Pagar</Text>
            <Text style={styles.summaryValue}>{formatCurrency(toPay)}</Text>
          </View>
        </View>

        {/* Principais Clientes */}
        <Card variant="elevated" style={styles.mainCard}>
          <CardHeader
            title="Principais Clientes"
            subtitle="Último ano"
            icon="👥"
          />
          <CardContent>
            {topClients.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Nenhum cliente cadastrado</Text>
              </View>
            ) : (
              <View style={styles.clientsList}>
                {topClients.map((client, index) => (
                  <View key={client.client_id}>
                    <View style={styles.clientRow}>
                      <View style={styles.clientInfo}>
                        <View style={styles.clientRank}>
                          <Text style={styles.clientRankText}>
                            {index + 1}º
                          </Text>
                        </View>
                        <Text style={styles.clientName}>
                          {client.client_name}
                        </Text>
                      </View>
                      <Text style={styles.clientValue}>
                        {formatCurrency(Number(client.total_sales) || 0)}
                      </Text>
                    </View>
                    {index < topClients.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Categorias de Gastos */}
        <Card variant="elevated" style={styles.mainCard}>
          <CardHeader
            title="Principais Gastos"
            subtitle="Por categoria"
            icon="📊"
          />
          <CardContent>
            {expenseCategories.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Nenhuma despesa cadastrada</Text>
              </View>
            ) : (
              <View style={styles.expensesList}>
                {expenseCategories.map((category, index) => (
                  <View key={category.name}>
                    <View style={styles.expenseRow}>
                      <View style={styles.expenseInfo}>
                        <Text style={styles.expenseName}>{category.name}</Text>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${category.percentage}%` },
                            ]}
                          />
                        </View>
                      </View>
                      <View style={styles.expenseValues}>
                        <Text style={styles.expenseValue}>
                          {formatCurrency(category.value)}
                        </Text>
                        <Text style={styles.expensePercentage}>
                          {category.percentage.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                    {index < expenseCategories.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Contas Recentes */}
        <Card variant="elevated" style={styles.mainCard}>
          <CardHeader
            title="Contas Pendentes"
            subtitle="Próximos vencimentos"
            icon="📋"
          />
          <CardContent>
            {recentAccounts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Nenhuma conta pendente</Text>
              </View>
            ) : (
              <View style={styles.accountsList}>
                {recentAccounts.map((account, index) => (
                  <View key={account.id}>
                    <View style={styles.accountCard}>
                      <View style={styles.accountHeader}>
                        <View style={styles.accountHeaderLeft}>
                          <Text style={styles.accountDescription}>
                            {account.description}
                          </Text>
                          <View style={styles.accountMeta}>
                            <View
                              style={[
                                styles.accountTypeBadge,
                                account.type === 'Recebível'
                                  ? styles.typeBadgeReceivable
                                  : styles.typeBadgePayable,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.accountTypeBadgeText,
                                  account.type === 'Recebível'
                                    ? styles.typeBadgeTextReceivable
                                    : styles.typeBadgeTextPayable,
                                ]}
                              >
                                {account.type}
                              </Text>
                            </View>
                            <Text style={styles.accountCategory}>
                              {account.category}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.accountHeaderRight}>
                          <Text style={styles.accountValue}>
                            {formatCurrency(Number(account.value))}
                          </Text>
                          <Text style={styles.accountDueDate}>
                            {formatDate(account.due_date)}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() =>
                          handleMarkAsPaid(account.id, Number(account.value))
                        }
                        disabled={markAsPaidMutation.isPending}
                      >
                        <Text style={styles.actionButtonText}>
                          ✓ Marcar como Pago
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {index < recentAccounts.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                ))}
              </View>
            )}
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
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.base,
    marginBottom: spacing.base,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    ...shadows.base,
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.text.inverse,
    opacity: 0.9,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.inverse,
    textAlign: 'center',
  },
  mainCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.base,
  },
  emptyState: {
    padding: spacing.base,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text.hint,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.light,
    marginVertical: spacing.sm,
  },
  // Clientes
  clientsList: {
    gap: spacing.xs,
  },
  clientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  clientRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientRankText: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: '700',
  },
  clientName: {
    fontSize: 15,
    color: colors.text.primary,
    flex: 1,
  },
  clientValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  // Gastos
  expensesList: {
    gap: spacing.xs,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.base,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.neutral.light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 3,
  },
  expenseValues: {
    alignItems: 'flex-end',
  },
  expenseValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  expensePercentage: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  // Contas Recentes
  accountsList: {
    gap: spacing.xs,
  },
  accountCard: {
    paddingVertical: spacing.md,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  accountHeaderLeft: {
    flex: 1,
  },
  accountHeaderRight: {
    alignItems: 'flex-end',
  },
  accountDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  accountMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  accountTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeBadgeReceivable: {
    backgroundColor: `${colors.success}15`,
  },
  typeBadgePayable: {
    backgroundColor: `${colors.error}15`,
  },
  accountTypeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  typeBadgeTextReceivable: {
    color: colors.success,
  },
  typeBadgeTextPayable: {
    color: colors.error,
  },
  accountCategory: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  accountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  accountDueDate: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  actionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.success,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    marginTop: spacing.xs,
    ...shadows.sm,
  },
  actionButtonText: {
    color: colors.text.inverse,
    fontSize: 13,
    fontWeight: '600',
  },
})

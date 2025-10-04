import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useMemo } from 'react'
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ErrorState, LoadingState } from '../../components'
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
  } = useAccounts(selectedProperty?.id)

  // Contas recentes (últimas 5 contas pendentes)
  const recentAccounts = useMemo(() => {
    return accounts
      .filter((acc) => acc.status === 'Pendente')
      .sort(
        (a, b) =>
          new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
      )
      .slice(0, 5)
  }, [accounts])

  // Calcular categorias de gastos a partir das contas "Pagável"
  const expenseCategories = useMemo(() => {
    const payableAccounts = accounts.filter((acc) => acc.type === 'Pagável')
    const categoryMap = new Map<string, number>()
    let total = 0

    payableAccounts.forEach((account) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago':
        return '#22C55E'
      case 'Pendente':
        return '#F59E0B'
      case 'Vencido':
        return '#EF4444'
      default:
        return '#999'
    }
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Financeiro</Text>
          <Text style={styles.subtitle}>Visão Geral Financeira</Text>
        </View>

        {/* Fluxo de Caixa */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Fluxo de Caixa</Text>
          <View style={styles.cardContent}>
            <View style={styles.cashFlowRow}>
              <Text style={styles.cashFlowLabel}>Saldo Atual</Text>
              <Text
                style={[
                  styles.cashFlowValue,
                  balance >= 0 ? styles.balancePositive : styles.toPay,
                ]}
              >
                {formatCurrency(balance)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.cashFlowRow}>
              <Text style={styles.cashFlowLabel}>A Receber</Text>
              <Text style={[styles.cashFlowValue, styles.toReceive]}>
                {formatCurrency(toReceive)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.cashFlowRow}>
              <Text style={styles.cashFlowLabel}>A Pagar</Text>
              <Text style={[styles.cashFlowValue, styles.toPay]}>
                {formatCurrency(toPay)}
              </Text>
            </View>
          </View>
        </View>

        {/* Principais Clientes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            👥 Principais Clientes (Último Ano)
          </Text>
          {topClients.length === 0 ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ color: '#999', fontSize: 14 }}>
                Nenhum cliente cadastrado
              </Text>
            </View>
          ) : (
            <View style={styles.clientsList}>
              {topClients.map((client, index) => (
                <View key={client.client_id}>
                  <View style={styles.clientRow}>
                    <View style={styles.clientInfo}>
                      <View style={styles.clientRank}>
                        <Text style={styles.clientRankText}>{index + 1}º</Text>
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
        </View>

        {/* Categorias de Gastos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            📊 Principais Gastos (Por Categoria)
          </Text>
          {expenseCategories.length === 0 ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ color: '#999', fontSize: 14 }}>
                Nenhuma conta de despesa cadastrada
              </Text>
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
        </View>

        {/* Contas Recentes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Contas Pendentes Recentes</Text>
          {recentAccounts.length === 0 ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ color: '#999', fontSize: 14 }}>
                Nenhuma conta pendente
              </Text>
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
                          Venc: {formatDate(account.due_date)}
                        </Text>
                      </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.accountActions}>
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
                  </View>
                  {index < recentAccounts.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddAccount')}
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
  // Fluxo de Caixa
  cashFlowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cashFlowLabel: {
    fontSize: 16,
    color: '#666',
  },
  cashFlowValue: {
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
    marginVertical: 8,
  },
  // Clientes
  clientsList: {
    gap: 8,
  },
  clientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  clientRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6B4226',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientRankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  clientName: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  clientValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22C55E',
  },
  // Gastos
  expensesList: {
    gap: 8,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B4226',
    borderRadius: 3,
  },
  expenseValues: {
    alignItems: 'flex-end',
  },
  expenseValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  expensePercentage: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  // Contas Recentes
  accountsList: {
    gap: 8,
  },
  accountCard: {
    paddingVertical: 12,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
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
    color: '#333',
    marginBottom: 8,
  },
  accountMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeBadgeReceivable: {
    backgroundColor: '#22C55E15',
  },
  typeBadgePayable: {
    backgroundColor: '#EF444415',
  },
  accountTypeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  typeBadgeTextReceivable: {
    color: '#22C55E',
  },
  typeBadgeTextPayable: {
    color: '#EF4444',
  },
  accountCategory: {
    fontSize: 12,
    color: '#999',
  },
  accountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  accountDueDate: {
    fontSize: 12,
    color: '#666',
  },
  accountActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#22C55E',
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  // Floating Action Button
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

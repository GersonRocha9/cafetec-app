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
import { useActivitiesByPlot, usePlot } from '../../hooks'
import { PropertyStackParamList } from '../../types/navigation'

type Props = NativeStackScreenProps<PropertyStackParamList, 'PlotDetail'>

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

export function PlotDetailScreen({ route, navigation }: Props) {
  const { id } = route.params

  // Buscar dados do talhão e suas atividades
  const {
    data: plot,
    isLoading: plotLoading,
    error: plotError,
    refetch: refetchPlot,
  } = usePlot(id)

  const { data: activities = [], isLoading: activitiesLoading } =
    useActivitiesByPlot(id)

  // Loading state
  if (plotLoading || activitiesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState />
      </SafeAreaView>
    )
  }

  // Error state
  if (plotError) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          message="Erro ao carregar informações do talhão"
          onRetry={() => refetchPlot()}
        />
      </SafeAreaView>
    )
  }

  // Empty state (plot not found)
  if (!plot) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="🌱"
          title="Talhão não encontrado"
          description="Não foi possível encontrar as informações deste talhão"
          actionLabel="Voltar"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    )
  }

  const statusColor = getStatusColor(plot.status)

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header com Nome e Status */}
        <View style={styles.header}>
          <Text style={styles.plotName}>{plot.name}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}15` },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {plot.status}
            </Text>
          </View>
        </View>

        {/* Card de Dados do Talhão */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Dados do Talhão</Text>
          <View style={styles.dataGrid}>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>Área</Text>
              <Text style={styles.dataValue}>{plot.area.toFixed(1)} ha</Text>
            </View>
            {plot.soil_type && (
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Tipo de Solo</Text>
                <Text style={styles.dataValue}>{plot.soil_type}</Text>
              </View>
            )}
            {plot.plantings && (
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Nº de Plantios</Text>
                <Text style={styles.dataValue}>
                  {plot.plantings.toLocaleString('pt-BR')}
                </Text>
              </View>
            )}
          </View>
          {plot.description && (
            <>
              <View style={styles.divider} />
              <View style={styles.descriptionContainer}>
                <Text style={styles.dataLabel}>Descrição</Text>
                <Text style={styles.descriptionText}>{plot.description}</Text>
              </View>
            </>
          )}
        </View>

        {/* Card de Atividades */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Atividades Recentes</Text>
          {activities.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text
                style={{ color: '#999', fontSize: 16, textAlign: 'center' }}
              >
                Nenhuma atividade registrada ainda
              </Text>
            </View>
          ) : (
            activities.map((activity, index) => (
              <View key={activity.id}>
                <View style={styles.activityItem}>
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityType}>{activity.type}</Text>
                    <Text style={styles.activityDate}>
                      {formatDate(activity.date)}
                    </Text>
                  </View>
                  {activity.responsible && (
                    <Text style={styles.activityResponsible}>
                      👤 {activity.responsible}
                    </Text>
                  )}
                  {activity.notes && (
                    <Text style={styles.activityNotes}>{activity.notes}</Text>
                  )}
                </View>
                {index < activities.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddActivity', { plotId: id })}
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
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  plotName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
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
  dataGrid: {
    gap: 16,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  descriptionContainer: {
    gap: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  activityItem: {
    paddingVertical: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activityDate: {
    fontSize: 13,
    color: '#999',
  },
  activityResponsible: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  activityNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
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

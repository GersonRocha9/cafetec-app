import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { EmptyState, ErrorState } from '../../components'
import { useAuth } from '../../contexts/AuthContext'
import { useProperty } from '../../contexts/PropertyContext'
import { useProfile } from '../../hooks'
import {
  PropertyStackParamList,
  PropertyTabsParamList,
} from '../../types/navigation'

type Props = CompositeScreenProps<
  BottomTabScreenProps<PropertyTabsParamList, 'Profile'>,
  NativeStackScreenProps<PropertyStackParamList>
>

export function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth()
  const { setSelectedProperty } = useProperty()
  const { data: profile, isLoading, error, refetch } = useProfile(user?.id)

  const handleLogout = () => {
    logout()
  }

  const handleChangeProperty = () => {
    // Limpa a propriedade selecionada e reseta a navegação
    setSelectedProperty(null)
    // Usar reset para garantir que volta para SelectProperty sem cache
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'SelectProperty' }],
    })
  }

  const getInitials = (name: string) => {
    const names = name.split(' ')
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase()
  }

  // Estados de loading/error
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B4226" />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          message="Erro ao carregar perfil"
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    )
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          title="Perfil não encontrado"
          description="O perfil do usuario não foi encontrado"
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
          </View>
          <Text style={styles.userName}>{profile.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Dados Pessoais</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Nome Completo</Text>
            <Text style={styles.infoValue}>{profile.name}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>E-mail</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Telefone</Text>
            <Text style={styles.infoValue}>{profile.phone}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Endereço</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>CEP</Text>
            <Text style={styles.infoValue}>{profile.cep}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Endereço</Text>
            <Text style={styles.infoValue}>
              {profile.street}, {profile.number}
              {profile.complement ? ` - ${profile.complement}` : ''}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Cidade/UF</Text>
            <Text style={styles.infoValue}>
              {profile.city} - {profile.state}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👨‍🌾 Perfil do Produtor</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Tipo de Produtor</Text>
            <Text style={styles.infoValue}>{profile.producer_profile}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Atividade Agrícola Principal</Text>
            <Text style={styles.infoValue}>{profile.main_activity}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Área de Cultivo</Text>
            <Text style={styles.infoValue}>
              {profile.cultivation_area} hectares
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Acesso à Internet</Text>
            <View style={styles.internetBadge}>
              <View
                style={[
                  styles.internetDot,
                  profile.has_internet
                    ? styles.internetDotOnline
                    : styles.internetDotOffline,
                ]}
              />
              <Text style={styles.infoValue}>
                {profile.has_internet ? 'Diário' : 'Ocasional'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Configurações</Text>

          <TouchableOpacity
            style={styles.settingButton}
            onPress={handleChangeProperty}
          >
            <Text style={styles.settingButtonText}>Trocar Propriedade</Text>
            <Text style={styles.settingButtonIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Editar Perfil</Text>
            <Text style={styles.settingButtonIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Alterar Senha</Text>
            <Text style={styles.settingButtonIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Notificações</Text>
            <Text style={styles.settingButtonIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>
              Privacidade e Segurança
            </Text>
            <Text style={styles.settingButtonIcon}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Cafetec - Versão 1.0.0</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#6B4226',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6B4226',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#f5f5f5',
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  internetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  internetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  internetDotOnline: {
    backgroundColor: '#22C55E',
  },
  internetDotOffline: {
    backgroundColor: '#EAB308',
  },
  settingButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  settingButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingButtonIcon: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
})

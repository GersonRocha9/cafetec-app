import type { User } from '@supabase/supabase-js'
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Alert } from 'react-native'
import { supabase } from '../config/supabase'
import type { Profile, ProfileInsert } from '../services'

interface AuthContextData {
  isAuthenticated: boolean
  user: User | null
  profile: Profile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signUp: (
    email: string,
    password: string,
    profileData: Omit<ProfileInsert, 'id'>
  ) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user

  // Load profile
  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
      setProfile(null)
    }
  }

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) throw error

        if (session?.user) {
          setUser(session.user)
          await loadProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('❌ Erro ao verificar sessão:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        await loadProfile(session.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        setUser(data.user)
        await loadProfile(data.user.id)
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error)
      Alert.alert(
        'Erro ao fazer login',
        error.message || 'Verifique suas credenciais e tente novamente.'
      )
      throw error
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setProfile(null)
    } catch (error: any) {
      console.error('❌ Erro no logout:', error)
      Alert.alert('Erro ao sair', error.message || 'Tente novamente.')
      throw error
    }
  }

  const signUp = async (
    email: string,
    password: string,
    profileData: Omit<ProfileInsert, 'id'>
  ) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Falha ao criar usuário')

      // Create profile
      const { data: profileDataResult, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          ...profileData,
        })
        .select()
        .single()

      if (profileError) throw profileError

      setUser(authData.user)
      setProfile(profileDataResult)

      Alert.alert(
        'Sucesso! 🎉',
        'Sua conta foi criada com sucesso. Bem-vindo ao CafeTec!'
      )
    } catch (error: any) {
      console.error('❌ Erro ao criar conta:', error)
      Alert.alert(
        'Erro ao criar conta',
        error.message || 'Não foi possível criar sua conta. Tente novamente.'
      )
      throw error
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        profile,
        loading,
        login,
        logout,
        signUp,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

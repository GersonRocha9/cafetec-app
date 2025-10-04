// =====================================================
// AUTH SERVICE
// =====================================================
import { supabase } from '../config/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '../types/database'

export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

// =====================================================
// AUTH OPERATIONS
// =====================================================

export const authService = {
  // Sign Up
  signUp: async (
    email: string,
    password: string,
    profileData: Omit<ProfileInsert, 'id'>
  ) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('User creation failed')

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        ...profileData,
      })
      .select()
      .single()

    if (profileError) throw profileError

    return { user: authData.user, profile }
  },

  // Sign In
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  // Sign Out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get Current User
  getCurrentUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Get Current Session
  getCurrentSession: async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Update Password
  updatePassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
    return data
  },
}

// =====================================================
// PROFILE OPERATIONS
// =====================================================

export const profileService = {
  // Get Profile by User ID
  getProfile: async (userId: string): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  // Update Profile
  updateProfile: async (
    userId: string,
    updates: ProfileUpdate
  ): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

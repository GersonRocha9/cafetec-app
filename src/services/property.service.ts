// =====================================================
// PROPERTY SERVICE
// =====================================================
import { supabase } from '../config/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '../types/database'

export type Property = Tables<'properties'>
export type PropertyInsert = TablesInsert<'properties'>
export type PropertyUpdate = TablesUpdate<'properties'>

export const propertyService = {
  // Get all properties for current user
  getProperties: async (userId: string): Promise<Property[]> => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get single property
  getProperty: async (propertyId: string): Promise<Property> => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()

    if (error) throw error
    return data
  },

  // Create property
  createProperty: async (property: PropertyInsert): Promise<Property> => {
    const { data, error } = await supabase
      .from('properties')
      .insert(property)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update property
  updateProperty: async (
    propertyId: string,
    updates: PropertyUpdate
  ): Promise<Property> => {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', propertyId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete property (soft delete)
  deleteProperty: async (propertyId: string): Promise<void> => {
    const { error } = await supabase
      .from('properties')
      .update({ is_active: false })
      .eq('id', propertyId)

    if (error) throw error
  },
}

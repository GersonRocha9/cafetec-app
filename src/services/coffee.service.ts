// =====================================================
// COFFEE SERVICE
// =====================================================
import { supabase } from '../config/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '../types/database'

export type Coffee = Tables<'coffees'>
export type CoffeeInsert = TablesInsert<'coffees'>
export type CoffeeUpdate = TablesUpdate<'coffees'>

export const coffeeService = {
  // Get all coffees for a property
  getCoffeesByProperty: async (propertyId: string): Promise<Coffee[]> => {
    const { data, error } = await supabase
      .from('coffees')
      .select('*')
      .eq('property_id', propertyId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get single coffee
  getCoffee: async (coffeeId: string): Promise<Coffee> => {
    const { data, error } = await supabase
      .from('coffees')
      .select('*')
      .eq('id', coffeeId)
      .single()

    if (error) throw error
    return data
  },

  // Create coffee
  createCoffee: async (coffee: CoffeeInsert): Promise<Coffee> => {
    const { data, error } = await supabase
      .from('coffees')
      .insert(coffee)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update coffee
  updateCoffee: async (
    coffeeId: string,
    updates: CoffeeUpdate
  ): Promise<Coffee> => {
    const { data, error } = await supabase
      .from('coffees')
      .update(updates)
      .eq('id', coffeeId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete coffee (soft delete)
  deleteCoffee: async (coffeeId: string): Promise<void> => {
    const { error } = await supabase
      .from('coffees')
      .update({ is_active: false })
      .eq('id', coffeeId)

    if (error) throw error
  },
}

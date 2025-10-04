// =====================================================
// PLOT SERVICE
// =====================================================
import { supabase } from '../config/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '../types/database'

export type Plot = Tables<'plots'>
export type PlotInsert = TablesInsert<'plots'>
export type PlotUpdate = TablesUpdate<'plots'>

export const plotService = {
  // Get all plots for a coffee
  getPlotsByCoffee: async (coffeeId: string): Promise<Plot[]> => {
    const { data, error } = await supabase
      .from('plots')
      .select('*')
      .eq('coffee_id', coffeeId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get all plots for a property
  getPlotsByProperty: async (propertyId: string): Promise<Plot[]> => {
    const { data, error } = await supabase
      .from('plots')
      .select(
        `
        *,
        coffees!inner (
          property_id
        )
      `
      )
      .eq('coffees.property_id', propertyId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get single plot
  getPlot: async (plotId: string): Promise<Plot> => {
    const { data, error } = await supabase
      .from('plots')
      .select('*')
      .eq('id', plotId)
      .single()

    if (error) throw error
    return data
  },

  // Create plot
  createPlot: async (plot: PlotInsert): Promise<Plot> => {
    const { data, error } = await supabase
      .from('plots')
      .insert(plot)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update plot
  updatePlot: async (plotId: string, updates: PlotUpdate): Promise<Plot> => {
    const { data, error } = await supabase
      .from('plots')
      .update(updates)
      .eq('id', plotId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete plot (soft delete)
  deletePlot: async (plotId: string): Promise<void> => {
    const { error } = await supabase
      .from('plots')
      .update({ is_active: false })
      .eq('id', plotId)

    if (error) throw error
  },

  // Get plots by status (using RPC function)
  getPlotsByStatus: async (propertyId: string) => {
    const { data, error } = await supabase.rpc('get_plots_by_status', {
      p_property_id: propertyId,
    })

    if (error) throw error
    return data || []
  },
}

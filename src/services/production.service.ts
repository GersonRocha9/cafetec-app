// =====================================================
// PRODUCTION SERVICE
// =====================================================
import { supabase } from '../config/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '../types/database'

export type ProductionData = Tables<'production_data'>
export type ProductionDataInsert = TablesInsert<'production_data'>
export type ProductionDataUpdate = TablesUpdate<'production_data'>

export const productionService = {
  // Get production data by plot
  getProductionByPlot: async (plotId: string): Promise<ProductionData[]> => {
    const { data, error } = await supabase
      .from('production_data')
      .select('*')
      .eq('plot_id', plotId)
      .order('year', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get production data by property and year
  getProductionByProperty: async (
    propertyId: string,
    year?: number
  ): Promise<ProductionData[]> => {
    let query = supabase
      .from('production_data')
      .select(
        `
        *,
        plots!inner (
          coffee_id,
          coffees!inner (
            property_id
          )
        )
      `
      )
      .eq('plots.coffees.property_id', propertyId)
      .order('year', { ascending: false })

    if (year) {
      query = query.eq('year', year)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  // Get production stats (using RPC function)
  getProductionStats: async (propertyId: string, year: number) => {
    const { data, error } = await supabase
      .rpc('get_production_stats', { p_property_id: propertyId, p_year: year })
      .single()

    if (error) throw error
    return data
  },

  // Create production data
  createProductionData: async (
    production: ProductionDataInsert
  ): Promise<ProductionData> => {
    const { data, error } = await supabase
      .from('production_data')
      .insert(production)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update production data
  updateProductionData: async (
    productionId: string,
    updates: ProductionDataUpdate
  ): Promise<ProductionData> => {
    const { data, error } = await supabase
      .from('production_data')
      .update(updates)
      .eq('id', productionId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete production data
  deleteProductionData: async (productionId: string): Promise<void> => {
    const { error } = await supabase
      .from('production_data')
      .delete()
      .eq('id', productionId)

    if (error) throw error
  },
}

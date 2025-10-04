// =====================================================
// ACTIVITY SERVICE
// =====================================================
import { supabase } from '../config/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '../types/database'

export type Activity = Tables<'activities'>
export type ActivityInsert = TablesInsert<'activities'>
export type ActivityUpdate = TablesUpdate<'activities'>

export const activityService = {
  // Get all activities for a plot
  getActivitiesByPlot: async (plotId: string): Promise<Activity[]> => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('plot_id', plotId)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get single activity
  getActivity: async (activityId: string): Promise<Activity> => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activityId)
      .single()

    if (error) throw error
    return data
  },

  // Create activity
  createActivity: async (activity: ActivityInsert): Promise<Activity> => {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update activity
  updateActivity: async (
    activityId: string,
    updates: ActivityUpdate
  ): Promise<Activity> => {
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', activityId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete activity (hard delete)
  deleteActivity: async (activityId: string): Promise<void> => {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId)

    if (error) throw error
  },
}

// =====================================================
// ACTIVITY HOOKS
// =====================================================
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../constants/queryKeys'
import {
  activityService,
  type ActivityInsert,
  type ActivityUpdate,
} from '../services'

// Get all activities for a plot
export const useActivitiesByPlot = (plotId?: string) => {
  return useQuery({
    queryKey: queryKeys.activities.byPlot(plotId!),
    queryFn: () => activityService.getActivitiesByPlot(plotId!),
    enabled: !!plotId,
  })
}

// Get single activity
export const useActivity = (activityId?: string) => {
  return useQuery({
    queryKey: queryKeys.activities.detail(activityId!),
    queryFn: () => activityService.getActivity(activityId!),
    enabled: !!activityId,
  })
}

// Create activity mutation
export const useCreateActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activity: ActivityInsert) =>
      activityService.createActivity(activity),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.activities.byPlot(data.plot_id),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all })
    },
  })
}

// Update activity mutation
export const useUpdateActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      activityId,
      updates,
    }: {
      activityId: string
      updates: ActivityUpdate
    }) => activityService.updateActivity(activityId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.activities.detail(data.id),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.activities.byPlot(data.plot_id),
      })
    },
  })
}

// Delete activity mutation
export const useDeleteActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activityId: string) =>
      activityService.deleteActivity(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all })
    },
  })
}

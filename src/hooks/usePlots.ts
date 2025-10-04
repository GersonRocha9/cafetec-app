// =====================================================
// PLOT HOOKS
// =====================================================
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../constants/queryKeys'
import { plotService, type PlotInsert, type PlotUpdate } from '../services'

// Get all plots for a coffee
export const usePlotsByCoffee = (coffeeId?: string) => {
  return useQuery({
    queryKey: queryKeys.plots.byCoffee(coffeeId!),
    queryFn: () => plotService.getPlotsByCoffee(coffeeId!),
    enabled: !!coffeeId,
  })
}

// Get all plots for a property
export const usePlotsByProperty = (propertyId?: string) => {
  return useQuery({
    queryKey: queryKeys.plots.byProperty(propertyId!),
    queryFn: () => plotService.getPlotsByProperty(propertyId!),
    enabled: !!propertyId,
  })
}

// Get single plot
export const usePlot = (plotId?: string) => {
  return useQuery({
    queryKey: queryKeys.plots.detail(plotId!),
    queryFn: () => plotService.getPlot(plotId!),
    enabled: !!plotId,
  })
}

// Get plots by status
export const usePlotsByStatus = (propertyId?: string) => {
  return useQuery({
    queryKey: queryKeys.plots.byStatus(propertyId!),
    queryFn: () => plotService.getPlotsByStatus(propertyId!),
    enabled: !!propertyId,
  })
}

// Create plot mutation
export const useCreatePlot = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (plot: PlotInsert) => plotService.createPlot(plot),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.plots.byCoffee(data.coffee_id),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.plots.all })
    },
  })
}

// Update plot mutation
export const useUpdatePlot = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      plotId,
      updates,
    }: {
      plotId: string
      updates: PlotUpdate
    }) => plotService.updatePlot(plotId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.plots.detail(data.id),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.plots.byCoffee(data.coffee_id),
      })
    },
  })
}

// Delete plot mutation
export const useDeletePlot = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (plotId: string) => plotService.deletePlot(plotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plots.all })
    },
  })
}

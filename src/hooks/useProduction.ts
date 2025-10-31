// =====================================================
// PRODUCTION HOOKS
// =====================================================
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../constants/queryKeys'
import {
  productionService,
  type ProductionDataInsert,
  type ProductionDataUpdate,
} from '../services'

// Get production data by plot
export const useProductionByPlot = (plotId?: string) => {
  return useQuery({
    queryKey: queryKeys.production.byPlot(plotId!),
    queryFn: () => productionService.getProductionByPlot(plotId!),
    enabled: !!plotId,
  })
}

// Get production data by property
export const useProductionByProperty = (propertyId?: string, year?: number) => {
  return useQuery({
    queryKey: queryKeys.production.byProperty(propertyId!, year),
    queryFn: () => productionService.getProductionByProperty(propertyId!, year),
    enabled: !!propertyId,
  })
}

// Get production stats
export const useProductionStats = (propertyId?: string, year?: number) => {
  const currentYear = year || new Date().getFullYear()

  return useQuery({
    queryKey: queryKeys.production.stats(propertyId!, currentYear),
    queryFn: () =>
      productionService.getProductionStats(propertyId!, currentYear),
    enabled: !!propertyId,
  })
}

// Create production data mutation
export const useCreateProductionData = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (production: ProductionDataInsert) =>
      productionService.createProductionData(production),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.production.byPlot(data.plot_id),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.production.all })
    },
  })
}

// Update production data mutation
export const useUpdateProductionData = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productionId,
      updates,
    }: {
      productionId: string
      updates: ProductionDataUpdate
    }) => productionService.updateProductionData(productionId, updates),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.production.byPlot(data.plot_id),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.production.all })
    },
  })
}

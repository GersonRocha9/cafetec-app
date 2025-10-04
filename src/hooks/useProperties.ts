// =====================================================
// PROPERTY HOOKS
// =====================================================
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../constants/queryKeys'
import {
  propertyService,
  type PropertyInsert,
  type PropertyUpdate,
} from '../services'

// Get all properties for user
export const useProperties = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.properties.byUser(userId!),
    queryFn: () => propertyService.getProperties(userId!),
    enabled: !!userId,
  })
}

// Get single property
export const useProperty = (propertyId?: string) => {
  return useQuery({
    queryKey: queryKeys.properties.detail(propertyId!),
    queryFn: () => propertyService.getProperty(propertyId!),
    enabled: !!propertyId,
  })
}

// Create property mutation
export const useCreateProperty = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (property: PropertyInsert) =>
      propertyService.createProperty(property),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.byUser(data.user_id),
      })
    },
  })
}

// Update property mutation
export const useUpdateProperty = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      propertyId,
      updates,
    }: {
      propertyId: string
      updates: PropertyUpdate
    }) => propertyService.updateProperty(propertyId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.detail(data.id),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.byUser(data.user_id),
      })
    },
  })
}

// Delete property mutation
export const useDeleteProperty = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (propertyId: string) =>
      propertyService.deleteProperty(propertyId),
    onSuccess: (_, propertyId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all })
    },
  })
}

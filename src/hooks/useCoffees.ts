// =====================================================
// COFFEE HOOKS
// =====================================================
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../constants/queryKeys'
import {
  coffeeService,
  type CoffeeInsert,
  type CoffeeUpdate,
} from '../services'

// Get all coffees for a property
export const useCoffees = (propertyId?: string) => {
  return useQuery({
    queryKey: queryKeys.coffees.byProperty(propertyId!),
    queryFn: () => coffeeService.getCoffeesByProperty(propertyId!),
    enabled: !!propertyId,
  })
}

// Get single coffee
export const useCoffee = (coffeeId?: string) => {
  return useQuery({
    queryKey: queryKeys.coffees.detail(coffeeId!),
    queryFn: () => coffeeService.getCoffee(coffeeId!),
    enabled: !!coffeeId,
  })
}

// Create coffee mutation
export const useCreateCoffee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (coffee: CoffeeInsert) => coffeeService.createCoffee(coffee),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.coffees.byProperty(data.property_id),
      })
    },
  })
}

// Update coffee mutation
export const useUpdateCoffee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      coffeeId,
      updates,
    }: {
      coffeeId: string
      updates: CoffeeUpdate
    }) => coffeeService.updateCoffee(coffeeId, updates),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.coffees.detail(data.id),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.coffees.byProperty(data.property_id),
      })
    },
  })
}

// Delete coffee mutation
export const useDeleteCoffee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (coffeeId: string) => coffeeService.deleteCoffee(coffeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coffees.all })
    },
  })
}

// =====================================================
// FINANCIAL HOOKS
// =====================================================
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../constants/queryKeys'
import {
  accountService,
  clientService,
  type AccountInsert,
  type AccountUpdate,
  type ClientInsert,
  type ClientUpdate,
} from '../services'

// =====================================================
// ACCOUNTS
// =====================================================

// Get all accounts for property
export const useAccounts = (propertyId?: string) => {
  return useQuery({
    queryKey: queryKeys.accounts.byProperty(propertyId!),
    queryFn: () => accountService.getAccountsByProperty(propertyId!),
    enabled: !!propertyId,
  })
}

// Get accounts by type
export const useAccountsByType = (
  propertyId?: string,
  type?: 'Recebível' | 'Pagável'
) => {
  return useQuery({
    queryKey: queryKeys.accounts.byType(propertyId!, type!),
    queryFn: () => accountService.getAccountsByType(propertyId!, type!),
    enabled: !!propertyId && !!type,
  })
}

// Get financial summary
export const useFinancialSummary = (propertyId?: string) => {
  return useQuery({
    queryKey: queryKeys.accounts.summary(propertyId!),
    queryFn: () => accountService.getFinancialSummary(propertyId!),
    enabled: !!propertyId,
  })
}

// Create account mutation
export const useCreateAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (account: AccountInsert) =>
      accountService.createAccount(account),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.accounts.byProperty(data.property_id),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.accounts.summary(data.property_id),
      })
    },
  })
}

// Update account mutation
export const useUpdateAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      accountId,
      updates,
    }: {
      accountId: string
      updates: AccountUpdate
    }) => accountService.updateAccount(accountId, updates),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.accounts.byProperty(data.property_id),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.accounts.summary(data.property_id),
      })
    },
  })
}

// Mark account as paid
export const useMarkAccountAsPaid = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      accountId,
      paidValue,
    }: {
      accountId: string
      paidValue: number
    }) => {
      return accountService.updateAccount(accountId, {
        status: 'Pago',
        paid_at: new Date().toISOString(),
        paid_value: paidValue,
      })
    },
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.accounts.byProperty(data.property_id),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.accounts.summary(data.property_id),
      })
    },
  })
}

// =====================================================
// CLIENTS
// =====================================================

// Get all clients for property
export const useClients = (propertyId?: string) => {
  return useQuery({
    queryKey: queryKeys.clients.byProperty(propertyId!),
    queryFn: () => clientService.getClientsByProperty(propertyId!),
    enabled: !!propertyId,
  })
}

// Get top clients
export const useTopClients = (propertyId?: string, limit: number = 5) => {
  return useQuery({
    queryKey: queryKeys.clients.top(propertyId!, limit),
    queryFn: () => clientService.getTopClients(propertyId!, limit),
    enabled: !!propertyId,
  })
}

// Create client mutation
export const useCreateClient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (client: ClientInsert) => clientService.createClient(client),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.clients.byProperty(data.property_id),
      })
    },
  })
}

// Update client mutation
export const useUpdateClient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      clientId,
      updates,
    }: {
      clientId: string
      updates: ClientUpdate
    }) => clientService.updateClient(clientId, updates),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.clients.detail(data.id),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.clients.byProperty(data.property_id),
      })
    },
  })
}

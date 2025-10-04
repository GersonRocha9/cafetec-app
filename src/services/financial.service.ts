// =====================================================
// FINANCIAL SERVICE
// =====================================================
import { supabase } from '../config/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '../types/database'

export type Account = Tables<'accounts'>
export type AccountInsert = TablesInsert<'accounts'>
export type AccountUpdate = TablesUpdate<'accounts'>

export type Client = Tables<'clients'>
export type ClientInsert = TablesInsert<'clients'>
export type ClientUpdate = TablesUpdate<'clients'>

// =====================================================
// ACCOUNTS (Contas a Pagar/Receber)
// =====================================================

export const accountService = {
  // Get all accounts for a property
  getAccountsByProperty: async (propertyId: string): Promise<Account[]> => {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('property_id', propertyId)
      .order('due_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get accounts by type
  getAccountsByType: async (
    propertyId: string,
    type: 'Recebível' | 'Pagável'
  ): Promise<Account[]> => {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('property_id', propertyId)
      .eq('type', type)
      .order('due_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get financial summary (using RPC function)
  getFinancialSummary: async (propertyId: string) => {
    const { data, error } = await supabase
      .rpc('get_financial_summary', { p_property_id: propertyId })
      .single()

    if (error) throw error
    return data
  },

  // Create account
  createAccount: async (account: AccountInsert): Promise<Account> => {
    const { data, error } = await supabase
      .from('accounts')
      .insert(account)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update account
  updateAccount: async (
    accountId: string,
    updates: AccountUpdate
  ): Promise<Account> => {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', accountId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete account
  deleteAccount: async (accountId: string): Promise<void> => {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId)

    if (error) throw error
  },
}

// =====================================================
// CLIENTS
// =====================================================

export const clientService = {
  // Get all clients for a property
  getClientsByProperty: async (propertyId: string): Promise<Client[]> => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('property_id', propertyId)
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  },

  // Get top clients (using RPC function)
  getTopClients: async (propertyId: string, limit: number = 5) => {
    const { data, error } = await supabase.rpc('get_top_clients', {
      p_property_id: propertyId,
      p_limit: limit,
    })

    if (error) throw error
    return data || []
  },

  // Create client
  createClient: async (client: ClientInsert): Promise<Client> => {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update client
  updateClient: async (
    clientId: string,
    updates: ClientUpdate
  ): Promise<Client> => {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clientId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete client (soft delete)
  deleteClient: async (clientId: string): Promise<void> => {
    const { error } = await supabase
      .from('clients')
      .update({ is_active: false })
      .eq('id', clientId)

    if (error) throw error
  },
}

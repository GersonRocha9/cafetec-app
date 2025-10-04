// =====================================================
// QUERY KEYS - TanStack Query
// =====================================================
// Centraliza todas as query keys para facilitar invalidação
// e gerenciamento de cache

export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },

  // Profiles
  profiles: {
    all: ['profiles'] as const,
    detail: (userId: string) => ['profiles', userId] as const,
  },

  // Properties
  properties: {
    all: ['properties'] as const,
    byUser: (userId: string) => ['properties', 'user', userId] as const,
    detail: (propertyId: string) => ['properties', propertyId] as const,
  },

  // Coffees
  coffees: {
    all: ['coffees'] as const,
    byProperty: (propertyId: string) =>
      ['coffees', 'property', propertyId] as const,
    detail: (coffeeId: string) => ['coffees', coffeeId] as const,
  },

  // Plots
  plots: {
    all: ['plots'] as const,
    byCoffee: (coffeeId: string) => ['plots', 'coffee', coffeeId] as const,
    byProperty: (propertyId: string) =>
      ['plots', 'property', propertyId] as const,
    detail: (plotId: string) => ['plots', plotId] as const,
    byStatus: (propertyId: string) => ['plots', 'status', propertyId] as const,
  },

  // Activities
  activities: {
    all: ['activities'] as const,
    detail: (id: string) => ['activities', id] as const,
    byPlot: (plotId: string) => ['activities', 'plot', plotId] as const,
    byProperty: (propertyId: string) =>
      ['activities', 'property', propertyId] as const,
    recent: (propertyId: string, limit?: number) =>
      ['activities', 'recent', propertyId, limit] as const,
  },

  // Accounts (Financial)
  accounts: {
    all: ['accounts'] as const,
    byProperty: (propertyId: string) =>
      ['accounts', 'property', propertyId] as const,
    byType: (propertyId: string, type: 'Recebível' | 'Pagável') =>
      ['accounts', 'property', propertyId, type] as const,
    summary: (propertyId: string) =>
      ['accounts', 'summary', propertyId] as const,
  },

  // Clients
  clients: {
    all: ['clients'] as const,
    byProperty: (propertyId: string) =>
      ['clients', 'property', propertyId] as const,
    detail: (clientId: string) => ['clients', clientId] as const,
    top: (propertyId: string, limit?: number) =>
      ['clients', 'top', propertyId, limit] as const,
  },

  // Sales
  sales: {
    all: ['sales'] as const,
    byProperty: (propertyId: string) =>
      ['sales', 'property', propertyId] as const,
    byClient: (clientId: string) => ['sales', 'client', clientId] as const,
    byCoffee: (coffeeId: string) => ['sales', 'coffee', coffeeId] as const,
  },

  // Production Data
  production: {
    all: ['production'] as const,
    byPlot: (plotId: string) => ['production', 'plot', plotId] as const,
    byProperty: (propertyId: string, year?: number) =>
      ['production', 'property', propertyId, year] as const,
    stats: (propertyId: string, year: number) =>
      ['production', 'stats', propertyId, year] as const,
  },
} as const

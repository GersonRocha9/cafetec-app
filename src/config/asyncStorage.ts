// =====================================================
// ASYNC STORAGE ADAPTER FOR SUPABASE
// =====================================================
import AsyncStorage from '@react-native-async-storage/async-storage'

export const AsyncStorageAdapter = {
  getItem: async (key: string) => {
    return AsyncStorage.getItem(key)
  },
  setItem: async (key: string, value: string) => {
    return AsyncStorage.setItem(key, value)
  },
  removeItem: async (key: string) => {
    return AsyncStorage.removeItem(key)
  },
}

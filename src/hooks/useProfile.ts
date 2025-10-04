// =====================================================
// PROFILE HOOKS
// =====================================================
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../constants/queryKeys'
import { profileService, type ProfileUpdate } from '../services'

// Get profile by user ID
export const useProfile = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.profiles.detail(userId!),
    queryFn: () => profileService.getProfile(userId!),
    enabled: !!userId,
  })
}

// Update profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: string
      updates: ProfileUpdate
    }) => profileService.updateProfile(userId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.profiles.detail(data.id),
      })
    },
  })
}

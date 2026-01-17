import { getUserInfo } from '@/actions/auth'
import { useQuery } from '@tanstack/react-query'

export function useUserInfo() {
  return useQuery({
    queryKey: ['user', 'detail'],
    staleTime: 1000 * 60,
    queryFn: async () => {
      const info = await getUserInfo()
      return info
    },
  })
}

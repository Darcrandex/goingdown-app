import { getUserInfo } from '@/actions/auth'
import { getUserWallet } from '@/actions/wallet'
import { useQuery } from '@tanstack/react-query'

export function useUserInfo() {
  return useQuery({
    queryKey: ['user', 'detail'],
    staleTime: 1000 * 60,
    queryFn: async () => {
      const info = await getUserInfo()
      const wallet = await getUserWallet()
      return { ...info, balance: wallet.balance }
    },
  })
}

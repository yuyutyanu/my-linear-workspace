import { useQuery } from '@tanstack/react-query';

import { env } from '@/lib/env';

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health-check'],
    queryFn: async () => ({
      apiUrl: env.apiUrl,
      status: 'ready' as const,
    }),
  });
}

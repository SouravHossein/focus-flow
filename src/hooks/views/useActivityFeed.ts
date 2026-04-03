import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const PAGE_SIZE = 50;

export function useActivityFeed(entityId?: string) {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['activity-feed', user?.id, entityId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) return { data: [], nextPage: null };
      let query = (supabase as any)
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      if (entityId) {
        query = query.eq('entity_id', entityId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return {
        data: data || [],
        nextPage: (data || []).length === PAGE_SIZE ? pageParam + PAGE_SIZE : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!user,
  });
}

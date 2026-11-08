import { useQuery } from '@tanstack/react-query';
import { fetchScreens } from '@/shared/api/client';

export const useScreenList = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['screens'],
    queryFn: fetchScreens,
  });

  return {
    screens: data?.data || [],
    isLoading,
    refetch,
  };
};
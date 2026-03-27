import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';

export interface ISession {
  _id: string;
  academicYear: string;
  term: 'First Term' | 'Second Term' | 'Third Term';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

const fetchActiveSession = async (): Promise<ISession | null> => {
  const res = await apiClient.get('academic-sessions/active');
  return res.data?.data ?? null;
};

const useActiveSession = () => {
  const { data: activeSession, isLoading, isError } = useQuery<ISession | null>({
    queryKey: ['activeAcademicSession'],
    queryFn: fetchActiveSession,
    staleTime: 2 * 60 * 1000,
  });

  return { activeSession: activeSession ?? null, isLoading, isError };
};

export default useActiveSession;

import { useState, useEffect } from 'react';
import { POI } from '@/types/poi';
import { getPOIs } from '@/api/poi';

export type POIResponse = {
  pois: POI[];
  loading: boolean;
  error: string | null;
  refreshPOIs: () => Promise<void>;
};

export const useGetPOIs = (): POIResponse => {
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPOIs();
  }, []);

  const fetchPOIs = async () => {
    try {
      setLoading(true);
      const data = await getPOIs();
      setPois(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    pois,
    loading,
    error,
    refreshPOIs: fetchPOIs,
  };
};

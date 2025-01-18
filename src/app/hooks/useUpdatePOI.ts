import { updatePOIService } from '@/api/poi';
import { UpdatePOIData } from '@/types/poi';
import { useState } from 'react';

interface UseUpdatePOIReturn {
  updatePOI: (poiId: string, data: UpdatePOIData) => Promise<void>;
  isUpdating: boolean;
  error: string | null;
}

export const useUpdatePOI = (): UseUpdatePOIReturn => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePOI = async (poiId: string, data: UpdatePOIData) => {
    try {
      setIsUpdating(true);
      setError(null);
      await updatePOIService(poiId, data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update POI');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updatePOI,
    isUpdating,
    error,
  };
};

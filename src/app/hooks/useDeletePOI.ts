import { deletePOIService } from '@/api/poi';
import { useState } from 'react';

interface UseDeletePOIReturn {
  deletePOI: (poiId: string) => Promise<void>;
  isDeleting: boolean;
  error: string | null;
}

export const useDeletePOI = (): UseDeletePOIReturn => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePOI = async (poiId: string): Promise<void> => {
    try {
      setIsDeleting(true);
      setError(null);
      await deletePOIService(poiId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deletePOI,
    isDeleting,
    error,
  };
};

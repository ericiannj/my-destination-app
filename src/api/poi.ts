import { POI, POIResponse } from '@/types/poi';
import axios, { AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_DESTINATION_API_URL;

export const createPOI = async (poiData: POI): Promise<POIResponse> => {
  try {
    const response: AxiosResponse<POIResponse> = await axios.post(
      `${API_URL}/pois`,
      poiData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to create POI: ${error.message}`);
    }
    throw error;
  }
};

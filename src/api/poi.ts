import { POI, POIResponse, UpdatePOIData } from '@/types/poi';
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

export const getPOIs = async (): Promise<POI[]> => {
  try {
    const response: AxiosResponse<POI[]> = await axios.get(`${API_URL}/pois`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch POIs: ${error.message}`);
    }
    throw error;
  }
};

export const deletePOIService = async (poiId: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/pois/${poiId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to delete POI: ${error.message}`);
    }
    throw error;
  }
};

export const updatePOIService = async (
  poiId: string,
  data: UpdatePOIData,
): Promise<void> => {
  try {
    await axios.patch(`${API_URL}/pois/${poiId}`, data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to update POI: ${error.message}`);
    }
    throw error;
  }
};

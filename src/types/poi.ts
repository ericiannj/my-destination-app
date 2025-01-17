export interface POI {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
}

export interface POIResponse {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

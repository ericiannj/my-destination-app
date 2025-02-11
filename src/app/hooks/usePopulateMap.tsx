import { useCallback, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { POIResponse } from './useGetPOIs';
import { createRoot } from 'react-dom/client';
import { MapPinCheck } from 'lucide-react';
import { POI } from '@/types/poi';

type PopulateMapProps = {
  map: React.RefObject<mapboxgl.Map | null>;
  poiMarkers: React.RefObject<{ [key: string]: mapboxgl.Marker }>;
  poiResponse: POIResponse;
  handlePoiClick: (poi: POI) => void;
};

const usePopulateMap = (args: PopulateMapProps) => {
  const { map, poiMarkers, poiResponse, handlePoiClick } = args;

  const createExistingPOIMarker = () => {
    const el = document.createElement('div');
    el.className =
      'p-2 rounded-full bg-white shadow-lg cursor-pointer hover:bg-gray-50 transition-colors';

    const root = createRoot(el);
    root.render(<MapPinCheck size={20} color="#3B82F6" strokeWidth={2} />);

    return el;
  };

  const setupPOIClickHandlers = useCallback(() => {
    if (!poiMarkers.current) return;

    Object.entries(poiMarkers.current).forEach(([poiId, marker]) => {
      const poi = poiResponse.pois.find((p) => p.id === poiId);
      if (!poi) return;

      const element = marker.getElement();
      element.addEventListener('click', () => handlePoiClick(poi));
    });
  }, [poiMarkers, poiResponse.pois, handlePoiClick]);

  const addPOIMarkers = useCallback(() => {
    if (!map.current) return;

    Object.values(poiMarkers.current).forEach((marker) => marker.remove());
    poiMarkers.current = {};

    poiResponse.pois.forEach((poi) => {
      const el = createExistingPOIMarker();

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([poi.longitude, poi.latitude])
        .addTo(map.current!);

      poiMarkers.current[poi.id] = marker;
    });

    setupPOIClickHandlers();
  }, [map, poiMarkers, poiResponse.pois, setupPOIClickHandlers]);

  useEffect(() => {
    if (map.current) {
      addPOIMarkers();
    }
  }, [addPOIMarkers, map]);
};

export default usePopulateMap;

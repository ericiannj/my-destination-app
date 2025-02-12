import { POI } from '@/types/poi';
import { MapPinCheck } from 'lucide-react';
import { useCallback } from 'react';
import { createRoot } from 'react-dom/client';

type MapChangesProps = {
  map: React.RefObject<mapboxgl.Map | null>;
  mapContainer: React.RefObject<HTMLDivElement | null>;
  poiMarkers: React.RefObject<{ [key: string]: mapboxgl.Marker }>;
  temporaryMarker: React.RefObject<mapboxgl.Marker | null>;
  selectedPOI: POI | null;
};

const useMapChanges = (args: MapChangesProps) => {
  const { map, temporaryMarker, poiMarkers, selectedPOI } = args;

  const removeTemporaryMarker = useCallback(() => {
    if (temporaryMarker.current) {
      temporaryMarker.current.remove();
      temporaryMarker.current = null;
    }
  }, [temporaryMarker]);

  const createNewPOIMarker = () => {
    const el = document.createElement('div');
    el.className =
      'p-2 rounded-full bg-blue-500 shadow-lg cursor-pointer hover:bg-blue-600 transition-colors';

    const root = createRoot(el);
    root.render(<MapPinCheck size={20} color="white" strokeWidth={2} />); // Changed icon color to white

    return el;
  };

  const centerMap = useCallback(
    (latitude: number, longitude: number) => {
      if (map.current) {
        map.current.flyTo({
          center: [longitude, latitude],
          zoom: 15,
          essential: true, // This animation is considered essential for the user experience
          duration: 1000,
        });
      }
    },
    [map],
  );

  const getMarkerElement = () => {
    if (selectedPOI) {
      return poiMarkers.current[selectedPOI.id]?.getElement() || null;
    }
    return temporaryMarker.current?.getElement() || null;
  };

  return {
    removeTemporaryMarker,
    createNewPOIMarker,
    centerMap,
    getMarkerElement,
  };
};

export default useMapChanges;

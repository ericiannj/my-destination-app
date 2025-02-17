import { POI } from '@/types/poi';
import { MapPinCheck } from 'lucide-react';
import { useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';

type MapChangesProps = {
  map: React.RefObject<mapboxgl.Map | null>;
  mapContainer: React.RefObject<HTMLDivElement | null>;
  poiMarkers: React.RefObject<{ [key: string]: mapboxgl.Marker }>;
  temporaryMarker: React.RefObject<mapboxgl.Marker | null>;
  selectedPOI: POI | null;
  handlePopperOpen: () => void;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

const useMapChanges = (args: MapChangesProps) => {
  const { map, temporaryMarker, poiMarkers, selectedPOI, handlePopperOpen } =
    args;
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

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
    root.render(<MapPinCheck size={20} color="white" strokeWidth={2} />);

    return el;
  };

  const centerMap = useCallback(
    (latitude: number, longitude: number) => {
      if (map.current) {
        map.current.flyTo({
          center: [longitude, latitude],
          zoom: 15,
          essential: true,
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

  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    if (
      e.originalEvent.target instanceof Element &&
      e.originalEvent.target.closest('.mapboxgl-marker')
    ) {
      return;
    }

    const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

    if (!temporaryMarker.current) {
      const el = createNewPOIMarker();

      temporaryMarker.current = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([e.lngLat.lng, e.lngLat.lat])
        .addTo(map.current!);
    } else {
      temporaryMarker.current.setLngLat(coords);
    }

    setCoordinates({ latitude: coords[1], longitude: coords[0] });
    handlePopperOpen();
  }, []);

  return {
    coordinates,
    removeTemporaryMarker,
    createNewPOIMarker,
    centerMap,
    getMarkerElement,
    handleMapClick,
  };
};

export default useMapChanges;

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12';
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

type SetupMapProps = {
  map: React.RefObject<mapboxgl.Map | null>;
  mapContainer: React.RefObject<HTMLDivElement | null>;
  poiMarkers: React.RefObject<{ [key: string]: mapboxgl.Marker }>;
  temporaryMarker: React.RefObject<mapboxgl.Marker | null>;
  handleMapClick: (event: mapboxgl.MapMouseEvent) => void;
};

const useSetupMap = (args: SetupMapProps) => {
  const { map, mapContainer, poiMarkers, temporaryMarker, handleMapClick } =
    args;
  const [isMapLoading, setMapLoading] = useState(false);
  const initialConfigRef = useRef({
    center: [-74.006, 40.7128] as [number, number],
    zoom: 12,
    style: MAP_STYLE,
  });

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: initialConfigRef.current.style,
      center: initialConfigRef.current.center,
      zoom: initialConfigRef.current.zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-left');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'bottom-left');

    map.current.on('click', handleMapClick);

    map.current.on('load', () => {
      setMapLoading(true);
    });

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
        map.current.remove();
        map.current = null;
      }
      if (temporaryMarker.current) {
        temporaryMarker.current.remove();
        temporaryMarker.current = null;
      }
      // removeTemporaryMarker();
      Object.values(poiMarkers.current).forEach((marker) => marker.remove());
      poiMarkers.current = {};
    };
  }, [
    handleMapClick,
    map,
    mapContainer,
    poiMarkers,
    temporaryMarker,
    setMapLoading,
  ]);

  useEffect(() => {
    if (
      map.current &&
      isMapLoading &&
      MAP_STYLE !== initialConfigRef.current.style
    ) {
      map.current.setStyle(MAP_STYLE);
      initialConfigRef.current.style = MAP_STYLE;
    }
  }, [isMapLoading, map]);
};

export default useSetupMap;

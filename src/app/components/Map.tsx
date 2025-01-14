'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  mapStyle?: string;
  width?: string;
  height?: string;
  handleChangeCoordinates: (coordinates: Coordinates) => void;
}

export type Coordinates = [number, number] | null;

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

const Map: React.FC<MapProps> = ({
  initialCenter = [-74.006, 40.7128], //NYC
  initialZoom = 12,
  mapStyle = 'mapbox://styles/mapbox/streets-v12',
  width = '100%',
  height = 'calc(100vh - 64px)',
  handleChangeCoordinates,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const handleMapClick = useCallback(
    (e: mapboxgl.MapMouseEvent) => {
      const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      handleChangeCoordinates(coordinates);
    },
    [handleChangeCoordinates],
  );

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: initialCenter,
      zoom: initialZoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-left');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'bottom-left');

    map.current.on('click', handleMapClick);

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setStyle(mapStyle);
    }
  }, [mapStyle, mapLoaded]);

  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setCenter(initialCenter);
      map.current.setZoom(initialZoom);
    }
  }, [initialCenter, initialZoom, mapLoaded]);

  return (
    <div
      ref={mapContainer}
      style={{
        width,
        height,
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    />
  );
};

export default Map;

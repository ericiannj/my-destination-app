'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPopper } from './MapPopper';

interface MapProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  mapStyle?: string;
  width?: string;
  height?: string;
}

export type Coordinates = {
  latitude: number;
  longitude: number;
} | null;

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

const Map: React.FC<MapProps> = ({
  initialCenter = [-74.006, 40.7128],
  initialZoom = 12,
  mapStyle = 'mapbox://styles/mapbox/streets-v12',
  width = '100%',
  height = 'calc(100vh - 64px)',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showPopper, setShowPopper] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates>(null);

  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

    if (!marker.current) {
      // Create marker if it doesn't exist
      const el = document.createElement('div');
      el.className = 'w-4 h-4 bg-red-500 rounded-full';

      marker.current = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat(coords)
        .addTo(map.current!);
    } else {
      // Update marker position
      marker.current.setLngLat(coords);
    }

    setCoordinates({ latitude: coords[1], longitude: coords[0] });
    setShowPopper(true);
  }, []);

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
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
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

  const handleClosePopper = () => {
    setShowPopper(false);
  };

  const getMarkerElement = () => {
    return marker.current?.getElement() || null;
  };

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        className="rounded-lg overflow-hidden"
        style={{ width, height }}
      />
      {showPopper && marker.current && coordinates && (
        <MapPopper
          markerElement={getMarkerElement()}
          coordinates={coordinates}
          onClose={handleClosePopper}
        />
      )}
    </div>
  );
};

export default Map;

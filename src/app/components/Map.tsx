'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPopper } from './MapPopper';
import { POIResponse } from '../hooks/useGetPOIs';
import { MapPinCheck } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import { POI } from '@/types/poi';

interface MapProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  mapStyle?: string;
  width?: string;
  height?: string;
  poiResponse: POIResponse;
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
  poiResponse,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const poiMarkers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showPopper, setShowPopper] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates>(null);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const { pois } = poiResponse;

  const createMarkerElement = () => {
    const el = document.createElement('div');
    el.className =
      'p-2 rounded-full bg-white shadow-lg cursor-pointer hover:bg-gray-50 transition-colors';

    const root = createRoot(el);
    root.render(<MapPinCheck size={20} color="#3B82F6" strokeWidth={2} />);

    return el;
  };

  const addPOIMarkers = useCallback(() => {
    if (!map.current) return;

    Object.values(poiMarkers.current).forEach((marker) => marker.remove());
    poiMarkers.current = {};

    pois.forEach((poi) => {
      const el = createMarkerElement();

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([poi.longitude, poi.latitude])
        .addTo(map.current!);

      el.addEventListener('click', () => {
        setSelectedPOI(poi);
        setCoordinates({
          latitude: poi.latitude,
          longitude: poi.longitude,
        });
        setShowPopper(true);
      });

      poiMarkers.current[poi.id] = marker;
    });
  }, [pois]);

  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

    if (!marker.current) {
      const el = createMarkerElement();

      marker.current = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat(coords)
        .addTo(map.current!);
    } else {
      marker.current.setLngLat(coords);
    }

    setSelectedPOI(null);
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
      Object.values(poiMarkers.current).forEach((marker) => marker.remove());
      poiMarkers.current = {};
    };
  }, []);

  useEffect(() => {
    if (map.current && mapLoaded) {
      addPOIMarkers();
    }
  }, [mapLoaded, addPOIMarkers]);

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
    setSelectedPOI(null);
  };

  const getMarkerElement = () => {
    if (selectedPOI) {
      return poiMarkers.current[selectedPOI.id]?.getElement() || null;
    }
    return marker.current?.getElement() || null;
  };

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        className="rounded-lg overflow-hidden"
        style={{ width, height }}
      />
      {showPopper && coordinates && (
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

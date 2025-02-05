'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPopper } from './MapPopper';
import { POIResponse } from '../hooks/useGetPOIs';
import { MapPinCheck } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import { POI } from '@/types/poi';
import POIList from './POIList';

interface MapProps {
  poiResponse: POIResponse;
  handlePOIEdit: (poi: POI) => void;
}

export type Coordinates = {
  latitude: number;
  longitude: number;
} | null;

const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12';
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

const Map: React.FC<MapProps> = ({ poiResponse, handlePOIEdit }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map>(null);
  const temporaryMarker = useRef<mapboxgl.Marker>(null);
  const poiMarkers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const initialConfigRef = useRef({
    center: [-74.006, 40.7128] as [number, number],
    zoom: 12,
    style: MAP_STYLE,
  });

  const [mapLoaded, setMapLoaded] = useState(false);
  const [showPopper, setShowPopper] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates>(null);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [isListOpen, setListOpen] = useState(false);
  const { pois } = poiResponse;

  // Function for creating existing POI markers
  const createExistingPOIMarker = () => {
    const el = document.createElement('div');
    el.className =
      'p-2 rounded-full bg-white shadow-lg cursor-pointer hover:bg-gray-50 transition-colors';

    const root = createRoot(el);
    root.render(<MapPinCheck size={20} color="#3B82F6" strokeWidth={2} />);

    return el;
  };

  // Function for creating new POI marker
  const createNewPOIMarker = () => {
    const el = document.createElement('div');
    el.className =
      'p-2 rounded-full bg-blue-500 shadow-lg cursor-pointer hover:bg-blue-600 transition-colors';

    const root = createRoot(el);
    root.render(<MapPinCheck size={20} color="white" strokeWidth={2} />); // Changed icon color to white

    return el;
  };

  const removeTemporaryMarker = useCallback(() => {
    if (temporaryMarker.current) {
      temporaryMarker.current.remove();
      temporaryMarker.current = null;
    }
  }, []);

  const centerMap = useCallback((latitude: number, longitude: number) => {
    if (map.current) {
      // Fly to the location with animation
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        essential: true, // This animation is considered essential for the user experience
        duration: 1000, // Animation duration in milliseconds
      });
    }
  }, []);

  const addPOIMarkers = useCallback(() => {
    if (!map.current) return;

    Object.values(poiMarkers.current).forEach((marker) => marker.remove());
    poiMarkers.current = {};

    pois.forEach((poi) => {
      const el = createExistingPOIMarker(); // Using existing POI style

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([poi.longitude, poi.latitude])
        .addTo(map.current!);

      el.addEventListener('click', () => {
        // When clicking an existing POI, trigger the edit handler
        handlePOIEdit(poi);
        setShowPopper(false);
        removeTemporaryMarker();
      });

      poiMarkers.current[poi.id] = marker;
    });
  }, [pois, handlePOIEdit, removeTemporaryMarker]);

  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    // Only handle clicks on empty map space (not on POI markers)
    if (
      e.originalEvent.target instanceof Element &&
      e.originalEvent.target.closest('.mapboxgl-marker')
    ) {
      return;
    }

    const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

    if (!temporaryMarker.current) {
      const el = createNewPOIMarker(); // Using new POI style for the temporary marker

      temporaryMarker.current = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat(coords)
        .addTo(map.current!);
    } else {
      temporaryMarker.current.setLngLat(coords);
    }

    // Reset selected POI and show popper for creating new POI
    setSelectedPOI(null);
    setCoordinates({ latitude: coords[1], longitude: coords[0] });
    setShowPopper(true);
    setListOpen(false);
  }, []);

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
      setMapLoaded(true);
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
      removeTemporaryMarker();
      Object.values(poiMarkers.current).forEach((marker) => marker.remove());
      poiMarkers.current = {};
    };
  }, [handleMapClick, removeTemporaryMarker]);

  useEffect(() => {
    if (map.current && mapLoaded) {
      addPOIMarkers();
    }
  }, [mapLoaded, addPOIMarkers]);

  useEffect(() => {
    if (
      map.current &&
      mapLoaded &&
      MAP_STYLE !== initialConfigRef.current.style
    ) {
      map.current.setStyle(MAP_STYLE);
      initialConfigRef.current.style = MAP_STYLE;
    }
  }, [mapLoaded]);

  const handleClosePopper = () => {
    setShowPopper(false);
    setSelectedPOI(null);
    if (temporaryMarker.current) {
      temporaryMarker.current.remove();
      temporaryMarker.current = null;
    }
  };

  const getMarkerElement = () => {
    if (selectedPOI) {
      return poiMarkers.current[selectedPOI.id]?.getElement() || null;
    }
    return temporaryMarker.current?.getElement() || null;
  };

  const handleToggleList = () => {
    if (showPopper) setShowPopper(false);
    setListOpen((prevState) => !prevState);
  };

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        className="rounded-lg overflow-hidden"
        style={{ width: '100%', height: 'calc(100vh - 64px)' }}
      />
      {showPopper && coordinates && (
        <MapPopper
          markerElement={getMarkerElement()}
          coordinates={coordinates}
          onClose={handleClosePopper}
          refreshPOIs={poiResponse.refreshPOIs}
        />
      )}
      <POIList
        poiResponse={poiResponse}
        handlePOIEdit={handlePOIEdit}
        onCenterMap={centerMap}
        isOpen={isListOpen}
        onToggleList={handleToggleList}
      />
    </div>
  );
};

export default Map;

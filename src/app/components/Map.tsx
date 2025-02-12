'use client';

import React, { useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPopper } from './MapPopper';
import { POIResponse } from '../hooks/useGetPOIs';
import { POI } from '@/types/poi';
import POIList from './POIList';
import usePopulateMap from '../hooks/usePopulateMap';
import useSetupMap from '../hooks/useSetupMap';
import useMapChanges from '../hooks/useMapChanges';

interface MapProps {
  poiResponse: POIResponse;
  handlePOIEdit: (poi: POI) => void;
}

export type Coordinates = {
  latitude: number;
  longitude: number;
};

const Map: React.FC<MapProps> = ({ poiResponse, handlePOIEdit }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map>(null);
  const temporaryMarker = useRef<mapboxgl.Marker>(null);
  const poiMarkers = useRef<{ [key: string]: mapboxgl.Marker }>({});

  const [isCreatePopperOpen, setCreatePopperOpen] = useState(false);
  const [isListOpen, setListOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);

  const handlePoiClick = (poi: POI) => {
    handlePOIEdit(poi);
    setCreatePopperOpen(false);
    removeTemporaryMarker();
  };

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
        .setLngLat([e.lngLat.lng, e.lngLat.lat])
        .addTo(map.current!);
    } else {
      temporaryMarker.current.setLngLat(coords);
    }

    // Reset selected POI and show popper for creating new POI
    setSelectedPOI(null);
    setCoordinates({ latitude: coords[1], longitude: coords[0] });
    setCreatePopperOpen(true);
    setListOpen(false);
  }, []);

  useSetupMap({
    map,
    mapContainer,
    poiMarkers,
    temporaryMarker,
    handleMapClick,
  });

  usePopulateMap({
    map,
    poiMarkers,
    poiResponse,
    handlePoiClick,
  });

  const {
    centerMap,
    createNewPOIMarker,
    getMarkerElement,
    removeTemporaryMarker,
  } = useMapChanges({
    map,
    temporaryMarker,
    poiMarkers,
    selectedPOI,
    mapContainer,
  });

  const handleClosePopper = () => {
    setCreatePopperOpen(false);
    setSelectedPOI(null);
    if (temporaryMarker.current) {
      temporaryMarker.current.remove();
      temporaryMarker.current = null;
    }
  };

  const handleToggleList = () => {
    if (isCreatePopperOpen) setCreatePopperOpen(false);
    setListOpen((prevState) => !prevState);
  };

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        className="rounded-lg overflow-hidden"
        style={{ width: '100%', height: 'calc(100vh - 64px)' }}
      />
      {isCreatePopperOpen && coordinates && (
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

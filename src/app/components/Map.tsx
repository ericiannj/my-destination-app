'use client';

import React, { useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPopper } from './MapPopper';
import { POIResponse } from '../hooks/useGetPOIs';
import { POI } from '@/types/poi';
import POIList from './POIList';
import usePopulateMap from '../hooks/usePopulateMap';
import useSetupMap from '../hooks/useSetupMap';
import useMapChanges from '../hooks/useMapChanges';
import { MapPin } from 'lucide-react';

interface MapProps {
  poiResponse: POIResponse;
  handlePOIEdit: (poi: POI) => void;
}

const Map: React.FC<MapProps> = ({ poiResponse, handlePOIEdit }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map>(null);
  const temporaryMarker = useRef<mapboxgl.Marker>(null);
  const poiMarkers = useRef<{ [key: string]: mapboxgl.Marker }>({});

  const [isCreatePopperOpen, setCreatePopperOpen] = useState(false);
  const [isListOpen, setListOpen] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const handlePoiClick = (poi: POI) => {
    handlePOIEdit(poi);
    setCreatePopperOpen(false);
    removeTemporaryMarker();
  };

  const handlePopperOpen = () => {
    setSelectedPOI(null);
    setCreatePopperOpen(true);
    setListOpen(false);
  };

  const {
    centerMap,
    getMarkerElement,
    removeTemporaryMarker,
    coordinates,
    handleMapClick,
  } = useMapChanges({
    map,
    temporaryMarker,
    poiMarkers,
    selectedPOI,
    mapContainer,
    handlePopperOpen,
    isCreateMode,
  });

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
        className={`rounded-lg overflow-hidden ${
          isCreateMode
            ? '!cursor-pointer [&_.mapboxgl-canvas-container]:!cursor-pointer'
            : 'cursor-grab'
        }`}
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
      <button
        onClick={() => setIsCreateMode((prev) => !prev)}
        className={`absolute top-4 left-4 flex items-center gap-2 rounded-full p-2 shadow-lg transition-colors ${
          isCreateMode
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
        title={isCreateMode ? 'Disable Create Mode' : 'Enable Create Mode'}
      >
        <MapPin className="h-6 w-6" />
        <span className="text-sm font-medium">
          {isCreateMode ? 'Creating...' : 'Create POI'}
        </span>
      </button>
    </div>
  );
};

export default Map;

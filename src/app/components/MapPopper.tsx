'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Coordinates } from './Map';
import { createPOI } from '@/api/poi';
import { X } from 'lucide-react';

interface MapPopperProps {
  markerElement: HTMLElement | null;
  coordinates: Coordinates;
  onClose: () => void;
  refreshPOIs: () => Promise<void>;
}

type Poi = {
  name: string;
  description: string;
};

const initialPoi: Poi = {
  name: '',
  description: '',
};

export const MapPopper: React.FC<MapPopperProps> = ({
  markerElement,
  coordinates,
  onClose,
  refreshPOIs,
}) => {
  const [poi, setPoi] = useState<Poi>(initialPoi);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  const handleChangePoi = (key: keyof Poi, value: string) => {
    setPoi((prevState) => ({ ...prevState, [key]: value }));
  };

  const updatePopperPosition = useCallback(() => {
    if (markerElement) {
      const markerRect = markerElement.getBoundingClientRect();
      setPosition({
        left: markerRect.right - 20,
        top: markerRect.top - markerRect.height / 2,
      });
    }
  }, [markerElement]);

  useEffect(() => {
    updatePopperPosition();

    const handleResize = () => {
      updatePopperPosition();
    };

    window.addEventListener('resize', handleResize);

    // Some browsers might need this for smooth updates during map interactions
    if (markerElement) {
      const observer = new MutationObserver(updatePopperPosition);
      observer.observe(markerElement, {
        attributes: true,
        attributeFilter: ['style'],
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (markerElement) {
        const observer = new MutationObserver(updatePopperPosition);
        observer.disconnect();
      }
    };
  }, [markerElement, updatePopperPosition]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (e.target instanceof HTMLElement) {
        const isPopperClick = e.target.closest('.popper-container');
        const isMarkerClick = e.target.closest('.mapboxgl-marker');

        if (!isPopperClick && !isMarkerClick) {
          onClose();
        }
      }
    };

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPOI = {
      title: poi.name,
      description: poi.description,
      latitude: coordinates?.latitude ?? 0,
      longitude: coordinates?.longitude ?? 0,
    };

    try {
      await createPOI(newPOI);
      refreshPOIs();
      onClose();
    } catch (error) {
      console.error('Error creating POI:', error);
    }
  };

  return (
    <div
      className="popper-container absolute z-10 bg-white rounded-lg shadow-lg p-3"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        transform: 'translateY(-50%)',
      }}
    >
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -right-1 -top-1 p-1 hover:bg-gray-100 rounded-full"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2">
          <div className="w-2 h-2 bg-white rotate-45 transform -translate-x-1" />
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-4"
        >
          <div>
            <h1>Create POI</h1>
          </div>
          <div>
            <input
              type="text"
              value={poi.name}
              onChange={(event) => handleChangePoi('name', event.target.value)}
              placeholder="Enter location name"
              className="block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <div>
            <input
              type="text"
              value={poi.description}
              onChange={(event) =>
                handleChangePoi('description', event.target.value)
              }
              placeholder="Enter location description"
              className="block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

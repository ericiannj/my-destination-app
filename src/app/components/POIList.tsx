import React, { SyntheticEvent, useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { POIResponse } from '../hooks/useGetPOIs';
import { useDeletePOI } from '../hooks/useDeletePOI';
import { POI } from '@/types/poi';
import POIDialog from './POIDialog';

type POIListProps = {
  poiResponse: POIResponse;
};

const POIList = ({ poiResponse }: POIListProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<POI | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { pois, loading, error, refreshPOIs } = poiResponse;

  const { deletePOI, isDeleting } = useDeletePOI();

  const handlePOIClick = (poi: POI) => {
    setSelectedPOI(poi);
    setIsDialogOpen(true);
  };

  const handleDelete = async (event: SyntheticEvent, poiId: POI['id']) => {
    event.stopPropagation();
    try {
      await deletePOI(poiId);
      refreshPOIs();
    } catch (error) {
      console.error('Failed to delete POI:', error);
    }
  };

  return (
    <>
      <div className="absolute top-8 right-8 z-10">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.button
              key="toggle-button"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.1 }}
              onClick={() => setIsOpen(true)}
              className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100"
              aria-label="Toggle POI List"
            >
              <MapPin className="h-6 w-6 text-gray-600" />
            </motion.button>
          ) : (
            <motion.div
              key="poi-list"
              initial={{ scale: 0, opacity: 0, originX: 1, originY: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: 'easeOut',
              }}
              className="bg-white rounded-lg shadow-lg p-4 w-72 h-96 overflow-hidden"
            >
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Points of Interest</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={refreshPOIs}
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      Refresh
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsOpen(false)}
                      className="p-1 rounded hover:bg-gray-200"
                      aria-label="Close POI List"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </motion.button>
                  </div>
                </div>
                {loading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">Loading POIs...</div>
                  </div>
                ) : error ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-red-500">Error: {error}</div>
                    <button
                      onClick={refreshPOIs}
                      className="mt-2 text-blue-500 hover:text-blue-700"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <motion.div
                    className="space-y-2 overflow-y-auto flex-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {pois.length === 0 ? (
                      <div className="text-center text-gray-500">
                        No POIs found
                      </div>
                    ) : (
                      pois.map((poi, index) => (
                        <motion.div
                          key={poi.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handlePOIClick(poi)}
                          className="p-2 hover:bg-gray-100 rounded cursor-pointer border border-gray-100 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium">{poi.title}</h3>
                            <p className="text-sm text-gray-600">
                              {poi.description}
                            </p>
                            <div className="text-xs text-gray-400 mt-1">
                              Lat: {poi.latitude}, Long: {poi.longitude}
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(event) => handleDelete(event, poi.id)}
                            disabled={isDeleting}
                            className="ml-2 p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Delete POI"
                          >
                            <X className="h-4 w-4 text-gray-400 hover:text-gray-600 flex-shrink-0" />
                          </motion.button>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <POIDialog
        poi={selectedPOI}
        isOpen={isDialogOpen}
        refreshPOIs={refreshPOIs}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
};

export default POIList;

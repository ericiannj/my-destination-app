import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { POI } from '@/types/poi';
import { useUpdatePOI } from '../hooks/useUpdatePOI';

type POIDialogProps = {
  poi?: POI;
  isOpen: boolean;
  onClose: () => void;
  refreshPOIs?: () => Promise<void>;
};

const POIDialog = ({ poi, isOpen, onClose, refreshPOIs }: POIDialogProps) => {
  const [editedPOI, setEditedPOI] = useState({
    title: '',
    description: '',
  });
  const { updatePOI, isUpdating, error: updateError } = useUpdatePOI();

  useEffect(() => {
    if (poi) {
      setEditedPOI({
        title: poi.title,
        description: poi.description,
      });
    }
  }, [poi]);

  if (!poi) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePOI(poi.id, {
        title: editedPOI.title,
        description: editedPOI.description,
      });
      refreshPOIs?.();
      onClose();
    } catch (error) {
      console.error('Failed to update POI:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 
                       bg-white rounded-lg shadow-xl w-full max-w-md p-6"
          >
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Edit POI</h2>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </motion.button>
              </div>
              {updateError && (
                <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600">
                  {updateError}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-500"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={editedPOI.title}
                    onChange={(e) =>
                      setEditedPOI({ ...editedPOI, title: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             shadow-sm p-2 text-gray-900 focus:border-blue-500 
                             focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-500"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={editedPOI.description}
                    onChange={(e) =>
                      setEditedPOI({
                        ...editedPOI,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             shadow-sm p-2 text-gray-900 focus:border-blue-500 
                             focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Latitude
                    </label>
                    <div
                      className="mt-1 block w-full rounded-md border border-gray-100 
                                  bg-gray-50 p-2 text-gray-700"
                    >
                      {poi.latitude}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Longitude
                    </label>
                    <div
                      className="mt-1 block w-full rounded-md border border-gray-100 
                                  bg-gray-50 p-2 text-gray-700"
                    >
                      {poi.longitude}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    disabled={isUpdating}
                    className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isUpdating}
                    className="px-4 py-2 rounded-md bg-blue-500 text-white 
                             hover:bg-blue-600 focus:outline-none focus:ring-2 
                             focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Update POI
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default POIDialog;

'use client';

import dynamic from 'next/dynamic';
import ClientOnly from './components/ClientOnly';
import { useGetPOIs } from './hooks/useGetPOIs';
import POIDialog from './components/POIDialog';
import { useState } from 'react';
import { POI } from '@/types/poi';

const MapWithNoSSR = dynamic(() => import('./components/Map'), { ssr: false });

export default function Home() {
  const [selectedPOI, setSelectedPOI] = useState<POI | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const poiResponse = useGetPOIs();

  const handlePOIEdit = (poi: POI) => {
    setSelectedPOI(poi);
    setIsDialogOpen(true);
  };

  return (
    <main className="min-h-screen p-8">
      <ClientOnly>
        <MapWithNoSSR poiResponse={poiResponse} handlePOIEdit={handlePOIEdit} />
        <POIDialog
          poi={selectedPOI}
          isOpen={isDialogOpen}
          refreshPOIs={poiResponse.refreshPOIs}
          onClose={() => setIsDialogOpen(false)}
        />
      </ClientOnly>
    </main>
  );
}

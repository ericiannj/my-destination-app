'use client';

import dynamic from 'next/dynamic';
import ClientOnly from './components/ClientOnly';
import POIList from './components/POIList';
import { useGetPOIs } from './hooks/useGetPOIs';

const MapWithNoSSR = dynamic(() => import('./components/Map'), { ssr: false });

export default function Home() {
  const poiResponse = useGetPOIs();

  return (
    <main className="min-h-screen p-8">
      <ClientOnly>
        <MapWithNoSSR poiResponse={poiResponse} />
        <POIList poiResponse={poiResponse} />
      </ClientOnly>
    </main>
  );
}

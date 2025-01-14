'use client';

import dynamic from 'next/dynamic';
import ClientOnly from './components/ClientOnly';

const MapWithNoSSR = dynamic(() => import('./components/Map'), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <ClientOnly>
        <MapWithNoSSR />
      </ClientOnly>
    </main>
  );
}

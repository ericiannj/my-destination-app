'use client';

import dynamic from 'next/dynamic';
import ClientOnly from './components/ClientOnly';
import { useState } from 'react';
import { Coordinates } from './components/Map';

const MapWithNoSSR = dynamic(() => import('./components/Map'), { ssr: false });

export default function Home() {
  const [coordinates, setCoordinates] = useState<Coordinates>(null);
  console.log('coordinates:', coordinates);

  const handleChangeCoordinates = (coordinates: Coordinates) => {
    setCoordinates(coordinates);
  };

  return (
    <main className="min-h-screen p-8">
      <h1>
        {!!coordinates
          ? `${coordinates[0]} | ${coordinates[1]}`
          : 'Select Coordinates'}
      </h1>
      <ClientOnly>
        <MapWithNoSSR handleChangeCoordinates={handleChangeCoordinates} />
      </ClientOnly>
    </main>
  );
}

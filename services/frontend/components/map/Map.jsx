'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./LeafMap'), {
  ssr: false,
});

export default Map;

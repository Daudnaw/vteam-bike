'use client';

import { useEffect, useState } from 'react';
import BaseMap from './BaseMap';
import ZonesLayer from './ZonesLayer';
import { getAllZones } from '../../src/app/actions/zones';

export default function ZonesOnlyMap() {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    async function fetchZones() {
      const zonesData = await getAllZones();
      setZones(zonesData);
    }
    fetchZones();
  }, []);

  return (
    <BaseMap>
      <ZonesLayer zones={zones} />
    </BaseMap>
  );
}

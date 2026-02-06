'use client';

import { useEffect, useState } from 'react';
import BaseMap from './BaseMap';
import ZonesLayer from './ZonesLayer';
import BikesLayer from './BikesLayer';
import { getAllZones } from '../../src/app/actions/zones';
import { getBikes } from '../../src/app/actions/bikes';

/**
 * Zone and bike map.
 * @returns
 */
export default function ZonesAndBikesMap() {
    const [zones, setZones] = useState([]);
    const [bikes, setBikes] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const zonesData = await getAllZones();
            const bikesData = await getBikes();

            setZones(zonesData);
            setBikes(bikesData);
        }
        fetchData();
    }, []);

    return (
        <BaseMap zones={zones}>
            <ZonesLayer zones={zones} admin={true} />
            <BikesLayer bikes={bikes} admin={true} />
        </BaseMap>
    );
}

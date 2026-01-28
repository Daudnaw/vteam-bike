'use client';
import { useEffect, useState } from 'react';
import React from 'react';
import AppMap from '../../../../../../components/map/AppMap';
import LocateButton from '../../../../../../components/map/LocateButton';
import { getAllZones } from '../../../../actions/zones';
import { getBikes } from '../../../../actions/bikes';

export default function Page() {
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
        <div>
            <AppMap zones={zones} bikes={bikes} />
        </div>
    );
}

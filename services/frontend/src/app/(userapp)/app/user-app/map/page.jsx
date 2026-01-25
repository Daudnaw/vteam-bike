'use client';
import { useEffect, useState } from 'react';
import React from 'react';
import AppMap from '../../../../../../components/map/AppMap';
import LocateButton from '../../../../../../components/map/LocateButton';
import { getAllZones } from '../../../../actions/zones';

export default function Page() {
    const [zones, setZones] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const zonesData = await getAllZones();

            setZones(zonesData);
        }
        fetchData();
    }, []);
    return (
        <div>
            <AppMap zones={zones} />
        </div>
    );
}

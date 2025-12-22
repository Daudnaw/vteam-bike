'use client';
import React, { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function CityButton({ zones }) {
    const map = useMap();
    const [zone, setZone] = useState('');

    useEffect(() => {
        if (!zone) {
            return;
        }
        const city = zones.find((z) => z.id.toString() === zone);

        if (!city) {
            return;
        }

        function handleLocate(city) {
            map.flyTo([city.latitude, city.longitude], 12, {
                animate: true,
                duration: 1.5,
            });
        }

        handleLocate(city);
    }, [zone]);

    return (
        <div className='absolute top-14 right-2 bg-slate-800 p-2 rounded-md z-1000 text-white'>
            <select value={zone} onChange={(e) => setZone(e.target.value)}>
                <option value=''>Välj stad</option>
                {zones?.map((zone) => {
                    return (
                        <option value={zone.id} key={zone.id}>
                            {zone.name}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}

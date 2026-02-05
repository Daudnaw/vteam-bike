'use client';
import React, { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
// import L from 'leaflet';
import { Pin } from 'lucide-react';

/**
 * Locate the user and relocate the map to user.
 * @returns
 */
export default function LocateButton() {
    const map = useMap();

    function handleLocate() {
        map.locate({ enableHighAccuracy: true });

        map.once('locationfound', (e) => {
            map.flyTo(e.latlng, 17, {
                animate: true,
                duration: 1.5,
            });
        });

        map.once('locationerror', (e) => {
            console.error(e.message);
        });
    }

    return (
        <button
            onClick={handleLocate}
            className='absolute top-2 right-2 bg-slate-800 p-2 rounded-md z-1000'
        >
            <Pin className='text-detail-yellow' />
        </button>
    );
}

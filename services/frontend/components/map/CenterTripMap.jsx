import React from 'react';
import { useMap } from 'react-leaflet';

/**
 * Center on a trip from start to end.
 * @param {*} param0
 * @returns
 */
export default function CenterTripMap({ start, end }) {
    const map = useMap();

    map.fitBounds([start, end], {
        padding: [30, 30],
    });
    return null;
}

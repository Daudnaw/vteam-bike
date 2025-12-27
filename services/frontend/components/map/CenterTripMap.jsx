import React from 'react';
import { useMap } from 'react-leaflet';

export default function CenterTripMap({ start, end }) {
    const map = useMap();

    map.fitBounds([start, end], {
        padding: [30, 30],
    });
    return null;
}

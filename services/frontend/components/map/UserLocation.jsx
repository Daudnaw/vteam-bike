'use client';
import React, { useState, useEffect } from 'react';
import { useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const pinIcon = new L.Icon({
    iconUrl: '/pin.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

export default function UserLocation() {
    const map = useMap();
    const [pos, setPos] = useState();

    useEffect(() => {
        map.locate({ enableHighAccuracy: true });

        map.on('locationfound', (e) => {
            setPos(e.latlng);
            map.flyTo(e.latlng, 15);
        });

        map.on('locationerror', (e) => {
            console.error(e.message);
        });
    }, [map]);
    if (pos) {
        return (
            <Marker icon={pinIcon} position={pos}>
                <Popup>Du är här</Popup>
            </Marker>
        );
    }

    return null;
}

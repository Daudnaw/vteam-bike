'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import UserLocation from './UserLocation';
import LocateButton from './LocateButton';

export default function AppMap({ zones }) {
    console.log('ZONES:', zones);

    return (
        <MapContainer
            center={[0, 0]}
            zoom={2}
            style={{ height: '100vh', width: '100%' }}
        >
            <TileLayer
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                attribution='&copy; OpenStreetMap contributors'
            />
            <LocateButton />
            <UserLocation />
        </MapContainer>
    );
}

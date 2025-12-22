'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import UserLocation from './UserLocation';
import LocateButton from './LocateButton';
import CityButton from './CityButton';

const zones = [
    {
        id: 1,
        name: 'Göteborg',
        latitude: 57.7089,
        longitude: 11.9746,
    },
    {
        id: 2,
        name: 'Malmö',
        latitude: 55.60498,
        longitude: 13.0038,
    },
    {
        id: 3,
        name: 'Stockholm',
        latitude: 59.3293,
        longitude: 18.0686,
    },
];

export default function AppMap() {
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
            <CityButton zones={zones} />
            <UserLocation />
        </MapContainer>
    );
}

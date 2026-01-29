'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import UserLocation from './UserLocation';
import LocateButton from './LocateButton';
import ZonesLayer from './ZonesLayer';
import BikesLayer from './BikesLayer';

export default function AppMap({ zones, bikes }) {
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
            <ZonesLayer zones={zones} admin={false} />
            <BikesLayer bikes={bikes} admin={false} />
        </MapContainer>
    );
}

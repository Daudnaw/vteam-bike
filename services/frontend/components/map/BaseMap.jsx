'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';

export default function BaseMap({ children }) {
    return (
        <MapContainer
            center={[59.33, 18.07]}
            zoom={6}
            scrollWheelZoom
            style={{ height: '600px', width: '100%' }}
        >
            <TileLayer
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                attribution='&copy; OpenStreetMap contributors'
            />
            {children}
        </MapContainer>
    );
}

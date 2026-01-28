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
                url='https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png'
                attribution='© OpenStreetMap © CARTO'
            />
            {children}
        </MapContainer>
    );
}

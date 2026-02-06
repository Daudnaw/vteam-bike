'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import CityButton from './CityButton';

/**
 * Basemap.
 * @param {*} param0
 * @returns
 */
export default function BaseMap({ children, zones }) {
    const cityZones = zones.filter((zone) => zone.zoneType == 'city');

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
            <CityButton zones={cityZones} />
        </MapContainer>
    );
}

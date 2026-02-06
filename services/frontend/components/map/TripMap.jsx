'use client';

import 'leaflet/dist/leaflet.css';
import {
    MapContainer,
    TileLayer,
    Popup,
    Marker,
    Polyline,
} from 'react-leaflet';
import L from 'leaflet';
import CenterTripMap from './CenterTripMap';

const pinIcon = new L.Icon({
    iconUrl: '/pin.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

/**
 * Map to view a trip.
 * @param {*} param0
 * @returns
 */
export default function TripMap({ startPos, endPos }) {
    return (
        <MapContainer
            scrollWheelZoom={false}
            style={{ height: '600px', width: '100%' }}
        >
            <TileLayer
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                attribution='&copy; OpenStreetMap contributors'
            />

            <Marker icon={pinIcon} position={startPos}>
                <Popup>Start</Popup>
            </Marker>

            <Marker icon={pinIcon} position={endPos}>
                <Popup>Slut</Popup>
            </Marker>

            <Polyline
                positions={[startPos, endPos]}
                pathOptions={{ color: 'blue', weight: 2 }}
            />

            <CenterTripMap start={startPos} end={endPos} />
        </MapContainer>
    );
}

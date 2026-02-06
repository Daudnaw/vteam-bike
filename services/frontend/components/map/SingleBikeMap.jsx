'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useMemo } from 'react';

/**
 * Bike icon.
 * @param {*} size
 * @returns
 */
function createBikeIcon(size) {
    return new L.Icon({
        iconUrl: '/scooter.png',
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
    });
}

/**
 * Map for user app.
 * @param {*} param0
 * @returns
 */
export default function SingleBikeMap({ bike, admin }) {
    const bikeIcon = useMemo(() => createBikeIcon(20), [20]);
    return (
        <MapContainer
            center={[bike?.lat, bike?.lon]}
            zoom={16}
            style={{ height: '70vh', width: '100%' }}
        >
            <TileLayer
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                attribution='&copy; OpenStreetMap contributors'
            />
            <Marker
                key={bike?._id}
                position={[bike?.lat, bike?.lon]}
                icon={bikeIcon}
            >
                <Popup>
                    <a
                        style={{
                            color:
                                bike?.status == 'offline' ? '#F08080' : '#000',
                            fontWeight: 700,
                        }}
                    >
                        {bike?.status == 'offline' && (
                            <span>Inte tillgänglig</span>
                        )}
                        {bike?.status == 'available' && (
                            <span>Tillgänglig</span>
                        )}
                        {bike?.status == 'charging' && <span>Laddar</span>}
                        {bike?.status == 'maintenance' && <span>Service</span>}
                        {bike?.status == 'rented' && <span>Aktiv</span>}
                    </a>
                    <br />
                    <br />
                    {admin ? (
                        <a
                            href={`/admin-dashboard/bikes/single?bikeId=${bike?._id}`}
                            style={{
                                color: '#1976d2',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                            }}
                        >
                            Se detaljer
                        </a>
                    ) : (
                        bike?.status == 'available' && (
                            <a
                                href={`/app/user-app/rent-bike?bikeId=${bike?._id}`}
                                style={{
                                    backgroundColor: 'green',
                                    color: '#fff',
                                    padding: '5px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                }}
                            >
                                Hyr cykel
                            </a>
                        )
                    )}
                </Popup>
            </Marker>
        </MapContainer>
    );
}

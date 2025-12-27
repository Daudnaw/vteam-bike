'use client';

import 'leaflet/dist/leaflet.css';
import {
    MapContainer,
    TileLayer,
    Circle,
    Polygon,
    Popup,
    Marker,
} from 'react-leaflet';
import { getZones } from '../../src/app/actions/zones';
import { getBikes } from '../../src/app/actions/bikes';
import { useState, useEffect } from 'react';
import L from 'leaflet';

const bikeIcon = new L.Icon({
    iconUrl: '/scooter.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

export default function LeafMap() {
    const [zones, setZones] = useState([]);
    const [bikes, setBikes] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const zonesData = await getZones();
            const bikesData = await getBikes();

            setZones(zonesData.zones);
            setBikes(bikesData.bikes);
        }
        fetchData();
    }, []);

    return (
        <MapContainer
            center={[59.33, 18.07]}
            zoom={13}
            scrollWheelZoom
            style={{ height: '600px', width: '100%' }}
        >
            <TileLayer
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                attribution='&copy; OpenStreetMap contributors'
            />

            {zones.map((zone) => {
                const color =
                    {
                        parking: '#056b2fff',
                        speed_limit: '#856c0cff',
                        no_go: '#e62914ff',
                        custom: '#093e62ff',
                    }[zone.zoneType] || '#555';

                if (zone.type === 'circle') {
                    return (
                        <Circle
                            key={zone._id}
                            center={zone.center}
                            radius={zone.radius}
                            pathOptions={{
                                color,
                                fillColor: color,
                                fillOpacity: 0.25,
                            }}
                        >
                            <Popup>
                                <b>{zone.name}</b>
                                <br />
                                Type: {zone.zoneType}
                                <br />
                            </Popup>
                        </Circle>
                    );
                }

                if (zone.type === 'polygon') {
                    return (
                        <Polygon
                            key={zone._id}
                            positions={zone.area}
                            pathOptions={{
                                color,
                                fillColor: color,
                                fillOpacity: 0.25,
                            }}
                        >
                            <Popup>
                                <b>{zone.name}</b>
                                <br />
                                Typ: {zone.zoneType}
                                <br />
                                Aktiv: {zone.active ? 'Ja' : 'Nej'}
                                <br />
                                {zone.maxSpeed && (
                                    <>Maxhastighet: {zone.maxSpeed} km/h</>
                                )}
                            </Popup>
                        </Polygon>
                    );
                }

                return null;
            })}
            {bikes.map((bike) => (
                <Marker
                    key={bike._id}
                    position={[bike.lat, bike.lng]}
                    icon={bikeIcon}
                >
                    <Popup>
                        <div className='text-sm'>
                            <b>{bike.name}</b>
                            <br />
                            Status: {bike.status}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

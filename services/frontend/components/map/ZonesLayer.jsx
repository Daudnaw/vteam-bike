'use client';

import { Circle, Polygon, Popup } from 'react-leaflet';

/**
 * Zones layer to load on map.
 * @param {*} param0
 * @returns
 */
export default function ZonesLayer({ zones, admin }) {
    const zoneStyles = {
        city: {
            color: '#4a90e2',
            fillColor: '#4a90e2',
            fillOpacity: 0.08,
            weight: 1,
        },
        parking: {
            color: '#2e7d32',
            fillColor: '#2e7d32',
            fillOpacity: 0.35,
            weight: 2,
        },
        speed_limit: {
            color: '#f9a825',
            fillColor: '#f9a825',
            fillOpacity: 0.35,
            weight: 2,
        },
        no_go: {
            color: '#c62828',
            fillColor: '#c62828',
            fillOpacity: 0.45,
            weight: 2,
        },
        custom: {
            color: '#455a64',
            fillColor: '#455a64',
            fillOpacity: 0.35,
            weight: 2,
        },
    };

    const hoverStyle = {
        fillOpacity: 0.6,
    };

    return zones.map((zone) => {
        const style = zoneStyles[zone.zoneType] || zoneStyles.custom;

        if (zone.type === 'circle') {
            return (
                <Circle
                    key={zone.id}
                    center={zone.center}
                    radius={zone.radius}
                    pathOptions={style}
                    eventHandlers={{
                        mouseover: (e) => e.target.setStyle(hoverStyle),
                        mouseout: (e) => e.target.setStyle(style),
                    }}
                >
                    <Popup>
                        <div style={{ minWidth: 180 }}>
                            <b>{zone.name}</b>
                            <br />
                            {admin && (
                                <div>
                                    <span>Type: {zone.zoneType}</span>
                                    <br />
                                    <a
                                        href='/admin-dashboard/cities'
                                        style={{
                                            color: '#1976d2',
                                            textDecoration: 'underline',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        To Edit go to relevent city
                                    </a>
                                </div>
                            )}
                        </div>
                    </Popup>
                </Circle>
            );
        }

        if (zone.type === 'polygon') {
            return (
                <Polygon
                    key={zone.id}
                    positions={zone.area}
                    pathOptions={style}
                    eventHandlers={{
                        mouseover: (e) => e.target.setStyle(hoverStyle),
                        mouseout: (e) => e.target.setStyle(style),
                    }}
                >
                    {admin && (
                        <Popup>
                            <div style={{ minWidth: 180 }}>
                                <b>{zone.name}</b>
                                <br />
                                Type: {zone.zoneType}
                                <br />
                                <a
                                    href='/admin-dashboard/cities'
                                    style={{
                                        color: '#1976d2',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                    }}
                                >
                                    To Edit go to relevent city
                                </a>
                            </div>
                        </Popup>
                    )}
                </Polygon>
            );
        }

        return null;
    });
}

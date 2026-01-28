import { Marker, Popup, useMap } from 'react-leaflet';
import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import dynamic from 'next/dynamic';

const MarkerClusterGroup = dynamic(() => import('react-leaflet-cluster'), {
    ssr: false,
});

function createBikeIcon(size) {
    return new L.Icon({
        iconUrl: '/scooter.png',
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
    });
}

function createClusterCustomIcon(cluster) {
    const count = cluster.getChildCount();
    const size = count < 10 ? 30 : count < 50 ? 40 : 50;

    return L.divIcon({
        html: `<div style="
      background: rgba(25, 118, 210, 0.8);
      color: white;
      border-radius: 50%;
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      border: 2px solid white;
    ">${count}</div>`,
        className: '',
        iconSize: L.point(size, size, true),
    });
}

export default function BikesLayer({ bikes }) {
    const map = useMap();
    const [zoom, setZoom] = useState(map.getZoom());

    useEffect(() => {
        const onZoom = () => setZoom(map.getZoom());
        map.on('zoomend', onZoom);
        return () => map.off('zoomend', onZoom);
    }, [map]);

    const bikeIcon = useMemo(() => createBikeIcon(20), [20]);

    return (
        <MarkerClusterGroup
            chunkedLoading
            disableClusteringAtZoom={14}
            showCoverageOnHover={false}
            iconCreateFunction={createClusterCustomIcon}
        >
            {bikes.map((bike) => (
                <Marker
                    key={bike._id}
                    position={[bike.lat, bike.lon]}
                    icon={bikeIcon}
                >
                    <Popup>
                        <b>{bike.name}</b>
                        <br />
                        Status: {bike.status}
                        <br />
                        <a
                            href={`/admin-dashboard/bikes/single?bikeId=${bike.bikeId}`}
                            style={{
                                color: '#1976d2',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                            }}
                        >
                            More details
                        </a>
                    </Popup>
                </Marker>
            ))}
        </MarkerClusterGroup>
    );
}

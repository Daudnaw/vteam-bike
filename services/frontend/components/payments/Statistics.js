'use client';

import { useEffect, useState } from 'react';
import StatCard from '../webb/dashboards/shared/StatCard';

const BASE_URL = 'http://localhost:3000';

export default function NetVolumeCard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const res = await fetch(
                    `${BASE_URL}/api/payments/stats/net-volume`
                );
                const json = await res.json();
                setData(json);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    if (loading) {
        return (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <StatCard nr='…' text='Net volume (loading)' />
                <StatCard nr='…' text='Total purchases (loading)' />
            </div>
        );
    }

    if (!data) return null;

    const totalNet = data.days.reduce((sum, d) => sum + d.net, 0);
    const totalPurchases = data.days.reduce((sum, d) => sum + d.count, 0);

    const formattedNet = new Intl.NumberFormat('sv-SE', {
        style: 'currency',
        currency: 'SEK',
    }).format(totalNet);

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <StatCard
                nr={formattedNet}
                text='Nettovolym (senaste 30 dagarna)'
            />

            <StatCard
                nr={totalPurchases}
                text='Antal hyrda cyklar (senaste 30 dagarna)'
            />
        </div>
    );
}

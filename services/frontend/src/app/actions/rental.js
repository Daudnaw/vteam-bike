'use server';
import { cookies } from 'next/headers';

export async function rentBike(bikeId) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(`http://backend:3000/api/v1/rentals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scooter: bikeId }),
        cache: 'no-store',
    });

    if (res.ok) {
        return res.json();
    }

    throw new Error(res.err || 'Renting bike failed!');
}

export async function getAllRentalUser(id) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(`http://backend:3000/api/v1/rentals/user/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
    });

    if (res.ok) {
        return res.json();
    }

    throw new Error(res.err || 'Fetching rentals failed!');
}

export async function getSingleRental(id) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(`http://backend:3000/api/v1/rentals/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
    });

    if (res.ok) {
        return res.json();
    }

    throw new Error(res.err || 'Fetching rental failed!');
}

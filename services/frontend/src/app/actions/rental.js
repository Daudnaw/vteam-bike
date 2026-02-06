'use server';
import { cookies } from 'next/headers';

/**
 * Rent new bike
 * @param {*} bikeId
 * @returns
 */
export async function rentBike(bikeId) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(`${process.env.API_URL_INTERNAL}/api/v1/rentals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scooter: bikeId }),
        cache: 'no-store',
    });

    if (res.status == 201) {
        return await res.json();
    }

    if (res.status == 402) {
        return { message: 'För lite krediter på kontot!' };
    }

    const resError = await res.json();

    throw new Error(resError.error || 'Renting bike failed!');
}

/**
 * End active rental
 * @param {*} rentalId
 * @returns
 */
export async function endRental(rentalId) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(
        `${process.env.API_URL_INTERNAL}/api/v1/rentals/${rentalId}/end`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (res.ok) {
        return await res.json();
    }

    const resError = await res.json();

    throw new Error(resError.error || 'Deleting rental failed!');
}

/**
 * Get all rentals from a user
 * @param {*} id
 * @returns
 */
export async function getAllRentalUser(id) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(
        `${process.env.API_URL_INTERNAL}/api/v1/rentals/user/${id}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        }
    );

    if (res.status == 404) {
        return [];
    }

    if (res.ok) {
        return res.json();
    }

    throw new Error(res.err || 'Fetching rentals failed!');
}

/**
 * Get a single rental
 * @param {*} id
 * @returns
 */
export async function getSingleRental(id) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(
        `${process.env.API_URL_INTERNAL}/api/v1/rentals/${id}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        }
    );

    if (res.ok) {
        return res.json();
    }

    throw new Error(res.err || 'Fetching rental failed!');
}

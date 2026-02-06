'use server';
import { cookies } from 'next/headers';
import { refresh } from 'next/cache';

/**
 * Get all bikes.
 * @returns
 */
export async function getBikes() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(`${process.env.API_URL_INTERNAL}/api/v1/scooter`, {
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

    throw new Error(res.err || 'Fetching bikes failed!');
}

/**
 * Delete a bike.
 * @param {*} bike
 * @returns
 */
export async function deleteBike(bike) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(
        `${process.env.API_URL_INTERNAL}/api/v1/scooter/${bike._id}`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (res.ok) {
        refresh();
        return res.json();
    }

    throw new Error(res.err || 'Deleting bike failed!');
}

/**
 * Stop a bike.
 * @param {*} bike
 * @returns
 */
export async function stopBike(bike) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    bike.status = 'offline';

    const res = await fetch(
        `${process.env.API_URL_INTERNAL}/api/v1/scooter/${bike._id}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                bike,
            }),
            cache: 'no-store',
        }
    );

    if (res.ok) {
        refresh();
        return res.json();
    }

    throw new Error(res.err || 'Updating bike failed!');
}

/**
 * Lock a bike.
 * @param {*} bike
 * @returns
 */
export async function lockBike(bike) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    bike.status = 'locked';

    const res = await fetch(
        `${process.env.API_URL_INTERNAL}/api/v1/scooter/${bike._id}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                bike,
            }),
            cache: 'no-store',
        }
    );

    if (res.ok) {
        refresh();
        return res.json();
    }

    throw new Error(res.err || 'Lock bike failed!');
}

/**
 * Maintain a bike.
 * @param {*} bike
 * @returns
 */
export async function maintainBike(bike) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    bike.status = 'maintenance';

    const res = await fetch(
        `${process.env.API_URL_INTERNAL}/api/v1/scooter/${bike._id}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                bike,
            }),
            cache: 'no-store',
        }
    );

    if (res.ok) {
        refresh();
        return res.json();
    }

    throw new Error(res.err || 'Maintance bike failed!');
}

/**
 * Set a bike to ready.
 * @param {*} bike
 * @returns
 */
export async function readyBike(bike) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    bike.status = 'available';

    const res = await fetch(
        `${process.env.API_URL_INTERNAL}/api/v1/scooter/${bike._id}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                bike,
            }),
            cache: 'no-store',
        }
    );

    if (res.ok) {
        refresh();
        return res.json();
    }

    throw new Error(res.err || 'Ready bike failed!');
}

/**
 * Add a new bike.
 * @param {*} form
 * @returns
 */
export async function addBike(form) {
    const formObject = Object.fromEntries(form.entries());

    const { bikeStatus, batteryLevel, lat, lon } = formObject;

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(`${process.env.API_URL_INTERNAL}/api/v1/scooter`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            battery: parseInt(batteryLevel),
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            status: bikeStatus,
        }),
        cache: 'no-store',
    });

    if (res.ok) {
        return { success: true };
    }

    throw new Error(res.err || 'Add bike failed');
}

/**
 * Update a bike.
 * @param {*} id
 * @param {*} form
 * @returns
 */
export async function updateBike(id, form) {
    console.log(`update ${form} `);
    return { success: true };
}

/**
 * Get a single bike.
 * @param {*} bikeId
 * @returns
 */
export async function getSingelBike(bikeId) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(
        `${process.env.API_URL_INTERNAL}/api/v1/scooter/${bikeId}`,
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

    throw new Error(res.err || 'Fetching bike failed!');
}

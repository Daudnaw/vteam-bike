'use server';
import { cookies } from 'next/headers';

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

    const res = await fetch(`http://backend:3000/api/v1/scooter`, {
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
 * @param {*} bikeId
 * @returns
 */
export async function deleteBike(bikeId) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(`http://backend:3000/api/v1/scooter/${bikeId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (res.ok) {
        return res.json();
    }

    throw new Error(res.err || 'Deleting bike failed!');
}

/**
 * Stop a bike.
 * @param {*} bikeId
 * @returns
 */
export async function stopBike(bikeId) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(`http://backend:3000/api/v1/scooter/${bikeId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (res.ok) {
        return res.json();
    }

    throw new Error(res.err || 'Updating bike failed!');
}

/**
 * Lock a bike.
 * @param {*} bikeId
 * @returns
 */
export async function lockBike(bikeId) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(`http://backend:3000/api/v1/scooter/${bikeId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (res.ok) {
        return res.json();
    }

    throw new Error(res.err || 'Lock bike failed!');
}

/**
 * Maintain a bike.
 * @param {*} bikeId
 * @returns
 */
export async function maintainBike(bikeId) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(`http://backend:3000/api/v1/scooter/${bikeId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (res.ok) {
        return res.json();
    }

    throw new Error(res.err || 'Maintance bike failed!');
}

/**
 * Set a bike to ready.
 * @param {*} bikeId
 * @returns
 */
export async function readyBike(bikeId) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(`http://backend:3000/api/v1/scooter/${bikeId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (res.ok) {
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

    const res = await fetch(`http://backend:3000/api/v1/scooter`, {
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

    const res = await fetch(`http://backend:3000/api/v1/scooter/${bikeId}`, {
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

    throw new Error(res.err || 'Fetching bike failed!');
}

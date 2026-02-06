'use server';
//import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Get all users.
 * @returns
 */
export async function getAllUsers() {
    const res = await fetch(`${process.env.API_URL_INTERNAL}/api/v1/users`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch users (${res.status})`);
    }

    return res.json();
}

/**
 * Delete a user.
 * @param {*} userId
 * @returns
 */
export async function deleteUser(userId) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(
        `${process.env.API_URL_INTERNAL}/api/v1/users/${userId}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        }
    );

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete user');
    }

    return res.json();
}

/**
 * Update a user.
 * @param {*} userId
 * @param {*} data
 * @returns
 */
export async function updateUser(userId, data) {
    const { firstName, lastName, email, role } = data;

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Not authenticated');
    }
    //dubbelkolla om pull är gjort och om url är korrekt
    const res = await fetch(
        `${process.env.API_URL_INTERNAL}/api/admin/users/${userId}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ firstName, lastName, email, role }),
            cache: 'no-store',
        }
    );

    const responseData = await res.json();

    if (!res.ok) {
        throw new Error(responseData.error || 'Update failed');
    }

    return { ok: true, data: responseData };
}

/**
 * Create a new user
 * @param {*} formData
 * @returns
 */
export async function createUser(formData) {
    console.log('Dummy updateUser', formData);
    return { success: true };
}

/**
 * Get a single user
 * @param {*} id
 * @returns
 */
export async function getSingleUser(id) {
    const res = await fetch(
        `${process.env.API_URL_INTERNAL}/api/v1/users/${id}`,
        {
            cache: 'no-store',
        }
    );

    if (!res.ok) {
        throw new Error(`Failed to fetch user with id: ${id}`);
    }

    return res.json();
}

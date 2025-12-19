'use server';
//import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function getAllUsers() {
  const res = await fetch('http://backend:3000/api/v1/users', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch users (${res.status})`);
  }

  return res.json();
}

export async function deleteUser(userId) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(
    `http://backend:3000/api/v1/users/${userId}`,
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

export async function updateUser(userId, data) {

  const { firstName, lastName, email, role } = data;

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`http://backend:3000/api/v1/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ firstName, lastName, email, role }),
    cache: 'no-store',
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.error || 'Update failed');
  }

  return { ok: true, data: responseData };
}


export async function createUser(formData) {
  console.log("Dummy updateUser", formData);
  return { success: true };
}

'use server';
import { cookies } from 'next/headers';

export async function getAllCities() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(
    `http://backend:3000/api/v1/zones/zonetype/city`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch cities (${res.status})`);
  }

  return res.json();
}

export async function deleteZone(zoneId) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`http://backend:3000/api/v1/zones/${zoneId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to delete zone (${res.status})`);
  }

  return res.json();
}

export async function createZone(formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch('http://backend:3000/api/v1/zones', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to create zone');
  }

  return res.json();;
}

export async function getSingelZone(zoneId) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(
    `http://backend:3000/api/v1/zones/${zoneId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch the zone (${res.status})`);
  }

  return res.json();
}

export async function getAllZones() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(
    `http://backend:3000/api/v1/zones`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch zones (${res.status})`);
  }

  return res.json();
}

export async function updateZone(zoneId, formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`http://backend:3000/api/v1/zones/${zoneId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to update the zone (${res.status})`);
  }

  return res.json();
}

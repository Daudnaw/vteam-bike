import 'server-only';
import { cookies as nextCookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

export async function getSession() {
    const cookieStore = await nextCookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        if (!decoded?.sub) return null;

        const baseUrl = process.env.API_URL_INTERNAL || 'http://backend:3000';
        const res = await fetch(`${baseUrl}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data.user;
    } catch {
        return null;
    }
}

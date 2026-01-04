import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

export async function getSession() {
    const cookieStore = await cookies();

    const token = cookieStore.get('token');

    if (!token) {
        return null;
    }

    try {
        const decodedToken = jwtDecode(token.value);

        return decodedToken;
    } catch {
        return null;
    }
}

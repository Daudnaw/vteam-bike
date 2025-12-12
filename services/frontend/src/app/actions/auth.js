'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signin(formData) {
    console.log(formData);

    let email = formData.get('email');

    let password = formData.get('password');

    const res = await fetch('http://backend:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message);
    }

    const cookieStore = await cookies();

    cookieStore.set('token', data.token, { httpOnly: true });

    redirect('/dashboard');
}

export async function signout() {
    const cookieStore = await cookies();

    cookieStore.delete('token');

    redirect('/auth/login');
}

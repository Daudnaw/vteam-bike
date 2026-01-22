'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signin(formData) {
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

    cookieStore.set('token', data.token, { httpOnly: true, path: '/' });

    return {
        ok: true,
        role: data.user.role,
        message: 'Inloggningen lyckades!',
    };
}

export async function signinapp(formData) {
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

    cookieStore.set('token', data.token, { httpOnly: true, path: '/' });

    return {
        ok: true,
        message: 'Inloggningen lyckades!',
    };
}

export async function signoutapp() {
    const cookieStore = await cookies();

    cookieStore.delete('token');

    redirect('/app/auth/login');
}

export async function signout() {
    const cookieStore = await cookies();

    cookieStore.delete('token');

    redirect('/webb/auth/login');
}
export async function register(formData) {
    let firstName = formData.get('firstName');
    let lastName = formData.get('lastName');
    let email = formData.get('email');
    let password = formData.get('password');

    const res = await fetch('http://backend:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message);
    }

    const cookieStore = await cookies();

    cookieStore.set('token', data.token, { httpOnly: true, path: '/' });

    return {
        ok: true,
        message: 'Registreringen lyckades!',
    };
}

export async function registerapp(formData) {
    let firstName = formData.get('firstName');
    let lastName = formData.get('lastName');
    let email = formData.get('email');
    let password = formData.get('password');

    const res = await fetch('http://backend:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message);
    }

    const cookieStore = await cookies();

    cookieStore.set('token', data.token, { httpOnly: true, path: '/' });

    return {
        ok: true,
        message: 'Registreringen lyckades!',
    };
}

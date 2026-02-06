'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Sign in webb.
 * @param {*} formData
 * @returns
 */
export async function signin(formData) {
    let email = formData.get('email');

    let password = formData.get('password');

    const res = await fetch(`${process.env.API_URL_INTERNAL}/api/auth/login`, {
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

/**
 * Sign in app.
 * @param {*} formData
 * @returns
 */
export async function signinapp(formData) {
    let email = formData.get('email');

    let password = formData.get('password');

    const res = await fetch(`${process.env.API_URL_INTERNAL}/api/auth/login`, {
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

/**
 * Signout app.
 */
export async function signoutapp() {
    const cookieStore = await cookies();

    cookieStore.delete('token');

    redirect('/app/auth/login');
}

/**
 * Signout webb.
 */
export async function signout() {
    const cookieStore = await cookies();

    cookieStore.delete('token');

    redirect('/webb/auth/login');
}

/**
 * Register new user.
 * @param {*} formData
 * @returns
 */
export async function register(formData) {
    let firstName = formData.get('firstName');
    let lastName = formData.get('lastName');
    let email = formData.get('email');
    let password = formData.get('password');

    const res = await fetch(
        `${process.env.API_URL_INTERNAL}/api/auth/register`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password }),
        }
    );

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

/**
 * Register in app.
 * @param {*} formData
 * @returns
 */
export async function registerapp(formData) {
    let firstName = formData.get('firstName');
    let lastName = formData.get('lastName');
    let email = formData.get('email');
    let password = formData.get('password');

    const res = await fetch(
        `${process.env.API_URL_INTERNAL}/api/auth/register`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password }),
        }
    );

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

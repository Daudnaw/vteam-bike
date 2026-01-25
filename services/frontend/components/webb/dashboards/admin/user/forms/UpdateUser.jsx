'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
    getAllUsers,
    updateUser,
} from '../../../../../../src/app/actions/user';

export default function UpdateUser({ userId }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'customer',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getAllUsers()
            .then((users) => {
                const u = users.find((x) => x._id === userId);
                if (!u) throw new Error('User not found');

                setUser(u);
                setForm({
                    firstName: u.firstName || '',
                    lastName: u.lastName || '',
                    email: u.email || '',
                    role: u.role || 'customer',
                });
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [userId]);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            const res = await updateUser(userId, form);

            if (res.ok) {
                toast.success('User updated successfully', { autoClose: 1500 });
            }

            setTimeout(() => router.back(), 1500);
        } catch (err) {
            setError(err);
        }
        setLoading(false);
    }

    if (loading) return <p>Loading user...</p>;
    if (error) return <p className='mt-2 text-detail-red'>{error}</p>;

    return (
        <div className='w-md mx-auto border border-detail-yellow rounded-md p-6 shadow-xl from-slate-600 to-slate-800 bg-linear-to-br'>
            <h2 className='text-3xl text-white mb-6 text-center'>
                Uppdatera användare
            </h2>

            <form onSubmit={handleSubmit}>
                <input
                    className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                    type='text'
                    placeholder='Förnamn...'
                    value={form.firstName}
                    onChange={(e) =>
                        setForm((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                        }))
                    }
                />

                <input
                    className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                    type='text'
                    placeholder='Efternamn...'
                    value={form.lastName}
                    onChange={(e) =>
                        setForm((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                        }))
                    }
                />

                <input
                    className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                    type='email'
                    placeholder='Email...'
                    value={form.email}
                    onChange={(e) =>
                        setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                />

                <select
                    className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                    value={form.role}
                    onChange={(e) =>
                        setForm((prev) => ({ ...prev, role: e.target.value }))
                    }
                >
                    <option value='customer'>Användare</option>
                    <option value='admin'>Admin</option>
                </select>

                <button
                    type='submit'
                    className='bg-detail-yellow text-black rounded-md w-full text-h4 text-center mt-5 py-2 hover:opacity-90 cursor-pointer'
                >
                    Uppdatera information
                </button>
            </form>
        </div>
    );
}

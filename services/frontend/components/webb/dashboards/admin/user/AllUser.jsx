'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { User, Mail, Trash2, Edit3, Plus } from 'lucide-react';
import { getAllUsers, deleteUser } from '../../../../../src/app/actions/user';

/**
 * All users in a table.
 * @returns
 */
export default function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getAllUsers()
            .then(setUsers)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    async function handleDelete(userId) {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await deleteUser(userId);
            toast.success('Deleted successfully', { autoClose: 1500 });

            setUsers((prev) => prev.filter((u) => u._id !== userId));
        } catch (err) {
            toast.error(err.message || 'Failed to delete user');
        }
    }

    if (loading) return <p>Loading users...</p>;
    if (error) return <p>Error: {error}</p>;

    const admins = users.filter((u) => u.role === 'admin');
    const customers = users.filter((u) => u.role === 'customer');

    const renderTable = (title, data, showActions) => (
        <div className='mb-10'>
            <div className='flex justify-between items-center'>
                <h2 className='text-3xl text-black mb-4 '>{title}</h2>
                {title != 'Admin' && (
                    <div className='flex justify-between items-center mb-4'>
                        <Link
                            href='/admin-dashboard/customers/create'
                            className='flex items-center gap-2 bg-detail-yellow text-black px-4 py-2 rounded hover:bg-yellow-600 transition'
                        >
                            <Plus size={18} />
                            Skapa nytt konto
                        </Link>
                    </div>
                )}
            </div>
            <div className='overflow-hidden rounded-md border border-detail-yellow shadow-2xl'>
                <table className='w-full border-collapse divide-detail-yellow from-slate-600 to-slate-800 bg-linear-to-br text-white p-5'>
                    <thead className='bg-slate-900'>
                        <tr>
                            <th className='border border-detail-yellow text-2xl py-2 text-center'>
                                <div className='flex gap-2 justify-center items-center'>
                                    <User className='text-detail-yellow' />{' '}
                                    First name
                                </div>
                            </th>
                            <th className='border border-detail-yellow text-2xl py-2 text-center'>
                                <div className='flex gap-2 justify-center items-center'>
                                    <User className='text-detail-yellow' /> Last
                                    name
                                </div>
                            </th>
                            <th className='border border-detail-yellow text-2xl py-2 text-center'>
                                <div className='flex gap-2 justify-center items-center'>
                                    <Mail className='text-detail-yellow' />{' '}
                                    Email
                                </div>
                            </th>
                            {showActions && (
                                <th className='border border-detail-yellow text-2xl py-2 text-center'>
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody className='divide-detail-yellow'>
                        {data.map((user) => (
                            <tr key={user._id}>
                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    {user.firstName}
                                </td>
                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    {user.lastName}
                                </td>
                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    {user.email}
                                </td>
                                {showActions && (
                                    <td className='border border-detail-yellow px-2 py-2 text-center flex gap-2 justify-center items-center'>
                                        <Link
                                            href={`/admin-dashboard/customers/update?userId=${user._id}`}
                                            className='flex gap-1 items-center text-blue-400 hover:text-detail-yellow'
                                        >
                                            <Edit3 size={18} /> Edit
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDelete(user._id)
                                            }
                                            className='flex gap-1 items-center text-red-400 hover:text-detail-yellow'
                                        >
                                            <Trash2 size={18} /> Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <>
            {renderTable('Admin', admins, false)}

            {renderTable('Användares konton', customers, true)}
        </>
    );
}

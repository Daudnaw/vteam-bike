import React from 'react';
import { Calendar, Ruler, Timer, Activity, DollarSign } from 'lucide-react';
import Link from 'next/link';

const bills = [
    {
        id: 1,
        month: 'Augusti',
        amount: 800,
        min_traveld: 430,
        km_traveld: 210,
        status: 'Betald',
    },
    {
        id: 2,
        month: 'September',
        amount: 900,
        min_traveld: 430,
        km_traveld: 210,
        status: 'Skickad',
    },
    {
        id: 3,
        month: 'Oktober',
        amount: 1000,
        min_traveld: 430,
        km_traveld: 210,
        status: 'Väntar',
    },
];

/**
 * Bill table.
 * @returns
 */
export default function BillTable() {
    return (
        <div className='overflow-hidden rounded-md border border-detail-yellow shadow-2xl'>
            <table className='w-full border-collapse divide-detail-yellow from-slate-600 to-slate-800 bg-linear-to-br text-white p-5'>
                <thead className='bg-slate-900'>
                    <tr className=''>
                        <th className='border border-detail-yellow text-2xl py-2 text-white text-center'>
                            <div className='flex gap-2 w-full items-center justify-center'>
                                <Calendar className='text-detail-yellow' />
                                Månad
                            </div>
                        </th>
                        <th className='border border-detail-yellow text-2xl py-2 text-white text-center'>
                            <div className='flex gap-2 w-full items-center justify-center'>
                                <DollarSign className='text-detail-yellow' />
                                Kostnad (kr)
                            </div>
                        </th>
                        <th className='border border-detail-yellow text-2xl py-2 text-white text-center'>
                            <div className='flex gap-2 w-full items-center justify-center'>
                                <Timer className='text-detail-yellow' /> Tid
                                (min)
                            </div>
                        </th>
                        <th className='border border-detail-yellow text-2xl py-2 text-white text-center'>
                            <div className='flex gap-2 w-full items-center justify-center'>
                                <Ruler className='text-detail-yellow' /> Längd
                                (km)
                            </div>
                        </th>
                        <th className='border border-detail-yellow text-2xl py-2 text-white text-center'>
                            <div className='flex gap-2 w-full items-center justify-center'>
                                <Activity className='text-detail-yellow' />{' '}
                                Status
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody className='divide-detail-yellow'>
                    {bills.map((bill) => {
                        return (
                            <tr key={bill.id}>
                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    {bill.month}
                                </td>
                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    {bill.amount}
                                </td>
                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    {bill.min_traveld}
                                </td>
                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    {bill.km_traveld}
                                </td>
                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    <Link
                                        href='/user-dashboard'
                                        className='underline underline-offset-4 hover:decoration-detail-yellow'
                                    >
                                        Se mer
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

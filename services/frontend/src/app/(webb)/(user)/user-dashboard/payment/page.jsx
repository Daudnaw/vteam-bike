import React from 'react';
import BillTable from '../../../../../../components/webb/dashboards/shared/BillTable';
import StatCard from '../../../../../../components/webb/dashboards/shared/StatCard';

export default function Page() {
    return (
        <div className='p-5'>
            <h2 className='text-h2 mb-5 font-bold'>Översikt Betalning</h2>
            <div className='grid grid-cols-3 gap-5'>
                <StatCard nr={0} text='Totala Fakturor' />
                <StatCard nr={0} text='Betalda Fakturor' />
                <StatCard nr={0} text='Obetalda Fakturor' />
            </div>

            <h2 className='text-h3 mt-10 font-bold mb-5'>Alla Fakturor</h2>
            <BillTable />
        </div>
    );
}

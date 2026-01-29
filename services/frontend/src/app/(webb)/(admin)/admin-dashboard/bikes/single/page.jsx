'use client';

import { useSearchParams } from 'next/navigation';
import SingleBike from '../../../../../../../components/webb/dashboards/admin/bikes/SingleBike';

export default function Page() {
    const searchParams = useSearchParams();
    const bikeId = searchParams.get('bikeId');

    if (!bikeId) {
        return <p>Loading bike...</p>;
    }

    return (
        <div className='mt-5 mx-5'>
            <SingleBike bikeId={bikeId} />
        </div>
    );
}

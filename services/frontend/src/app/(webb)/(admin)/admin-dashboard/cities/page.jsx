import React from 'react';
import Link from 'next/link';

export default function Page() {
    return <div>cities
        <Link
                        href='/webb/admin-dashboard/cities'
                        className='underline hover:decoration-detail-yellow'
                    >
                        add city
                    </Link>
    </div>;
}

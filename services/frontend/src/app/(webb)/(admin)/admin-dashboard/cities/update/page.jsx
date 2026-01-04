'use client';

import { useSearchParams } from 'next/navigation';
import UpdateCity from '../../../../../../../components/webb/dashboards/admin/city/update/page';
import ZonesList from '../../../../../../../components/webb/dashboards/admin/zone/AllZone';

export default function Page() {
  const searchParams = useSearchParams();
  const cityId = searchParams.get('cityId');

  return (
      <section>
        <UpdateCity cityId={cityId} />
        <ZonesList />
      </section>
    );
}

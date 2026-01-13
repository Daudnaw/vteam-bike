'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import CreateNewZone from '../../../../../../../components/webb/dashboards/admin/zone/create/page';

export default function Page() {
  const searchParams = useSearchParams();
  const cityId = searchParams.get('cityId');

  return (
    <section>
      <CreateNewZone cityId={cityId} />
    </section>
  );
}

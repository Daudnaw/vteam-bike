'use client';

import { useSearchParams } from 'next/navigation';
import UpdateBike from '../../../../../../../components/webb/dashboards/admin/bikes/forms/UpdateBike';

export default function Page() {
  const searchParams = useSearchParams();
  const bikeId = searchParams.get('bikeId');

  return <UpdateBike bikeId={bikeId} />;
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit3, Plus } from 'lucide-react';
import { getSingelZone } from '../../../../../../src/app/actions/zones';

export default function UpdateCity({ cityId }) {
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cityId) return;

    getSingelZone(cityId)
      .then(setCity)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [cityId]);

  if (loading) return <p>Loading city...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!city) return <p>City not found</p>;

  return (
    <div className="p-6 bg-white rounded-md shadow">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        Welcome to {city.name}

        <Link
          href={`/admin-dashboard/zones/update?cityId=${cityId}`}
          className="p-2 rounded border border-slate-300 hover:bg-slate-100"
          title="Edit city"
        >
        <Edit3 size={18} />
        </Link>
      </h2>
      <div className="flex justify-between items-center mb-4">

        <Link
          href={`/admin-dashboard/zones/create?cityId=${cityId}`}
          className="flex items-center gap-2 bg-detail-yellow text-black px-4 py-2 rounded hover:bg-yellow-600 transition"
        >
          <Plus size={18} />
          Create New zone
        </Link>
      </div>
    </div>
  );
}

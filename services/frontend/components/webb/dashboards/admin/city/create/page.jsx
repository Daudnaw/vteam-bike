'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { createZone } from '../../../../../../src/app/actions/zones';

export default function CreateCity() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleAction(formData) {
    try {
      setLoading(true);
      setError(null);

      const name = formData.get('name');
      const areaText = formData.get('area');

      const area = areaText
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
          const [lat, lng] = line.split(',').map(Number);
          if (Number.isNaN(lat) || Number.isNaN(lng)) {
            throw new Error('Invalid coordinate format');
          }
          return [lat, lng];
        });

      await createZone({
        name,
        type: 'polygon',
        zoneType: 'city',
        active: true,
        area,
      });

      toast.success('City created successfully', { autoClose: 1500 });

      setTimeout(() => {
        router.push('/admin-dashboard/cities');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create city');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-md mx-auto border border-detail-yellow rounded-md p-6 shadow-xl bg-white">
      <h2 className="text-3xl text-black mb-6 text-center">
        Create City
      </h2>

      <form action={handleAction}>
        <input
          name="name"
          placeholder="City name..."
          required
          className="w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black"
        />

        <input
          value="polygon"
          readOnly
          className="w-full bg-slate-100 p-2 rounded-md text-xl mt-3 h-14 border border-gray-300 text-gray-500"
        />

        <input
          value="city"
          readOnly
          className="w-full bg-slate-100 p-2 rounded-md text-xl mt-3 h-14 border border-gray-300 text-gray-500"
        />

        <input
          value="active"
          readOnly
          className="w-full bg-slate-100 p-2 rounded-md text-xl mt-3 h-14 border border-gray-300 text-gray-500"
        />

        <textarea
          name="area"
          required
          placeholder={`One coordinate per line\nlat,lng`}
          rows={6}
          className="w-full bg-slate-200 p-2 rounded-md text-lg mt-3 border-detail border-2 text-black"
        />

        {error && (
          <p className="mt-2 text-detail-red">{error}</p>
        )}

        <button
          type="submit"
          className="bg-detail-yellow text-black rounded-md w-full text-h4 text-center mt-5 py-2 hover:opacity-90"
        >
          {loading ? 'Creating city...' : 'Create city'}
        </button>
      </form>
    </div>
  );
}

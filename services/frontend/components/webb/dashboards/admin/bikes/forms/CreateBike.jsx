'use client';

import { useState } from 'react';
import { addBike } from '../../../../../../src/app/actions/bikes';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function CreateBike() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  async function handleAction(formData) {
    try {
      setLoading(true);
      setError(null);

      formData.append('speed', 0);
      formData.append('rideLogs', null);
      formData.append('needsCharge', false);
      formData.append('currentCustomer', null);

      const res = await addBike(formData);

      if (res.ok) {
        toast.success('Bike created successfully', { autoClose: 1500 });
      }

      setTimeout(() => {
          router.push('/admin-dashboard/bikes');
        }, 1500);

    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-md mx-auto border border-detail-yellow rounded-md p-6 shadow-xl bg-white">
      <h2 className="text-3xl text-black mb-6 text-center">
        Create New Bike
      </h2>

      <form action={handleAction}>
        <input
          className="w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black"
          required
          placeholder="BikeId"
          name="bikeId"
          type="text"
        />

        <select
          name="status"
          required
          className="w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black"
        >
          <option value="">Select status</option>
          <option value="available">Available</option>
          <option value="in_use">In use</option>
          <option value="maintenance">Maintenance</option>
        </select>

        <input
          className="w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black"
          required
          placeholder="Battery level (%)"
          name="batteryLevel"
          type="number"
          min="0"
          max="100"
        />

        <input
          className="w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black"
          required
          placeholder="Latitude"
          name="lat"
          type="number"
          step="any"
        />

        <input
          className="w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black"
          required
          placeholder="Longitude"
          name="lng"
          type="number"
          step="any"
        />

        <input
          className="w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black"
          required
          placeholder="City"
          name="city"
          type="text"
        />

        {error && (
          <p className="mt-2 text-detail-red">
            {error.message}
          </p>
        )}

        <button
          type="submit"
          className="bg-detail-yellow text-black rounded-md w-full text-h4 text-center mt-5 py-2 hover:opacity-90 cursor-pointer"
        >
          {loading ? 'Creating bike...' : 'Create bike'}
        </button>
      </form>
    </div>
  );
}

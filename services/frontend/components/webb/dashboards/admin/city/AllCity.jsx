'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { MoreVertical, Trash2, Plus } from 'lucide-react';
import { getAllCities, deleteZone } from '../../../../../src/app/actions/zones';

export default function CitiesList() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllCities()
      .then(setCities)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(zoneId) {
      if (!confirm('Are you sure you want to delete this city?')) return;
  
      try {
        await deleteZone(zoneId);
         toast.success('Deleted successfully', { autoClose: 1500 });
      
        setCities((prev) => prev.filter((u) => u._id !== zoneId));
      } catch (err) {
        toast.error(err.message || 'Failed to delete city');
      }
    }

  if (loading) return <p>Loading cities...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="mb-10">
      <h2 className="text-3xl text-black mb-4 text-center">Cities</h2>
      <div className="overflow-hidden rounded-md border border-detail-yellow shadow-2xl">
        <table className="w-full border-collapse divide-detail-yellow from-slate-600 to-slate-800 bg-linear-to-br text-white p-5">
          <thead className="bg-slate-900">
            <tr>
              <th className="border border-detail-yellow text-2xl py-2 text-center">City Name</th>
              <th className="border border-detail-yellow text-2xl py-2 text-center">Type</th>
              <th className="border border-detail-yellow text-2xl py-2 text-center">Zonetype</th>
              <th className="border border-detail-yellow text-2xl py-2 text-center">Active</th>
              <th className="border border-detail-yellow text-2xl py-2 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-detail-yellow">
            {cities.map((city) => (
              <tr key={city._id}>
                <td className="border border-detail-yellow px-2 py-2 text-center">{city.name}</td>
                <td className="border border-detail-yellow px-2 py-2 text-center">{city.type}</td>
                <td className="border border-detail-yellow px-2 py-2 text-center">{city.zoneType}</td>
                <td className="border border-detail-yellow px-2 py-2 text-center">
                  {city.active ? 'Yes' : 'No'}
                </td>
                  <td className="border border-detail-yellow px-2 py-2 text-center flex gap-2 justify-center items-center">
                    <Link
                      href={`/admin-dashboard/cities/update?cityId=${city._id}`}
                      className="flex gap-1 items-center text-blue-400 hover:text-detail-yellow"
                    >
                      <MoreVertical size={18} /> More
                    </Link>
                    <button
                      onClick={() => handleDelete(city._id)}
                      className="flex gap-1 items-center text-red-400 hover:text-detail-yellow"
                    >
                      <Trash2 size={18} /> Delete
                    </button>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Link
          href="/admin-dashboard/cities/create"
          className="flex items-center gap-2 bg-detail-yellow text-black px-4 py-2 rounded hover:bg-yellow-600 transition"
        >
          <Plus size={18} />
          Create New city
        </Link>
      </div>
    </div>
  );
}

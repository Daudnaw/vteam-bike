'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getAllCities } from '../../../../../src/app/actions/zones'; // should fetch zones of type "custom"

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
              <th className="border border-detail-yellow text-2xl py-2 text-center">Center / Area</th>
              <th className="border border-detail-yellow text-2xl py-2 text-center">Radius</th>
              <th className="border border-detail-yellow text-2xl py-2 text-center">Active</th>
            </tr>
          </thead>

          <tbody className="divide-detail-yellow">
            {cities.map((city) => (
              <tr key={city._id}>
                <td className="border border-detail-yellow px-2 py-2 text-center">{city.name}</td>
                <td className="border border-detail-yellow px-2 py-2 text-center">{city.type}</td>
                <td className="border border-detail-yellow px-2 py-2 text-center">
                  {city.type === 'circle' ? `[${city.center.join(', ')}]` : JSON.stringify(city.area)}
                </td>
                <td className="border border-detail-yellow px-2 py-2 text-center">
                  {city.type === 'circle' ? city.radius : '-'}
                </td>
                <td className="border border-detail-yellow px-2 py-2 text-center">
                  {city.active ? 'Yes' : 'No'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

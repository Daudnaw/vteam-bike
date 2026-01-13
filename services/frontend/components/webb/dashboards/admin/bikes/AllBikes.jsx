import React from "react";
import { Bike, MapPin, Activity, Wrench, Plus } from "lucide-react";
import Link from "next/link";
import { getBikes } from '../../../../../src/app/actions/bikes';

const statusConfig = {
  available: { label: "Tillgänglig", color: "text-green-400" },
  in_use: { label: "Används", color: "text-yellow-400" },
  in_service: { label: "Service", color: "text-red-400" },
};

export default async function BikeTable() {
  const bikes = await getBikes();

  return (
    <div>
    <div className="overflow-hidden rounded-md border border-detail-yellow shadow-2xl">
      <table className="w-full border-collapse divide-detail-yellow from-slate-600 to-slate-800 bg-linear-to-br text-white">
        <thead className="bg-slate-900">
          <tr>
            <th className="border border-detail-yellow text-2xl py-2 text-center">
              <div className="flex gap-2 items-center justify-center">
                <Bike className="text-detail-yellow" />
                Cykel
              </div>
            </th>
            <th className="border border-detail-yellow text-2xl py-2 text-center">
              <div className="flex gap-2 items-center justify-center">
                <Activity className="text-detail-yellow" />
                Status
              </div>
            </th>
            <th className="border border-detail-yellow text-2xl py-2 text-center">
              <div className="flex gap-2 items-center justify-center">
                <MapPin className="text-detail-yellow" />
                Plats
              </div>
            </th>
            <th className="border border-detail-yellow text-2xl py-2 text-center">
              <div className="flex gap-2 items-center justify-center">
                <Wrench className="text-detail-yellow" />
                Åtgärder
              </div>
            </th>
          </tr>
        </thead>

        <tbody className="divide-detail-yellow">
          {bikes.map((bike) => {
            const status = statusConfig[bike.status] || {
              label: "Okänd",
              color: "text-gray-400",
            };

            return (
              <tr key={bike.bikeId}>
                <td className="border border-detail-yellow px-2 py-2 text-center">
                  {bike.bikeId}
                </td>

                <td className="border border-detail-yellow px-2 py-2 text-center">
                  <span className={`font-semibold ${status.color}`}>
                    ● {status.label}
                  </span>
                </td>

                <td className="border border-detail-yellow px-2 py-2 text-center">
                  {bike.position}
                </td>

                <td className="border border-detail-yellow px-2 py-2 text-center">
                  <Link
                    href={`/admin-dashboard/bikes/single?bikeId=${bike.bikeId}`}
                    className="underline underline-offset-4 hover:decoration-detail-yellow"
                  >
                    Hantera
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <div className="flex justify-between items-center mb-4">
        <Link
          href="/admin-dashboard/bikes/create"
          className="flex items-center gap-2 bg-detail-yellow text-black px-4 py-2 rounded hover:bg-yellow-600 transition"
        >
          <Plus size={18} />
          Add Bike
        </Link>
      </div>
    </div>
  );
}

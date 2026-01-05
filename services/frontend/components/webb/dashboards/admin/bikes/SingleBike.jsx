'use client';

import { toast } from 'react-toastify';
import { Trash2, Lock, PauseCircle, Wrench } from 'lucide-react';
import {
  deleteBike,
  stopBike,
  lockBike,
  maintainBike,
  readyBike
} from '../../../../../src/app/actions/bikes';


export default function SingleBike({ bikeId }) {
  // Dummy
  const bike = {
    bikeId: "STOCKHOLM-004",
    status: "available", // Tsta att byta "maintenance", "locked", or "riding"
    speed: 0,
    batteryLevel: 90,
    position: "Accepterad",
    rideLogs: [],
    needsCharge: false,
    currentCustomer: null,
    city: "Stockholm",
  };

  const actionRules = {
  available: {
    stop: false,
    lock: true,
    maintain: true,
    delete: true,
    ready: false,
  },
  locked: {
    stop: false,
    lock: false,
    maintain: true,
    delete: true,
    ready: false,
  },
  riding: {
    stop: true,
    lock: false,
    maintain: false,
    delete: false,
    ready: false,
  },
  in_service: {
    stop: false,
    lock: false,
    maintain: false,
    delete: true,
    ready: true,
  },
};


  const canDo = (status, action) => actionRules[status]?.[action] ?? false;

  const handleAction = async (actionFn, actionName, actionKey) => {
    if (!canDo(bike.status, actionKey)) {
      toast.info('Åtgärden är inte tillåten just nu');
      return;
    }

    await actionFn(bike.bikeId);
    toast.success(actionName);
  };

  return (
    <div className="overflow-hidden rounded-md border border-detail-yellow shadow-2xl">
      <table className="w-full border-collapse divide-detail-yellow from-slate-600 to-slate-800 bg-linear-to-br text-white">
        <thead className="bg-slate-900">
          <tr>
            <th className="border border-detail-yellow text-2xl py-2 text-center">Cykel</th>
            <th className="border border-detail-yellow text-2xl py-2 text-center">Status</th>
            <th className="border border-detail-yellow text-2xl py-2 text-center">Plats</th>
            <th className="border border-detail-yellow text-2xl py-2 text-center">Åtgärder</th>
          </tr>
        </thead>

        <tbody className="divide-detail-yellow">
          <tr>
            <td className="border border-detail-yellow px-2 py-4 text-center">{bike.bikeId}</td>

            <td className="border border-detail-yellow px-2 py-4 text-center">
              <span
                className={`font-semibold ${
                  bike.status === 'available'
                    ? 'text-green-400'
                    : bike.status === 'locked'
                    ? 'text-yellow-400'
                    : bike.status === 'maintenance'
                    ? 'text-orange-400'
                    : 'text-gray-400'
                }`}
              >
                ● {bike.status.charAt(0).toUpperCase() + bike.status.slice(1)}
              </span>
            </td>

            <td className="border border-detail-yellow px-2 py-4 text-center">{bike.position}</td>

            <td className="border border-detail-yellow px-2 py-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <button
                  disabled={!canDo(bike.status, 'stop')}
                  onClick={() =>
                    handleAction(stopBike, 'Cykeln stoppad', 'stop')
                  }
                  className={`h-10 w-10 rounded-full border border-detail-yellow
                    flex items-center justify-center transition
                    ${
                      canDo(bike.status, 'stop')
                        ? 'hover:bg-detail-yellow hover:text-black'
                        : 'opacity-40 cursor-not-allowed'
                    }`}
                  title={
                    canDo(bike.status, 'stop')
                      ? 'Stoppa'
                      : 'Cykeln är redan stoppad'
                  }
                >
                  <PauseCircle size={18} />
                </button>

                <button
                  disabled={!canDo(bike.status, 'lock')}
                  onClick={() =>
                    handleAction(lockBike, 'Cykeln låst', 'lock')
                  }
                  className={`h-10 w-10 rounded-full border border-detail-yellow
                    flex items-center justify-center transition
                    ${
                      canDo(bike.status, 'lock')
                        ? 'hover:bg-detail-yellow hover:text-black'
                        : 'opacity-40 cursor-not-allowed'
                    }`}
                  title={
                    canDo(bike.status, 'lock') ? 'Lås' : 'Cykeln är redan låst'
                  }
                >
                  <Lock size={18} />
                </button>

                <button
                  disabled={!canDo(bike.status, 'maintain')}
                  onClick={() =>
                    handleAction(
                      maintainBike,
                      'Cykeln satt i service',
                      'maintain'
                    )
                  }
                  className={`h-10 w-10 rounded-full border border-detail-yellow
                    flex items-center justify-center transition
                    ${
                      canDo(bike.status, 'maintain')
                        ? 'hover:bg-detail-yellow hover:text-black'
                        : 'opacity-40 cursor-not-allowed'
                    }`}
                  title={
                    canDo(bike.status, 'maintain')
                      ? 'Service'
                      : 'Cykeln är redan i service'
                  }
                >
                  <Wrench size={18} />
                </button>

                <button
                  disabled={!canDo(bike.status, 'delete')}
                  onClick={() =>
                    handleAction(deleteBike, 'Cykeln borttagen', 'delete')
                  }
                  className={`h-10 w-10 rounded-full border border-red-500 text-red-400
                    flex items-center justify-center transition
                    ${
                      canDo(bike.status, 'delete')
                        ? 'hover:bg-red-500 hover:text-black'
                        : 'opacity-40 cursor-not-allowed'
                    }`}
                  title={
                    canDo(bike.status, 'delete')
                      ? 'Ta bort'
                      : 'Kan inte ta bort cykeln nu'
                  }
                >
                  <Trash2 size={18} />
                </button>

                <button
                  disabled={!canDo(bike.status, 'ready')}
                  onClick={() =>
                    handleAction(
                      readyBike,
                      'Cykeln är nu tillgänglig',
                      'ready'
                    )
                  }
                  className={`h-10 w-10 rounded-full border border-green-500 text-green-400
                    flex items-center justify-center transition
                    ${
                      canDo(bike.status, 'ready')
                        ? 'hover:bg-green-500 hover:text-black'
                        : 'opacity-40 cursor-not-allowed'
                    }`}
                  title={
                    canDo(bike.status, 'ready')
                      ? 'Gör tillgänglig'
                      : 'Kan inte göras tillgänglig'
                  }
              >
                ✓
              </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

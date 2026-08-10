import Badge from "../common/Badge";

export default function BusTable({ buses }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-[780px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-jaatra-gray">
            <tr>
              <th className="px-4 py-3">Bus</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Seats</th>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {buses.map((bus) => (
              <tr key={bus.id} className="text-jaatra-ink">
                <td className="px-4 py-3">
                  <div className="font-bold">{bus.name}</div>
                  <div className="text-xs text-jaatra-gray">{bus.id} / {bus.number}</div>
                </td>
                <td className="px-4 py-3">{bus.type}</td>
                <td className="px-4 py-3">{bus.route}</td>
                <td className="px-4 py-3">{bus.departureTime}</td>
                <td className="px-4 py-3">{bus.availableSeats}/{bus.capacity}</td>
                <td className="px-4 py-3">{bus.assignedDriver}</td>
                <td className="px-4 py-3"><Badge>{bus.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

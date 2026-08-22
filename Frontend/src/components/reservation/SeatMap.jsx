import { Armchair, BusFront, DoorOpen } from "lucide-react";

const rows = Array.from({ length: 11 }, (_, index) => index + 1);
const columns = ["A", "B", "C", "D"];

function seatState(seat, selectedSeat, reservedSeats, unavailableSeats) {
  if (selectedSeat === seat) return "Selected";
  if (reservedSeats.includes(seat)) return "Reserved";
  if (unavailableSeats.includes(seat)) return "Unavailable";
  return "Available";
}

const styles = {
  Available: "bg-white text-safar-ink ring-slate-200 hover:bg-safar-mint hover:text-safar-navy hover:ring-safar-teal/40",
  Selected: "seat-selected bg-safar-teal text-white ring-safar-teal",
  Reserved: "cursor-not-allowed bg-slate-200 text-slate-400 ring-slate-200",
  Unavailable: "cursor-not-allowed bg-red-50 text-red-300 ring-red-100",
};

export default function SeatMap({ selectedSeat, reservedSeats = [], unavailableSeats = [], onSelectSeat }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-safar-ink">Seat Layout</h2>
          <p className="mt-1 text-sm text-safar-gray">Choose one available seat for this exact trip.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-safar-gray">
          <BusFront className="h-4 w-4 text-safar-teal" />
          Front
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-3">
        <div className="mb-4 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm font-semibold text-safar-gray ring-1 ring-slate-200">
          <span>Driver</span>
          <DoorOpen className="h-5 w-5 text-safar-amber" aria-label="Emergency exit" />
        </div>

        <div className="mx-auto max-w-sm space-y-2">
          {rows.map((row) => (
            <div key={row} className="grid grid-cols-[1fr_1fr_24px_1fr_1fr] gap-2">
              {columns.map((column, columnIndex) => {
                const seat = `${row}${column}`;
                const state = seatState(seat, selectedSeat, reservedSeats, unavailableSeats);
                const disabled = state === "Reserved" || state === "Unavailable";
                const button = (
                  <button
                    key={seat}
                    type="button"
                    className={`focus-ring flex min-h-11 items-center justify-center gap-1 rounded-lg text-sm font-bold ring-1 transition ${styles[state]}`}
                    disabled={disabled}
                    onClick={() => onSelectSeat(seat)}
                    aria-label={`${seat}, ${state}`}
                    aria-pressed={state === "Selected"}
                  >
                    <Armchair className="h-4 w-4" />
                    {seat}
                  </button>
                );

                if (columnIndex === 2) {
                  return [
                    <div key={`${row}-aisle`} className="grid place-items-center text-xs font-bold text-slate-300">|</div>,
                    button,
                  ];
                }

                return button;
              })}
            </div>
          ))}
        </div>

        <div className="mt-5 text-center text-xs font-bold uppercase tracking-wide text-safar-gray">Back</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-safar-gray sm:grid-cols-4">
        {Object.keys(styles).map((state) => (
          <div key={state} className="flex items-center gap-2">
            <span className={`h-4 w-4 rounded ring-1 ${styles[state].split(" ").slice(0, 3).join(" ")}`} />
            {state}
          </div>
        ))}
      </div>
    </div>
  );
}

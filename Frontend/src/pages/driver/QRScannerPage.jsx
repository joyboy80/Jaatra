import { CheckCircle2, QrCode, ScanLine, UserCheck, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getCurrentTrip, verifyTicket } from "../../services/driverService";

export default function QRScannerPage() {
  const [trip, setTrip] = useState(null);
  const [ticketId, setTicketId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getCurrentTrip().then(setTrip);
  }, []);

  async function scan(event) {
    event.preventDefault();
    if (!ticketId.trim() || !trip) return;
    setLoading(true);

    try {
      const verified = await verifyTicket(ticketId, trip.id);
      setResult({ valid: true, ticket: verified });
    } catch (error) {
      setResult({ valid: false, message: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Ticket Verification"
          title="QR scanner"
          description="Verify a ticket against the active bus, trip, date, departure time, and previous scans."
          actions={trip && <Badge tone="success">{trip.busName} | {trip.departureTime}</Badge>}
        />

        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl bg-jaatra-ink p-5 text-white shadow-sm">
            <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl border border-white/20 bg-black/20">
              <div className="absolute inset-8 border-2 border-white/70">
                <span className="absolute -left-0.5 -top-0.5 h-8 w-8 border-l-4 border-t-4 border-jaatra-mint" />
                <span className="absolute -right-0.5 -top-0.5 h-8 w-8 border-r-4 border-t-4 border-jaatra-mint" />
                <span className="absolute -bottom-0.5 -left-0.5 h-8 w-8 border-b-4 border-l-4 border-jaatra-mint" />
                <span className="absolute -bottom-0.5 -right-0.5 h-8 w-8 border-b-4 border-r-4 border-jaatra-mint" />
              </div>
              <div className="text-center">
                <ScanLine className="mx-auto h-12 w-12 text-jaatra-mint" />
                <p className="mt-3 text-sm font-semibold">Mock camera scanner</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-300">Enter the identifier encoded in a Jaatra ticket QR code.</p>
            <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={scan}>
              <label className="sr-only" htmlFor="ticket-id">Ticket ID</label>
              <input
                id="ticket-id"
                className="focus-ring h-12 min-w-0 flex-1 rounded-xl border border-white/20 bg-white px-4 text-sm font-semibold uppercase text-jaatra-ink"
                placeholder="TKT-DEMO-1004"
                value={ticketId}
                onChange={(event) => setTicketId(event.target.value)}
              />
              <Button className="h-12" icon={QrCode} loading={loading} type="submit">Verify Ticket</Button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {["TKT-DEMO-1004", "TKT-DEMO-1005", "TKT-DEMO-1008"].map((id) => (
                <button key={id} className="focus-ring rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20" onClick={() => setTicketId(id)} type="button">
                  {id}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            {!result && (
              <div className="grid min-h-72 place-items-center text-center">
                <div>
                  <QrCode className="mx-auto h-12 w-12 text-slate-300" />
                  <h2 className="mt-4 text-lg font-bold text-jaatra-ink">Ready to verify</h2>
                  <p className="mt-2 text-sm text-jaatra-gray">Scan or enter a ticket identifier to view the result.</p>
                </div>
              </div>
            )}

            {result?.valid && (
              <div>
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                <h2 className="mt-4 text-2xl font-bold text-jaatra-ink">Ticket Verified</h2>
                <p className="mt-1 text-sm font-semibold text-emerald-700">Passenger marked as boarded.</p>
                <dl className="mt-6 divide-y divide-slate-100 text-sm">
                  {[
                    ["Passenger", result.ticket.passengerName],
                    ["Bus", result.ticket.busName],
                    ["Seat", result.ticket.seatNumber],
                    ["Trip", `${result.ticket.departureTime} - ${result.ticket.route}`],
                    ["Status", "Boarded"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-4 py-3">
                      <dt className="font-medium text-jaatra-gray">{label}</dt>
                      <dd className="text-right font-bold text-jaatra-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
                <Button className="mt-5 w-full" icon={UserCheck} onClick={() => { setResult(null); setTicketId(""); }}>Scan Next Passenger</Button>
              </div>
            )}

            {result && !result.valid && (
              <div className="grid min-h-72 place-items-center text-center">
                <div>
                  <XCircle className="mx-auto h-12 w-12 text-red-600" />
                  <h2 className="mt-4 text-2xl font-bold text-jaatra-ink">Invalid Ticket</h2>
                  <p className="mt-2 text-sm font-semibold text-red-700">{result.message}</p>
                  <Button className="mt-5" variant="secondary" onClick={() => setResult(null)}>Try Another Ticket</Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

import { CheckCircle2, QrCode, ScanLine, UserCheck, XCircle, Camera, Pause, Play, Image as ImageIcon, Video, VideoOff } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getCurrentTrip, verifyTicket } from "../../services/driverService";
import useScanner from "../../hooks/useScanner";

export default function QRScannerPage() {
  const [trip, setTrip] = useState(null);
  const [ticketId, setTicketId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const parseTicketId = (payload) => {
    // Look for TKT- followed by 12 hex characters
    const match = payload.match(/TKT-[A-F0-9]{12}/i);
    return match ? match[0].toUpperCase() : null;
  };

  const processScan = async (scannedText) => {
    if (!trip) return;
    scanner.pause(); // Pause camera on successful detection
    
    const parsedId = parseTicketId(scannedText);
    if (!parsedId) {
      setResult({ valid: false, message: `Invalid QR Code format. Content: ${scannedText}` });
      return;
    }
    
    setTicketId(parsedId);
    setLoading(true);
    try {
      const verified = await verifyTicket(parsedId, trip.id);
      setResult({ valid: true, ticket: verified });
    } catch (error) {
      setResult({ valid: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const scanner = useScanner({ onScan: processScan });

  useEffect(() => {
    getCurrentTrip().then(setTrip);
  }, []);

  async function scan(event) {
    event.preventDefault();
    if (!ticketId.trim() || !trip) return;
    setLoading(true);

    // Intelligently parse the manually entered text
    let parsedId = parseTicketId(ticketId);
    if (!parsedId) {
      // If they didn't paste a URL but just typed the raw string, format it
      let rawText = ticketId.trim().toUpperCase();
      // Remove any URL paths or spaces they might have accidentally included
      rawText = rawText.split('/').pop().trim();
      parsedId = rawText.startsWith('TKT-') ? rawText : `TKT-${rawText}`;
    }

    try {
      const verified = await verifyTicket(parsedId, trip.id);
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
          <div className="rounded-2xl bg-safar-ink p-5 text-white shadow-sm">
            <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl border border-white/20 bg-black/20">
              {scanner.hasPermission ? (
                <>
                  <video 
                    ref={scanner.videoRef} 
                    className={`absolute inset-0 h-full w-full object-cover ${scanner.isPaused ? 'opacity-50 blur-sm' : ''}`}
                    muted
                  />
                  <canvas ref={scanner.canvasRef} className="hidden" />
                </>
              ) : null}

              <div className="absolute inset-8 border-2 border-white/70 pointer-events-none">
                <span className="absolute -left-0.5 -top-0.5 h-8 w-8 border-l-4 border-t-4 border-safar-mint" />
                <span className="absolute -right-0.5 -top-0.5 h-8 w-8 border-r-4 border-t-4 border-safar-mint" />
                <span className="absolute -bottom-0.5 -left-0.5 h-8 w-8 border-b-4 border-l-4 border-safar-mint" />
                <span className="absolute -bottom-0.5 -right-0.5 h-8 w-8 border-b-4 border-r-4 border-safar-mint" />
              </div>
              
              {!scanner.hasPermission && !scanner.error && (
                <div className="text-center z-10">
                  <ScanLine className="mx-auto h-12 w-12 text-safar-mint" />
                  <p className="mt-3 text-sm font-semibold">Click Start to enable camera</p>
                </div>
              )}

              {scanner.error && (
                <div className="text-center z-10 px-4">
                  <VideoOff className="mx-auto h-12 w-12 text-red-400" />
                  <p className="mt-3 text-sm font-semibold text-red-200">{scanner.error}</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {!scanner.isScanning ? (
                <Button 
                  className="flex-1" 
                  variant="secondary" 
                  icon={Camera} 
                  onClick={() => scanner.start()}
                >
                  Start Camera
                </Button>
              ) : (
                <>
                  <Button 
                    className="flex-1" 
                    variant="secondary" 
                    icon={scanner.isPaused ? Play : Pause} 
                    onClick={scanner.isPaused ? scanner.resume : scanner.pause}
                  >
                    {scanner.isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  {scanner.devices.length > 1 && (
                    <select 
                      className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-safar-mint"
                      value={scanner.activeDeviceId || ''}
                      onChange={(e) => scanner.switchCamera(e.target.value)}
                    >
                      {scanner.devices.map((d, i) => (
                        <option key={d.deviceId} value={d.deviceId} className="text-black">
                          {d.label || `Camera ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  )}
                  <Button 
                    variant="secondary" 
                    icon={VideoOff} 
                    onClick={scanner.stop}
                    title="Stop Camera"
                  />
                </>
              )}
              
              <Button 
                variant="secondary" 
                icon={ImageIcon} 
                onClick={() => fileInputRef.current?.click()}
                title="Upload Image"
              />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={(e) => {
                  if (e.target.files?.[0]) scanner.scanImage(e.target.files[0]);
                  e.target.value = '';
                }} 
              />
            </div>

            <p className="mt-6 text-sm text-slate-300">Or manually enter the Safar ticket identifier.</p>
            <form className="mt-3 flex flex-col gap-3 sm:flex-row" onSubmit={scan}>
              <label className="sr-only" htmlFor="ticket-id">Ticket ID</label>
              <input
                id="ticket-id"
                className="focus-ring h-12 min-w-0 flex-1 rounded-xl border border-white/20 bg-white px-4 text-sm font-semibold uppercase text-safar-ink"
                placeholder="Enter ticket ID"
                value={ticketId}
                onChange={(event) => setTicketId(event.target.value.toUpperCase())}
              />
              <Button className="h-12" icon={QrCode} loading={loading} type="submit">Verify Ticket</Button>
            </form>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            {!result && (
              <div className="grid min-h-72 place-items-center text-center">
                <div>
                  <QrCode className="mx-auto h-12 w-12 text-slate-300" />
                  <h2 className="mt-4 text-lg font-bold text-safar-ink">Ready to verify</h2>
                  <p className="mt-2 text-sm text-safar-gray">Scan or enter a ticket identifier to view the result.</p>
                </div>
              </div>
            )}

            {result?.valid && (
              <div>
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                <h2 className="mt-4 text-2xl font-bold text-safar-ink">Ticket Verified</h2>
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
                      <dt className="font-medium text-safar-gray">{label}</dt>
                      <dd className="text-right font-bold text-safar-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
                <Button className="mt-5 w-full" icon={UserCheck} onClick={() => { 
                  setResult(null); 
                  setTicketId(""); 
                  scanner.resume(); 
                }}>Scan Next Passenger</Button>
              </div>
            )}

            {result && !result.valid && (
              <div className="grid min-h-72 place-items-center text-center">
                <div>
                  <XCircle className="mx-auto h-12 w-12 text-red-600" />
                  <h2 className="mt-4 text-2xl font-bold text-safar-ink">Invalid Ticket</h2>
                  <p className="mt-2 text-sm font-semibold text-red-700">{result.message}</p>
                  <Button className="mt-5" variant="secondary" onClick={() => { 
                    setResult(null);
                    setTicketId("");
                    scanner.resume();
                  }}>Try Another Ticket</Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

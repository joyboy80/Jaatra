import { CheckCircle2, Clock, Ticket, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import SeatMap from "../../components/reservation/SeatMap";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { addDays, formatDisplayDate, toDateInputValue } from "../../utils/date";
import { createReservation, getReservedSeats } from "../../services/reservationService";
import { getUnavailableSeatsForCapacity } from "../../utils/seats";
import { getBusesByRole } from "../../services/busService";
import { getSchedules } from "../../services/scheduleService";
import Loading from "../../components/common/Loading";

export default function ReservationFlowPage({ role }) {
  const { user, setToast } = useAuth();
  const [searchParams] = useSearchParams();
  const [buses, setBuses] = useState([]);
  const [allTrips, setAllTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busId, setBusId] = useState(searchParams.get("busId") || "");
  const [date, setDate] = useState(toDateInputValue());
  const [tripId, setTripId] = useState("");
  const [selectedSeat, setSelectedSeat] = useState("");
  const [reservedSeats, setReservedSeats] = useState([]);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const selectedBus = buses.find((bus) => bus.id === busId);
  const trips = useMemo(() => allTrips.filter((trip) => trip.busId === busId), [allTrips, busId]);
  const selectedTrip = trips.find((trip) => trip.id === tripId) || trips[0];
  const unavailableSeats = useMemo(
    () => getUnavailableSeatsForCapacity(selectedBus?.capacity || 44),
    [selectedBus?.capacity]
  );

  useEffect(() => {
    Promise.all([getBusesByRole(role), getSchedules()]).then(([busData, tripData]) => {
      setBuses(busData);
      setAllTrips(tripData.filter((trip) => busData.some((bus) => bus.id === trip.busId)));
      setBusId((current) => current || busData[0]?.id || "");
    }).finally(() => setLoading(false));
  }, [role]);

  useEffect(() => {
    if (trips[0] && !trips.some((trip) => trip.id === tripId)) {
      setTripId(trips[0].id);
    }
  }, [tripId, trips]);

  useEffect(() => {
    if (!selectedTrip || !date) return;

    getReservedSeats(selectedTrip.id, date).then((seats) => {
      setReservedSeats(seats);
      if (seats.includes(selectedSeat) || unavailableSeats.includes(selectedSeat)) {
        setSelectedSeat("");
      }
    });
  }, [date, selectedSeat, selectedTrip]);

  if (loading) return <DashboardLayout><Loading label="Loading available trips" /></DashboardLayout>;

  if (!selectedBus) {
    return <Navigate to={`/${role}/today-buses`} replace />;
  }

  async function handleConfirm() {
    setError("");

    if (!selectedTrip || !selectedSeat) {
      setError("Select a trip and an available seat before confirming.");
      return;
    }

    setConfirming(true);
    try {
      const nextResult = await createReservation({
        user,
        role,
        tripId: selectedTrip.id,
        date,
        seatNumber: selectedSeat,
      });
      setResult(nextResult);
      setToast({ type: "success", message: "Reservation successful. Your digital ticket is ready." });
    } catch (reservationError) {
      setError(reservationError.message);
      setToast({ type: "error", message: reservationError.message });
    } finally {
      setConfirming(false);
    }
  }

  if (result) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Reservation Confirmed"
            title="Reservation Successful \u{1F389}"
            description="Your seat is confirmed and a digital ticket has been generated."
          />
          <section className="rounded-xl border-t-4 border-emerald-500 bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="font-semibold text-jaatra-gray">Booking ID</dt><dd className="mt-1 break-all text-jaatra-ink">{result.reservation.bookingId}</dd></div>
              <div><dt className="font-semibold text-jaatra-gray">Ticket ID</dt><dd className="mt-1 break-all text-jaatra-ink">{result.ticket.ticketId}</dd></div>
              <div><dt className="font-semibold text-jaatra-gray">Bus</dt><dd className="mt-1 text-jaatra-ink">{result.reservation.busName}</dd></div>
              <div><dt className="font-semibold text-jaatra-gray">Seat</dt><dd className="mt-1 text-jaatra-ink">{result.reservation.seatNumber}</dd></div>
            </dl>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <Link
                className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-jaatra-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-jaatra-navy"
                to={`/${role}/tickets/${result.ticket.ticketId}`}
              >
                <Ticket className="h-4 w-4" />
                View Ticket
              </Link>
              <Link
                className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-jaatra-ink shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                to={`/${role}/reservations`}
              >
                Reservation History
              </Link>
            </div>
          </section>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Seat Reservation"
          title="Reserve a seat"
          description="Select the exact bus trip, date, departure time, and seat before confirming."
        />

        <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-3 md:grid-cols-3">
            <Select
              label="Select Bus"
              value={busId}
              onChange={(event) => {
                setBusId(event.target.value);
                setSelectedSeat("");
              }}
            >
              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>{bus.name} / {bus.type}</option>
              ))}
            </Select>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-jaatra-ink">Select Date</span>
              <input
                className="focus-ring h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-jaatra-ink"
                type="date"
                min={toDateInputValue()}
                max={addDays(7)}
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setSelectedSeat("");
                }}
              />
            </label>
            <Select
              label="Select Departure Time"
              value={selectedTrip?.id || ""}
              onChange={(event) => {
                setTripId(event.target.value);
                setSelectedSeat("");
              }}
            >
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.departureTime} - {trip.arrivalTime} / {trip.route}
                </option>
              ))}
            </Select>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
          <SeatMap
            selectedSeat={selectedSeat}
            reservedSeats={reservedSeats}
            unavailableSeats={unavailableSeats}
            onSelectSeat={setSelectedSeat}
          />

          <div className="rounded-xl border-t-4 border-jaatra-teal bg-white p-5 shadow-sm ring-1 ring-slate-200 xl:sticky xl:top-24 xl:self-start">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-jaatra-ink">Reservation Summary</h2>
              <Badge tone={selectedSeat ? "success" : "warning"}>{selectedSeat || "No seat"}</Badge>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div><dt className="font-semibold text-jaatra-gray">Passenger</dt><dd className="mt-1 text-jaatra-ink">{user.name}</dd></div>
              <div><dt className="font-semibold text-jaatra-gray">University ID</dt><dd className="mt-1 text-jaatra-ink">{user.universityId || user.id}</dd></div>
              <div><dt className="font-semibold text-jaatra-gray">Bus</dt><dd className="mt-1 text-jaatra-ink">{selectedTrip?.busName}</dd></div>
              <div><dt className="font-semibold text-jaatra-gray">Bus Category</dt><dd className="mt-1 text-jaatra-ink">{selectedTrip?.busCategory}</dd></div>
              <div><dt className="font-semibold text-jaatra-gray">Route</dt><dd className="mt-1 text-jaatra-ink">{selectedTrip?.route}</dd></div>
              <div><dt className="font-semibold text-jaatra-gray">Date</dt><dd className="mt-1 text-jaatra-ink">{formatDisplayDate(date)}</dd></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-jaatra-teal" />{selectedTrip?.departureTime}</div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-jaatra-teal" />{selectedTrip?.arrivalTime}</div>
              </div>
            </dl>
            {error && (
              <div className="mt-4 flex gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-100">
                <XCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <Link
                className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-jaatra-ink shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                to={`/${role}/today-buses`}
              >
                Cancel
              </Link>
              <Button loading={confirming} disabled={!selectedSeat} onClick={handleConfirm}>
                Confirm Reservation
              </Button>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

import { QrCode } from "lucide-react";

export default function QRCode({ value }) {
  return (
    <div className="inline-flex min-h-40 w-40 flex-col items-center justify-center rounded-lg bg-white p-4 text-center ring-1 ring-slate-200" aria-label={`Ticket identifier ${value}`}>
      <QrCode className="h-10 w-10 text-safar-teal" />
      <p className="mt-3 break-all text-xs font-bold text-safar-ink">{value}</p>
      <p className="mt-2 text-[10px] font-medium text-safar-gray">QR image currently unavailable</p>
    </div>
  );
}

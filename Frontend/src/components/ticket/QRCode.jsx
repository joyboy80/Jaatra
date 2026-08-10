function hashString(value) {
  return value.split("").reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
}

export default function QRCode({ value }) {
  const size = 13;
  const seed = Math.abs(hashString(value));
  const cells = Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size);
    const column = index % size;
    const finder =
      (row < 4 && column < 4) ||
      (row < 4 && column > size - 5) ||
      (row > size - 5 && column < 4);

    if (finder) {
      return row === 0 || column === 0 || row === 3 || column === 3 || (row === 1 && column === 1) || (row === 2 && column === 2);
    }

    return ((seed + row * 17 + column * 31 + row * column) % 5) < 2;
  });

  return (
    <div className="qr-code-surface inline-grid rounded-lg p-3 ring-1 ring-slate-200" aria-label={`QR code for ticket ${value}`}>
      <div className="grid h-40 w-40 grid-cols-[repeat(13,minmax(0,1fr))] gap-0.5">
        {cells.map((filled, index) => (
          <span key={index} className={filled ? "qr-cell-on" : "qr-cell-off"} />
        ))}
      </div>
    </div>
  );
}

const rows = Array.from({ length: 11 }, (_, index) => index + 1);
const columns = ["A", "B", "C", "D"];

export function getSeatOrder() {
  return rows.flatMap((row) => columns.map((column) => `${row}${column}`));
}

export function getUnavailableSeatsForCapacity(capacity) {
  return getSeatOrder().slice(Math.max(0, capacity));
}

const BUS_ACCENTS = [
  "bus-violet", "bus-cyan", "bus-emerald", "bus-orange", "bus-rose", "bus-indigo",
  "bus-teal", "bus-amber", "bus-purple", "bus-blue", "bus-green",
];

export function getBusAccent(identity = "") {
  const index = [...String(identity)].reduce((sum, character) => sum + character.codePointAt(0), 0) % BUS_ACCENTS.length;
  return BUS_ACCENTS[index];
}

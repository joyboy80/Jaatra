const BUS_ACCENTS = {
  Surma: "bus-violet",
  Meghna: "bus-cyan",
  Padma: "bus-emerald",
  Jamuna: "bus-orange",
  Brahmaputra: "bus-rose",
  Karnaphuli: "bus-indigo",
  Teesta: "bus-teal",
  Madhumati: "bus-amber",
  Atrai: "bus-rose",
  Buriganga: "bus-purple",
  Shitalakshya: "bus-blue",
  Dhaleshwari: "bus-green",
  Rupsa: "bus-orange",
  Pasur: "bus-cyan",
  Sangu: "bus-violet",
  Halda: "bus-emerald",
  Gorai: "bus-rose",
  Kushiyara: "bus-indigo",
};

export function getBusAccent(busName) {
  return BUS_ACCENTS[busName] || "bus-violet";
}

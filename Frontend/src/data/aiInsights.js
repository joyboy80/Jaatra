export const occupancyPredictions = [
  { busId: "BUS-001", busName: "Surma", occupancy: 92, demand: "Very High", confidence: 94, recommendation: "Add a backup student bus for the 7:30 AM departure." },
  { busId: "BUS-003", busName: "Padma", occupancy: 75, demand: "High", confidence: 89, recommendation: "Keep the current allocation and monitor reservations." },
  { busId: "BUS-004", busName: "Jamuna", occupancy: 88, demand: "Very High", confidence: 91, recommendation: "Open five standby seats if vehicle policy allows." },
  { busId: "BUS-006", busName: "Karnaphuli", occupancy: 65, demand: "Moderate", confidence: 86, recommendation: "Current allocation is sufficient." },
  { busId: "BUS-009", busName: "Atrai", occupancy: 41, demand: "Low", confidence: 82, recommendation: "Review this bus for temporary peak-route reassignment." },
];

export const allocationRecommendations = [
  {
    id: "ALLOC-001",
    sourceRoute: "Campus Route B",
    sourceDemand: 40,
    targetRoute: "Campus Route A",
    targetDemand: 95,
    period: "7:30 AM peak",
    recommendation: "Consider moving one available bus from Campus Route B to Campus Route A during the 7:30 AM peak period.",
    confidence: 91,
  },
  {
    id: "ALLOC-002",
    sourceRoute: "Faculty Quarter Loop",
    sourceDemand: 38,
    targetRoute: "Main Campus - Medical Gate",
    targetDemand: 87,
    period: "4:30 PM peak",
    recommendation: "Keep one Faculty Quarter bus on standby for the Main Campus evening departure.",
    confidence: 84,
  },
];

export const smartInsightDefaults = [
  { label: "Peak demand time", value: "7:15 - 8:15 AM", detail: "Morning arrivals account for 34% of daily demand." },
  { label: "Most crowded bus", value: "Surma", detail: "Expected occupancy is 92%." },
  { label: "Most popular route", value: "Main Campus - Medical Gate", detail: "Highest combined booking and boarding volume." },
  { label: "Underutilized bus", value: "Atrai", detail: "Expected occupancy is 41%." },
  { label: "High cancellation route", value: "South Hall Loop", detail: "Cancellation rate is 9.2%." },
  { label: "High no-show route", value: "Faculty Quarter Loop", detail: "No-show rate is 7.1%." },
  { label: "Expected demand tomorrow", value: "+12%", detail: "Exam traffic is likely to increase morning demand." },
];

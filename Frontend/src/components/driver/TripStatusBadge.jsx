import Badge from "../common/Badge";

const tones = {
  Upcoming: "info",
  Boarding: "warning",
  "In Progress": "success",
  Completed: "neutral",
  Cancelled: "danger",
};

export default function TripStatusBadge({ status }) {
  return <Badge tone={tones[status] || "neutral"}>{status}</Badge>;
}

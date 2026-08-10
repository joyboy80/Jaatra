import Badge from "../common/Badge";

const tones = {
  "On Time": "success",
  Running: "info",
  Delayed: "danger",
  Maintenance: "warning",
  Offline: "neutral",
  Completed: "neutral",
};

export default function LiveStatusBadge({ status }) {
  return <Badge tone={tones[status] || "neutral"}>{status}</Badge>;
}

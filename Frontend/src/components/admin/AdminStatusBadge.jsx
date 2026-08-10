import Badge from "../common/Badge";

const success = ["Active", "Available", "Good", "Confirmed", "Boarded", "On Time", "Scheduled"];
const warning = ["Delayed", "Minor Issue", "Boarding", "Not Boarded", "Upcoming", "Off Duty"];
const danger = ["Cancelled", "Critical", "Critical Issue", "Under Maintenance", "Emergency", "Inactive"];
const info = ["In Progress", "On Trip", "En Route"];

export default function AdminStatusBadge({ status }) {
  let tone = "neutral";
  if (success.includes(status)) tone = "success";
  if (warning.includes(status)) tone = "warning";
  if (danger.includes(status)) tone = "danger";
  if (info.includes(status)) tone = "info";
  return <Badge tone={tone}>{status}</Badge>;
}

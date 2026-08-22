import { Construction } from "lucide-react";
import { useParams } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";

function toTitle(value = "module") {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function PlaceholderPage() {
  const { section } = useParams();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Safar Module"
          title={toTitle(section)}
          description="This protected module is reserved for the next implementation phase."
        />
        <div>
          <Construction className="h-8 w-8 text-safar-teal" />
          <div className="mt-4">
            <EmptyState title={`${toTitle(section)} is ready for Step 2`} message="Routing, layout, and role protection are already in place." />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

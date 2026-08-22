import { Globe2, Moon, Phone, User } from "lucide-react";
import Badge from "../../components/common/Badge";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/common/ThemeToggle";

export default function ProfilePage({ role }) {
  const { user } = useAuth();
  void role;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Profile"
          title="Account and preferences"
          description="Manage your Safar identity, communication details, and transport preferences."
        />

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col items-center text-center">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-safar-mint text-3xl font-bold text-safar-teal">
                {user.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
              </div>
              <h2 className="mt-4 text-xl font-bold text-safar-ink">{user.name}</h2>
              <p className="mt-1 text-sm text-safar-gray">{user.universityId || user.id}</p>
              <div className="mt-3"><Badge tone="info">{user.roleLabel}</Badge></div>
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-safar-teal" />
                <span className="text-safar-gray">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-safar-teal" />
                <span className="text-safar-gray">{user.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe2 className="h-4 w-4 text-safar-teal" />
                <span className="text-safar-gray">{user.universityId || user.id}</span>
              </div>
            </dl>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold text-safar-ink">Settings</h2>
            <div className="mt-4 divide-y divide-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-safar-sky">
                      <Moon className="h-5 w-5 text-safar-teal" />
                    </div>
                    <p className="font-semibold text-safar-ink">Theme</p>
                  </div>
                  <div className="w-full max-w-[230px]"><ThemeToggle /></div>
                </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

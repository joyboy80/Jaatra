import { Bell, Globe2, KeyRound, Languages, Lock, Moon, Phone, User } from "lucide-react";
import Badge from "../../components/common/Badge";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/common/ThemeToggle";

const profileDefaults = {
  student: { name: "Mahbubur Rahman", id: "STU-2026-0142", phone: "+880 1712 345678" },
  teacher: { name: "Dr. Nusrat Jahan", id: "FAC-2026-0031", phone: "+880 1812 345678" },
  staff: { name: "Imran Chowdhury", id: "STF-2026-0087", phone: "+880 1912 345678" },
  driver: { name: "Mizan Rahman", id: "DRV-2026-0019", phone: "+880 1711 445566" },
  admin: { name: "Transport Authority", id: "ADM-2026-0001", phone: "+880 1800 000001" },
};

const settings = [
  { label: "Notification settings", value: "Enabled", icon: Bell },
  { label: "Theme", value: "System", icon: Moon },
  { label: "Language", value: "English", icon: Languages },
  { label: "Privacy", value: "Campus only", icon: Lock },
  { label: "Change password", value: "Available", icon: KeyRound },
];

export default function ProfilePage({ role }) {
  const { user } = useAuth();
  const profile = profileDefaults[role];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Profile"
          title="Account and preferences"
          description="Manage your Jaatra identity, communication details, and transport preferences."
        />

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col items-center text-center">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-jaatra-mint text-3xl font-bold text-jaatra-teal">
                {profile.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
              </div>
              <h2 className="mt-4 text-xl font-bold text-jaatra-ink">{profile.name}</h2>
              <p className="mt-1 text-sm text-jaatra-gray">{user?.universityId || profile.id}</p>
              <div className="mt-3"><Badge tone="info">{user?.roleLabel}</Badge></div>
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-jaatra-teal" />
                <span className="text-jaatra-gray">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-jaatra-teal" />
                <span className="text-jaatra-gray">{profile.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe2 className="h-4 w-4 text-jaatra-teal" />
                <span className="text-jaatra-gray">{user?.universityId || profile.id}</span>
              </div>
            </dl>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold text-jaatra-ink">Settings</h2>
            <div className="mt-4 divide-y divide-slate-100">
              {settings.map((item) => (
                <div key={item.label} className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-jaatra-sky">
                      <item.icon className="h-5 w-5 text-jaatra-teal" />
                    </div>
                    <p className="font-semibold text-jaatra-ink">{item.label}</p>
                  </div>
                  {item.label === "Theme" ? <div className="w-full max-w-[230px]"><ThemeToggle /></div> : <span className="text-sm font-semibold text-jaatra-gray">{item.value}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

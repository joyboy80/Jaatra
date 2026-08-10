import { Bell, Languages, LockKeyhole, Mail, ShieldCheck, Smartphone } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "../../components/common/ThemeToggle";
import Toggle from "../../components/common/Toggle";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";

const defaultPreferences = { service: true, reservations: true, arrival: true, email: false, privacy: true };

export default function SettingsPage() {
  const { setToast } = useAuth();
  const [preferences, setPreferences] = useState(defaultPreferences);

  function update(key, value) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setToast({ type: "success", message: "Preference updated." });
  }

  const rows = [
    ["service", Bell, "Service alerts", "Delays, cancellations, and schedule changes"],
    ["reservations", Mail, "Reservation updates", "Ticket confirmations and cancellation status"],
    ["arrival", Smartphone, "Arrival reminders", "Receive an alert when your bus is approaching"],
    ["email", Languages, "Email summaries", "A daily digest of relevant transportation updates"],
    ["privacy", ShieldCheck, "Campus-only visibility", "Keep profile and travel activity within university services"],
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader eyebrow="Preferences" title="Settings" description="Control appearance, notifications, language, privacy, and account security." />
        <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold text-jaatra-ink">Appearance</h2>
            <p className="mt-1 text-sm leading-6 text-jaatra-gray">Choose a comfortable theme for every Jaatra portal.</p>
            <div className="mt-5"><ThemeToggle /></div>
            <div className="mt-6 rounded-lg bg-jaatra-mint p-4 ring-1 ring-jaatra-teal/10">
              <p className="text-sm font-bold text-jaatra-navy">Your role accent stays consistent</p>
              <p className="mt-1 text-xs leading-5 text-jaatra-gray">Light, dark, and system modes retain the visual identity of your workspace.</p>
            </div>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold text-jaatra-ink">Notifications and privacy</h2>
            <div className="mt-3 divide-y divide-slate-100">
              {rows.map(([key, Icon, title, description]) => (
                <div key={key} className="flex items-center gap-3 py-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-jaatra-mint"><Icon className="h-4 w-4 text-jaatra-teal" /></span>
                  <div className="min-w-0 flex-1"><p className="text-sm font-bold text-jaatra-ink">{title}</p><p className="mt-1 text-xs leading-5 text-jaatra-gray">{description}</p></div>
                  <Toggle label={title} checked={preferences[key]} onChange={(value) => update(key, value)} />
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-50"><LockKeyhole className="h-5 w-5 text-amber-600" /></span><div><h2 className="font-bold text-jaatra-ink">Password and account security</h2><p className="mt-1 text-sm leading-6 text-jaatra-gray">Password management will connect to the university identity provider when backend authentication is enabled.</p></div></div>
        </section>
      </div>
    </DashboardLayout>
  );
}

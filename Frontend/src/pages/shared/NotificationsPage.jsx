import { Bell, CheckCheck, CheckCircle2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { clearNotifications, markAllNotificationsRead, markNotificationRead, subscribeToNotifications } from "../../services/notificationService";

const notificationStyles = {
  success: "border-emerald-500 bg-emerald-50 text-emerald-700",
  warning: "border-amber-500 bg-amber-50 text-amber-700",
  danger: "border-rose-500 bg-red-50 text-red-700",
  info: "border-cyan-500 bg-sky-50 text-sky-700",
  neutral: "border-violet-500 bg-violet-50 text-violet-700",
};

export default function NotificationsPage({ role }) {
  const { user, setToast } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => subscribeToNotifications(
    { userId: user.id, role },
    (items) => { setNotifications(items); setError(""); },
    (requestError) => setError(requestError.message)
  ), [role, user.id]);

  const unreadCount = notifications.filter((notification) => notification.unread).length;

  async function markRead(id) {
    await markNotificationRead(user.id, role, id);
  }

  async function markAll() {
    await markAllNotificationsRead(user.id, role);
    setToast({ type: "success", message: "All notifications marked as read." });
  }

  async function clearAll() {
    await clearNotifications(user.id, role);
    setToast({ type: "info", message: "Notification center cleared." });
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Notification Center"
          title="Transport updates"
          description="Backend-provided reservation, arrival, delay, cancellation, seat, and schedule notifications."
          actions={<div className="flex flex-wrap gap-2"><Badge tone={unreadCount ? "warning" : "neutral"}>{unreadCount} unread</Badge><Button variant="secondary" icon={CheckCheck} disabled={!unreadCount} onClick={markAll}>Mark all read</Button><Button variant="ghost" icon={Trash2} disabled={!notifications.length} onClick={clearAll}>Clear</Button></div>}
        />

        {error && !notifications.length ? <ErrorState title="Notifications unavailable" message={error} /> : notifications.length ? (
          <section className="space-y-3" aria-live="polite">
            {notifications.map((notification) => (
              <article key={notification.id} className={`rounded-xl border-l-4 bg-white p-4 shadow-sm ring-1 transition ${notification.unread ? "ring-safar-teal/40" : "ring-slate-200"} ${(notificationStyles[notification.tone] || notificationStyles.info).split(" ")[0]}`}>
                <div className="flex gap-3">
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${notification.unread ? notificationStyles[notification.tone] || notificationStyles.info : "bg-slate-100 text-safar-gray"}`}><Bell className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-safar-ink">{notification.title}</h2>{notification.unread && <Badge tone="warning">Unread</Badge>}</div><p className="mt-2 text-sm leading-6 text-safar-gray">{notification.message}</p></div>
                      <span className="shrink-0 text-xs font-semibold text-safar-gray">{notification.time}</span>
                    </div>
                    {notification.unread && <button className="focus-ring mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold text-safar-teal hover:bg-safar-mint" onClick={() => markRead(notification.id)}><CheckCircle2 className="h-4 w-4" /> Mark as read</button>}
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : <EmptyState title="You're all caught up" message="New live transportation updates will appear here." />}
      </div>
    </DashboardLayout>
  );
}

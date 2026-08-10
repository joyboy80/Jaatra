import { Bell, Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../common/Badge";
import ThemeToggle from "../common/ThemeToggle";
import { subscribeToNotifications } from "../../services/notificationService";

export default function Navbar({ user, onMenu }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => subscribeToNotifications(
    { userId: user.id, role: user.role },
    (items) => setUnreadCount(items.filter((item) => item.unread).length)
  ), [user.id, user.role]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        <button className="focus-ring icon-button lg:hidden" onClick={onMenu} aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden min-w-0 flex-1 sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-jaatra-gray" />
          <input
            className="focus-ring h-10 w-full max-w-md rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-jaatra-ink transition hover:border-jaatra-teal/30"
            placeholder="Search buses, routes, tickets"
          />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Badge tone="info">{user.roleLabel}</Badge>
          <ThemeToggle compact />
          <Link className="focus-ring icon-button relative" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} to={`/${user.role}/notifications`}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-jaatra-red px-1 text-[10px] font-bold text-white ring-2 ring-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </Link>
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-jaatra-teal text-sm font-bold text-white shadow-glow" title={user.name}>
            {initials || "JU"}
          </div>
        </div>
      </div>
    </header>
  );
}

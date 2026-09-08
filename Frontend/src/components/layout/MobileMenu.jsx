import { X } from "lucide-react";
import { NavLink } from "react-router-dom";
import Logo from "../common/Logo";
import { getNavigationForRole } from "../../utils/navigation";

export default function MobileMenu({ open, user, onClose, onLogout }) {
  if (!open) return null;

  const items = getNavigationForRole(user.role);

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button className="absolute inset-0 bg-safar-ink/40 backdrop-blur-sm" onClick={onClose} aria-label="Close navigation overlay" />
      <aside className="relative h-full w-[88vw] max-w-sm overflow-y-auto border-r border-white/20 bg-white/70 backdrop-blur-3xl p-4 shadow-2xl dark:bg-slate-900/70 dark:border-slate-800/50">
        <div className="flex items-center justify-between">
          <Logo />
          <button className="focus-ring icon-button" onClick={onClose} aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-8 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.label}
              to={`/${user.role}/${item.path}`}
              onClick={onClose}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-300 ${
                  isActive ? "bg-gradient-to-r from-brand-maroon/10 to-brand-purple/10 text-brand-purple shadow-sm ring-1 ring-brand-purple/20 dark:from-pink-900/20 dark:to-purple-900/20 dark:text-pink-400" : "text-safar-gray hover:bg-slate-100/50 hover:text-safar-ink dark:hover:bg-slate-800/50 dark:hover:text-white"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <button
          className="focus-ring mt-5 w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
          onClick={onLogout}
        >
          Logout
        </button>
      </aside>
    </div>
  );
}

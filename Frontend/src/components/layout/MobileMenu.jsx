import { X } from "lucide-react";
import { NavLink } from "react-router-dom";
import Logo from "../common/Logo";
import { getNavigationForRole } from "../../utils/navigation";

export default function MobileMenu({ open, user, onClose, onLogout }) {
  if (!open) return null;

  const items = getNavigationForRole(user.role);

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button className="absolute inset-0 bg-safar-ink/40" onClick={onClose} aria-label="Close navigation overlay" />
      <aside className="relative h-full w-[88vw] max-w-sm overflow-y-auto border-r border-slate-200 bg-white p-4 shadow-soft">
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
                `focus-ring flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                  isActive ? "bg-safar-mint text-safar-navy shadow-sm" : "text-safar-gray hover:bg-slate-100 hover:text-safar-ink"
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

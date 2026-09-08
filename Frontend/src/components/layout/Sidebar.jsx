import { NavLink } from "react-router-dom";
import Logo from "../common/Logo";
import { getNavigationForRole } from "../../utils/navigation";

export default function Sidebar({ user, onLogout }) {
  const items = getNavigationForRole(user.role);

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-white/20 bg-white/70 backdrop-blur-3xl px-4 py-5 lg:sticky lg:top-0 lg:flex lg:flex-col dark:bg-slate-900/70 dark:border-slate-800/50">
      <div className="px-2"><Logo /></div>
      <div className="mt-6 rounded-2xl bg-white/50 p-4 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-md dark:bg-slate-800/50 dark:ring-slate-700/50">
        <p className="text-xs font-bold uppercase tracking-wider text-safar-teal">{user.roleLabel}</p>
        <p className="mt-1 truncate text-sm font-bold text-safar-ink">{user.name}</p>
      </div>
      <nav className="mt-8 flex-1 space-y-1 overflow-y-auto pr-1">
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={`/${user.role}/${item.path}`}
            className={({ isActive }) =>
              `focus-ring group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
                isActive ? "bg-gradient-to-r from-brand-maroon/10 to-brand-purple/10 text-brand-purple shadow-sm ring-1 ring-brand-purple/20 dark:from-pink-900/20 dark:to-purple-900/20 dark:text-pink-400" : "text-safar-gray hover:bg-slate-100/50 hover:text-safar-ink dark:hover:bg-slate-800/50 dark:hover:text-white"
              }`
            }
          >
            <item.icon className="h-4 w-4 transition group-hover:text-safar-teal" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <button
        className="focus-ring mt-4 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
        onClick={onLogout}
      >
        Logout
      </button>
    </aside>
  );
}

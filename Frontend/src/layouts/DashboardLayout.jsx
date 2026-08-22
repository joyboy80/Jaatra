import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/common/Modal";
import Toast from "../components/common/Toast";
import MobileMenu from "../components/layout/MobileMenu";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import FloatingAIChat from "../components/ai/FloatingAIChat";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  async function confirmLogout() {
    await logout();
    setLogoutOpen(false);
    navigate("/login", { replace: true });
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300" data-role={user.role}>
      {/* Abstract Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] top-0 h-[500px] w-[500px] rounded-full bg-brand-maroon/5 mix-blend-multiply blur-3xl dark:bg-pink-900/10 dark:mix-blend-lighten" />
        <div className="absolute -right-[10%] top-[10%] h-[600px] w-[600px] rounded-full bg-brand-cyan/5 mix-blend-multiply blur-3xl dark:bg-cyan-900/10 dark:mix-blend-lighten" />
        <div className="absolute left-[20%] top-[40%] h-[400px] w-[400px] rounded-full bg-brand-purple/5 mix-blend-multiply blur-3xl dark:bg-purple-900/10 dark:mix-blend-lighten" />
      </div>

      <div className="relative flex min-h-screen z-10">
        <Sidebar user={user} onLogout={() => setLogoutOpen(true)} />
        <MobileMenu
          open={mobileOpen}
          user={user}
          onClose={() => setMobileOpen(false)}
          onLogout={() => {
            setMobileOpen(false);
            setLogoutOpen(true);
          }}
        />
        <div className="min-w-0 flex-1">
          <Navbar user={user} onMenu={() => setMobileOpen(true)} />
          <main className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
      <Modal
        open={logoutOpen}
        title="Log out of Safar?"
        description="Your secure server session will be ended and you will return to the login screen."
        confirmLabel="Logout"
        danger
        onClose={() => setLogoutOpen(false)}
        onConfirm={confirmLogout}
      />
      <Toast />
      {["student", "teacher", "staff"].includes(user.role) && <FloatingAIChat />}
    </div>
  );
}

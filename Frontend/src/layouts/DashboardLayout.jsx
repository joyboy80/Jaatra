import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/common/Modal";
import Toast from "../components/common/Toast";
import { backendEnabled } from "../services/api";
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
    <div className="min-h-screen bg-slate-50" data-role={user.role}>
      <div className="flex min-h-screen">
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
        title="Log out of Jaatra?"
        description={backendEnabled ? "Your secure server session will be ended and you will return to the login screen." : "Your current mock session will be cleared and you will return to the login screen."}
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

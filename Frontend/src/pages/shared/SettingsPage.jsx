import { Bell, LockKeyhole, Mail, Smartphone, Save } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/common/ThemeToggle";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/common/Button";
import { updateProfile, changePassword } from "../../services/authService";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [prefs, setPrefs] = useState(user?.preferences || { email: true, push: true });
  const [savingPrefs, setSavingPrefs] = useState(false);
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMessage, setPwdMessage] = useState("");
  const [pwdError, setPwdError] = useState("");

  const handlePrefChange = async (key) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    setSavingPrefs(true);
    try {
      const res = await updateProfile({ preferences: newPrefs });
      updateUser(res.user);
    } catch (err) {
      console.error(err);
      // Revert on error
      setPrefs(prefs);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdMessage("");
    setPwdError("");
    setSavingPwd(true);
    try {
      await changePassword(password, confirmPassword);
      setPwdMessage("Password updated successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwdError(err.message);
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader eyebrow="Preferences" title="Settings" description="Control appearance and review account capabilities." />
        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold text-safar-ink">Appearance</h2>
            <p className="mt-1 text-sm leading-6 text-safar-gray">Theme is the only preference stored in this browser.</p>
            <div className="mt-5"><ThemeToggle /></div>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-safar-teal" />
              <h2 className="text-lg font-bold text-safar-ink">Notifications</h2>
            </div>
            <p className="mt-1 text-sm leading-6 text-safar-gray">Choose how you want to be notified.</p>
            <div className="mt-5 space-y-4">
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <span className="font-semibold text-safar-ink">Email Notifications</span>
                </div>
                <input 
                  type="checkbox" 
                  className="h-5 w-5 rounded border-slate-300 text-safar-teal focus:ring-safar-teal disabled:opacity-50"
                  checked={prefs.email} 
                  onChange={() => handlePrefChange('email')}
                  disabled={savingPrefs}
                />
              </label>
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-slate-400" />
                  <span className="font-semibold text-safar-ink">Push Notifications</span>
                </div>
                <input 
                  type="checkbox" 
                  className="h-5 w-5 rounded border-slate-300 text-safar-teal focus:ring-safar-teal disabled:opacity-50"
                  checked={prefs.push} 
                  onChange={() => handlePrefChange('push')}
                  disabled={savingPrefs}
                />
              </label>
            </div>
          </div>
        </section>
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-50"><LockKeyhole className="h-5 w-5 text-amber-600" /></span>
            <div className="flex-1">
              <h2 className="font-bold text-safar-ink">Password and account security</h2>
              <p className="mt-1 text-sm leading-6 text-safar-gray">Change your account password below.</p>
              
              <form onSubmit={handlePasswordSubmit} className="mt-5 max-w-sm space-y-4">
                {pwdMessage && <div className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">{pwdMessage}</div>}
                {pwdError && <div className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">{pwdError}</div>}
                
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-safar-ink" htmlFor="password">New password</label>
                  <input
                    id="password"
                    type="password"
                    className="focus-ring block h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-safar-ink transition-colors placeholder:text-slate-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-safar-ink" htmlFor="confirmPassword">Confirm new password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="focus-ring block h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-safar-ink transition-colors placeholder:text-slate-400"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" loading={savingPwd} icon={Save}>Change Password</Button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

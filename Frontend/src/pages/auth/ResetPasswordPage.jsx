import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthPageShell from "../../components/auth/AuthPageShell";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { resetPassword } from "../../services/authService";

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setToast } = useAuth();
  const token = useMemo(() => {
    const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(location.search);
    return hash.get("access_token") || query.get("access_token") || "";
  }, [location.hash, location.search]);
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) return setError("Password and confirmation do not match.");
    setLoading(true);
    setError("");
    try {
      await resetPassword(token, form.password, form.confirmPassword);
      const message = "Password reset successful. Sign in with your new password.";
      setToast({ type: "success", message });
      navigate("/login", { replace: true, state: { message } });
    } catch (requestError) {
      setError(requestError.message);
      setToast({ type: "error", message: requestError.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell eyebrow="Secure recovery" title="Choose a new password" description="Use at least eight characters with uppercase, lowercase, and a number.">
      {!token ? <div className="mt-6 rounded-lg bg-red-50 px-4 py-4 text-sm font-medium text-red-700">This recovery link is missing its access token or has expired. Request a new link.</div> : <form className="mx-auto mt-6 max-w-md space-y-5" onSubmit={submit}>{error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}{["password", "confirmPassword"].map((name) => <label className="block" key={name}><span className="text-sm font-semibold">{name === "password" ? "New password" : "Confirm new password"}</span><input className="focus-ring mt-2 h-12 w-full rounded-lg border border-slate-200 px-3 text-sm" type="password" value={form[name]} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} minLength="8" required /></label>)}<Button className="w-full" type="submit" loading={loading}>Set new password</Button></form>}
      <p className="mt-6 text-center text-sm"><Link className="font-semibold text-safar-teal" to="/forgot-password">Request another recovery link</Link></p>
    </AuthPageShell>
  );
}

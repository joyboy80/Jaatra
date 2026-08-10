import { useState } from "react";
import { Link } from "react-router-dom";
import AuthPageShell from "../../components/auth/AuthPageShell";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { forgotPassword } from "../../services/authService";

export default function ForgotPasswordPage() {
  const { setToast } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await forgotPassword(email);
      setSent(true);
      setToast({ type: "success", message: "If the account exists, a recovery link has been sent." });
    } catch (requestError) {
      setError(requestError.message);
      setToast({ type: "error", message: requestError.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell eyebrow="Account recovery" title="Reset your password" description="Enter your CUET email and we’ll send a secure recovery link.">
      {sent ? <div className="mt-6 rounded-lg bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-800">Check your email for the recovery link. You may close this page.</div> : <form className="mx-auto mt-6 max-w-md" onSubmit={submit}>{error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}<label className="block"><span className="text-sm font-semibold">CUET email</span><input className="focus-ring mt-2 h-12 w-full rounded-lg border border-slate-200 px-3 text-sm" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><Button className="mt-5 w-full" type="submit" loading={loading}>Send recovery link</Button></form>}
      <p className="mt-6 text-center text-sm"><Link className="font-semibold text-jaatra-teal" to="/login">Back to sign in</Link></p>
    </AuthPageShell>
  );
}

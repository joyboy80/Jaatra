import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthPageShell from "../../components/auth/AuthPageShell";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { register } from "../../services/authService";
import { genderOptions, registrationRoles } from "../../utils/authOptions";

const fieldClass = "focus-ring mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-safar-ink";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setToast } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    userType: "STUDENT",
    fullName: "",
    phone: "",
    email: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (form.userType === "STUDENT" && !/^u\d{7}@(student\.)?cuet\.ac\.bd$/i.test(form.email.trim())) {
      const message = "Use a valid CUET student email such as u2204012@cuet.ac.bd.";
      setError(message);
      setToast({ type: "error", message });
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        userType: form.userType,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setToast({ type: "success", message: "Registration started. Check your email for the code." });
      navigate(`/verify-otp?email=${encodeURIComponent(form.email.trim())}`, {
        replace: true,
        state: { verification: result.verification },
      });
    } catch (requestError) {
      setError(requestError.message);
      setToast({ type: "error", message: requestError.message });
    } finally {
      setLoading(false);
    }
  }

  const isStudent = form.userType === "STUDENT";

  return (
    <AuthPageShell eyebrow="Create account" title="Join Safar" description="Register with your verified CUET identity. Transport Admin accounts are created only by the system administrator.">
      {error && <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
      <form className="mt-6 grid gap-5 sm:grid-cols-2" onSubmit={submit}>
        <label className="block">
          <span className="text-sm font-semibold">Account type</span>
          <select className={fieldClass} name="userType" value={form.userType} onChange={update}>
            {registrationRoles.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Full name</span>
          <input className={fieldClass} name="fullName" value={form.fullName} onChange={update} required />
        </label>

        <div className="sm:col-span-2">
          <label className="block">
            <span className="text-sm font-semibold">{isStudent ? "CUET student email" : "Email"}</span>
            <input
              className={fieldClass}
              type="email"
              name="email"
              value={form.email}
              onChange={update}
              placeholder={
                isStudent
                  ? "u2204012@cuet.ac.bd"
                  : form.userType === "TEACHER"
                    ? "teacher@cuet.ac.bd or name@example.com"
                    : "name@example.com"
              }
              required
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold">Mobile number</span>
          <input className={fieldClass} type="tel" name="phone" value={form.phone} onChange={update} placeholder="01712345678" required />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Gender</span>
          <select className={fieldClass} name="gender" value={form.gender} onChange={update} required>
            <option value="" disabled>Select gender</option>
            {genderOptions.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Password</span>
          <input className={fieldClass} type="password" name="password" value={form.password} onChange={update} minLength="8" required />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Confirm password</span>
          <input className={fieldClass} type="password" name="confirmPassword" value={form.confirmPassword} onChange={update} minLength="8" required />
        </label>

        <div className="sm:col-span-2">
          <p className="mb-4 text-xs leading-5 text-safar-gray">Use at least eight characters with uppercase, lowercase, and a number.</p>
          <Button className="w-full" type="submit" loading={loading}>Create account</Button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-safar-gray">
        Already registered? <Link className="font-semibold text-safar-teal" to="/login">Sign in</Link>
      </p>
    </AuthPageShell>
  );
}

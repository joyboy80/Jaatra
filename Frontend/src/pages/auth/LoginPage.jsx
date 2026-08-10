import { ArrowRight, BusFront, Clock3, Eye, EyeOff, Lock, Mail, MapPin, Route, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";
import Toast from "../../components/common/Toast";
import ThemeToggle from "../../components/common/ThemeToggle";
import Loading from "../../components/common/Loading";
import { useAuth } from "../../context/AuthContext";
import { getDashboardForRole, roleOptions } from "../../utils/roles";
import { backendEnabled } from "../../services/api";

export default function LoginPage() {
  const { isAuthenticated, isRestoring, login, user, setToast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    identifier: backendEnabled ? "" : "student@university.edu",
    password: backendEnabled ? "" : "jaatra123",
    role: "student",
    remember: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const destination = useMemo(() => {
    if (!user) return "/login";
    return location.state?.from?.pathname || getDashboardForRole(user.role);
  }, [location.state, user]);

  if (isRestoring) {
    return <main className="min-h-screen bg-slate-50 p-4"><Loading label="Restoring your session" /></main>;
  }

  if (isAuthenticated && user) {
    return <Navigate to={destination} replace />;
  }

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.identifier.trim()) {
      nextErrors.identifier = "Email or university ID is required.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Use at least 6 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      setToast({ type: "error", message: "Please fix the highlighted fields." });
      return;
    }

    setLoading(true);
    try {
      const nextAuth = await login(form);
      navigate(getDashboardForRole(nextAuth.user.role), { replace: true });
    } catch (error) {
      setErrors({ form: error.message });
      setToast({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50" data-role={form.role}>
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="login-visual relative hidden overflow-hidden px-10 py-8 text-white lg:flex lg:flex-col xl:px-16">
          <Logo light />
          <div className="relative z-10 mt-12 max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
              <ShieldCheck className="h-4 w-4" />
              Smart university transport platform
            </div>
            <h1 className="max-w-xl text-4xl font-extrabold leading-tight xl:text-5xl">Every campus journey, connected.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/75 xl:text-lg">
              Schedules, reservations, live fleet intelligence, and Jaatra AI in one reliable transport workspace.
            </p>
          </div>

          <div className="relative z-10 my-auto py-8">
            <div className="route-board max-w-2xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-jaatra-navy shadow-lg"><BusFront className="h-6 w-6" /></span>
                  <div><p className="text-xs font-bold uppercase tracking-widest text-cyan-200">Live campus route</p><p className="mt-1 text-xl font-bold">Surma Express</p></div>
                </div>
                <span className="rounded-full bg-emerald-400/20 px-3 py-1.5 text-xs font-bold text-emerald-200 ring-1 ring-emerald-300/30">On time</span>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-cyan-300" />
                <span className="h-1.5 flex-1 rounded-full bg-white/15"><span className="block h-full w-3/5 rounded-full bg-cyan-300" /></span>
                <ArrowRight className="h-5 w-5 text-white/50" />
              </div>
              <div className="mt-3 flex justify-between text-sm font-semibold"><span>Hathazari</span><span>CUET Campus</span></div>
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-sm">
                <span className="flex items-center gap-2 text-white/75"><Clock3 className="h-4 w-4 text-cyan-300" />8 min ETA</span>
                <span className="flex items-center gap-2 text-white/75"><Users className="h-4 w-4 text-violet-300" />18 seats</span>
                <span className="flex items-center gap-2 text-white/75"><Sparkles className="h-4 w-4 text-amber-300" />AI ready</span>
              </div>
            </div>
          </div>
          <p className="relative z-10 text-xs font-semibold text-white/50">University mobility, thoughtfully orchestrated.</p>
          <Route className="absolute -bottom-12 -right-10 h-72 w-72 rotate-12 text-white/[0.045]" />
        </section>

        <section className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="absolute right-4 top-4 sm:right-6 sm:top-6"><ThemeToggle compact /></div>
          <div className="w-full max-w-md">
            <div className="mb-7 lg:hidden">
              <Logo />
            </div>
            <div className="rounded-xl bg-white p-5 shadow-soft ring-1 ring-slate-200 sm:p-8">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-jaatra-teal">Welcome back</p>
                <h2 className="mt-2 text-3xl font-extrabold text-jaatra-ink">Sign in to Jaatra</h2>
                <p className="mt-2 text-sm leading-6 text-jaatra-gray">Access your university transportation workspace.</p>
              </div>

              {location.state?.message && (
                <div className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-100">
                  {location.state.message}
                </div>
              )}

              {errors.form && (
                <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-100">
                  {errors.form}
                </div>
              )}

              <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
                <label className="block">
                  <span className="text-sm font-semibold text-jaatra-ink">{backendEnabled ? "CUET email" : "Email / University ID"}</span>
                  <span className="relative mt-2 block">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-jaatra-gray" />
                    <input
                      className={`focus-ring h-12 w-full rounded-lg border bg-white pl-10 pr-3 text-sm text-jaatra-ink shadow-sm transition hover:border-jaatra-teal/40 ${
                        errors.identifier ? "border-red-300" : "border-slate-200"
                      }`}
                      name="identifier"
                      value={form.identifier}
                      onChange={updateField}
                      placeholder="student@university.edu"
                    />
                  </span>
                  {errors.identifier && <span className="mt-1 block text-xs font-medium text-red-600">{errors.identifier}</span>}
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-jaatra-ink">Password</span>
                  <span className="relative mt-2 block">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-jaatra-gray" />
                    <input
                      className={`focus-ring h-12 w-full rounded-lg border bg-white pl-10 pr-12 text-sm text-jaatra-ink shadow-sm transition hover:border-jaatra-teal/40 ${
                        errors.password ? "border-red-300" : "border-slate-200"
                      }`}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={updateField}
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-jaatra-gray hover:bg-slate-100"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </span>
                  {errors.password && <span className="mt-1 block text-xs font-medium text-red-600">{errors.password}</span>}
                </label>

                {!backendEnabled && <label className="block">
                  <span className="text-sm font-semibold text-jaatra-ink">Role</span>
                  <select
                    className="focus-ring mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-jaatra-ink shadow-sm transition hover:border-jaatra-teal/40"
                    name="role"
                    value={form.role}
                    onChange={updateField}
                  >
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </label>}

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <label className="flex items-center gap-2 font-medium text-jaatra-gray">
                    <input
                      className="h-4 w-4 rounded border-slate-300 text-jaatra-teal focus:ring-jaatra-teal"
                      type="checkbox"
                      name="remember"
                      checked={form.remember}
                      onChange={updateField}
                    />
                    Remember me
                  </label>
                  <Link className="focus-ring rounded-lg font-semibold text-jaatra-teal hover:text-jaatra-navy" to={backendEnabled ? "/forgot-password" : "/login"}>
                    Forgot password?
                  </Link>
                </div>

                <Button className="w-full" type="submit" loading={loading}>
                  Sign in
                </Button>
              </form>
              {backendEnabled && <p className="mt-5 text-center text-sm text-jaatra-gray">Need an account? <Link className="font-semibold text-jaatra-teal" to="/register">Register with CUET</Link></p>}
              {!backendEnabled && <p className="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-800">Demo mode: the selected role controls the mock portal.</p>}
              <div className="mt-6 border-t border-slate-100 pt-5"><ThemeToggle /></div>
            </div>
          </div>
        </section>
      </div>
      <Toast />
    </main>
  );
}

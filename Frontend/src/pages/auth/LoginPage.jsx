import { ArrowRight, BusFront, Clock3, Eye, EyeOff, Lock, Mail, MapPin, Route, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";
import Toast from "../../components/common/Toast";
import ThemeToggle from "../../components/common/ThemeToggle";
import Loading from "../../components/common/Loading";
import { useAuth } from "../../context/AuthContext";
import { getDashboardForRole } from "../../utils/roles";

export default function LoginPage() {
  const { isAuthenticated, isRestoring, login, user, setToast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    identifier: "",
    password: "",
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
      if (error.code === "REQUIRES_VERIFICATION" || error.status === 403 || error.details?.requires_verification) {
        setToast({ type: "info", message: "A new verification code has been sent to your email." });
        navigate(`/verify-otp?email=${encodeURIComponent(form.identifier.trim())}`);
        return;
      }
      setErrors({ form: error.message });
      setToast({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="login-visual relative hidden overflow-hidden px-10 py-8 text-white lg:flex lg:flex-col xl:px-16 animate-fade-in">
          <Logo light />
          <div className="relative z-10 mt-16 max-w-2xl animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-md shadow-lg">
              <ShieldCheck className="h-5 w-5 text-brand-cyan" />
              Smart university transport platform
            </div>
            <h1 className="max-w-xl text-5xl font-display font-black leading-[1.15] xl:text-6xl drop-shadow-lg">Every campus journey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-cyan-300">connected.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 xl:text-xl font-medium">
              Schedules, reservations, live fleet intelligence, and Safar AI in one reliable premium workspace.
            </p>
          </div>

          <div className="relative z-10 my-auto py-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="route-board max-w-2xl transform hover:scale-[1.02] transition-transform duration-500">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-white to-slate-100 text-brand-maroon shadow-xl"><BusFront className="h-7 w-7" /></span>
                  <div><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300 mb-1">Secure transport access</p><p className="text-2xl font-display font-bold">Backend-connected workspace</p></div>
                </div>
                <span className="rounded-full bg-emerald-500/30 px-4 py-2 text-xs font-bold text-emerald-200 ring-1 ring-emerald-400/40 shadow-inner">Protected</span>
              </div>
              <div className="mt-10 flex items-center gap-4">
                <MapPin className="h-6 w-6 text-cyan-300 animate-pulse" />
                <span className="h-2 flex-1 rounded-full bg-white/10 shadow-inner overflow-hidden"><span className="block h-full w-2/3 rounded-full bg-gradient-to-r from-brand-maroon via-brand-purple to-brand-cyan" /></span>
                <ArrowRight className="h-6 w-6 text-white/50" />
              </div>
              <div className="mt-4 flex justify-between text-sm font-semibold text-white/80"><span>Sign in</span><span>Open your portal</span></div>
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/20 pt-6 text-sm">
                <span className="flex items-center justify-center gap-2 text-white/90 bg-white/5 rounded-lg py-2"><Clock3 className="h-4 w-4 text-cyan-300" />Live schedules</span>
                <span className="flex items-center justify-center gap-2 text-white/90 bg-white/5 rounded-lg py-2"><Users className="h-4 w-4 text-purple-300" />Role access</span>
                <span className="flex items-center justify-center gap-2 text-white/90 bg-white/5 rounded-lg py-2"><Sparkles className="h-4 w-4 text-amber-300" />Secure sessions</span>
              </div>
            </div>
          </div>
          <p className="relative z-10 text-xs font-bold uppercase tracking-widest text-white/40">University mobility, thoughtfully orchestrated.</p>
          <Route className="absolute -bottom-16 -right-16 h-[400px] w-[400px] rotate-12 text-white/[0.03] pointer-events-none" />
        </section>

        <section className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10 z-10">
          <div className="absolute right-6 top-6"><ThemeToggle compact /></div>
          
          <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
            <div className="absolute -left-[20%] top-0 h-[400px] w-[400px] rounded-full bg-brand-maroon/10 mix-blend-multiply blur-3xl dark:bg-pink-900/20 dark:mix-blend-lighten" />
            <div className="absolute -right-[20%] top-[20%] h-[500px] w-[500px] rounded-full bg-brand-cyan/10 mix-blend-multiply blur-3xl dark:bg-cyan-900/20 dark:mix-blend-lighten" />
          </div>

          <div className="w-full max-w-md relative z-10 animate-slide-up">
            <div className="mb-8 flex justify-center lg:hidden">
              <Logo />
            </div>
            <div className="rounded-3xl bg-white/80 p-6 shadow-2xl ring-1 ring-slate-200/60 backdrop-blur-2xl sm:p-10 dark:bg-slate-900/80 dark:ring-slate-700/50">
              <div className="text-center mb-8">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-cyan dark:text-cyan-400">Welcome back</p>
                <h2 className="mt-3 text-4xl font-display font-black text-safar-ink dark:text-white">Sign in to Safar</h2>
                <p className="mt-3 text-sm leading-relaxed text-safar-gray dark:text-slate-400">Access your intelligent transportation workspace.</p>
              </div>

              {location.state?.message && (
                <div className="mt-6 rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200/50 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-800">
                  {location.state.message}
                </div>
              )}

              {errors.form && (
                <div className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-700 ring-1 ring-red-200/50 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-800">
                  {errors.form}
                </div>
              )}

              <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                <label className="block">
                  <span className="text-sm font-bold text-safar-ink dark:text-slate-200">CUET email</span>
                  <span className="relative mt-2.5 block">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-safar-gray" />
                    <input
                      className={`focus-ring h-14 w-full rounded-2xl border bg-slate-50/50 pl-12 pr-4 text-sm text-safar-ink shadow-inner transition hover:border-brand-cyan/40 focus:bg-white dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 ${
                        errors.identifier ? "border-red-300 dark:border-red-500/50" : "border-slate-200 dark:border-slate-700"
                      }`}
                      name="identifier"
                      value={form.identifier}
                      onChange={updateField}
                      placeholder="student@university.edu"
                    />
                  </span>
                  {errors.identifier && <span className="mt-1.5 block text-xs font-bold text-red-600 dark:text-red-400">{errors.identifier}</span>}
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-safar-ink dark:text-slate-200">Password</span>
                  <span className="relative mt-2.5 block">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-safar-gray" />
                    <input
                      className={`focus-ring h-14 w-full rounded-2xl border bg-slate-50/50 pl-12 pr-12 text-sm text-safar-ink shadow-inner transition hover:border-brand-cyan/40 focus:bg-white dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 ${
                        errors.password ? "border-red-300 dark:border-red-500/50" : "border-slate-200 dark:border-slate-700"
                      }`}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={updateField}
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-safar-gray hover:bg-slate-200/50 transition-colors dark:hover:bg-slate-700"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </span>
                  {errors.password && <span className="mt-1.5 block text-xs font-bold text-red-600 dark:text-red-400">{errors.password}</span>}
                </label>

                <div className="flex flex-wrap items-center justify-between gap-4 text-sm mt-2">
                  <label className="flex items-center gap-3 font-semibold text-safar-gray dark:text-slate-400 cursor-pointer">
                    <input
                      className="h-5 w-5 rounded-md border-slate-300 text-brand-cyan focus:ring-brand-cyan dark:border-slate-600 dark:bg-slate-700"
                      type="checkbox"
                      name="remember"
                      checked={form.remember}
                      onChange={updateField}
                    />
                    Remember me
                  </label>
                  <Link className="focus-ring rounded-lg font-bold text-brand-cyan hover:text-brand-purple transition-colors" to="/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <Button className="w-full py-4 text-base mt-4" type="submit" loading={loading}>
                  Sign in
                </Button>
              </form>
              <div className="mt-8 flex flex-col items-center gap-4">
                <p className="text-center text-sm font-medium text-safar-gray dark:text-slate-400">
                  Need an account? <Link className="font-bold text-brand-cyan hover:text-brand-purple transition-colors ml-1" to="/register">Register with Mail</Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Toast />
    </main>
  );
}

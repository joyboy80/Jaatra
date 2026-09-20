import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDashboardForRole } from "../../utils/roles";

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const dashboardPath = user ? (user.destination || getDashboardForRole(user.role)) : "/login";

  // Use scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans overflow-hidden">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 px-6 lg:px-12 py-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 text-safar-amber" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
          </svg>
          <span className="text-white text-2xl font-display font-bold tracking-tight">SAFAR</span>
        </div>
        <div>
          <Link
            to={isAuthenticated ? dashboardPath : "/login"}
            className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 font-medium transition-all duration-300"
          >
            {isAuthenticated ? "Dashboard" : "Sign In"}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 relative flex items-center justify-center pt-24 pb-12 lg:pt-0">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/images/jamuna.jpg"
            alt="CUET Bus"
            className="w-full h-full object-cover opacity-35 object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/75 via-surface/60 to-surface" />
        </div>

        <div className="relative z-10 container mx-auto px-6 lg:px-12 flex flex-col items-center justify-center text-center max-w-4xl py-12">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold tracking-wide backdrop-blur-md animate-fade-in">
            Official CUET Transportation
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-safar-ink leading-tight mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Your Journey, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-safar-teal to-safar-sky">Simplified.</span>
          </h1>
          <p className="text-lg lg:text-xl text-safar-gray mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Experience seamless campus commutes with SAFAR. Book seat reservations, 
            view bus routes, and stay updated with the latest campus schedules.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link
              to={isAuthenticated ? dashboardPath : "/login"}
              className="group relative px-9 py-4 bg-safar-teal text-white rounded-full font-semibold shadow-glow hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden text-base"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative flex items-center gap-2">
                {isAuthenticated ? "Open Dashboard" : "Explore Our Site"}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Quick feature highlights */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="p-5 rounded-2xl bg-elevated/80 backdrop-blur-md border border-outline/50 shadow-sm flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-safar-teal/15 text-safar-teal flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-safar-ink text-base">Schedules</h3>
              <p className="text-safar-gray text-xs mt-1">Up-to-date departure times</p>
            </div>

            <div className="p-5 rounded-2xl bg-elevated/80 backdrop-blur-md border border-outline/50 shadow-sm flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-safar-teal/15 text-safar-teal flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-safar-ink text-base">Seat Booking</h3>
              <p className="text-safar-gray text-xs mt-1">Fast and hassle-free passes</p>
            </div>

            <div className="p-5 rounded-2xl bg-elevated/80 backdrop-blur-md border border-outline/50 shadow-sm flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-safar-teal/15 text-safar-teal flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-safar-ink text-base">Campus Routes</h3>
              <p className="text-safar-gray text-xs mt-1">Complete stop details</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-outline relative z-10 bg-surface">
        <div className="container mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-safar-teal" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
            </svg>
            <span className="text-safar-ink font-display font-semibold">SAFAR</span>
          </div>
          <p className="text-safar-gray text-sm">
            © {new Date().getFullYear()} CUET. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

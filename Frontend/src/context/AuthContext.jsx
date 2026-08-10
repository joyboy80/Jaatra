import { createContext, useContext, useMemo, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => authService.getStoredAuth());
  const [toast, setToast] = useState(null);

  const value = useMemo(
    () => ({
      user: auth?.user || null,
      token: auth?.token || null,
      isAuthenticated: Boolean(auth?.token),
      toast,
      setToast,
      async login(credentials) {
        const nextAuth = await authService.login(credentials);
        setAuth(nextAuth);
        setToast({ type: "success", message: `Welcome to Jaatra, ${nextAuth.user.roleLabel}.` });
        return nextAuth;
      },
      logout() {
        authService.logout();
        setAuth(null);
        setToast({ type: "info", message: "You have been signed out." });
      },
    }),
    [auth, toast]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

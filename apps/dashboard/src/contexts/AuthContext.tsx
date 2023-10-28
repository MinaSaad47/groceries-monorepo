import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: any;
  loading: boolean;
  logout: () => void;
  login: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: JSX.Element }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async ({ code }) => {
      setLoading(true);
      let { data } = await axios.post("/api/v1/oauth/google", { code });
      if (data?.status !== "success") {
        setLoading(false);
        return;
      }
      localStorage.setItem("credentials", JSON.stringify(data?.data));
      setUser(data?.data?.user);
      setLoading(false);
    },
  });

  useEffect(() => {
    setLoading(true);
    const credentials = localStorage.getItem("credentials");
    if (credentials) {
      setUser(JSON.parse(credentials));
    }
    setLoading(false);
    return () => {
      setLoading(false);
    };
  }, []);

  const login = googleLogin;
  const logout = () => {
    localStorage.removeItem("credentials");
    setUser(null);
  };

  const value = {
    user,
    loading,
    logout,
    login,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};

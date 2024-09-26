import React, { createContext, useState, useEffect } from "react";
import { useRouter } from "next/router";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in by checking localStorage
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      setUser(JSON.parse(storedProfile));
    } else if (router.pathname !== "/login") {
      // Redirect to login page if not logged in and trying to access a protected route
      router.push("/login");
    }
  }, []);

  const login = (profile) => {
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userProfile");
    setUser(null);
    router.push("/login");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

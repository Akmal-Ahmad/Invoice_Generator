import { createContext, useState, useEffect } from "react";
export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");
    const guest = params.get("guest");

    if (guest === "true") {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("loggedInUser");
      setUser(null);
      window.history.replaceState({}, document.title, "/");
      return;
    }

    if (token && email) {
      localStorage.setItem("jwtToken", token);
      localStorage.setItem("loggedInUser", email);
      setUser({ email });
      window.history.replaceState({}, document.title, "/");
    } else {
      const storedUser = localStorage.getItem("loggedInUser");
      if (storedUser) setUser({ email: storedUser });
    }

    // Listen for localStorage changes in other tabs
    const syncLogout = (e) => {
      if (e.key === "loggedInUser" && e.newValue === null) {
        // User logged out in another tab
        setUser(null);
      }
      if (e.key === "jwtToken" && e.newValue === null) {
        setUser(null);
      }
    };
    window.addEventListener("storage", syncLogout);

    return () => window.removeEventListener("storage", syncLogout);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

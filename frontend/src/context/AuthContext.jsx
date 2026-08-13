import { useState } from "react";
import { AuthContext } from "./useAuth";

const STORAGE_KEY = "usuario";

function getStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const guardado = window.localStorage.getItem(STORAGE_KEY);
    return guardado ? JSON.parse(guardado) : null;
  } catch (error) {
    console.error("Error al leer el usuario guardado:", error);
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => getStoredUser());

  const login = (datosUsuario) => {
    const payload = datosUsuario ?? null;

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
    }

    setUsuario(payload);
  };

  const logout = () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error al limpiar el usuario:", error);
    }

    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

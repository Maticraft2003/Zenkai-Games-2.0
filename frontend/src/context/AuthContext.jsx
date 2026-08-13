import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

function AuthProvider({ children }) {

    const [usuario, setUsuario] = useState(() => {

        const guardado = localStorage.getItem("usuario");

        return guardado ? JSON.parse(guardado) : null;

    });

    const login = (datosUsuario) => {

        localStorage.setItem(
            "usuario",
            JSON.stringify(datosUsuario)
        );

        setUsuario(datosUsuario);

    };

    const logout = () => {

        localStorage.removeItem("usuario");

        setUsuario(null);

    };

    return (

        <AuthContext.Provider
            value={{
                usuario,
                login,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}

export function useAuth() {
    return useContext(AuthContext);
}

export default AuthProvider;

import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../services/firebase";
import { logoutUser } from "../services/authService";
import { AuthContext } from "./AuthContext";
import { getAuthErrorMessage } from "../helpers/authErrors";
import { toast } from "sonner";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await logoutUser();
            toast.success("Sesión cerrada");
            navigate("/login");
        } catch (error) {
            toast.error(getAuthErrorMessage(error));
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

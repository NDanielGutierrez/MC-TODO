import type { User } from "firebase/auth";

export interface AuthContextValue {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
}

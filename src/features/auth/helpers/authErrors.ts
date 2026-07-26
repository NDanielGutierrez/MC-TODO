import { FirebaseError } from "firebase/app";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
    "auth/invalid-credential": "Credenciales invalidas. Verifica tu email y contrasena.",
    "auth/user-not-found": "No existe una cuenta con ese email.",
    "auth/wrong-password": "Contrasena incorrecta.",
    "auth/email-already-in-use": "Ya existe una cuenta con ese email.",
    "auth/weak-password": "La contrasena debe tener al menos 6 caracteres.",
    "auth/invalid-email": "El formato del email no es valido.",
    "auth/too-many-requests": "Demasiados intentos fallidos. Intenta de nuevo mas tarde.",
};

export function getAuthErrorMessage(error: unknown): string {
    if (error instanceof FirebaseError) {
        return AUTH_ERROR_MESSAGES[error.code] ?? "Ocurrio un error de autenticacion. Intentalo nuevamente.";
    }

    return "Ocurrio un error inesperado. Intentalo nuevamente.";
}

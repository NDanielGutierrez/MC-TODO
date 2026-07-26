import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from "firebase/auth";
import { auth } from "../../../services/firebase";

export async function registerUser(email: string, password: string) {
    return await createUserWithEmailAndPassword(auth, email, password);
}

export async function loginUser(email: string, password: string) {
    return await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
    await signOut(auth);
}

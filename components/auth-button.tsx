"use client";
import { signIn, signOut } from "next-auth/react";

export function AuthButton({ signedIn }: { signedIn: boolean }) {
  return signedIn
    ? <button className="button secondary" onClick={() => signOut()}>Выйти</button>
    : <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>Войти через Google</button>;
}

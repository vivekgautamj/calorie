"use client";

import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function SignIn() {
    const { data: session } = useSession();

    if (session) {
        redirect("/dashboard");
    }

  return <button onClick={() => signIn("twitter")}>Login with Twitter</button>;
}

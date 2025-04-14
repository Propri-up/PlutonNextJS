import { createAuthClient } from "better-auth/react";

export const { signIn, signUp } = createAuthClient({
  baseURL: process.env.ENV === "dev" ? "https://api.pluton.tools" : "https://api.pluton.tools",
});

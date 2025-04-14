import { createAuthClient } from "better-auth/react";

export const { signIn, signUp } = createAuthClient({
  baseURL: "https://api.pluton.tools",
});

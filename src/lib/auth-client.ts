import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, getSession } = createAuthClient({
  baseURL: "https://api.pluton.tools",
}); 

export const auth = createAuthClient({
  baseURL: "https://api.pluton.tools" ,
});

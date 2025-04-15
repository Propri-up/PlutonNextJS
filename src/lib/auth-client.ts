import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, getSession } = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
}); 

export const auth = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}` ,
});

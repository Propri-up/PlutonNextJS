import type { auth } from "@/lib/auth-client";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers'
 
type Session = typeof auth.$Infer.Session;
 
export async function middleware(request: NextRequest) {
	const res = await fetch(`https://api.pluton.tools/api/auth/get-session`, {
	  headers: {
		cookie: await cookies()
	  },
	  credentials: "include",
	});
	try {
	  const session = await res.json() as Session;
	  if (!session) {
		  return NextResponse.redirect(new URL("/login", request.url));
	  }
	  return NextResponse.next();
	} catch (error) {
	  console.error("Failed to get session:", error);
	  return NextResponse.redirect(new URL("/login", request.url));
	}
  }
 
export const config = {
	matcher: ["/dashboard", "/chat"],
};
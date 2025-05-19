import type { auth } from "@/lib/auth-client";
import { NextRequest, NextResponse } from "next/server";
 
type Session = typeof auth.$Infer.Session;
 
export async function middleware(request: NextRequest) {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`, {
	  headers: {
		cookie: request.headers.get("cookie") || "",
	  },
	  credentials: "include",
	});
	try {
	  const session = await res.json() as Session;
	  console.log(session);
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
	matcher: ["/dashboard", "/chat","/properties", "/documents", "/account"],
};
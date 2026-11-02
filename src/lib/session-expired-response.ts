import { NextResponse } from "next/server";

/** The 401 clients treat as "sign in again" (see endExpiredSession in auth-context). */
export function sessionExpiredResponse() {
  return NextResponse.json(
    { error: "Your session has expired. Please sign in again.", code: "session-expired" },
    { status: 401 }
  );
}

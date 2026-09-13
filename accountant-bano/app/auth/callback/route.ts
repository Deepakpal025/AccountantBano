import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { safeReturn } from "@/lib/access";
import type { EmailOtpType } from "@supabase/supabase-js";
export async function GET(request: Request) {
  const url = new URL(request.url),
    client = await db();
  const code = url.searchParams.get("code"),
    hash = url.searchParams.get("token_hash"),
    type = url.searchParams.get("type");
  const allowed = ["signup", "invite", "recovery", "email_change", "email"];
  const result = code
    ? await client.auth.exchangeCodeForSession(code)
    : hash && type && allowed.includes(type)
      ? await client.auth.verifyOtp({
          token_hash: hash,
          type: type as EmailOtpType,
        })
      : { error: true };
  const target = result.error
    ? "/login?message=This%20link%20is%20invalid%20or%20expired."
    : safeReturn(url.searchParams.get("next"));
  const response = NextResponse.redirect(
    new URL(target, process.env.NEXT_PUBLIC_SITE_URL || url.origin),
  );
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { code } = await req.json().catch(() => ({ code: "" }));

  const expected = process.env.SITE_PASSCODE || "";
  if (!expected) {
    return NextResponse.json(
      { error: "SITE_PASSCODE is not set on the server" },
      { status: 500 }
    );
  }

  if (code !== expected) {
    return NextResponse.json({ error: "Incorrect passcode" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set("ps_auth", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 days
  });

  return res;
}
import { NextRequest, NextResponse } from "next/server";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RouteHandler = (req: NextRequest, method: Method) => Promise<Response>;

const handler: RouteHandler = async (req, method) => {
  const path = req.nextUrl.pathname.substring("/api/proxy".length);
  const searchQuery = req.nextUrl.search;
  const res = await fetch(process.env.API_URL + path + searchQuery, {
    method,
    body: req.body,
    headers: req.headers,
    credentials: "include",
    duplex: "half",
  } as RequestInit);

  const redirectTo = res.headers.get("X-Redirect-To");
  if (redirectTo) {
    const nextRes = NextResponse.redirect(new URL(redirectTo, req.nextUrl));
    nextRes.headers.set("Set-Cookie", res.headers.get("Set-Cookie") ?? "");
    return nextRes;
  }

  return new Response(res.body, {
    headers: res.headers,
    status: res.status,
    statusText: res.statusText,
  });
};

export const GET = (req: NextRequest) => handler(req, "GET");
export const POST = (req: NextRequest) => handler(req, "POST");
export const PUT = (req: NextRequest) => handler(req, "PUT");
export const PATCH = (req: NextRequest) => handler(req, "PATCH");
export const DELETE = (req: NextRequest) => handler(req, "DELETE");

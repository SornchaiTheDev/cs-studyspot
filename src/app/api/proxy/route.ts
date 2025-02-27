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

export const GET: RouteHandler = (req) => handler(req, "GET");
export const POST: RouteHandler = (req) => handler(req, "POST");
export const PUT: RouteHandler = (req) => handler(req, "PUT");
export const PATCH: RouteHandler = (req) => handler(req, "PATCH");
export const DELETE: RouteHandler = (req) => handler(req, "DELETE");

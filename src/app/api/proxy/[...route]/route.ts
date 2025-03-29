import { NextRequest, NextResponse } from "next/server";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RouteHandler = (req: NextRequest, method: Method) => Promise<Response>;

const handler: RouteHandler = async (req, method) => {
  // Track these variables at the top level of the handler
  const path = req.nextUrl.pathname.substring("/api".length);
  const searchQuery = req.nextUrl.search;
  const apiUrl = process.env.API_URL + path + searchQuery;

  try {
    // Clone headers but remove 'host' which might cause issues
    const headers = new Headers(req.headers);
    headers.delete("host");

    const requestInit: RequestInit = {
      method,
      headers,
      credentials: "include",
      // duplex is not recognized by TypeScript types for RequestInit
      // but is needed for streaming responses
    };

    // Add the duplex property using type assertion
    const requestOptions = requestInit as RequestInit & { duplex: string };
    requestOptions.duplex = "half";

    // Only add body for methods that support it
    if (["POST", "PUT", "PATCH"].includes(method)) {
      // Handle different content types appropriately
      const contentType = req.headers.get("content-type");

      if (contentType && contentType.includes("multipart/form-data")) {
        // For FormData, just pass the body directly
        requestOptions.body = req.body;
      } else if (contentType && contentType.includes("application/json")) {
        // For JSON, read and stringify
        try {
          const jsonBody = await req.json();

          // Handle special case for attend/enroll endpoint
          if (path.includes("/attend/enroll")) {
            // Create a new object with snake_case keys for the API
            let requestBody = { ...jsonBody };

            // Transform camelCase to snake_case for this specific endpoint
            if (jsonBody.userId && jsonBody.courseId) {
              requestBody = {
                user_id: jsonBody.userId,
                course_id: jsonBody.courseId,
              };

              // Validation for course_id
              if (typeof requestBody.course_id !== "string") {
                requestBody.course_id = String(requestBody.course_id);
              }

              if (
                !requestBody.course_id ||
                requestBody.course_id.trim() === ""
              ) {
                return NextResponse.json(
                  { error: "Invalid request: course_id cannot be empty" },
                  { status: 400 },
                );
              }
            }

            requestOptions.body = JSON.stringify(requestBody);
          } else {
            // For non-attend/enroll endpoints, use the original body
            requestOptions.body = JSON.stringify(jsonBody);
          }
        } catch (err) {
          // Silent catch for JSON parse errors
        }
      } else {
        // For other types, pass the raw body
        requestOptions.body = req.body;
      }
    }

    try {
      const res = await fetch(apiUrl, requestOptions);

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
    } catch (fetchError: any) {
      // Determine if it's a network connectivity issue
      const isNetworkError =
        (typeof fetchError.message === "string" &&
          fetchError.message.includes("fetch failed")) ||
        fetchError.cause?.code === "UND_ERR_SOCKET" ||
        (typeof fetchError.cause?.message === "string" &&
          fetchError.cause.message.includes("closed"));

      if (isNetworkError) {
        return NextResponse.json(
          {
            error:
              "Network connectivity issue. Unable to reach the API server.",
            details:
              "The connection to the backend API server was closed unexpectedly.",
          },
          { status: 503 }, // Service Unavailable
        );
      }

      return NextResponse.json(
        {
          error: "Failed to proxy request",
          message: fetchError.message || "Unknown error",
          path: path,
        },
        { status: 500 },
      );
    }
  } catch (handlerError: any) {
    return NextResponse.json(
      { error: "Failed to proxy request", message: handlerError.message },
      { status: 500 },
    );
  }
};

export const GET = (req: NextRequest) => handler(req, "GET");
export const POST = (req: NextRequest) => handler(req, "POST");
export const PUT = (req: NextRequest) => handler(req, "PUT");
export const PATCH = (req: NextRequest) => handler(req, "PATCH");
export const DELETE = (req: NextRequest) => handler(req, "DELETE");

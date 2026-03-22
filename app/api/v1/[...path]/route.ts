import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/** Server-side only. Real API base (no /api/v1 suffix). */
function backendOrigin(): string {
  return (
    process.env.BACKEND_URL ||
    process.env.AI_MATCHER_BACKEND_URL ||
    "http://127.0.0.1:3001"
  ).replace(/\/$/, "");
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await context.params;
  const suffix = path.length ? path.join("/") : "";
  const incoming = new URL(request.url);
  const target = `${backendOrigin()}/api/v1/${suffix}${incoming.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (["host", "connection", "content-length", "transfer-encoding"].includes(k)) {
      return;
    }
    headers.set(key, value);
  });

  const method = request.method;
  const hasBody = !["GET", "HEAD"].includes(method);

  const init: RequestInit = {
    method,
    headers,
    redirect: "manual",
  };

  if (hasBody && request.body) {
    Object.assign(init, {
      body: request.body,
      duplex: "half" as const,
    });
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch (e) {
    console.error("[api proxy] fetch failed:", target, e);
    return NextResponse.json(
      { message: "Could not reach backend API. Check BACKEND_URL on the server." },
      { status: 502 }
    );
  }

  const out = new Headers(upstream.headers);
  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: out,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;

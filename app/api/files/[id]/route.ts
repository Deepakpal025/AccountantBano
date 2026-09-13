import { db, service } from "@/lib/supabase";
import { z } from "zod";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const headers = {
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  };
  if (!z.uuid().safeParse(id).success)
    return new Response("File unavailable", { status: 404, headers });
  try {
    const client = await db(),
      {
        data: { user },
      } = await client.auth.getUser();
    if (!user) return new Response("Login required", { status: 401, headers });
    const { data: allowed } = await client.rpc("asset_access", { target: id });
    if (!allowed)
      return new Response("Course access required", { status: 403, headers });
    const { data: asset } = await client
      .from("assets")
      .select("*")
      .eq("id", id)
      .single();
    if (!asset)
      return new Response("File unavailable", { status: 404, headers });
    const { data, error } = await service()
      .storage.from(asset.bucket)
      .createSignedUrl(asset.path, 30);
    if (error || !data)
      return new Response("File unavailable", { status: 404, headers });
    const range = request.headers.get("range");
    if (range && !/^bytes=\d*-\d*$/.test(range))
      return new Response("Invalid range", { status: 416, headers });
    const upstream = await fetch(data.signedUrl, {
      cache: "no-store",
      headers: range ? { Range: range } : {},
    });
    const responseHeaders = new Headers(headers);
    for (const key of ["content-length", "content-range", "accept-ranges"]) {
      const value = upstream.headers.get(key);
      if (value) responseHeaders.set(key, value);
    }
    responseHeaders.set("Content-Type", asset.mime);
    responseHeaders.set(
      "Content-Disposition",
      `${new URL(request.url).searchParams.has("download") ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(asset.name)}`,
    );
    responseHeaders.set(
      "Content-Security-Policy",
      "default-src 'none'; sandbox",
    );
    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return new Response("File service unavailable", { status: 503, headers });
  }
}

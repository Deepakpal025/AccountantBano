import { NextResponse } from "next/server";
import { db, service } from "@/lib/supabase";
import { z } from "zod";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const client = await db();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    const input = z
      .object({
        course_id: z.uuid(),
        name: z.string().min(1).max(180),
        mime: z.enum([
          "video/mp4",
          "video/webm",
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/webp",
        ]),
        size: z
          .number()
          .positive()
          .max(500 * 1024 * 1024),
        kind: z.enum(["course", "doubt"]),
      })
      .parse(await request.json());
    const { data: admin } = await client.rpc("is_admin");
    const { data: access } = await client.rpc("can_access_course", {
      target: input.course_id,
    });
    if (
      !admin &&
      (input.kind !== "doubt" ||
        !access ||
        input.size > 10 * 1024 * 1024 ||
        input.mime.startsWith("video/"))
    )
      return NextResponse.json(
        { error: "You cannot upload this file." },
        { status: 403 },
      );
    const { data: asset, error: reserveError } = await client.rpc(
      "reserve_upload",
      {
        target: input.course_id,
        filename: input.name,
        content_type: input.mime,
        file_kind: input.kind,
      },
    );
    if (reserveError || !asset) throw reserveError;
    const { data, error: uploadError } = await service()
      .storage.from(asset.bucket)
      .createSignedUploadUrl(asset.path);
    if (uploadError) throw uploadError;
    return NextResponse.json(
      { ...asset, token: data.token },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Upload could not be prepared. Check the file type and configuration.",
      },
      { status: 400 },
    );
  }
}

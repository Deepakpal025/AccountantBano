"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, service } from "@/lib/supabase";
import { identity } from "@/lib/auth";
import { cleanRecord, schemas, type Entity } from "@/lib/schema";
import { safeReturn } from "@/lib/access";
export type ActionResult = { error?: string; success?: string };
const string = (f: FormData, k: string) => String(f.get(k) || "");
function failure(error: unknown): ActionResult {
  if (error instanceof z.ZodError)
    return { error: error.issues.map((i) => i.message).join(" ") };
  const message = error instanceof Error ? error.message : "";
  if (message.startsWith("NEXT_REDIRECT")) throw error;
  return {
    error: message.includes("Too many")
      ? message
      : "Action could not be completed. Check your inputs, access and connection, then try again.",
  };
}
function check(result: { error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message);
}
export async function authenticate(
  _: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  let destination = "";
  try {
    const client = await db(),
      mode = string(form, "mode");
    const email = z.email().parse(string(form, "email"));
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    if (mode === "reset") {
      check(
        await client.auth.resetPasswordForEmail(email, {
          redirectTo: origin + "/auth/callback?next=/profile",
        }),
      );
      return {
        success:
          "If this email has an account, a password reset link is on its way.",
      };
    }
    const password = z
      .string()
      .min(10, "Use at least 10 characters.")
      .max(128)
      .parse(string(form, "password"));
    if (mode === "register") {
      const name = z
        .string()
        .trim()
        .min(2)
        .max(200)
        .parse(string(form, "name"));
      const mobile = z
        .string()
        .regex(/^\+?[0-9 ]{10,20}$/, "Enter a valid mobile number.")
        .parse(string(form, "mobile"));
      check(
        await client.auth.signUp({
          email,
          password,
          options: {
            data: { name, mobile },
            emailRedirectTo: origin + "/auth/callback",
          },
        }),
      );
      return {
        success:
          "Check your email to confirm your account. Course access is assigned by the academy.",
      };
    }
    const result = await client.auth.signInWithPassword({ email, password });
    if (result.error)
      return {
        error:
          "Email or password is incorrect, or your email is not confirmed.",
      };
    const { data: profile } = await client
      .from("profiles")
      .select("role,active")
      .eq("id", result.data.user.id)
      .single();
    if (!profile?.active || (mode === "admin" && profile.role !== "admin")) {
      await client.auth.signOut();
      return {
        error:
          mode === "admin"
            ? "Administrator access is required."
            : "Your account is disabled. Please contact support.",
      };
    }
    destination = mode === "admin" ? "/admin/dashboard" : "/dashboard";
  } catch (error) {
    return failure(error);
  }
  redirect(destination);
}
export async function logout() {
  const client = await db();
  await client.auth.signOut();
  redirect("/login");
}
export async function mutate(
  _: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  try {
    const { client, user } = await identity();
    const action = string(form, "action");
    if (action === "profile")
      check(
        await client
          .from("profiles")
          .update({
            name: z.string().min(2).max(200).parse(string(form, "name")),
            mobile: z
              .string()
              .regex(/^\+?[0-9 ]{10,20}$/)
              .parse(string(form, "mobile")),
          })
          .eq("id", user.id),
      );
    else if (action === "password") {
      const password = z
        .string()
        .min(10)
        .max(128)
        .parse(string(form, "password"));
      if (password !== string(form, "confirm"))
        return { error: "Passwords do not match." };
      check(await client.auth.updateUser({ password }));
    } else if (action === "complete") {
      const lessonId = z.uuid().parse(string(form, "lesson_id"));
      if (string(form, "undo") === "true")
        check(
          await client
            .from("lesson_progress")
            .delete()
            .eq("user_id", user.id)
            .eq("lesson_id", lessonId),
        );
      else {
        const result = await client
          .from("lesson_progress")
          .insert({ user_id: user.id, lesson_id: lessonId });
        if (result.error?.code !== "23505") check(result);
      }
    } else if (action === "doubt")
      check(
        await client
          .from("doubts")
          .insert({
            user_id: user.id,
            module_id: z.uuid().parse(string(form, "module_id")),
            title: z
              .string()
              .trim()
              .min(1)
              .max(200)
              .parse(string(form, "title")),
            body: z
              .string()
              .trim()
              .min(1)
              .max(12000)
              .parse(string(form, "body")),
            asset_id: string(form, "asset_id")
              ? z.uuid().parse(string(form, "asset_id"))
              : null,
          }),
      );
    else if (action === "comment")
      check(
        await client
          .from("community_comments")
          .insert({
            user_id: user.id,
            post_id: z.uuid().parse(string(form, "post_id")),
            body: z
              .string()
              .trim()
              .min(1)
              .max(3000)
              .parse(string(form, "body")),
          }),
      );
    else if (action === "read")
      check(
        await client.rpc("mark_notification_read", {
          target: z.uuid().parse(string(form, "id")),
        }),
      );
    else return { error: "Unknown action." };
    revalidatePath("/", "layout");
    return { success: "Saved successfully." };
  } catch (error) {
    return failure(error);
  }
}
export async function adminMutate(
  _: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  try {
    const { client, user } = await identity(true);
    const action = string(form, "action"),
      entity = string(form, "entity");
    if (action === "save") {
      if (!(entity in schemas)) return { error: "Invalid form." };
      const data: Record<string, unknown> = cleanRecord(entity as Entity, form),
        id = string(form, "id");
      if (entity === "settings")
        check(await client.from("settings").update(data).eq("id", 1));
      else if (entity === "enrollments")
        check(
          await client
            .from(entity)
            .upsert(data, { onConflict: "user_id,course_id" }),
        );
      else if (id)
        check(
          await client.from(entity).update(data).eq("id", z.uuid().parse(id)),
        );
      else check(await client.from(entity).insert(data));
    } else if (action === "delete") {
      if (
        ![
          "courses",
          "modules",
          "lessons",
          "notes",
          "community_posts",
          "announcements",
          "community_comments",
        ].includes(entity)
      )
        return { error: "Deletion is not supported here." };
      check(
        await client
          .from(entity)
          .delete()
          .eq("id", z.uuid().parse(string(form, "id"))),
      );
    } else if (action === "student") {
      const student = z.uuid().parse(string(form, "id"));
      if (student === user.id)
        return {
          error: "You cannot change your own administrator status here.",
        };
      check(
        await client
          .from("profiles")
          .update({
            name: z.string().min(2).max(200).parse(string(form, "name")),
            mobile: z.string().max(25).parse(string(form, "mobile")),
            active: string(form, "active") === "on",
          })
          .eq("id", student)
          .eq("role", "student"),
      );
    } else if (action === "delete-student") {
      const student = z.uuid().parse(string(form, "id"));
      const { data: target } = await client
        .from("profiles")
        .select("role")
        .eq("id", student)
        .single();
      if (target?.role !== "student")
        return { error: "Only student accounts can be deleted." };
      check(await service().auth.admin.deleteUser(student));
    } else if (action === "invite") {
      const email = z.email().parse(string(form, "email")),
        name = z.string().min(2).max(200).parse(string(form, "name")),
        mobile = z
          .string()
          .regex(/^\+?[0-9 ]{10,20}$/)
          .parse(string(form, "mobile"));
      const requested = schemas.enrollments.parse({
        ...Object.fromEntries(form),
        user_id: "00000000-0000-4000-8000-000000000000",
      });
      const admin = service();
      const result = await admin.auth.admin.inviteUserByEmail(email, {
        data: { name, mobile },
        redirectTo:
          (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") +
          "/auth/callback?next=/profile",
      });
      check(result);
      if (result.data.user) {
        form.set("user_id", result.data.user.id);
        const enrollment = schemas.enrollments.safeParse({
          ...requested,
          user_id: result.data.user.id,
        });
        if (enrollment.success) {
          const saved = await client
            .from("enrollments")
            .upsert(enrollment.data, { onConflict: "user_id,course_id" });
          if (saved.error)
            return {
              error:
                "Student invitation sent, but access was not saved. Open Students to grant access.",
            };
        } else
          return {
            error:
              "Student invitation sent. Open Students to assign a valid course and validity.",
          };
      }
    } else if (action === "reply")
      check(
        await client
          .from("doubt_replies")
          .insert({
            author_id: user.id,
            doubt_id: z.uuid().parse(string(form, "doubt_id")),
            body: z
              .string()
              .trim()
              .min(1)
              .max(12000)
              .parse(string(form, "body")),
          }),
      );
    else if (action === "close-doubt")
      check(
        await client
          .from("doubts")
          .update({ status: "closed" })
          .eq("id", z.uuid().parse(string(form, "id"))),
      );
    else if (action === "notify")
      check(
        await client
          .from("notifications")
          .insert({
            user_id: z.uuid().parse(string(form, "user_id")),
            title: z.string().min(1).max(200).parse(string(form, "title")),
            body: z.string().max(12000).parse(string(form, "body")),
          }),
      );
    else return { error: "Unknown action." };
    revalidatePath("/", "layout");
    return {
      success:
        action === "invite"
          ? "Invitation sent and course access saved."
          : "Changes saved.",
    };
  } catch (error) {
    return failure(error);
  }
}

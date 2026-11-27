"use server";

import { createHash, randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { appOrigin } from "@/lib/app-origin";
import { mailConfigured, sendPasswordReset } from "@/lib/mail";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { clearSession, getSession, setSession } from "@/lib/session";

const credentials = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  email: z.email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirm: z.string(),
});

export type AuthState = { error: string; sent?: boolean; saved?: boolean; href?: string };

export async function registerBusiness(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  if (parsed.data.password !== parsed.data.confirm) return { error: "Passwords do not match." };

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists." };

  const businessName = String(formData.get("businessName") ?? "").trim();
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await hashPassword(parsed.data.password),
      role: "business",
      businessName: businessName || null,
      subscriptionPlan: "free",
      subscriptionStatus: "inactive",
    },
  });

  await setSession({ id: user.id, email: user.email, name: user.name, role: "business" });
  return { error: "", href: "/dashboard" };
}

export async function registerAthlete(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  if (parsed.data.password !== parsed.data.confirm) return { error: "Passwords do not match." };

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists." };

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await hashPassword(parsed.data.password),
      role: "athlete",
      sport: String(formData.get("sport") ?? "").trim() || null,
      school: String(formData.get("school") ?? "").trim() || null,
      profileToken: randomBytes(16).toString("hex"),
    },
  });

  await setSession({ id: user.id, email: user.email, name: user.name, role: "athlete" });
  return { error: "", href: "/athlete/dashboard" };
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const expected = formData.get("role") === "athlete" ? "athlete" : "business";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Those credentials do not match our records." };
  }
  if (!user.isActive) return { error: "This account is inactive." };
  if (user.role !== expected && !(expected === "business" && user.role === "admin")) {
    return {
      error:
        expected === "athlete"
          ? "This email is a business account. Use business sign in."
          : "This email is an athlete account. Use athlete sign in.",
    };
  }

  const role = user.role === "admin" ? "admin" : expected;
  await setSession({ id: user.id, email: user.email, name: user.name, role });
  const next = role === "business" ? safeNext(formData.get("next")) : null;
  const href = next ?? (role === "athlete" ? "/athlete/dashboard" : role === "admin" ? "/admin" : "/dashboard");
  return { error: "", href };
}

function safeNext(value: FormDataEntryValue | null) {
  const path = String(value ?? "");
  if (!path.startsWith("/dashboard") || path.startsWith("//") || path.includes("\\")) return null;
  return path;
}

export async function changePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const session = await getSession();
  if (!session) return { error: "Sign in again." };
  if (session.impersonatorId) return { error: "Return to your own account before changing this password." };
  const current = String(formData.get("current") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user || !(await verifyPassword(current, user.passwordHash))) return { error: "The current password is wrong." };
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } });
  await prisma.passwordReset.deleteMany({ where: { userId: user.id } });
  return { error: "", saved: true };
}

export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!mailConfigured()) return { error: "Password reset email is not set up on this server yet." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const athlete = formData.get("role") === "athlete";
  if (!z.email().safeParse(email).success) return { error: "Enter a valid email." };
  const user = await prisma.user.findUnique({ where: { email } });
  const matches = user && user.isActive && (athlete ? user.role === "athlete" : user.role === "business" || user.role === "admin");
  if (matches && user) {
    const recent = await prisma.passwordReset.findFirst({
      where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 60_000) } },
    });
    if (!recent) {
      const token = randomBytes(32).toString("hex");
      await prisma.passwordReset.deleteMany({ where: { userId: user.id } });
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          tokenHash: createHash("sha256").update(token).digest("hex"),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      });
      const link = `${await appOrigin()}/reset-password?token=${token}`;
      const sent = await sendPasswordReset(user.email, link, user.name);
      if (!sent.ok) {
        await prisma.passwordReset.deleteMany({ where: { userId: user.id } });
        return { error: sent.reason || "The reset email could not be sent. Try again." };
      }
    }
  }
  return { error: "", sent: true };
}

export async function resetPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };
  const row = token
    ? await prisma.passwordReset.findUnique({ where: { tokenHash: createHash("sha256").update(token).digest("hex") }, include: { user: true } })
    : null;
  if (!row || row.expiresAt.getTime() < Date.now()) return { error: "This reset link is invalid or expired." };
  await prisma.user.update({ where: { id: row.userId }, data: { passwordHash: await hashPassword(password) } });
  await prisma.passwordReset.deleteMany({ where: { userId: row.userId } });
  const login = row.user.role === "athlete" ? "/athlete/login" : "/login";
  redirect(`${login}?reset=1`);
}

export async function logout() {
  await clearSession();
  redirect("/");
}

export async function requireUser(role: "business" | "athlete" | "admin") {
  const session = await getSession();
  if (!session) redirect(role === "athlete" ? "/athlete/login" : "/login");
  if (role === "admin" && session.role !== "admin") {
    redirect(session.role === "athlete" ? "/athlete/dashboard" : "/dashboard");
  }
  if (role === "business" && session.role === "athlete") redirect("/athlete/dashboard");
  if (role === "business" && session.role === "admin") redirect("/admin");
  if (role === "athlete" && session.role !== "athlete") {
    redirect(session.role === "admin" ? "/admin" : "/dashboard");
  }
  return session;
}

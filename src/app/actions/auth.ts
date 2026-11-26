"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { clearSession, getSession, setSession } from "@/lib/session";

const credentials = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  email: z.email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirm: z.string(),
});

export type AuthState = { error: string };

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
  redirect("/dashboard");
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
    },
  });

  await setSession({ id: user.id, email: user.email, name: user.name, role: "athlete" });
  redirect("/athlete/dashboard");
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
  redirect(role === "athlete" ? "/athlete/dashboard" : "/dashboard");
}

export async function logout() {
  await clearSession();
  redirect("/");
}

export async function requireUser(role: "business" | "athlete") {
  const session = await getSession();
  if (!session) redirect(role === "athlete" ? "/athlete/login" : "/login");
  if (role === "business" && session.role === "athlete") redirect("/athlete/dashboard");
  if (role === "athlete" && session.role !== "athlete") redirect("/dashboard");
  return session;
}

import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "athletegum_session";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "business" | "athlete" | "admin";
};

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secretKey());
}

export async function readSession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const role = payload.role;
    if (
      typeof payload.id !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      (role !== "business" && role !== "athlete" && role !== "admin")
    ) {
      return null;
    }
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role,
    };
  } catch {
    return null;
  }
}

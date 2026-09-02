import prisma from "../config/prisma";
import googleClient from "../config/google";
import { signInToken, signRefreshToken } from "../utils/jwt.utils";

const userSelect = {
  id: true,
  email: true,
  googleId: true,
  name: true,
  avatarUrl: true,
  role: true,
  isOnboarded: true,
} as const;

async function loginWithGoogle(credentials: string) {
  try {
    if (!credentials) {
      throw new Error("Google credentials are required");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credentials,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("Payload:", payload)
    if (!payload?.email || !payload.sub) {
      throw new Error("Invalid Google payload");
    }

    let user = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
      select: userSelect,
    });
    console.log("User:", user)
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          googleId: payload.sub,
          name: payload.name ?? null,
          avatarUrl: payload.picture ?? null,
        },
        select: userSelect,
      });
    }

    const accessToken = signInToken({
      userData: user,
    });

    const refreshToken = signRefreshToken({
      userData: user,
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  } catch (error) {
    console.error("Google login error:", error);

    if (error instanceof Error) {
      throw new Error(`Google login failed: ${error.message}`);
    }

    throw new Error("Google login failed");
  }
}

export default {
  loginWithGoogle,
};


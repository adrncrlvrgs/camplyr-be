import prisma from "../config/prisma";
import googleClient from "../config/google";
import bcrypt from "bcryptjs";
//import excludeKeys from "../utils/dataExclution.utils";
import { signInToken, signRefreshToken } from "../utils/jwt.utils";

async function loginWithGoogle(credentials: any) {
  console.log("Received credentials:", credentials); // Debugging log
  const ticket = await googleClient.verifyIdToken({
    idToken: credentials,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email || !payload.sub)
    throw new Error(" Invalid Google payload");

  let user = await prisma.user.findUnique({
    where: { email: payload.email },
    select: {
      id: true,
      email: true,
      googleId: true,
      name: true,
      avatarUrl: true,
      role: true,
      isOnboarded: true,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: payload.email,
        googleId: payload.sub,
        name: payload.name,
        avatarUrl: payload.picture,
      },
      select: {
        id: true,
        email: true,
        googleId: true,
        name: true,
        avatarUrl: true,
        role: true,
        isOnboarded: true,
      },
    });
  }

  // console.log(user);

  const accessToken = signInToken({ userData: user });
  const refreshToken = signRefreshToken({ userData: user });

  console.log(accessToken);

  return { accessToken, refreshToken, user };
}

export default { loginWithGoogle };

import prisma from "../config/prisma";
import googleClient from "../config/google";
import bcrypt from "bcryptjs";
import excludeKeys from "../utils/dataExclution.utils";
import { signInToken, signRefreshToken } from "../utils/jwt.utils";

async function login(userName: string, password: string) {
  const user = await prisma.user.findUnique({ where: { userName } });
  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!user || !user.passwordHash) throw new Error("Invalid Credentials");
  if (!isValid) throw new Error("Invalid Credentials");

  const finalData = excludeKeys(user, ["passwordHash"]);
  const accessToken = signInToken({ userData: finalData });
  const refreshToken = signRefreshToken({ userData: finalData });

  return { accessToken, refreshToken };
}

async function loginWithGoogle(credentials: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken: credentials,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email) throw new Error(" Invalid Google payload");

  const user = await prisma.user.upsert({
    where: { email: payload.email },
    update: { name: payload.name ?? "" },
    create: { email: payload.email ?? "", name: payload.name ?? "" },
  });

  const finalData = excludeKeys(user, ["passwordHash"]);
  const accessToken = signInToken({ userData: finalData });
  const refreshToken = signRefreshToken({ userData: finalData });

  return { accessToken, refreshToken };
}

export default { login, loginWithGoogle };

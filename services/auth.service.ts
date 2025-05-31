import prisma from "../config/prisma";
import googleClient from "../config/google";
import { signIn } from "../utils/jwt.utils";

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

  const token = signIn({ userId: user.id });

  return token;
}

export default { loginWithGoogle };

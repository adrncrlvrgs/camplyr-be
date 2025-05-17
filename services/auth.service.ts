import prisma from "../prisma/client";
import googleClient from "../config/google";

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
}

import prisma from "../config/prisma";
import googleClient from "../config/google";
import bcrypt from "bcryptjs";
import excludeKeys from "../utils/dataExclution.utils";
import { signInToken, signRefreshToken } from "../utils/jwt.utils";

// not sure yet, maybe stick to google login

// async function login(userName: string, password: string) {
//   const user = await prisma.user.findUnique({ where: { userName } });
//   // const isValid = await bcrypt.compare(password, user.passwordHash); // passible null no yet "hashed" password

//   if (!user || !user.passwordHash) throw new Error("Invalid Credentials");
//   if (!user) throw new Error("Invalid Credentials");

//   const finalData = excludeKeys(user, ["passwordHash"]);
//   const accessToken = signInToken({ userData: finalData });
//   const refreshToken = signRefreshToken({ userData: finalData });

//   return { accessToken, refreshToken };
// }

async function loginWithGoogle(credentials: string) {
  console.log("Received credentials:", credentials); // Debugging log
  const ticket = await googleClient.verifyIdToken({
    idToken: credentials,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email) throw new Error(" Invalid Google payload");

  // if existing user just login and get data. or else create new fresh
  let userCredentials : any; // need specify the objects that needed
  if(payload.email){
      const findExistingUser = await prisma.user.findUnique({
          where: { email: payload.email }
      });
      userCredentials = findExistingUser;
  }else{
      userCredentials = await prisma.user.create({
          data: {
              email: payload.email ?? "",
              name: payload.name ?? ""
          }
      });
  }


  // const user = await prisma.user.upsert({
  //   where: { email: payload.email },
  //   update: { name: payload.name ?? "" },
  //   create: { email: payload.email ?? "", name: payload.name ?? "" }, // other credential
  // });

  const finalData = excludeKeys(userCredentials, ["passwordHash"]);
  const accessToken = signInToken({ userData: finalData });
  const refreshToken = signRefreshToken({ userData: finalData });

  return { accessToken, refreshToken };
}

export default { loginWithGoogle };

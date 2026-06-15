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

async function loginWithGoogle(credentials: any) {
  //console.log("Received credentials:", credentials); // Debugging log
  const ticket = await googleClient.verifyIdToken({
    idToken: credentials,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email || !payload.sub) throw new Error(" Invalid Google payload");

  // let userCredentials : object | null; 
 
  // if(payload?.email){ // check if user exist
  //     const findExistingUser = await prisma.user.findUnique({
  //         where: { email: payload.email }
  //     });
  //     userCredentials = findExistingUser;
  // }else{
  //     userCredentials = await prisma.user.create({
  //         data: {
  //            googleId: payload.sub,
  //            email: payload.email,
  //            name: payload.name 
  //         }
  //     });
 
  // }

  // let user = await prisma.user.findUnique({
  //   where: { email: payload.email },
  //   select:{
  //     id: true,
  //     email: true,
  //     googleId: true,
  //     name: true,
  //     avatarUrl: true,
  //     role: true,
  //     isOnboarded: true,
  //   },
  // });

  // if (!user) {
  //   user = await prisma.user.create({
  //     data: {
  //       email: payload.email,
  //       googleId: payload.sub,
  //       name: payload.name,
  //       avatarUrl: payload.picture,
  //     },
  //     select: {
  //       id: true,
  //       email: true,
  //       googleId: true,
  //       name: true,
  //       avatarUrl: true,
  //       role: true,
  //       isOnboarded: true,
  //     },
  //   });
  // }


  // console.log(user);



const data = {
    email: "example@example.com",
    name: "Example User"
};

//   const finalData = excludeKeys(payload, ["passwordHash"]);
  const accessToken = signInToken({ userData: data });
  const refreshToken = signRefreshToken({ userData: data });

//   console.log(accessToken);

  return { accessToken, refreshToken};
}

export default { loginWithGoogle };

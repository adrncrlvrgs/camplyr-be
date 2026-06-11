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
  console.log(payload?.email);

  if (!payload || !payload.email) throw new Error(" Invalid Google payload");

//   let userCredentials : any; 
//   console.log(userCredentials);
//   if(payload?.email){
//       const findExistingUser = await prisma.user.findUnique({
//           where: { email: payload.email }
//       });
//       console.log(findExistingUser);
//       userCredentials = findExistingUser;
//       console.log(userCredentials);
//   }else{
//       userCredentials = await prisma.user.create({
//           data: {
//               email: payload.email ?? "",
//               name: payload.name ?? ""
//           }
//       });
//       console.log(userCredentials);
//   }
//   console.log(userCredentials);


const data = {
    email: "example@example.com",
    name: "Example User"
};

//   const finalData = excludeKeys(payload, ["passwordHash"]);
  const accessToken = signInToken({ userData: data });
  const refreshToken = signRefreshToken({ userData: data });

  console.log(data);

  return { accessToken, refreshToken};
}

export default { loginWithGoogle };

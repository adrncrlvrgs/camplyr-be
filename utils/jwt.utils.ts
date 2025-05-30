import jwt from "jsonwebtoken";

export const signIn = (payload: object) =>
  jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });

export const verify = (token: string) =>
  jwt.verify(token, process.env.JWT_SECRET!);

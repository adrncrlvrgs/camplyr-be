import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES = "15m";
const REFRESH_TOKEN_EXPIRES = "7d";
const JWT_SECRET = process.env.JWT_SECRET!;
interface JwtPayload {
  userData: object;
}

export const signInToken = (payload: JwtPayload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });

export const verifyToken = (token: string) =>
  jwt.verify(token, JWT_SECRET) as JwtPayload;

export const signRefreshToken = (payload: JwtPayload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, JWT_SECRET) as JwtPayload;

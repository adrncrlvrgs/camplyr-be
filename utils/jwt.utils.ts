import jwt from "jsonwebtoken";

export const signin = (payload: object) =>
  jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });

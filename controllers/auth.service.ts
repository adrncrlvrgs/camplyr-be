import { Request, Response } from "express";
import authService from "../services/auth.service";

export const googleLogin = async (req: Request, res: Response) => {
  const { credentials } = req.body;

  if (!credentials) res.status(400).json({ message: "No Credentials" });

  try {
    const token = await authService.loginWithGoogle(credentials);
    res.json({ token });
  } catch (e) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

import { Request, Response } from "express";
import authService from "../services/auth.service";

export const googleLogin = async (req: Request, res: Response) => {
  const { credentials } = req.body;

  if (!credentials) res.status(400).json({ message: "No Credentials" });

  try {
    const { accessToken, refreshToken, user} = await authService.loginWithGoogle(credentials);
    res.cookie("token", accessToken, {
      httpOnly: true,
      // secure: true,
      sameSite: "lax",
    });
    res.status(200).json({ 
      message: "Login successful",
      userData: user 
    });

  } catch (e) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

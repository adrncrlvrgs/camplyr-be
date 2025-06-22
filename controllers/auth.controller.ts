import { Request, Response } from "express";
import authService from "../services/auth.service";

export const login = async (req: Request, res: Response) => {
  try {
    const { userName, password } = req.body;
    const tokens = await authService.login(userName, password);

    res.cookie("token", tokens.accessToken, {
      httpOnly: true,
      // secure: true,
      sameSite: "lax",
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      // secure: true,
      sameSite: "lax",
      path: "/api/auth/refresh",
    });

    res.json({ message: "Log successfully " });
  } catch (err) {
    res.status(401).json({ error: "Invalid credentials" });
  }
};

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

// export const test = async (req: Request, res: Response) => {
//   // const { credentials } = req.body;

//   // if (!credentials) res.status(400).json({ message: "No Credentials" });

//   try {
//     const test = await authService.test();
//     res.json(test);
//   } catch (e) {
//     res.status(401).json({ message: "test failed" });
//   }
// };

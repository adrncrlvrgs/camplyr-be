import { Request, Response } from "express";
import authService from "../services/auth.service";
import { signInToken, verifyRefreshToken} from "../utils/jwt.utils";

export const googleLogin = async (req: Request, res: Response) => {
  const { credentials } = req.body;

  if (!credentials) res.status(400).json({ message: "No Credentials" });

  try {
    const { accessToken, refreshToken, user } = await authService.loginWithGoogle(credentials);
    res.cookie("token", accessToken, {
      httpOnly: true,
      // secure: true,
      sameSite: "lax",
      maxAge: 15 * 50 * 1000, // 15 mins
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // secure: true,
      sameSite: "lax",
      // path: "/api/v1/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json({
      message: "Login successful",
      userData: user,
    });
  } catch (e) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const getUser = async (req: Request, res: Response) =>{
  res.status(200).json({userData: req.user})
};

export const refresh = async (req: Request, res: Response) => {
   const refreshToken = req.cookies?.refreshToken

  if (!refreshToken) res.status(400).json({ message: "No Refresh tokem" });

  try{
    if(refreshToken){
      const decoded =  verifyRefreshToken(refreshToken);
      const newToken = signInToken({ userData: decoded.userData} );

      res.cookie("token", newToken,{
      httpOnly: true,
      // secure: true,
      sameSite: "lax",
      maxAge: 15 * 50 * 1000, // 15 mins
      })
    }
  }catch (error) {
    return res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
}

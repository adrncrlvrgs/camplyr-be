import express from "express";
import authRoutes from "../routes/auth.routes";
import onboardRoutes from "../routes/onboard.routes"

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/onboard", onboardRoutes);

export default router;

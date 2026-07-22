import express from "express";
import authRoutes from "../routes/auth.routes";
import onboardRoutes from "../routes/onboard.routes"
import postRoutes from "../routes/post.routes"

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/onboard", onboardRoutes);
router.use("/post", postRoutes)

export default router;

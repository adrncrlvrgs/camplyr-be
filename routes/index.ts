import express from "express";
import authRoutes from "../routes/auth.routes";
import onboardRoutes from "../routes/onboard.routes"
import postRoutes from "../routes/post.routes"
import jobRoutes from "../routes/job.routes"

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/onboard", onboardRoutes);
router.use("/post", postRoutes)
router.use("/job",jobRoutes )

export default router;

import express from "express";
import { googleLogin, test } from "../controllers/auth.controller";

const router = express.Router();

router.post("/google", googleLogin);
router.get("/test", test);

export default router;

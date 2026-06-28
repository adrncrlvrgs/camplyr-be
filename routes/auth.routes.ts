import express from "express";
import { googleLogin, getUser} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/google", googleLogin);
router.get("/userProfile", requireAuth, getUser);
// router.get("/test", test);

export default router;

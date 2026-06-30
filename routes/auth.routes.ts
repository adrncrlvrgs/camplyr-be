import express from "express";
import { googleLogin, getUser, refresh,logout} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/google", googleLogin);
router.get("/userProfile", requireAuth, getUser);
router.post("/refresh", refresh);
router.post("/logout", logout);
// router.get("/test", test);

export default router;

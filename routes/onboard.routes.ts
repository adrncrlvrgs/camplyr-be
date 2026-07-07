import express from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { seekerOnboardingSchema } from "../utils/validation/schema.validation";
import { updateOnboarding } from "../controllers/onboard.controller";

const router = express.Router();

router.patch("/seeker", requireAuth, validateBody(seekerOnboardingSchema), updateOnboarding);

export default router;
import express from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { seekerOnboardingSchema, recruiterOnboardSchema } from "../utils/validation/schema.validation";
import { seekerOnboarding, recruiterOnboarding } from "../controllers/onboard.controller";

const router = express.Router();

router.patch("/seeker", requireAuth, validateBody(seekerOnboardingSchema), seekerOnboarding);
router.patch("/recruiter", requireAuth, validateBody(recruiterOnboardSchema), recruiterOnboarding)

export default router;
import express from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import {
  createApplicationSchema,
  updateApplicationStatus,
} from "../utils/validation/schema.validation";
import {
  applyToJob,
  getSeekerApplications,
  getJobApplications,
  updateApplicationStatus as updateStatus,
  withdrawApplication,
} from "../controllers/application.controller";

const router = express.Router();

router.post("/apply/:jobId", requireAuth, validateBody(createApplicationSchema), applyToJob);
router.get("/me", requireAuth, getSeekerApplications);
router.get("/job/:jobId", requireAuth, getJobApplications);
router.patch(
  "/:applicationId/status",
  requireAuth,
  validateBody(updateApplicationStatus),
  updateStatus
);
router.delete("/:applicationId", requireAuth, withdrawApplication);

export default router;
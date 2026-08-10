import express from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { createJob } from "../utils/validation/schema.validation";
// import { createJob } from "../controllers/job.controller";

const router = express.Router();

//router.post("/addJob", requireAuth, validateBody(postSchema), createPost);

export default router;
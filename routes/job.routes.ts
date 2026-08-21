import express from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { createJob } from "../utils/validation/schema.validation";
import { createJob  as addJob} from "../controllers/job.controller";
// import { createJob } from "../controllers/job.controller";

const router = express.Router();

router.post("/addJob", requireAuth, validateBody(createJob), addJob);

export default router;
import express from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { postSchema } from "../utils/validation/schema.validation";
import { createPost } from "../controllers/post.controller";

const router = express.Router();

router.post("/addPost", requireAuth, validateBody(postSchema), createPost);

export default router;
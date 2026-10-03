import express from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { postSchema, paginationQuerySchema } from "../utils/validation/schema.validation";
import { createPost, getAllPost } from "../controllers/post.controller";

const router = express.Router();

router.post("/addPost", requireAuth, validateBody(postSchema), createPost);
router.get("/getAllPost",  getAllPost)

export default router;
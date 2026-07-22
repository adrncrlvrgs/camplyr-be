import { Request, Response } from "express";
import { PostInput } from "../utils/validation/schema.validation";
import { postService } from "../services/post.service";

export async function createPost(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        message: "Unauthorized",
      });

      return;
    }

    const data = req.body as PostInput;

    const addPost = await postService.createPost(userId, data);

    res.status(200).json({
      message: "Post created",
      postData: addPost,
    });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Failed to add post",
    });

    return;
  }
}

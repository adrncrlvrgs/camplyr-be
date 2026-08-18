import { Request, Response } from "express";
import { CreateJobInput } from "../utils/validation/schema.validation";
import { jobService } from "../services/job.service";

export async function createJob(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        message: "Unauthorized",
      });

      return;
    }

    const data = req.body as CreateJobInput;
    const addJob = await jobService.createJob(userId, data);
    res.status(200).json({
      message: "Job created",
      postData: addJob,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add job",
    });

    return;
  }
}

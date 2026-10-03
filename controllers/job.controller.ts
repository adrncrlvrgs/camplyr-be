import { Request, Response } from "express";
import {
  CreateJobInput,
  jobSchema,
} from "../utils/validation/schema.validation";
import { jobService } from "../services/job.service";

export async function createJob(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
 
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
 
    const data = jobSchema.safeParse(req.body);
    console.log(data.data)
    if (!data.success) {
      res.status(400).json({
        message: "Invalid job data",
        errors: data.error.flatten(),
      });
      return;
    }
 
    // The service resolves the recruiter's company from userId.
    const job = await jobService.createJob(userId, data.data);
 
    res.status(201).json({
      message: "Job created",
      data: job,
    });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Failed to create job",
    });
    return;
  }
}

export async function getAllJobs(req: Request, res: Response) {
  try {
    const jobs = await jobService.getAllJobs();
    res.status(200).json({
      message: "Jobs retrieved",
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get all job",
    });

    return;
  }
}

export async function getJobById(req: Request, res: Response) {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      res.status(400).json({
        message: "Job id is required",
      });
      return;
    }

    const job = await jobService.getJobById(jobId);

    res.status(200).json({
      message: "Job retrieved",
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get all job",
    });

    return;
  }
}

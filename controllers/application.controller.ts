import { Request, Response } from "express";
import {
  CreateApplicationInput,
  UpdateApplicationStatusInput,
} from "../utils/validation/schema.validation";
import { applicationService } from "../services/application.service";

const KNOWN_ERROR_STATUS: Record<string, number> = {
  "Job not found": 404,
  "Application not found": 404,
  "This job is not accepting applications": 400,
  "You have already applied to this job": 409,
  "Recruiter is not associated with a company": 403,
};

function handleServiceError(
  res: Response,
  error: unknown,
  fallbackMessage: string,
) {
  const message = error instanceof Error ? error.message : undefined;
  const status = (message && KNOWN_ERROR_STATUS[message]) || 500;

  res.status(status).json({
    message: status === 500 ? fallbackMessage : message,
  });
}

export async function applyToJob(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        message: "Unauthorized",
      });

      return;
    }

    const { jobId } = req.params;

    if (!jobId) {
      res.status(400).json({
        message: "Job id is required",
      });

      return;
    }

    const data = req.body as CreateApplicationInput;
    const application = await applicationService.applyToJob(
      userId,
      jobId,
      data,
    );

    res.status(200).json({
      message: "Application submitted",
      data: application,
    });
  } catch (error) {
    handleServiceError(res, error, "Failed to submit application");
    return;
  }
}

export async function getSeekerApplications(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        message: "Unauthorize",
      });

      return;
    }

    const applications = await applicationService.getSeekerApplications(userId);
    res.status(200).json({
      message: "Applications retrieved",
      data: applications,
    });
  } catch (error) {
    handleServiceError(res, error, "Failed to retrieve applications");
    return;
  }
}

export async function getJobApplications(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        message: "Unauthorize",
      });

      return;
    }
    const { jobId } = req.params;

    if (!jobId) {
      res.status(400).json({
        message: "Job id is required",
      });
      return;
    }

    const applications = await applicationService.getJobApplications(
      userId,
      jobId,
    );

    res.status(200).json({
      message: "Applications retrieved",
      data: applications,
    });
  } catch (error) {
    handleServiceError(res, error, "Failed to retrieve applications");
    return;
  }
}

export async function updateApplicationStatus(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        message: "Unauthorize",
      });

      return;
    }

    const { applicationId } = req.params;
    if (!applicationId) {
      res.status(400).json({
        message: "Application id is required",
      });

      return;
    }

    const { status } = req.body as UpdateApplicationStatusInput;
    if (!status) {
      res.status(400).json({
        message: "Status is required",
      });

      return;
    }

    const application = await applicationService.updateApplicationStatus(
      userId,
      applicationId,
      status,
    );
    res.status(200).json({
      message: "Application status updated",
      data: application,
    });
  } catch (error) {
    handleServiceError(res, error, "Failed to update application status");
    return;
  }
}

export async function withdrawApplication(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        message: "Unauthorize",
      });

      return;
    }

    const { applicationId } = req.params;
    if (!applicationId) {
      res.status(400).json({
        message: "Application id is required",
      });

      return;
    }

    await applicationService.withdrawApplication(userId, applicationId);
  } catch (error) {
    handleServiceError(res, error, "Failed to withdraw application");
    return;
  }
}

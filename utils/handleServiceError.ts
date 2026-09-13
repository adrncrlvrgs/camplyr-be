import { Request, Response } from "express";


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
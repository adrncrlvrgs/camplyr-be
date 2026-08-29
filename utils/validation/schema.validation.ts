import { z } from "zod";
import { JobStatus } from "@prisma/client";
import { ApplicationStatus } from "@prisma/client";

export const seekerOnboardingSchema = z.object({
  role: z.literal("SEEKER"),
  headline: z.string().trim().min(2, "Headline is required"),
  location: z.string().trim().min(2, "Location is required"),
  bio: z.string().trim().min(10, "Bio must be at least 10 characters"),
  skills: z
    .array(z.string().trim().min(1, "Skill cannot be empty"))
    .min(1, "At least one skill is required"),
});

export type SeekerOnboardingInput = z.infer<typeof seekerOnboardingSchema>;

export const recruiterOnboardSchema = z.object({
  role: z.literal("RECRUITER"),
  position: z.string().trim().min(2, "Position is required"),
  companyName: z.string().trim().min(2, "Company Name is required"),
  website: z.string().trim().min(2, "Website is required"),
  location: z.string().trim().min(2, "Location is required"),
  description: z.string().trim().min(2, "Description is required"),
});

export type RecruiterOnboardingInput = z.infer<typeof recruiterOnboardSchema>;


export const postSchema = z.object({
  content: z.string().trim().min(1, "Post content is required").max(5000, "Post is too long"),
  imageUrl: z.string().trim().url("Invalid image URL").optional().or(z.literal(""))
})

export type PostInput = z.infer<typeof postSchema>;

export const createJob = z.object({
  title: z.string().trim().min(2, "Company Name is required"),
  location: z.string().trim().optional(),
  description: z.string().trim().min(2, "Description is required"),
  salaryMin: z.number().int().nonnegative().optional(),
  salaryMax: z.number().int().nonnegative().optional(),
  status: z.enum(JobStatus),
});

export type CreateJobInput = z.infer<typeof createJob>;


export const createApplicationSchema = z.object({
  coverLetter: z.string().optional(),
  resumeUrl: z.string().url().optional()
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

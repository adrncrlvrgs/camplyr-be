import { z } from "zod";

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
  location: z.string().trim().min(2, "Website is required"),
  description: z.string().trim().min(2, "Website is required"),
});

export type RecruiterOnboardingInput = z.infer<typeof recruiterOnboardSchema>;

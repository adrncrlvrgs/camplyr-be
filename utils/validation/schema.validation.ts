import { z } from "zod";
import { application_status, job_status } from "../../src/generated/prisma/enums";


export const QUESTION_TYPES = [
  "SHORT_TEXT",
  "LONG_TEXT",
  "SINGLE_CHOICE",
  "MULTI_CHOICE",
  "YES_NO",
  "NUMBER",
  "DATE",
] as const;
 
export const JOB_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "TEMPORARY",
] as const;

const isChoice = (t: (typeof QUESTION_TYPES)[number]) =>
  t === "SINGLE_CHOICE" || t === "MULTI_CHOICE";
 
// A job can be created as a draft or published right away.
export const JOB_STATUSES = ["DRAFT", "OPEN"] as const;
 
const salary = z.number().int().min(0).max(2_000_000_000).nullish();
 
// Unknown keys (e.g. the client-only `id`) are stripped by default.
export const jobQuestionSchema = z
  .object({
    label: z.string().trim().min(3).max(200),
    type: z.enum(QUESTION_TYPES),
    required: z.boolean().default(true),
    options: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
  })
  .superRefine((q, ctx) => {
    if (!isChoice(q.type)) return;
 
    if (q.options.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Choice questions need at least 2 options",
      });
    }
    if (new Set(q.options).size !== q.options.length) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Options must be unique",
      });
    }
  });

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
  content: z
    .string()
    .trim()
    .min(1, "Post content is required")
    .max(5000, "Post is too long"),
  imageUrl: z
    .string()
    .trim()
    .url("Invalid image URL")
    .optional()
    .or(z.literal("")),
});

export type PostInput = z.infer<typeof postSchema>;

export const jobSchema = z
  .object({
    title: z.string().trim().min(3).max(150),
    description: z.string().trim().min(20).max(10_000),
    location: z.string().trim().min(2).max(150),
    type: z.enum(JOB_TYPES).default("FULL_TIME"),
    status: z.enum(JOB_STATUSES).default("OPEN"),
    salaryMin: salary,
    salaryMax: salary,
    questions: z.array(jobQuestionSchema).max(10).default([]),
  })
  .refine(
    (d) => d.salaryMin == null || d.salaryMax == null || d.salaryMax >= d.salaryMin,
    { message: "Max salary must be greater than or equal to min salary", path: ["salaryMax"] }
  );

export type CreateJobInput = z.infer<typeof jobSchema>;
export { isChoice };

export const createApplicationSchema = z.object({
  coverLetter: z.string().optional(),
  resumeUrl: z.string().url().optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

export const updateApplicationStatus = z.object({
  status: z.nativeEnum(application_status)
});

export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatus>;


export const paginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>
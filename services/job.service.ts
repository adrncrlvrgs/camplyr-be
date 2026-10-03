import prisma from "../config/prisma";
import type { Prisma } from "../src/generated/prisma/client";
import { CreateJobInput, isChoice } from "../utils/validation/schema.validation";

function toStringArray(value: Prisma.JsonValue): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return [];
}

async function getRecruiterCompanyId(userId: string) {
  console.log("1. Getting recruiter profile for:", userId);

  const recruiter = await prisma.recruiterprofile.findUnique({
    where: { userId },
    select: { companyId: true },
  });

  console.log("2. Recruiter result:", recruiter);

  if (!recruiter?.companyId) {
    console.log("3. No company ID found");
    throw new Error("Recruiter is not associated with a company");
  }

  console.log("4. Company ID:", recruiter.companyId);

  return recruiter.companyId;
}

async function createJob(userId: string, data: CreateJobInput) {
  console.log("service data:", data);
  console.log("userId:", userId);

  const companyId = await getRecruiterCompanyId(userId);

  console.log("companyId returned:", companyId);

  return await prisma.job.create({
    data: {
      companyId,
      title: data.title,
      description: data.description,
      location: data.location,
      type: data.type,
      salaryMin: data.salaryMin ?? undefined,
      salaryMax: data.salaryMax ?? undefined,
      status: data.status,
      questions: {
        create: data.questions.map((q, index) => ({
          label: q.label,
          type: q.type,
          required: q.required,
          options: isChoice(q.type) ? q.options : undefined,
          sortOrder: index,
        })),
      },
    },
    include: {
      questions: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

async function getAllJobs() {
 const jobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      salaryMin: true,
      salaryMax: true,
      status: true,
      type: true,
      requirements: true,
      createdAt: true,
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
        },
      },
    },
  });

  return jobs.map((job) => ({
    ...job,
    requirements: toStringArray(job.requirements),
  }));
}

async function getJobById(jobId:string) {

  const job  = await prisma.job.findUnique({
    where:{id: jobId},
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      salaryMin: true,
      salaryMax: true,
      status: true,
      type: true,
      requirements: true,
      createdAt: true,
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
        },
      },
    },
  })

  if (!job) {
    throw new Error("Job not found");
  } else {
    return job;
  }
  
}

async function getCompanyJobs(userId: string) {
  const companyId = await getRecruiterCompanyId(userId);

  return await prisma.job.findMany({
    where: {
      companyId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      status: true,
      salaryMin: true,
      salaryMax: true,
      createdAt: true,
    },
  });
}

export const jobService = {
  createJob,
  getAllJobs,
  getJobById,
  getCompanyJobs,
};
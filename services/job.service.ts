import prisma from "../config/prisma";
import type { Prisma } from "../src/generated/prisma/client";
import { CreateJobInput } from "../utils/validation/schema.validation";

function toStringArray(value: Prisma.JsonValue): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return [];
}

async function getRecruiterCompanyId(userId: string) {
  const recruiter = await prisma.recruiterprofile.findUnique({
    where: { userId },
    select: { companyId: true },
  });

  if (!recruiter?.companyId) {
    throw new Error("Recruiter is not associated with a company");
  }

  return recruiter.companyId;
}

async function createJob(userId: string, data: CreateJobInput) {
  const companyId = await getRecruiterCompanyId(userId);

  return await prisma.job.create({
    data: {
      companyId,
      title: data.title,
      description: data.description,
      location: data.location,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      status: data.status,
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
  getCompanyJobs,
};
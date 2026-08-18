import prisma from "../config/prisma";
import { CreateJobInput } from "../utils/validation/schema.validation";

async function createJob(userId: string, data: CreateJobInput) {
  const recruiter = await prisma.recruiterProfile.findUnique({
    where: {
      id: userId,
    },
    select: {
      companyId: true,
    },
  });

  if (!recruiter?.companyId) {
    throw new Error("Recruiter is not associated with a company");
  }
  return await prisma.job.create({
    data: {
      companyId: recruiter.companyId,
      title: data.title,
      description: data.description,
      location: data.location,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      status: data.status,
    },
  });
}

async function getJobs() {
  // get all
  return await prisma.job.findMany({
    where: {
      status: "OPEN",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      salaryMin: true,
      salaryMax: true,
      createdAt: true,

      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          location: true,
        },
      },
    },
  });
}

async function getCompanyJobs(userId: string) {
  const recruiter = await prisma.recruiterProfile.findUnique({
    where: {
      id: userId,
    },
    select: {
      companyId: true,
    },
  });

  if (!recruiter?.companyId) {
    throw new Error("Recruiter is not associated with a company");
  }

  
 return await prisma.job.findMany({
    where:{
        companyId: recruiter.companyId
    },
    orderBy:{
        createdAt: 'desc'
    },
    select:{
      id: true,
      title: true,
      description: true,
      location: true,
      status: true,
      salaryMin: true,
      salaryMax: true,
      createdAt: true,
    }
 })

}

export const jobService = {
  createJob,
  getJobs,
  getCompanyJobs
};

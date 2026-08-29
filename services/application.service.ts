import prisma from "../config/prisma";
import { Prisma, ApplicationStatus } from "@prisma/client";
//import create application Input validation schema
import { CreateApplicationInput } from "../utils/validation/schema.validation";

async function applyToJob(
  seekerId: string,
  jobId: string,
  data: CreateApplicationInput,
) {
  const job = await prisma.job.findUnique({
    where: {
      id: seekerId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.status !== "OPEN") {
    throw new Error("This job is not accepting applications");
  }

  try {
    return await prisma.application.create({
      data: {
        seekerId: seekerId,
        jobId,
        coverLetter: data.coverLetter,
        resumeUrl: data.resumeUrl,
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      throw new Error("You have already applied to this job");
    }
    throw err;
  }
}

// get seeker applications via seeker id

async function getSeekerApplications(seekerId: string) {
  return await prisma.application.findMany({
    where: { seekerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      coverLetter: true,
      resumeUrl: true,
      createdAt: true,
      job: {
        select: {
          id: true,
          title: true,
          location: true,
          status: true,
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  });
}

async function getJobApplications(userId: string, jobId: string) {
  //get recruiter
  // check recruiter if associated with company
  //get job
  //check job

  const recruiter = await prisma.recruiterProfile.findUnique({
    where: { userId },
    select: {
      companyId: true,
    },
  });

  if (!recruiter?.companyId) {
    throw new Error("Recruiter is not associated with a company");
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { companyId: true },
  });

  if (!job || job.companyId !== recruiter.companyId) {
    throw new Error("Job not found");
  }

  return await prisma.application.findMany({
    where: { jobId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      coverLetter: true,
      resumeUrl: true,
      createdAt: true,
      seeker: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          seekerProfile: {
            select: {
              headline: true,
              location: true,
              skills: true,
              resumeUrl: true,
            },
          },
        },
      },
    },
  });
}

// update application status
// getcompnayID via reqruiter
// check company id
//get application
//check application if it id for the company
//return the update

async function updateApplicationStatus(
  userId: string,
  applicationId: string,
  status: ApplicationStatus,
) {
  const recruiter = await prisma.recruiterProfile.findUnique({
    where: { userId },
    select: {
      companyId: true,
    },
  });

  if (!recruiter?.companyId) {
    throw new Error("Recruiter is not associated with a company");
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      job: {
        select: {
          companyId: true,
        },
      },
    },
  });

  if (!application || application.job.companyId !== recruiter.companyId) {
    throw new Error("Application not found");
  }

  return await prisma.application.update({
    where: { id: applicationId },
    data: {
      status,
    },
  });
}

// withdrawal application

async function withdrawApplication(seekerId: string, applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      seekerId: true,
    },
  });

  if (!application || application.seekerId !== seekerId) {
    throw new Error("Application not found");
  }

  return await prisma.application.delete({
    where: { id: applicationId },
  });
}

export const applicationService = {
  applyToJob,
  getSeekerApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
};

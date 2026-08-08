import prisma from "../config/prisma";
import { CreateJobInput } from "../utils/validation/schema.validation";

async function createJob(userId: string, data: CreateJobInput) {

    const recruiter = await prisma.recruiterProfile.findUnique({
        where:{
            id : userId
        },
        select:{
            companyId: true
        }
    });

    if(!recruiter?.companyId){
        throw new Error("Recruiter is not associated with a company")
    }
     return await prisma.job.create({
        data:{
            companyId: recruiter.companyId,
            title: data.title,
            description: data.description,
            location: data.location,
            salaryMin: data.salaryMin,
            salaryMax: data.salaryMax,
            status: data.status,    
        }
     });
}

export const postJob= {
    createJob
}
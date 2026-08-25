import prisma from "../config/prisma";
//import create application Input validation schema

async function applyToJob(seekerId:string, jobId:string,) { //data
    const job = await prisma.job.findUnique({
        where:{
            id: jobId
        }, select:{
            id: true,
            status: true
        }
    })

    if(!job){
        throw new Error("Job not found")
    }

    if(job.status !== "OPEN"){
        throw new Error("This job is not accepting applications")
    }
    
}
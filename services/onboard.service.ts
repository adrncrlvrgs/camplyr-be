import { create } from "domain";
import prisma from "../config/prisma";

import { SeekerOnboardingInput,RecruiterOnboardingInput } from "../utils/validation/schema.validation";
import { generateSlug } from "../utils/slug.utils";


async function updateSeekerOnboarding(userId:string, data: SeekerOnboardingInput) {
    const updateUser = await prisma.user.update({
        where:{
            id: userId
        },
        data:{
            role: data.role,
            isOnboarded: true,

            seekerProfile :{
                upsert: {
                    create: {
                        headline : data.headline,
                        location: data.location,
                        bio: data.bio,
                        skills :data.skills
                    },
                    update : {
                        headline : data.headline,
                        location: data.location,
                        bio: data.bio,
                        skills :data.skills
                    },
                },
            },
        },
        select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            role: true,
            isOnboarded: true,
            seekerProfile: true,
        },
    });

    return updateUser;
    
}

async function updateRecruitingOnboarding(userId:string, data: RecruiterOnboardingInput) {
    const updateUser = await prisma.user.update({
        where: {
            id : userId
        },
        data:{
            role: data.role,
            isOnboarded: true,

            recruiterProfile:{
                create: {
                    position: data.position,

                    company: {
                        create: {
                            name: data.companyName,
                            location: data.location,
                            website: data.website,
                            description: data.description,
                            slug: generateSlug(data.companyName)
                        }
                    }
                }
            }
        },
        select:{
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            role: true,
            isOnboarded: true,
            recruiterProfile: true,
        }
    });

    return updateUser
}


export const onboardingService = {
    updateSeekerOnboarding,
    updateRecruitingOnboarding
}
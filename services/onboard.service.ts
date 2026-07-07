import { create } from "domain";
import prisma from "../config/prisma";

import { SeekerOnboardingInput } from "../utils/validation/schema.validation";


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
                        skills :data.bio
                    },
                    update : {
                        headline : data.headline,
                        location: data.location,
                        bio: data.bio,
                        skills :data.bio
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

export const onboardingService = {
    updateSeekerOnboarding
}
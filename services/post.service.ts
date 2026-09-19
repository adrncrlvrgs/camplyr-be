import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";
import { PostInput } from "../utils/validation/schema.validation";

async function createPost(authorId: string, data: PostInput) {
    const addPost = await prisma.post.create({
        data:{
            authorId,
            content: data.content,
            imageUrl: data.imageUrl
        },
        include:{
            user:{
                select:{
                    id: true,
                    name: true,
                    username: true,
                    avatarUrl: true,
                    role: true,
                }
            }
        }
    })

    return addPost;
}

async function getAllPost() {
    const post = await prisma.post.findMany({
        orderBy: {createdAt: 'desc'},
        select:{
            id: true,
            content: true,
            imageUrl: true,
            createdAt: true,
            updatedAt: true,
            user:{
                select:{
                    id: true,
                    name: true,
                    username: true,
                    avatarUrl: true,
                    role: true,
                }
            }
        }
    })

    return post
}


export const postService= {
    createPost,
    getAllPost
}
import prisma from "../config/prisma";
import { PostInput } from "../utils/validation/schema.validation";

async function createPost(authorId: string, data: PostInput) {
    const addPost = await prisma.post.create({
        data:{
            authorId,
            content: data.content,
            imageUrl: data.imageUrl
        },
        include:{
            author:{
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


export const postService= {
    createPost
}
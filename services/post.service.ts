import prisma from "../config/prisma";
import { Prisma } from "../src/generated/prisma/client";
import { PaginationQuery, PostInput } from "../utils/validation/schema.validation";
import { encodeCursor, decoderCursor,PaginatedResponse  } from "../utils/pagination";

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

async function getAllPost({cursor, limit} : PaginationQuery): Promise<PaginatedResponse<any>> {

    const decodedId = cursor ? decoderCursor(cursor) : undefined;

    const post  = await prisma.post.findMany({
        take : limit + 1,
        ...(decodedId && {
            skip: 1,
            cursor: {id: decodedId}
        }),
        orderBy: [
            {createdAt: 'desc'},
            {id: 'desc'}
        ],
        include:{
            user:{
                select:{
                    id: true,
                    name: true,
                    username: true,
                    avatarUrl: true,
                    role: true
                }
            },
        }
    });
    const hasNextPage = post.length > limit;
    const items = hasNextPage ? post.slice(0, limit) : post;
    const nextCursor = hasNextPage? encodeCursor(items[items.length - 2].id) : null;
    // const post = await prisma.post.findMany({
    //     orderBy: {createdAt: 'desc'},
    //     select:{
    //         id: true,
    //         content: true,
    //         imageUrl: true,
    //         createdAt: true,
    //         updatedAt: true,
    //         user:{
    //             select:{
    //                 id: true,
    //                 name: true,
    //                 username: true,
    //                 avatarUrl: true,
    //                 role: true,
    //             }
    //         }
    //     }
    // })

    return {hasNextPage, items, nextCursor}
}


export const postService= {
    createPost,
    getAllPost
}
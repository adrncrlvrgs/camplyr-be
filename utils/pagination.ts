export type PaginatedResponse<T>= {
    items: T[],
    nextCursor: string | null,
    hasNextPage: boolean
}

export function encodeCursor(id: string){
    return Buffer.from(id).toString('base64url')
}

export function decoderCursor(cursor: string){
    return Buffer.from(cursor, 'base64url').toString('utf-8')
}
// src/types.ts

export interface User {
   id: string;
   username: string;
   avatar: string;
   joined_at: string;
   roles: string[];
}

export interface Entry {
   _id: string;
   entry: string;
   type: string;
   categories: string[];
   author: string;
   authorId: string;
   timestamp: string;
   variation: string[];
}

export interface TokenPayload {
   username: string;
   avatar: string;
}
// src/types.ts

export interface User {
   id: string;
   username: string;
   avatar: string;
   joined_at: string;
}

export interface Entry {
   _id: string;
   entry: string;
   categories: string[];
   author: string;
   timestamp: string;
}

export interface TokenPayload {
   username: string;
   avatar: string;
}
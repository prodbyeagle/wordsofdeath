/**
 * Represents a user in the application.
 * @property `id` - Unique Discord user ID.
 * @property `username` - The user's Discord username.
 * @property `avatar` - Hash representing the user's avatar image. Can be used to construct the full avatar URL.
 * @property `joined_at` - Timestamp when the user first joined the application, in ISO 8601 format.
 * @property `roles` - (Optional) Array of roles associated with the user, if any.
 */
export interface User {
   /**
    * Unique Discord user ID.
    */
   id: string;

   /**
    * The user's Discord username.
    */
   username: string;

   /**
    * Hash representing the user's avatar image. Can be used to construct the full avatar URL.
    */
   avatar: string;

   /**
    * Timestamp when the user first joined the application, in ISO 8601 format.
    */
   joined_at: string;

   /**
    * (Optional) Array of roles associated with the user, if any.
    */
   roles?: string[];
}

/**
 * Represents an entry in the application, such as a saved word or phrase.
 * @property `_id` - Unique identifier for the entry in the database.
 * @property `id` - Unique identifier for the entry within the application.
 * @property `entry` - Content of the entry, typically a word or phrase.
 * @property `categories` - Array of categories to which this entry belongs.
 * @property `author` - Username of the entry's creator.
 * @property `authorId` - Discord user ID of the entry's creator.
 * @property `timestamp` - Timestamp of entry creation, in ISO 8601 format.
 */
export interface Entry {
   /**
    * Unique identifier for the entry in the database.
    */
   _id: string;

   /**
    * Secondary identifier for the entry.
    */
   id: string;

   /**
    * The content of the entry.
    */
   entry: string;

   /**
    * Categories associated with the entry.
    */
   categories: string[];

   /**
    * The name of the author who created the entry.
    */
   author: string;

   /**
    * Unique identifier for the author.
    */
   authorId: string;

   /**
    * Timestamp indicating when the entry was created.
    */
   timestamp: string;
}

/**
 * Represents a whitelist entry, which permits a specific user to access the application.
 * @property `_id` - Unique identifier for the whitelist entry in the database.
 * @property `username` - Username of the whitelisted user.
 * @property `added_at` - Timestamp when the user was added to the whitelist, in ISO 8601 format.
 */
export interface Whitelist {
   /**
    * Unique identifier for the whitelist entry in the database.
    */
   _id: string;

   /**
    * Username of the whitelisted user.
    */
   username: string;

   /**
    * Timestamp when the user was added to the whitelist, in ISO 8601 format.
    */
   added_at: string;
}

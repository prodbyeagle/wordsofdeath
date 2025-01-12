# WordsofDeath

## Overview
**WordsofDeath** is a web-based platform that allows users to store, categorize, and search for words or sentences. The platform is restricted to a whitelist of Discord users for access, and allows users to explore a variety of stored entries across different categories.

## Technology Stack
- **Frontend**: Next.js + TypeScript
- **Backend**: Native MongoDB
- **UI Framework**: Tailwind CSS w/ custom UI Library
- **Authentication**: Discord OAuth2

## Features

### 1. **User Authentication**
   - Authentication is handled via Discord OAuth2, providing seamless integration with Discord.
   - Collected user data includes:
     - **Username**: Discord username
     - **Avatar**: Discord profile picture hash
     - **ID**: Discord user ID
     - **Join Date**: Timestamp of the first access (using `Date.now`)

### 2. **Word and Sentence Storage**
   - Users can create entries by storing words or sentences in the database, and categorize them based on themes.
   - Information stored includes:
     - **Word or Sentence**: The actual stored content (word or sentence)
     - **Categories**: A list of categories for classification (e.g., "discord", "funny")
     - **Author**: The username of the creator

### 3. **Search and Filtering**
   - Users can search for stored words or sentences by category or keyword, enabling easy navigation through entries.

### 4. **Whitelist Management**
   - Only users in the whitelist, which consists of authorized Discord users, can access the website.
   - The whitelist is managed in the database, ensuring secure access to the platform.

## Database Schema

### User Schema
| Field Name    | Data Type  | Description                           |
|---------------|------------|---------------------------------------|
| `name`        | `string`   | Discord username                      |
| `timestamp`   | `Date.now` | Timestamp of first access             |
| `avatar`      | `string`   | Hash of the Discord profile avatar    |
| `joined_at`   | `Date`     | Timestamp of when the user joined     |

#### Example User Entry
```json
{
    "_id": "6732e69ef11016e40775ecf8",
    "id": "1065030118491308082",
    "name": "MaxMustermann",
    "avatar": "a9f0b4b5434e6cd5031bd246fdabce40",
    "joined_at": "2023-10-27T12:34:56Z"
}
```

### Word/Sentence Schema
| Field Name    | Data Type  | Description                          |
|---------------|------------|--------------------------------------|
| `entry`       | `string`   | The stored word or sentence          |
| `categories`  | `string[]` | List of categories                   |
| `author`      | `string`   | Username of the creator              |
| `timestamp`   | `Date`     | Timestamp of when the entry was made |

#### Example Word/Sentence Entry
```json
[{
  "_id": {
    "$oid": "6732e47363aa5cc0e6613d7c"
  },
  "id": "01JCFCRRW04PW5RZEWMPNA57H7",
  "entry": "testword123",
  "categories": [
    "discord"
  ],
  "author": "prodbyeagle",
  "authorId": "893759402832699392",
  "timestamp": "2024-10-28T20:42:08.572Z"
}]
```

## Contributing

If you would like to contribute to WordsofDeath, feel free to fork the repository and submit a pull request. We welcome bug reports, feature requests, and improvements!

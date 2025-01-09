# WordsofDeath

## Overview
**WordsofDeath** is a web-based platform that allows users to store and search for words or sentences across different categories. Access to the site is restricted to a whitelist of Discord users.

## Technology Stack
- **Frontend**: Next.js + TypeScript
- **Database**: Native MongoDB
- **UI Design**: Tailwind CSS
- **Login**: Discord OAuth2

## Features
1. **User Authentication**:
   - Authentication is handled through Discord OAuth2
   - Collected user data includes:
     - **Username**: Discord username
     - **Avatar**: Discord profile picture Hash
     - **ID**: Discord user ID
     - **Join Date**: Timestamp of first access (created using `Date.now`)

2. **Word and Sentence Storage**:
   - Users can store words or sentences in the database and categorize them
   - Information stored includes:
     - **Word or Sentence**: The stored information (either word or sentence)
     - **Categories**: One or more categories for thematic classification
     - **Author**: Username of the creator

3. **Search and Filtering**:
   - Users can search stored words and sentences using categories or keywords

4. **Whitelist Management**:
   - Only whitelisted users are allowed to access the website
   - Whitelist contains Discord users who are authorized to use the platform (database whitelist)

## Database Schema
| Field Name    | Data Type  | Description                  |
|---------------|------------|------------------------------|
| `name`        | `string`   | User name                    |
| `timestamp`   | `Date.now` | Access timestamp             |
| `entry`       | `string`   | Stored word or sentence      |
| `categories`  | `string[]` | List of categories          |
| `author`      | `string`   | Creator's name              |

### Example User Entry
```json
{
    "_id": "6732e69ef11016e40775ecf8",
    "id": "1065030118491308082",
    "name": "MaxMustermann",
    "avatar": "a9f0b4b5434e6cd5031bd246fdabce40",
    "joined_at": "2023-10-27T12:34:56Z"
}
```

### Example Word/Sentence Entry
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
  "timestamp": "2024-10-28T20:42:08.572Z",
}]
```

# Firebase Cloud Functions API

This project implements a RESTful API using Express, TypeScript, and Firebase Cloud Functions with Firestore as the database. It provides endpoints for managing tasks and users.

## Project Structure

```
src/
├── middleware/       # Request validation and error handling
├── models/           # TypeScript interfaces for tasks and users
├── constants.ts      # Constants for the application
└── index.ts          # Main entry point with API routes
```

## API Endpoints

### Tasks
- `GET /tasks`: Get all tasks (can be filtered by userId query parameter: `/tasks?userId=abc123`)
- `GET /tasks/stats`: Get statistics about a user's tasks (requires userId query parameter: `/tasks/stats?userId=abc123`)
- `GET /tasks/{taskId}`: Get a single task by ID
- `POST /tasks`: Create a new task (requires userId in the request body)
- `PUT /tasks/{taskId}`: Update a task
- `DELETE /tasks/{taskId}`: Delete a task

### Users
- `GET /users/{email}`: Get user by email
- `POST /users`: Create a new user (or retrieve existing user)

## Requirements

### Task Creation
When creating a task with `POST /tasks`, the request body must include:
- `title`: String (required)
- `userId`: String (required) - ID of the user who owns the task
- `description`: String (optional)
- `completed`: Boolean (optional, defaults to false)

Example:
```json
{
  "title": "Complete project",
  "userId": "user123",
  "description": "Finish the Firebase API project",
  "completed": false
}
```

### User Creation
When creating a user with `POST /users`, the request body must include:
- `email`: String (required) - A valid email address

Example:
```json
{
  "email": "user@example.com"
}
```

## Prerequisites

- Node.js (v14 or newer)
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase account (free tier is sufficient)

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Login to Firebase:
   ```
   firebase login
   ```
4. Initialize your Firebase project:
   ```
   firebase init
   ```
   - Select "Functions" and "Firestore"
   - Choose "Use an existing project" and select your Firebase project
   - Keep the default options for Firestore rules and indexes
   - Select TypeScript for Functions
   - Say yes to ESLint
   - Say yes to installing dependencies

5. Update the `.firebaserc` file with your Firebase project ID.

## Local Development

To run the functions locally:

```
npm run serve
```

This will start the Firebase emulators, including the Functions emulator and Firestore emulator.

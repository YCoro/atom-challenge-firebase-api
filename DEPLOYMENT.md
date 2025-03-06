# Deployment Guide for Firebase Cloud Functions

## Prerequisites

1. Make sure you have a Firebase account
2. Install the Firebase CLI if you haven't already:
   ```
   npm install -g firebase-tools
   ```

## Step 1: Login to Firebase

```
firebase login
```

This will open a browser window for you to authenticate with your Google account.

## Step 2: Initialize Firebase in your project

If you haven't already initialized Firebase in your project, run:

```
firebase init
```

Select the following options:
- Choose "Functions" and "Firestore"
- Select "Use an existing project" and choose your Firebase project
- Choose TypeScript for Functions
- Say yes to ESLint
- Say yes to installing dependencies

## Step 3: Configure Firebase Project

Create a `.firebaserc` file in the root directory of your project:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

Replace `your-firebase-project-id` with your actual Firebase project ID.

## Step 4: Build the Project

```
npm run build
```

This will compile your TypeScript code into JavaScript in the `lib` directory.

## Step 5: Deploy to Firebase

```
npm run deploy
```

This will deploy your Cloud Functions to Firebase.

## Step 6: Verify Deployment

After deployment, you'll see a URL for your Cloud Function. It will look something like:

```
https://us-central1-your-project-id.cloudfunctions.net/api
```

You can test your API endpoints using this base URL:

- GET all tasks: `https://us-central1-your-project-id.cloudfunctions.net/api/tasks?userId=YOUR_USER_ID`
- GET task statistics: `https://us-central1-your-project-id.cloudfunctions.net/api/tasks/stats?userId=YOUR_USER_ID`
- GET a single task: `https://us-central1-your-project-id.cloudfunctions.net/api/tasks/TASK_ID`
- Create a user: POST to `https://us-central1-your-project-id.cloudfunctions.net/api/users` with body `{"email": "user@example.com"}`
- Create a task: POST to `https://us-central1-your-project-id.cloudfunctions.net/api/tasks` with body `{"title": "Task title", "userId": "YOUR_USER_ID"}`

## Troubleshooting

### Deployment Failed

If deployment fails, check the error messages. Common issues include:

1. **Billing not enabled**: The free tier of Firebase requires a billing account to be set up (even though you won't be charged within the free limits).
   - Solution: Enable billing in the Firebase console.

2. **Permissions issues**: Make sure you have the necessary permissions to deploy to the Firebase project.
   - Solution: Make sure you're logged in with an account that has admin access to the Firebase project.

3. **Node.js version mismatch**: Firebase Cloud Functions requires Node.js 14, 16, or 18.
   - Solution: Specify the Node.js version in the `engines` field of your package.json.

### Function Execution Errors

If your function is deployed but not working correctly:

1. Check the Firebase Function logs:
   ```
   firebase functions:log
   ```

2. Test locally using the emulator:
   ```
   npm run serve
   ```

## Free Tier Limitations

Remember that Firebase free tier has limitations:

- Cloud Functions:
  - 2 million invocations per month
  - 400,000 GB-seconds of compute time
  - 200,000 CPU-seconds of compute time
  - 128MB memory limit per function

- Firestore:
  - 50,000 reads per day
  - 20,000 writes per day
  - 20,000 deletes per day
  - 1 GB of stored data

Ensure your application stays within these limits to avoid charges. 
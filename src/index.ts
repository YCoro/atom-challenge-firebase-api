import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';
import { Task, TaskDto } from './models/task.model';
import { User, CreateUserDto } from './models/user.model';
import { validateRequest } from './middleware/validation';
import { errorHandler } from './middleware/error-handler';
import { COLLECTIONS, FIELDS, HTTP_STATUS, ERROR_MESSAGES } from './constants';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Express app
const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());

// Helper function to convert async handlers to Express expected pattern
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: Function) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

// Task Routes
// GET /tasks - Get all tasks (optionally filtered by userId if provided)
app.get('/api/tasks', asyncHandler(async (req: Request, res: Response) => {
  try {
    let query: admin.firestore.Query = db.collection(COLLECTIONS.TASKS);
    
    // Filter by user ID if provided in query params
    if (req.query.userId) {
      query = query.where(FIELDS.USER_ID, '==', req.query.userId);
    }
    
    // Filter by completion status if specified
    if (req.query.completed !== undefined) {
      const isCompleted = req.query.completed === 'true';
      query = query.where(FIELDS.COMPLETED, '==', isCompleted);
    }
    
    const tasksSnapshot = await query.get();
    const tasks: Task[] = [];
    
    tasksSnapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      } as Task);
    });
    
    res.status(HTTP_STATUS.OK).json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.FAILED_GET_TASKS });
  }
}));

// GET /tasks/stats - Get task statistics for a user
app.get('/api/tasks/stats', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Check for userId in request query
    const userId = req.query.userId as string;
    if (!userId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'userId is required in query parameters' });
      return;
    }
    
    // Get all tasks for the user
    const tasksSnapshot = await db.collection(COLLECTIONS.TASKS)
      .where(FIELDS.USER_ID, '==', userId)
      .get();
    
    let totalTasks = 0;
    let completedTasks = 0;
    
    tasksSnapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
      totalTasks++;
      if (doc.data().completed) {
        completedTasks++;
      }
    });
    
    res.status(HTTP_STATUS.OK).json({
      total: totalTasks,
      completed: completedTasks,
      incomplete: totalTasks - completedTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    });
  } catch (error) {
    console.error('Error getting task statistics:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get task statistics' });
  }
}));

// GET /tasks/{taskId} - Get a single task by ID
app.get('/api/tasks/:taskId', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    
    const taskRef = db.collection(COLLECTIONS.TASKS).doc(taskId);
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.TASK_NOT_FOUND });
      return;
    }
    
    const taskData = taskDoc.data();
    
    res.status(HTTP_STATUS.OK).json({
      id: taskId,
      ...taskData
    } as Task);
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.FAILED_GET_TASK });
  }
}));

// POST /tasks - Create a new task
app.post('/api/tasks', validateRequest([
  { field: 'title', required: true, type: 'string', minLength: 1 },
  { field: 'userId', required: true, type: 'string' }
]), asyncHandler(async (req: Request, res: Response) => {
  try {
    const taskDto: TaskDto = req.body;
    
    const newTask: Omit<Task, 'id'> = {
      title: taskDto.title,
      description: taskDto.description || '',
      completed: taskDto.completed || false,
      userId: taskDto.userId,
      createdAt: admin.firestore.Timestamp.now()
    };
    
    const newTaskRef = await db.collection('tasks').add(newTask);
    const newTaskDoc = await newTaskRef.get();
    
    res.status(201).json({
      id: newTaskRef.id,
      ...newTaskDoc.data()
    } as Task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
}));

// PUT /tasks/{taskId} - Update a task
app.put('/api/tasks/:taskId', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const taskDto: TaskDto = req.body;
    
    const taskRef = db.collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    
    const updateData: any = {
      ...taskDto,
      updatedAt: admin.firestore.Timestamp.now()
    };
    
    await taskRef.update(updateData);
    
    const updatedTaskDoc = await taskRef.get();
    
    res.status(200).json({
      id: taskId,
      ...updatedTaskDoc.data()
    } as Task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
}));

// DELETE /tasks/{taskId} - Delete a task
app.delete('/api/tasks/:taskId', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    
    const taskRef = db.collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    
    await taskRef.delete();
    
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
}));

// PATCH /tasks/{taskId} - Update completion status
app.patch('/api/tasks/:taskId/completion', validateRequest([
  { field: 'completed', required: true, type: 'boolean' }
]), asyncHandler(async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { completed } = req.body;
    
    const taskRef = db.collection(COLLECTIONS.TASKS).doc(taskId);
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.TASK_NOT_FOUND });
      return;
    }
    
    // Only update the completion status and updatedAt timestamp
    await taskRef.update({
      completed,
      updatedAt: admin.firestore.Timestamp.now()
    });
    
    const updatedTaskDoc = await taskRef.get();
    
    res.status(HTTP_STATUS.OK).json({
      id: taskId,
      ...updatedTaskDoc.data()
    } as Task);
  } catch (error) {
    console.error('Error updating task completion status:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update task completion status' });
  }
}));

// PATCH /tasks/{taskId} - Update any task field
app.patch('/api/tasks/:taskId', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;
    
    // Validate that we're not trying to update invalid fields
    const allowedFields = ['title', 'description', 'completed', 'userId'];
    const invalidFields = Object.keys(updates).filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ 
        error: `Invalid fields: ${invalidFields.join(', ')}. Allowed fields: ${allowedFields.join(', ')}` 
      });
      return;
    }
    
    const taskRef = db.collection(COLLECTIONS.TASKS).doc(taskId);
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.TASK_NOT_FOUND });
      return;
    }
    
    // Add updatedAt timestamp to the updates
    const updateData = {
      ...updates,
      updatedAt: admin.firestore.Timestamp.now()
    };
    
    await taskRef.update(updateData);
    
    const updatedTaskDoc = await taskRef.get();
    
    res.status(HTTP_STATUS.OK).json({
      id: taskId,
      ...updatedTaskDoc.data()
    } as Task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update task' });
  }
}));

// User Routes
// GET /users/{email} - Get user by email
app.get('/api/users/:email', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    // Convert email to lowercase for case-insensitive comparison
    const normalizedEmail = email.toLowerCase();
    
    const usersSnapshot = await db.collection('users')
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    const userDoc = usersSnapshot.docs[0];
    
    res.status(200).json({
      id: userDoc.id,
      email: userDoc.data().email
    } as User);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
}));

// POST /users - Create a new user
app.post('/api/users', validateRequest([
  { field: 'email', required: true, type: 'email' }
]), asyncHandler(async (req: Request, res: Response) => {
  try {
    const userDto: CreateUserDto = req.body;
    // Convert email to lowercase for case-insensitive handling
    userDto.email = userDto.email.toLowerCase();
    
    // Check if user with this email already exists
    const userSnapshot = await db.collection('users')
      .where('email', '==', userDto.email)
      .limit(1)
      .get();
    
    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      res.status(200).json({
        id: userDoc.id,
        email: userDoc.data().email
      } as User);
      return;
    }
    
    const newUser: Omit<User, 'id'> = {
      email: userDto.email,
      createdAt: admin.firestore.Timestamp.now()
    };
    
    const newUserRef = await db.collection('users').add(newUser);
    
    res.status(201).json({
      id: newUserRef.id,
      email: userDto.email
    } as User);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}));

// Error handling middleware 
app.use(errorHandler);

// Export the Express API as default function
export const api = functions.https.onRequest(app);

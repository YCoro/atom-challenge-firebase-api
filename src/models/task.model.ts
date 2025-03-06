import * as admin from 'firebase-admin';

export interface Task {
  id?: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
  createdAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
}

export interface TaskDto {
  title: string;
  description?: string;
  completed?: boolean;
  userId: string;
}